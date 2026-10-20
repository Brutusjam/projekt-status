import { PageHeader } from "@/components/layout/page-header";
import { UpdateTimelineItem } from "@/components/projekte/update-timeline-item";
import { getPublishedFeed } from "@/lib/domain/updates/queries";
import { prisma } from "@/lib/prisma";

export default async function WasIstNeuPage() {
  const feed = await getPublishedFeed(prisma);

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Dashboard"
        title="Was ist neu"
        description="Chronologischer Feed der zuletzt publizierten Updates über alle Projekte."
      />

      {feed.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-6 py-10 text-center text-muted-foreground">
          Aktuell sind keine publizierten Updates vorhanden.
        </p>
      ) : (
        <div className="space-y-4">
          {feed.map((item) => (
            <UpdateTimelineItem
              key={item.id}
              id={item.id}
              datum={item.datum}
              kurztitel={item.kurztitel}
              detailtext={item.detailtext}
              pdfDateiname={item.pdfDateiname}
              projektTitel={item.projekt.titel}
              projektHref={`/projekte/${item.projekt.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
