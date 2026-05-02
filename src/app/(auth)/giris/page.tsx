"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { Mail, Lock, ShieldCheck } from "lucide-react";
import { Field, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";

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
  const { login } = useStore();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setTimeout(() => {
      const result = login(email, password);
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
    }, 400);
  };

  return (
    <div>
      <h1 className="text-3xl font-semibold text-brand-900">Giriş Yap</h1>
      <p className="mt-2 text-muted-foreground">
        Üye panelinize ve burs başvurularınıza erişmek için giriş yapın.
      </p>

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
          Giriş Yap
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          Hesabınız yok mu?{" "}
          <Link href="/kayit" className="text-brand-700 font-medium hover:underline">
            Üye olun
          </Link>
        </div>
      </form>

      <div className="mt-8 rounded-xl bg-brand-50/60 border border-brand-100 p-4">
        <div className="text-xs font-semibold text-brand-900 uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5" /> Demo Hesapları
        </div>
        <ul className="mt-3 space-y-1 text-xs text-brand-800">
          <li>
            <span className="font-mono">admin@umutdernegi.org</span> /{" "}
            <span className="font-mono">admin123</span> — Yönetici
          </li>
          <li>
            <span className="font-mono">ayse@example.com</span> /{" "}
            <span className="font-mono">uye123</span> — Üye
          </li>
        </ul>
      </div>
    </div>
  );
}
