"use client";

import { useActionState } from "react";
import { createProjectAction } from "@/app/(admin)/admin/actions/projects";
import { ProjectFormFields } from "@/components/admin/project-form-fields";

export function NewProjectForm() {
  const [state, action, pending] = useActionState(createProjectAction, {});

  return (
    <ProjectFormFields
      action={action}
      submitLabel="Projekt anlegen"
      state={state}
      pending={pending}
    />
  );
}
