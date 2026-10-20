import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { NewProjectForm } from "@/components/admin/new-project-form";
import { Button } from "@/components/ui/button";

export default function NewProjectPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <PageHeader
          eyebrow="Administration"
          title="Neues Projekt"
          description="Projektdaten erfassen. Updates können nach dem Anlegen hinzugefügt werden."
        />
        <Button variant="outline" render={<Link href="/admin" />}>
          Zurück
        </Button>
      </div>
      <NewProjectForm />
    </div>
  );
}
