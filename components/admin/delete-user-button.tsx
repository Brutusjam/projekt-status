"use client";

import { deleteUserFormAction } from "@/app/(admin)/admin/actions/form-wrappers";
import { Button } from "@/components/ui/button";

type DeleteUserButtonProps = {
  userId: number;
  userName: string;
};

export function DeleteUserButton({ userId, userName }: DeleteUserButtonProps) {
  return (
    <form
      action={deleteUserFormAction}
      onSubmit={(event) => {
        const ok = window.confirm(
          `Möchtest du den Benutzer «${userName}» wirklich löschen? Die Aktion kann nicht rückgängig gemacht werden.`,
        );
        if (!ok) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="userId" value={userId} />
      <Button type="submit" variant="destructive" size="sm">
        Löschen
      </Button>
    </form>
  );
}
