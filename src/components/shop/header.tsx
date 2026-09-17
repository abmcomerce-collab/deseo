"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, Search, User, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { cartCount, useCart } from "@/stores/cart";
import { cn } from "@/lib/format";
import { SearchDialog } from "./search-dialog";

const NAV = [
  { href: "/tienda", label: "Tienda" },
  { href: "/tienda?tipo=pack", label: "Packs" },
  { href: "/eventos", label: "Eventos" },
  { href: "/entregas", label: "Entregas" },
];

const subscribe = () => () => {};
export function useHydrated() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}

export function Header() {
  const pathname = usePathname();
  const items = useCart((s) => s.items);
  const openCart = useCart((s) => s.open);
  const hydrated = useHydrated();
  const count = hydrated ? cartCount(items) : 0;
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [searchKey, setSearchKey] = useState(0);
  const [bump, setBump] = useState(0);
  const [prevPath, setPrevPath] = useState(pathname);
  const [prevCount, setPrevCount] = useState(count);

  // Ajustes derivados durante el render (sin efectos en cascada).
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setMenu(false);
  }
  if (prevCount !== count) {
    setPrevCount(count);
    if (count > prevCount && prevCount > 0) setBump((b) => b + 1);
  }

  const closeSearch = useCallback(() => setSearch(false), []);
  const openSearch = () => {
    setSearchKey((k) => k + 1);
    setSearch(true);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchKey((k) => k + 1);
        setSearch((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);


  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 transition-[background-color,box-shadow,backdrop-filter] duration-500",
          scrolled ? "bg-papel/85 shadow-[0_1px_0_var(--color-linea)] backdrop-blur-xl" : "bg-transparent",
        )}
      >
        <div className="container-x grid h-16 grid-cols-[1fr_auto_1fr] items-center md:h-[4.5rem]">
          <nav aria-label="Principal" className="flex items-center gap-1">
            <button
              type="button"
              className="-ml-2 grid size-10 place-items-center rounded-full md:hidden"
              onClick={() => setMenu(true)}
              aria-label="Abrir menú"
            >
              <Menu className="size-5" />
            </button>
            <ul className="hidden items-center gap-7 md:flex">
              {NAV.map((n) => (
                <li key={n.label}>
                  <Link href={n.href} className="link-underline py-1 text-[0.92rem]">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <Link href="/" aria-label="DESEO, ir al inicio" className="text-[2.1rem] md:text-[2.5rem]">
            <Logo />
          </Link>

          <div className="flex items-center justify-end gap-1 md:gap-2">
            <button
              type="button"
              onClick={openSearch}
              className="group hidden h-10 items-center gap-3 rounded-full border border-linea px-3.5 text-sm text-humo transition hover:border-noche hover:text-noche lg:flex"
            >
              <Search className="size-4" />
              Buscar sabores
              <kbd className="rounded-md bg-arena/70 px-1.5 py-0.5 font-mono text-[10px] text-noche">⌘K</kbd>
            </button>
            <button
              type="button"
              onClick={openSearch}
              className="-mr-1 grid size-10 place-items-center rounded-full lg:hidden"
              aria-label="Buscar"
            >
              <Search className="size-5" />
            </button>
            <Link href="/cuenta" className="hidden size-10 place-items-center rounded-full sm:grid" aria-label="Mi cuenta">
              <User className="size-5" />
            </Link>
            <button
              type="button"
              onClick={openCart}
              className="relative flex h-10 items-center gap-2 rounded-full bg-noche pl-4 pr-1.5 text-sm text-crema transition hover:bg-brasa hover:text-noche"
            >
              <span>Cesta</span>
              <motion.span
                key={bump}
                initial={{ scale: bump ? 1.5 : 1 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                className="grid h-7 min-w-7 place-items-center rounded-full bg-crema px-1.5 font-mono text-xs text-noche"
              >
                {count}
              </motion.span>
              <span className="sr-only"> productos, abrir cesta</span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menu && (
          <motion.div
            className="fixed inset-0 z-50 bg-noche text-crema md:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="container-x flex h-16 items-center justify-between">
              <Logo className="text-[2.1rem]" />
              <button type="button" onClick={() => setMenu(false)} className="grid size-10 place-items-center" aria-label="Cerrar menú">
                <X className="size-6" />
              </button>
            </div>
            <ul className="container-x mt-10 space-y-2">
              {[{ href: "/", label: "Inicio" }, ...NAV, { href: "/cuenta", label: "Mi cuenta" }].map((n, i) => (
                <motion.li
                  key={n.label}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link href={n.href} className="font-display block text-6xl">
                    {n.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
            <p className="container-x eyebrow absolute bottom-8 text-crema/50">Solo para mayores de 18 · Barcelona</p>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchDialog key={searchKey} open={search} onClose={closeSearch} />
    </>
  );
}
