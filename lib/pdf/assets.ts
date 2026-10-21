import fs from "node:fs";
import path from "node:path";

const FONT_FILES = [
  { family: "Inter", weight: 400, file: "@fontsource/inter/files/inter-latin-400-normal.woff2" },
  { family: "Inter", weight: 600, file: "@fontsource/inter/files/inter-latin-600-normal.woff2" },
  { family: "Inter", weight: 700, file: "@fontsource/inter/files/inter-latin-700-normal.woff2" },
  { family: "Space Grotesk", weight: 500, file: "@fontsource/space-grotesk/files/space-grotesk-latin-500-normal.woff2" },
  { family: "Space Grotesk", weight: 700, file: "@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff2" },
];

function readBase64(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath).toString("base64");
  } catch {
    return null;
  }
}

/** @font-face-Regeln mit lokal gebündelten Schriften als Base64 (keine CDN-Links). */
export function embeddedFontFaces(): string {
  return FONT_FILES.map(({ family, weight, file }) => {
    const data = readBase64(path.join(process.cwd(), "node_modules", file));
    if (!data) return "";
    return `@font-face { font-family: '${family}'; font-weight: ${weight}; font-style: normal; src: url(data:font/woff2;base64,${data}) format('woff2'); }`;
  }).join("\n");
}

/** Wappen als Data-URI; fällt auf die öffentliche URL zurück, wenn die Datei fehlt. */
export function logoSource(fallbackUrl: string): string {
  const data = readBase64(path.join(process.cwd(), "public", "logo-altdorf.png"));
  return data ? `data:image/png;base64,${data}` : fallbackUrl;
}
