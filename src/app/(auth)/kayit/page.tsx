"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Field, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import { DEFAULT_AUTH_UI } from "@/lib/defaults/auth";
import type { AuthUiText } from "@/lib/types";

export default function KayitPage() {
  const router = useRouter();
  const { register, pageBlocks } = useStore();
  const { toast } = useToast();
  const auth =
    (pageBlocks["ui.auth"] as AuthUiText | undefined) ?? DEFAULT_AUTH_UI;
  const t = auth.register;
  const [data, setData] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    password: "",
    passwordConfirm: "",
  });
  /**
   * Honeypot — bot algılaması.
   *
   * Gerçek bir kullanıcı bu alanı görmez (ekran dışına çekildi ve
   * aria-hidden). Boş kalmalıdır. Otomatik bot'lar formdaki tüm
   * input'ları doldurmaya çalıştığı için bu alanı da doldurur ve
   * sunucu tarafında reddedilir. Recaptcha gerektirmez, ücretsizdir.
   */
  const [hp, setHp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (data.password.length < 6) {
      setError("Şifre en az 6 karakter olmalı.");
      return;
    }
    if (data.password !== data.passwordConfirm) {
      setError("Şifreler eşleşmiyor.");
      return;
    }
    setLoading(true);
    const result = await register({
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      city: data.city,
      password: data.password,
      website: hp,
    });
    if (result.ok) {
      toast({
        tone: "success",
        title: "Üyeliğiniz oluşturuldu",
        description: "Hesabınıza yönlendiriliyorsunuz.",
      });
      router.push("/hesabim");
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div>
      <h1 className="text-3xl font-semibold text-brand-900">{t.title}</h1>
      <p className="mt-2 text-muted-foreground">{t.description}</p>

      <form onSubmit={onSubmit} className="mt-8 grid sm:grid-cols-2 gap-4">
        {/*
         * Honeypot — ekran dışına itildi ve ekran okuyuculara gizlendi.
         * Bot'lar tüm input'ları doldurma eğiliminde olduğu için bu
         * alanı doldururlar ve kayıt API'sinde reddedilirler.
         * Gerçek kullanıcılar bu alanı asla göremez/odaklayamaz.
         */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "-10000px",
            top: "auto",
            width: 1,
            height: 1,
            overflow: "hidden",
          }}
        >
          <label htmlFor="hp-website">Web siteniz</label>
          <input
            id="hp-website"
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={hp}
            onChange={(e) => setHp(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <Field label="Ad Soyad" required>
            <Input
              required
              value={data.fullName}
              onChange={(e) =>
                setData((p) => ({ ...p, fullName: e.target.value }))
              }
              placeholder="Adınız Soyadınız"
            />
          </Field>
        </div>
        <Field label="E-posta" required>
          <Input
            type="email"
            required
            value={data.email}
            onChange={(e) => setData((p) => ({ ...p, email: e.target.value }))}
            placeholder="ornek@eposta.com"
          />
        </Field>
        <Field label="Telefon">
          <Input
            type="tel"
            value={data.phone}
            onChange={(e) => setData((p) => ({ ...p, phone: e.target.value }))}
            placeholder="+90 5xx xxx xx xx"
          />
        </Field>
        <Field label="Şehir">
          <Input
            value={data.city}
            onChange={(e) => setData((p) => ({ ...p, city: e.target.value }))}
            placeholder="İstanbul"
          />
        </Field>
        <span className="hidden sm:block" />
        <Field label="Şifre" required hint="En az 6 karakter">
          <Input
            type="password"
            required
            value={data.password}
            onChange={(e) =>
              setData((p) => ({ ...p, password: e.target.value }))
            }
            placeholder="••••••••"
          />
        </Field>
        <Field label="Şifre Tekrar" required>
          <Input
            type="password"
            required
            value={data.passwordConfirm}
            onChange={(e) =>
              setData((p) => ({ ...p, passwordConfirm: e.target.value }))
            }
            placeholder="••••••••"
          />
        </Field>

        {error && (
          <div className="sm:col-span-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="sm:col-span-2 mt-2">
          <Button type="submit" loading={loading} className="w-full" size="lg">
            {t.submitButton}
          </Button>
        </div>

        <div className="sm:col-span-2 text-center text-sm text-muted-foreground">
          {t.loginPrompt}{" "}
          <Link
            href="/giris"
            className="text-brand-700 font-medium hover:underline"
          >
            {t.loginLink}
          </Link>
        </div>
      </form>
    </div>
  );
}
