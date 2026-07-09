const tabs = [
  { href: '', label: 'Seguimiento' },
  { href: '/analysis', label: 'Análisis' },
  { href: '/stats', label: 'Stats/objetivos' },
];

export function AthleteSubnav({ athleteId, active }: { athleteId: string; active: 'overview' | 'analysis' | 'stats' }) {
  const activeHref = active === 'overview' ? '' : `/${active}`;

  return (
    <nav className="mb-5 flex flex-wrap gap-2" aria-label="Navegación ficha atleta">
      <a className="btn" href="/coach">← Roster</a>
      {tabs.map(tab => {
        const href = `/coach/athletes/${athleteId}${tab.href}`;
        const selected = tab.href === activeHref;
        return (
          <a key={tab.href || 'overview'} aria-current={selected ? 'page' : undefined} className={`btn ${selected ? 'btn-primary' : ''}`} href={href}>
            {tab.label}
          </a>
        );
      })}
    </nav>
  );
}
