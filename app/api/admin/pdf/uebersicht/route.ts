import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/session";
import { filterPublished } from "@/lib/domain/visibility";
import { getLatestUpdate } from "@/lib/domain/timeline";
import { htmlToPdfBuffer } from "@/lib/pdf/generate";
import { renderOverviewPdfHtml } from "@/lib/pdf/templates";
import { prisma } from "@/lib/prisma";
import type { ProjektStatus } from "@/app/generated/prisma/client";

export async function GET() {
  await requireAdminSession();

  const projects = await prisma.projekt.findMany({
    where: { archiviert: false },
    include: { updates: true },
    orderBy: { titel: "asc" },
  });

  const baseUrl =
    process.env.NEXTAUTH_URL ??
    process.env.APP_URL ??
    "http://localhost:3000";
  const logoUrl = `${baseUrl.replace(/\/$/, "")}/logo-altdorf.png`;

  const overview = projects
    .filter((project) =>
      project.updates.some((update) => update.status === "PUBLIZIERT"),
    )
    .map((project) => {
      const latest = getLatestUpdate(filterPublished(project.updates));
      return {
        titel: project.titel,
        abteilung: project.abteilung,
        status: project.status as ProjektStatus,
        letztesUpdate: latest?.kurztitel ?? null,
      };
    });

  const html = renderOverviewPdfHtml(overview, logoUrl);
  const pdf = await htmlToPdfBuffer(html);

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="projekte-uebersicht.pdf"',
    },
  });
}
