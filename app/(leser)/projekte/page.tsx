import { redirect } from "next/navigation";

type PageProps = {
  searchParams: Promise<{
    abteilung?: string;
    status?: string;
    q?: string;
  }>;
};

export default async function ProjekteRedirectPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = new URLSearchParams();

  if (params.abteilung) {
    query.set("abteilung", params.abteilung);
  }
  if (params.status) {
    query.set("status", params.status);
  }
  if (params.q) {
    query.set("q", params.q);
  }

  const queryString = query.toString();
  redirect(queryString ? `/?${queryString}` : "/");
}
