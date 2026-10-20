import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/session";
import { filterPublished } from "@/lib/domain/visibility";
import { sortTimeline } from "@/lib/domain/timeline";
import { getLatestUpdate } from "@/lib/domain/timeline";
import { htmlToPdfBuffer } from "@/lib/pdf/generate";
import { renderProjectPdfHtml } from "@/lib/pdf/templates";
import { prisma } from "@/lib/prisma";
import type { ProjektStatus } from "@/app/generated/prisma/client";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: RouteProps) {
  await requireAdminSession();
  const { id } = await params;
  const projectId = Number(id);
  if (Number.isNaN(projectId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const project = await prisma.projekt.findUnique({
    where: { id: projectId },
    include: {
      updates: {
        where: { status: "PUBLIZIERT" },
        orderBy: { datum: "desc" },
      },
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const baseUrl =
    process.env.NEXTAUTH_URL ??
    process.env.APP_URL ??
    "http://localhost:3000";
  const logoUrl = `${baseUrl.replace(/\/$/, "")}/logo-altdorf.png`;
  const html = renderProjectPdfHtml(
    {
      titel: project.titel,
      abteilung: project.abteilung,
      ansprechperson: project.ansprechperson,
      status: project.status as ProjektStatus,
      startdatum: project.startdatum,
      kurzbeschrieb: project.kurzbeschrieb,
      wirkung: project.wirkung,
      updates: sortTimeline(filterPublished(project.updates)).map((u) => ({
        datum: u.datum,
        kurztitel: u.kurztitel,
        detailtext: u.detailtext,
      })),
    },
    logoUrl,
  );

  const pdf = await htmlToPdfBuffer(html);
  const filename = `projekt-${projectId}.pdf`;

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
