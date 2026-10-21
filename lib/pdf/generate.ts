import { chromium, type Logger } from "playwright";

type PdfOptions = {
  /**
   * A4 mit Seitenumbrüchen statt eines durchlaufenden Blatts.
   * Optional mit Fusszeile (HTML, Playwright footerTemplate).
   */
  paged?: { footerTemplate?: string };
};

/** Obergrenze pro Schritt, damit ein hängendes Chromium nicht endlos blockiert. */
const STEP_TIMEOUT_MS = 30_000;

/**
 * Container-taugliche Chromium-Optionen: /dev/shm ist auf fly.io und in
 * Docker sehr klein, ohne --disable-dev-shm-usage bleibt Chromium hängen.
 */
const CHROMIUM_ARGS = ["--disable-dev-shm-usage", "--disable-gpu"];

/** Letzte Meldungen von Chromium, damit ein Fehler im Log erklärbar ist. */
function createBrowserLog(limit = 40) {
  const lines: string[] = [];
  const logger: Logger = {
    isEnabled: (name) => name === "browser",
    log: (name, severity, message) => {
      lines.push(`${severity}: ${String(message)}`);
      if (lines.length > limit) lines.shift();
    },
  };
  return { logger, lines };
}

/** newPage() hat in Playwright kein eigenes Zeitlimit. */
function withTimeout<T>(promise: Promise<T>, step: string): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`${step}: Zeitlimit von ${STEP_TIMEOUT_MS} ms überschritten`)),
      STEP_TIMEOUT_MS,
    );
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export async function htmlToPdfBuffer(
  html: string,
  options: PdfOptions = {},
): Promise<Buffer> {
  const started = Date.now();
  const steps: string[] = [];
  const mark = (step: string) => steps.push(`${step} ${Date.now() - started} ms`);
  const browserLog = createBrowserLog();

  const browser = await chromium.launch({
    headless: true,
    args: CHROMIUM_ARGS,
    timeout: STEP_TIMEOUT_MS,
    logger: browserLog.logger,
  });
  mark("launch");
  try {
    const page = await withTimeout(
      browser.newPage({
        viewport: { width: 794, height: 1123 },
        // page.pdf() rendert vektoriell; ein höherer Faktor kostet nur Speicher.
        deviceScaleFactor: 1,
      }),
      "newPage",
    );
    mark("newPage");
    page.setDefaultTimeout(STEP_TIMEOUT_MS);
    await page.setContent(html, { waitUntil: "load" });
    mark("setContent");

    let pdf: Uint8Array;
    if (options.paged) {
      const { footerTemplate } = options.paged;
      pdf = await withTimeout(
        page.pdf({
          format: "A4",
          margin: { top: "48px", right: "0", bottom: footerTemplate ? "64px" : "48px", left: "0" },
          printBackground: true,
          displayHeaderFooter: Boolean(footerTemplate),
          headerTemplate: "<span></span>",
          footerTemplate: footerTemplate ?? "<span></span>",
        }),
        "pdf",
      );
    } else {
      const height = await page.evaluate(() => document.body.scrollHeight);
      pdf = await withTimeout(
        page.pdf({
          width: "794px",
          height: `${height + 2}px`,
          margin: { top: "0", right: "0", bottom: "0", left: "0" },
          printBackground: true,
        }),
        "pdf",
      );
    }
    mark("pdf");

    console.info(
      `PDF erzeugt in ${Date.now() - started} ms (${Math.round(pdf.length / 1024)} KB): ${steps.join(", ")}`,
    );
    return Buffer.from(pdf);
  } catch (error) {
    console.error(
      `PDF-Erzeugung abgebrochen nach ${Date.now() - started} ms; Schritte: ${steps.join(", ") || "keine"}\nChromium:\n${browserLog.lines.join("\n")}`,
    );
    throw error;
  } finally {
    // close() kann bei einem hängenden Chromium selbst hängen
    await withTimeout(browser.close(), "close").catch((error) => {
      console.error("Chromium liess sich nicht schliessen", error);
    });
  }
}
