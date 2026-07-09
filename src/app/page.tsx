export default function HomePage() {
  return (
    <main className="shell py-6 md:py-10">
      <nav className="flex items-center justify-between gap-4 py-3">
        <div className="flex items-center gap-3 font-black">
          <span className="grid size-11 place-items-center rounded-2xl bg-white shadow-sm">TP</span>
          <span>Training Planner</span>
        </div>
        <a className="btn" href="/login">Entrar</a>
      </nav>

      <section className="grid items-center gap-8 py-14 md:grid-cols-[1.05fr_.95fr] md:py-20">
        <div>
          <span className="pill">Next backend foundation · Garmin-ready</span>
          <h1 className="mt-5 max-w-3xl text-5xl font-black tracking-[-0.05em] md:text-7xl">
            Planifica con contexto, no con ruido.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[color:var(--muted)]">
            Base real para atletas y misteres verificados: calendario, relaciones coach-atleta, Prisma, Auth y una estética pastel que no parece un panel de nave enemiga.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a className="btn btn-primary" href="/login">Ir al login</a>
            <a className="btn" href="/dashboard">Ver dashboard demo</a>
          </div>
        </div>

        <div className="panel p-4 md:p-6">
          <div className="rounded-[24px] bg-white/80 p-5 shadow-sm">
            <p className="text-sm font-bold text-[color:var(--muted)]">Panel Hoy</p>
            <h2 className="mt-2 text-3xl font-black">Bici Z2 · 90 min</h2>
            <p className="mt-2 text-[color:var(--muted)]">RPE 6 · Fatiga 5/10 · Sueño 7/10</p>
          </div>
          <div className="mt-4 grid gap-3">
            {['Lun 1 · 60 min', 'Mié 3 · Garmin', 'Vie 5 · Fuerza', 'Dom 7 · Libre'].map((day, index) => (
              <div key={day} className="flex items-center justify-between rounded-2xl border border-[color:var(--line)] bg-white/70 px-4 py-3">
                <b>{day}</b>
                <span className="size-3 rounded-full" style={{ background: ['var(--sky)', 'var(--mint)', 'var(--rose)', 'var(--butter)'][index] }} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
