import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "@/components/admin/login-form";

type PageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const callbackUrl = params.callbackUrl ?? "/";

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-4 text-center">
          <Image
            src="/logo-altdorf.png"
            alt="Gemeinde Altdorf"
            width={616}
            height={616}
            priority
            className="mx-auto h-20 w-auto"
          />
          <div className="space-y-2">
            <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
              Projektcockpit Prozessentwicklung
            </h1>
            <p className="text-sm text-muted-foreground">
              Bitte melde dich mit deinen Zugangsdaten an.
            </p>
          </div>
        </div>
        <LoginForm callbackUrl={callbackUrl} />
        <p className="text-center text-xs text-muted-foreground">
          <Link href="/" className="underline-offset-4 hover:underline">
            Zurück
          </Link>
        </p>
      </div>
    </div>
  );
}
