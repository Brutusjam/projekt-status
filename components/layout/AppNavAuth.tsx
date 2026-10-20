import Link from "next/link";
import { auth } from "@/auth";
import { logoutAction } from "@/app/(admin)/admin/actions/users";
import { Button } from "@/components/ui/button";

export async function AppNavAuth() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {session.user.rolle === "ADMIN" ? (
        <Link
          href="/admin"
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          Admin
        </Link>
      ) : null}
      <form action={logoutAction}>
        <Button type="submit" variant="ghost" size="sm">
          Abmelden
        </Button>
      </form>
    </div>
  );
}
