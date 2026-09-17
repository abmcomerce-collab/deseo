import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AuthShell } from "@/components/account/auth-shell";
import { LoginForm } from "@/components/account/auth-forms";

export const metadata = { title: "Iniciar sesión", robots: { index: false } };

export default async function LoginPage({ searchParams }: PageProps<"/cuenta/acceso">) {
  const { next } = await searchParams;
  const session = await getSession();
  if (session) redirect(session.role === "admin" ? "/admin" : "/cuenta");
  return (
    <AuthShell
      title={
        <>
          Hola <em>de nuevo.</em>
        </>
      }
      subtitle="Entra para ver tus pedidos y pagar más rápido."
    >
      <LoginForm next={typeof next === "string" ? next : undefined} />
    </AuthShell>
  );
}
