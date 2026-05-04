"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { Mail, Lock, ShieldCheck } from "lucide-react";
import { Field, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import { DEFAULT_AUTH_UI } from "@/lib/defaults/auth";
import type { AuthUiText } from "@/lib/types";

export default function GirisPage() {
  return (
    <Suspense fallback={<div className="text-muted-foreground">Yükleniyor...</div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const { login, pageBlocks } = useStore();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const auth =
    (pageBlocks["ui.auth"] as AuthUiText | undefined) ?? DEFAULT_AUTH_UI;
  const t = auth.login;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await login(email, password);
    if (result.ok) {
      toast({
        tone: "success",
        title: `Hoş geldiniz, ${result.user.fullName.split(" ")[0]}`,
      });
      const redirect = search.get("redirect");
      if (redirect) {
        router.push(redirect);
      } else if (result.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/hesabim");
      }
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div>
      <h1 className="text-3xl font-semibold text-brand-900">{t.title}</h1>
      <p className="mt-2 text-muted-foreground">{t.description}</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <Field label="E-posta" required>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9"
              placeholder="ornek@eposta.com"
            />
          </div>
        </Field>
        <Field label="Şifre" required>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-9"
              placeholder="••••••••"
            />
          </div>
        </Field>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <Button type="submit" loading={loading} className="w-full" size="lg">
          {t.submitButton}
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          {t.registerPrompt}{" "}
          <Link href="/kayit" className="text-brand-700 font-medium hover:underline">
            {t.registerLink}
          </Link>
        </div>
      </form>

      {auth.showDemoAccounts && auth.demoAccountsLines.length > 0 && (
        <div className="mt-8 rounded-xl bg-brand-50/60 border border-brand-100 p-4">
          <div className="text-xs font-semibold text-brand-900 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" /> {auth.demoAccountsTitle}
          </div>
          <ul className="mt-3 space-y-1 text-xs text-brand-800">
            {auth.demoAccountsLines.map((line, i) => {
              const [label, rest] = line.split("|").map((s) => s.trim());
              const credentials = rest ?? label;
              const labelText = rest ? label : "";
              const [creds, ...labelParts] = credentials.split(" — ");
              const inlineLabel = labelParts.join(" — ").trim();
              const finalLabel = inlineLabel || labelText;
              const [user, pwd] = creds.split("/").map((s) => s.trim());
              return (
                <li key={i}>
                  <span className="font-mono">{user}</span>
                  {pwd && (
                    <>
                      {" "}/ <span className="font-mono">{pwd}</span>
                    </>
                  )}
                  {finalLabel && <> — {finalLabel}</>}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
