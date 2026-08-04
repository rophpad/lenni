"use client";

import { useId, useState } from "react";

/* pr-11 leaves room for the reveal toggle that sits inside the field */
const FIELD = "field pr-11";

export function PasswordInput({
  label,
  name,
  autoComplete = "current-password",
  minLength = 8,
  required = true,
  defaultValue,
}: {
  label: string;
  name: string;
  autoComplete?: string;
  minLength?: number;
  required?: boolean;
  defaultValue?: string;
}) {
  const [visible, setVisible] = useState(false);
  const id = useId();

  return (
    <label className="mb-4 block" htmlFor={id}>
      <span className="mb-1 block text-body-s font-medium text-subtle">{label}</span>
      <span className="relative block">
        <input
          autoComplete={autoComplete}
          className={FIELD}
          defaultValue={defaultValue}
          id={id}
          minLength={minLength}
          name={name}
          required={required}
          type={visible ? "text" : "password"}
        />
        <button
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute right-1 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-subtle transition hover:bg-ui-raised hover:text-foreground"
          onClick={() => setVisible(v => !v)}
          /* keep focus in the field so typing continues uninterrupted */
          onMouseDown={event => event.preventDefault()}
          tabIndex={-1}
          type="button"
        >
          <svg
            className="size-4.5"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
            viewBox="0 0 24 24"
          >
            <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
            <circle cx="12" cy="12" r="3.2" />
            {!visible && <path d="M4 20L20 4" />}
          </svg>
        </button>
      </span>
    </label>
  );
}
