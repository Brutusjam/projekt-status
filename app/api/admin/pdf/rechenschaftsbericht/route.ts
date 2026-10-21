import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/session";
import {
  buildRechenschaftsbericht,
  parseReportDate,
} from "@/lib/domain/report/rechenschaftsbericht";
import { embeddedFontFaces, logoSource } from "@/lib/pdf/assets";
import { htmlToPdfBuffer } from "@/lib/pdf/generate";
import {
  rechenschaftsberichtFooter,
  renderRechenschaftsberichtHtml,
} from "@/lib/pdf/rechenschaftsbericht";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  await requireAdminSession();
  const { searchParams } = new URL(request.url);

  const now = new Date();
  const von = parseReportDate(searchParams.get("von"));
  const bis = parseReportDate(searchParams.get("bis")) ?? now;
  if (von && von.getTime() > bis.getTime()) {
    return NextResponse.json(
      { error: "Beginn des Berichtszeitraums liegt nach dem Ende" },
      { status: 400 },
    );
  }
  const mitArchiv = searchParams.get("archiv") === "1";

  const projects = await prisma.projekt.findMany({
    where: mitArchiv ? undefined : { archiviert: false },
    include: { updates: true },
  });

  const report = buildRechenschaftsbericht(projects, { von, bis }, now);

  const baseUrl =
    process.env.NEXTAUTH_URL ??
    process.env.APP_URL ??
    "http://localhost:3000";
  const html = renderRechenschaftsberichtHtml(report, {
    logoSrc: logoSource(`${baseUrl.replace(/\/$/, "")}/logo-altdorf.png`),
    fontFaces: embeddedFontFaces(),
  });

  if (searchParams.get("format") === "html") {
    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const pdf = await htmlToPdfBuffer(html, {
    paged: { footerTemplate: rechenschaftsberichtFooter(report.erstelltAm) },
  });
  const stamp = bis.toISOString().slice(0, 10).replaceAll("-", "");

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="projektbericht-prozessentwicklung-${stamp}.pdf"`,
    },
  });
}
