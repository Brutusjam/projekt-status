import { chromium } from "playwright";

type PdfOptions = {
  /**
   * A4 mit Seitenumbrüchen statt eines durchlaufenden Blatts.
   * Optional mit Fusszeile (HTML, Playwright footerTemplate).
   */
  paged?: { footerTemplate?: string };
};

export async function htmlToPdfBuffer(
  html: string,
  options: PdfOptions = {},
): Promise<Buffer> {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({
      viewport: { width: 794, height: 1123 },
      deviceScaleFactor: 2,
    });
    await page.setContent(html, { waitUntil: "networkidle" });

    if (options.paged) {
      const { footerTemplate } = options.paged;
      const pdf = await page.pdf({
        format: "A4",
        margin: { top: "48px", right: "0", bottom: footerTemplate ? "64px" : "48px", left: "0" },
        printBackground: true,
        displayHeaderFooter: Boolean(footerTemplate),
        headerTemplate: "<span></span>",
        footerTemplate: footerTemplate ?? "<span></span>",
      });
      return Buffer.from(pdf);
    }

    const height = await page.evaluate(() => document.body.scrollHeight);
    const pdf = await page.pdf({
      width: "794px",
      height: `${height + 2}px`,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
      printBackground: true,
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
