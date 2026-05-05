import { trpc } from "@/providers/trpc";

export function usePermissions() {
  const { data: member, isLoading } = trpc.equipe.me.useQuery();

  const role = member?.role ?? "admin";
  const isAdmin = role === "admin";
  const isEditor = role === "editor" || isAdmin;

  const can = {
    read: true,
    write: isEditor,
    delete: isAdmin,
    manageTeam: isAdmin,
    manageSettings: isAdmin,
  };

  return { role, can, isAdmin, isEditor, isLoading };
}
