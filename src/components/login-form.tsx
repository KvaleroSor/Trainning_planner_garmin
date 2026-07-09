'use client';

import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useState, type FormEvent } from 'react';

export function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('as') === 'coach' ? 'coach@trainingplanner.local' : 'k@demo.local');
  const [password, setPassword] = useState('demo1234');
  const [error, setError] = useState<string | null>(searchParams.get('error'));
  const callbackUrl = searchParams.get('callbackUrl') ?? (email.includes('coach') ? '/coach' : '/dashboard');

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const result = await signIn('credentials', {
      email,
      password,
      callbackUrl,
      redirect: false,
    });

    if (result?.error) {
      setError('Credenciales no válidas o usuario sin perfil activo.');
      return;
    }

    window.location.href = result?.url ?? callbackUrl;
  }

  return (
    <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
      <label className="grid gap-2 text-sm font-bold">
        Email
        <input className="rounded-2xl border border-[color:var(--line)] bg-white/80 px-4 py-3 outline-none" value={email} name="email" type="email" onChange={event => setEmail(event.target.value)} />
      </label>
      <label className="grid gap-2 text-sm font-bold">
        Contraseña
        <input className="rounded-2xl border border-[color:var(--line)] bg-white/80 px-4 py-3 outline-none" value={password} name="password" type="password" onChange={event => setPassword(event.target.value)} />
      </label>
      {error && <p className="rounded-2xl bg-[color:var(--rose)] px-4 py-3 text-sm font-bold">{error}</p>}
      <button className="btn btn-primary mt-2" type="submit">Entrar con sesión real</button>
      <div className="grid gap-2 sm:grid-cols-2">
        <button className="btn" type="button" onClick={() => setEmail('k@demo.local')}>Usar atleta demo</button>
        <button className="btn" type="button" onClick={() => setEmail('coach@trainingplanner.local')}>Usar Mister demo</button>
      </div>
    </form>
  );
}
