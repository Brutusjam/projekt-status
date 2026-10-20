/**
 * Standalone Playwright PDF pipeline (Header Variante A).
 * Usage: node scripts/pdf-export.mjs input.html output.pdf
 */
import fs from "node:fs";
import { chromium } from "playwright";

const [, , inputPath, outputPath] = process.argv;

if (!inputPath || !outputPath) {
  console.error("Usage: node scripts/pdf-export.mjs input.html output.pdf");
  process.exit(1);
}

const html = fs.readFileSync(inputPath, "utf8");
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({
    viewport: { width: 794, height: 1123 },
    deviceScaleFactor: 2,
  });
  await page.setContent(html, { waitUntil: "networkidle" });
  const height = await page.evaluate(() => document.body.scrollHeight);
  await page.pdf({
    path: outputPath,
    width: "794px",
    height: `${height + 2}px`,
    margin: { top: "0", right: "0", bottom: "0", left: "0" },
    printBackground: true,
  });
  console.log(`PDF geschrieben: ${outputPath}`);
} finally {
  await browser.close();
}
