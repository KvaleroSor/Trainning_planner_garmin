export default function LoginPage() {
  return (
    <main className="shell grid min-h-screen place-items-center py-8">
      <section className="panel w-full max-w-md p-6 md:p-8">
        <span className="pill">Login backend preparado</span>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.04em]">Entrar en Training Planner</h1>
        <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
          La autenticación real ya queda cableada con Auth.js Credentials. Esta pantalla mantiene acceso demo mientras migramos acciones server-side.
        </p>
        <form className="mt-6 grid gap-4" action="/dashboard">
          <label className="grid gap-2 text-sm font-bold">
            Email
            <input className="rounded-2xl border border-[color:var(--line)] bg-white/80 px-4 py-3 outline-none" defaultValue="k@demo.local" name="email" type="email" />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Contraseña
            <input className="rounded-2xl border border-[color:var(--line)] bg-white/80 px-4 py-3 outline-none" defaultValue="demo1234" name="password" type="password" />
          </label>
          <button className="btn btn-primary mt-2" type="submit">Entrar en demo</button>
        </form>
        <p className="mt-5 rounded-2xl bg-[color:var(--butter)]/70 p-4 text-sm text-[color:var(--muted)]">
          Usuario seed: <b>k@demo.local</b>. Coach seed: <b>coach@trainingplanner.local</b>. Nada sensible todavía, como debe ser.
        </p>
      </section>
    </main>
  );
}
