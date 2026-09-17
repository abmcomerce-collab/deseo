import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AuthShell } from "@/components/account/auth-shell";
import { RegisterForm } from "@/components/account/auth-forms";

export const metadata = { title: "Crear cuenta", robots: { index: false } };

export default async function RegisterPage({ searchParams }: PageProps<"/cuenta/registro">) {
  const { next } = await searchParams;
  if (await getSession()) redirect("/cuenta");
  return (
    <AuthShell
      title={
        <>
          Únete al <em>club.</em>
        </>
      }
      subtitle="Crea tu cuenta en 20 segundos. Sin spam, prometido."
    >
      <RegisterForm next={typeof next === "string" ? next : undefined} />
    </AuthShell>
  );
}
