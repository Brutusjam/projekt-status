"use client";

import { useActionState } from "react";
import type { ProjektStatus } from "@/app/generated/prisma/client";
import { updateProjectAction } from "@/app/(admin)/admin/actions/projects";
import { ProjectFormFields } from "@/components/admin/project-form-fields";

type EditProjectFormProps = {
  projectId: number;
  formKey: string;
  initial: {
    titel: string;
    abteilung: string;
    ansprechperson: string;
    status: ProjektStatus;
    startdatum: Date;
    naechsterTermin: Date | null;
    naechsterTerminLabel: string | null;
    kurzbeschrieb: string;
    wirkung: string;
  };
};

export function EditProjectForm({
  projectId,
  formKey,
  initial,
}: EditProjectFormProps) {
  const updateAction = updateProjectAction.bind(null, projectId);
  const [state, action, pending] = useActionState(updateAction, {});

  return (
    <ProjectFormFields
      key={formKey}
      action={action}
      initial={initial}
      submitLabel="Änderungen speichern"
      state={state}
      pending={pending}
    />
  );
}
