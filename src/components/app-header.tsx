const navItems = [
  { href: '/dashboard', label: 'Dashboard', hint: 'Resumen' },
  { href: '/today', label: 'Hoy', hint: 'Sesión' },
  { href: '/calendar', label: 'Calendario', hint: 'Semana/mes' },
  { href: '/coach', label: 'Mister', hint: 'Atletas' },
];

export function AppHeader({ eyebrow }: { eyebrow?: string }) {
  return (
    <header className="mb-6 rounded-[28px] border border-[color:var(--line)] bg-white/70 p-3 shadow-sm backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <a href="/dashboard" className="flex items-center gap-3 font-black">
          <span className="grid size-11 place-items-center rounded-2xl bg-white shadow-sm">TP</span>
          <span>
            Training Planner
            {eyebrow && <small className="block text-xs font-bold text-[color:var(--muted)]">{eyebrow}</small>}
          </span>
        </a>

        <nav className="hidden items-center gap-2 md:flex" aria-label="Navegación principal">
          {navItems.map(item => (
            <a key={item.href} className="rounded-2xl px-4 py-3 text-sm font-black transition hover:bg-white" href={item.href}>
              {item.label}
              <span className="block text-[11px] font-bold text-[color:var(--muted)]">{item.hint}</span>
            </a>
          ))}
        </nav>

        <details className="relative md:hidden">
          <summary className="btn cursor-pointer list-none">Menú</summary>
          <div className="absolute right-0 z-20 mt-2 grid w-56 gap-2 rounded-3xl border border-[color:var(--line)] bg-white p-3 shadow-lg">
            {navItems.map(item => (
              <a key={item.href} className="rounded-2xl px-4 py-3 text-sm font-black hover:bg-[color:var(--background)]" href={item.href}>
                {item.label}
                <span className="block text-xs font-bold text-[color:var(--muted)]">{item.hint}</span>
              </a>
            ))}
          </div>
        </details>
      </div>
    </header>
  );
}
