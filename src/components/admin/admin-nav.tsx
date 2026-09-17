"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, LayoutGrid, LogOut, Menu, Package, PartyPopper, ReceiptText, Tag, Users, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { logout } from "@/app/actions/auth";
import { cn } from "@/lib/format";

const LINKS = [
  { href: "/admin", label: "Resumen", icon: LayoutGrid, exact: true },
  { href: "/admin/pedidos", label: "Pedidos", icon: ReceiptText },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/cupones", label: "Cupones", icon: Tag },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/eventos", label: "Eventos B2B", icon: PartyPopper },
];

export function AdminNav({ name, email }: { name: string; email: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex h-full flex-col" aria-label="Administración">
      <div className="flex items-center justify-between px-5 pt-6">
        <Link href="/admin" className="flex items-baseline gap-2 text-crema">
          <Logo className="text-4xl" />
          <span className="eyebrow text-crema/40">panel</span>
        </Link>
        <button type="button" className="grid size-9 place-items-center lg:hidden" onClick={() => setOpen(false)} aria-label="Cerrar menú">
          <X className="size-5" />
        </button>
      </div>
      <ul className="mt-10 space-y-1 px-3">
        {LINKS.map((l) => {
          const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
          return (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                  active ? "bg-crema text-noche" : "text-crema/70 hover:bg-crema/10 hover:text-crema",
                )}
              >
                <l.icon className="size-4" />
                {l.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-auto space-y-3 p-3">
        <Link href="/" className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-crema/70 hover:bg-crema/10 hover:text-crema">
          Ver tienda <ArrowUpRight className="size-4" />
        </Link>
        <div className="rounded-2xl bg-crema/5 p-3">
          <p className="truncate text-sm text-crema">{name}</p>
          <p className="truncate text-xs text-crema/50">{email}</p>
          <form action={logout}>
            <button className="mt-3 flex items-center gap-2 text-xs text-crema/60 hover:text-crema">
              <LogOut className="size-3.5" /> Cerrar sesión
            </button>
          </form>
        </div>
      </div>
    </nav>
  );

  return (
    <>
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between bg-noche px-4 text-crema lg:hidden">
        <Logo className="text-3xl" />
        <button type="button" onClick={() => setOpen(true)} className="grid size-10 place-items-center" aria-label="Abrir menú">
          <Menu className="size-5" />
        </button>
      </div>
      <aside className="sticky top-0 hidden h-dvh bg-noche text-crema lg:block">{nav}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-noche/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-noche text-crema">{nav}</aside>
        </div>
      )}
    </>
  );
}
