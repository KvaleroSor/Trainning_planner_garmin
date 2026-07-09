import { Suspense } from 'react';
import { LoginForm } from '@/components/login-form';

export default function LoginPage() {
  return (
    <main className="shell grid min-h-screen place-items-center py-8">
      <section className="panel w-full max-w-md p-6 md:p-8">
        <span className="pill">Auth server-side</span>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.04em]">Entrar en Training Planner</h1>
        <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
          Login real con Auth.js Credentials. Los roles ya no se deciden por localStorage ni por botones con casco de juguete.
        </p>
        <Suspense fallback={<div className="mt-6 rounded-2xl bg-white/70 p-4 text-sm">Cargando login…</div>}>
          <LoginForm />
        </Suspense>
        <p className="mt-5 rounded-2xl bg-[color:var(--butter)]/70 p-4 text-sm text-[color:var(--muted)]">
          Seeds: <b>k@demo.local</b> / <b>coach@trainingplanner.local</b>. Contraseña: <b>demo1234</b>.
        </p>
      </section>
    </main>
  );
}
