import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/admin/admin-nav";

export const metadata: Metadata = {
  title: { default: "Panel", template: "%s · Panel DESEO" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await requireAdmin();
  return (
    <div className="min-h-dvh bg-[#f3eee7] lg:grid lg:grid-cols-[248px_1fr]">
      <AdminNav name={session.name} email={session.email} />
      <main className="min-w-0 px-4 pb-20 pt-6 sm:px-8 lg:px-10 lg:pt-10">{children}</main>
    </div>
  );
}
