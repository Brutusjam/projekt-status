import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  hasPdfAttachment,
  readPdfFile,
} from "@/lib/domain/updates/attachments";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.rolle || session.user.mustChangePassword) {
    return new NextResponse("Anmeldung erforderlich", { status: 401 });
  }

  const { id } = await context.params;
  const updateId = Number(id);
  if (Number.isNaN(updateId)) {
    return new NextResponse("Ungültige ID", { status: 400 });
  }

  const update = await prisma.update.findUnique({
    where: { id: updateId },
    select: {
      status: true,
      pdfDateiname: true,
      pdfMimeType: true,
      pdfGroesse: true,
      pdfGespeichertAm: true,
    },
  });

  if (!update || !hasPdfAttachment(update)) {
    return new NextResponse("PDF nicht gefunden", { status: 404 });
  }

  const isAdmin = session.user.rolle === "ADMIN";
  if (!isAdmin && update.status !== "PUBLIZIERT") {
    return new NextResponse("PDF nicht gefunden", { status: 404 });
  }

  const buffer = readPdfFile(updateId);
  if (!buffer) {
    return new NextResponse("PDF nicht gefunden", { status: 404 });
  }

  const filename = update.pdfDateiname ?? `update-${updateId}.pdf`;
  const asciiName = filename.replace(/[^\x20-\x7E]/g, "_");
  const encodedName = encodeURIComponent(filename);

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": update.pdfMimeType ?? "application/pdf",
      "Content-Length": String(buffer.length),
      "Content-Disposition": `attachment; filename="${asciiName}"; filename*=UTF-8''${encodedName}`,
      "Cache-Control": "private, no-store",
    },
  });
}
