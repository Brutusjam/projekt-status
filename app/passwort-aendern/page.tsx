import { PageHeader } from "@/components/layout/page-header";
import { ChangePasswordForm } from "@/components/admin/change-password-form";

export default function ChangePasswordPage() {
  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-4 py-16">
      <PageHeader
        eyebrow="Konto"
        title="Passwort ändern"
        description="Beim ersten Login musst du dein Passwort ändern."
      />
      <div className="mt-8">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
