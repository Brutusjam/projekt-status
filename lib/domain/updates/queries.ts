import type { PrismaClient } from "@/app/generated/prisma/client";
import { filterPublished } from "@/lib/domain/visibility";
import { sortTimeline } from "@/lib/domain/timeline";
import type { FeedItem } from "@/lib/domain/types";

export async function getPublishedFeed(db: PrismaClient): Promise<FeedItem[]> {
  const updates = await db.update.findMany({
    where: {
      status: "PUBLIZIERT",
      projekt: {
        archiviert: false,
      },
    },
    select: {
      id: true,
      projektId: true,
      datum: true,
      kurztitel: true,
      detailtext: true,
      status: true,
      createdAt: true,
      pdfDateiname: true,
      pdfMimeType: true,
      pdfGroesse: true,
      pdfGespeichertAm: true,
      projekt: {
        select: {
          id: true,
          titel: true,
          abteilung: true,
        },
      },
    },
  });

  return sortTimeline(filterPublished(updates));
}
