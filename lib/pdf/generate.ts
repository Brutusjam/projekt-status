import { chromium } from "playwright";

export async function htmlToPdfBuffer(html: string): Promise<Buffer> {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({
      viewport: { width: 794, height: 1123 },
      deviceScaleFactor: 2,
    });
    await page.setContent(html, { waitUntil: "networkidle" });
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
