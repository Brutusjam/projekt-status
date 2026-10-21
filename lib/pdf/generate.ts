import { chromium } from "playwright";

type PdfOptions = {
  /**
   * A4 mit Seitenumbrüchen statt eines durchlaufenden Blatts.
   * Optional mit Fusszeile (HTML, Playwright footerTemplate).
   */
  paged?: { footerTemplate?: string };
};

/** Obergrenze pro Schritt, damit ein hängendes Chromium nicht endlos blockiert. */
const STEP_TIMEOUT_MS = 45_000;

/**
 * Container-taugliche Chromium-Optionen: /dev/shm ist auf fly.io und in
 * Docker sehr klein, ohne --disable-dev-shm-usage bleibt Chromium hängen.
 */
const CHROMIUM_ARGS = ["--disable-dev-shm-usage", "--disable-gpu", "--no-zygote"];

export async function htmlToPdfBuffer(
  html: string,
  options: PdfOptions = {},
): Promise<Buffer> {
  const started = Date.now();
  const browser = await chromium.launch({
    headless: true,
    args: CHROMIUM_ARGS,
    timeout: STEP_TIMEOUT_MS,
  });
  try {
    const page = await browser.newPage({
      viewport: { width: 794, height: 1123 },
      deviceScaleFactor: 2,
    });
    page.setDefaultTimeout(STEP_TIMEOUT_MS);
    await page.setContent(html, { waitUntil: "load" });

    let pdf: Uint8Array;
    if (options.paged) {
      const { footerTemplate } = options.paged;
      pdf = await page.pdf({
        format: "A4",
        margin: { top: "48px", right: "0", bottom: footerTemplate ? "64px" : "48px", left: "0" },
        printBackground: true,
        displayHeaderFooter: Boolean(footerTemplate),
        headerTemplate: "<span></span>",
        footerTemplate: footerTemplate ?? "<span></span>",
      });
    } else {
      const height = await page.evaluate(() => document.body.scrollHeight);
      pdf = await page.pdf({
        width: "794px",
        height: `${height + 2}px`,
        margin: { top: "0", right: "0", bottom: "0", left: "0" },
        printBackground: true,
      });
    }

    console.info(`PDF erzeugt in ${Date.now() - started} ms (${Math.round(pdf.length / 1024)} KB)`);
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
