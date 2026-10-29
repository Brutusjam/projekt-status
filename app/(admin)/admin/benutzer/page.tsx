import {
  activateUserFormAction,
  deactivateUserFormAction,
  toggleMailAboFormAction,
} from "@/app/(admin)/admin/actions/form-wrappers";
import { CreateUserForm } from "@/components/admin/create-user-form";
import { DeleteUserButton } from "@/components/admin/delete-user-button";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { listUsers } from "@/lib/domain/users/queries";
import { formatDate } from "@/lib/format";
import { getRolleLabel } from "@/lib/labels";
import { prisma } from "@/lib/prisma";

export default async function AdminUsersPage() {
  const users = await listUsers(prisma);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Einstellungen"
        title="Benutzerverwaltung"
        description="Leserkonten anlegen, deaktivieren, löschen und Mail-Abo verwalten."
      />

      <CreateUserForm />

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">E-Mail</th>
              <th className="px-4 py-3 font-medium">Rolle</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Mail-Abo</th>
              <th className="px-4 py-3 font-medium">Angelegt</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{user.name}</td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">{getRolleLabel(user.rolle)}</td>
                <td className="px-4 py-3">
                  {user.aktiv ? "Aktiv" : "Deaktiviert"}
                  {user.mustChangePassword ? " · Passwortwechsel offen" : ""}
                </td>
                <td className="px-4 py-3">{user.mailAbo ? "Ja" : "Nein"}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap justify-end gap-2">
                    {user.rolle === "LESER" ? (
                      <form action={toggleMailAboFormAction}>
                        <input type="hidden" name="userId" value={user.id} />
                        <input
                          type="hidden"
                          name="mailAbo"
                          value={String(!user.mailAbo)}
                        />
                        <Button type="submit" variant="outline" size="sm">
                          Mail-Abo {user.mailAbo ? "aus" : "an"}
                        </Button>
                      </form>
                    ) : null}
                    {user.aktiv ? (
                      <form action={deactivateUserFormAction}>
                        <input type="hidden" name="userId" value={user.id} />
                        <Button type="submit" variant="destructive" size="sm">
                          Deaktivieren
                        </Button>
                      </form>
                    ) : (
                      <form action={activateUserFormAction}>
                        <input type="hidden" name="userId" value={user.id} />
                        <Button type="submit" variant="secondary" size="sm">
                          Aktivieren
                        </Button>
                      </form>
                    )}
                    <DeleteUserButton userId={user.id} userName={user.name} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
