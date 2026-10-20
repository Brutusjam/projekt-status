"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createUserAction } from "@/app/(admin)/admin/actions/users";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ROLLE_LABELS } from "@/lib/labels";

export function CreateUserForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState(createUserAction, {});

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <form action={action} className="space-y-4 rounded-xl border border-border p-5">
      <h3 className="font-medium">Neues Benutzerkonto</h3>
      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-green-700">{state.success}</p>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Name" htmlFor="name" error={state.fieldErrors?.name}>
          <Input id="name" name="name" required />
        </FormField>
        <FormField label="E-Mail" htmlFor="email" error={state.fieldErrors?.email}>
          <Input id="email" name="email" type="email" required />
        </FormField>
        <FormField label="Rolle" htmlFor="rolle">
          <Select id="rolle" name="rolle" defaultValue="LESER">
            <option value="LESER">{ROLLE_LABELS.LESER}</option>
            <option value="ADMIN">{ROLLE_LABELS.ADMIN}</option>
          </Select>
        </FormField>
        <FormField
          label="Initialpasswort"
          htmlFor="initialPassword"
          error={state.fieldErrors?.initialPassword}
        >
          <Input
            id="initialPassword"
            name="initialPassword"
            type="password"
            required
          />
        </FormField>
      </div>
      <Button type="submit" disabled={pending}>
        Benutzer anlegen
      </Button>
    </form>
  );
}
