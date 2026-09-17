"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { login, register, type AuthState } from "@/app/actions/auth";

function Field({
  name,
  label,
  state,
  type = "text",
  ...props
}: { name: string; label: string; state: AuthState } & React.InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false);
  const error = state?.errors?.[name];
  const isPassword = type === "password";
  return (
    <div>
      <label htmlFor={name} className="label">
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={isPassword && show ? "text" : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${name}-error` : undefined}
          className="field"
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-humo hover:text-noche"
            aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </div>
      {error && (
        <p id={`${name}-error`} className="mt-1.5 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

function FormMessage({ state }: { state: AuthState }) {
  if (!state?.message) return null;
  return (
    <p role="alert" className={`rounded-2xl px-4 py-3 text-sm ${state.ok ? "bg-lima/50" : "bg-brasa/10 text-red-800"}`}>
      {state.message}
    </p>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="next" value={next ?? ""} />
      <FormMessage state={state} />
      <Field name="email" label="Email" type="email" autoComplete="email" state={state} required />
      <Field name="password" label="Contraseña" type="password" autoComplete="current-password" state={state} required />
      <button className="btn btn-primary w-full py-4" disabled={pending}>
        {pending ? "Entrando…" : "Entrar"} <ArrowRight className="size-4" />
      </button>
      <p className="text-center text-sm text-humo">
        ¿Primera vez?{" "}
        <Link href={`/cuenta/registro${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-medium text-noche underline">
          Crea tu cuenta
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(register, null);
  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="next" value={next ?? ""} />
      <FormMessage state={state} />
      <Field name="name" label="Nombre" autoComplete="name" state={state} required />
      <Field name="email" label="Email" type="email" autoComplete="email" state={state} required />
      <Field name="password" label="Contraseña" type="password" autoComplete="new-password" state={state} required />
      <p className="-mt-2 text-xs text-humo">Mínimo 8 caracteres, con letras y números.</p>
      <label className="flex cursor-pointer items-start gap-3 text-sm">
        <input type="checkbox" name="age" className="mt-0.5 size-4 accent-[#140b10]" />
        <span>Confirmo que tengo 18 años o más.</span>
      </label>
      {state?.errors?.age && <p className="text-sm text-red-700">{state.errors.age}</p>}
      <button className="btn btn-primary w-full py-4" disabled={pending}>
        {pending ? "Creando cuenta…" : "Crear cuenta"} <ArrowRight className="size-4" />
      </button>
      <p className="text-center text-sm text-humo">
        ¿Ya tienes cuenta?{" "}
        <Link href={`/cuenta/acceso${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-medium text-noche underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
