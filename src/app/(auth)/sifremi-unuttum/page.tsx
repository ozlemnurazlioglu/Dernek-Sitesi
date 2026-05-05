"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowLeft, KeyRound, Loader2, Mail, MessageSquare, Phone } from "lucide-react";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

/**
 * "Şifremi Unuttum" sayfası.
 *
 * Email gönderme altyapısı henüz kurulmadığı için bu sayfa otomatik bir
 * sıfırlama linki yollamaz. Bunun yerine talebi `messages` tablosuna işler
 * (admin Mesajlar sekmesinde "[Şifre Sıfırlama Talebi]" başlığıyla görür) ve
 * üyeyi telefonla geri arayacağına dair bilgilendirir.
 *
 * Yanıt her zaman aynıdır: hesabın varlığı sızdırılmaz.
 */
export default function SifremiUnuttumPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone, note }),
      });
      if (!res.ok) {
        let msg = "Talep gönderilemedi";
        try {
          const body = (await res.json()) as { error?: string };
          if (body?.error) msg = body.error;
        } catch {
          // generic mesaj kullan
        }
        toast({ tone: "error", title: "Hata", description: msg });
        return;
      }
      setSubmitted(true);
    } catch (err) {
      console.error("[sifremi-unuttum] hata", err);
      toast({
        tone: "error",
        title: "Bağlantı hatası",
        description: "İnternet bağlantınızı kontrol edip tekrar deneyin.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div>
        <div className="h-12 w-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
          <KeyRound className="h-5 w-5" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold text-brand-900">
          Talebiniz alındı
        </h1>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          Şifre sıfırlama talebiniz dernek yöneticilerine iletildi.
          Sahte taleplerin önüne geçmek için <strong>kayıtlı telefon
          numaranızdan teyit</strong> alacağız ve ardından yeni şifrenizi
          belirleyip size güvenli bir kanaldan ileteceğiz.
        </p>
        <div className="mt-6 rounded-md border border-brand-100 bg-brand-50/40 px-4 py-3 text-sm text-brand-900">
          <strong>Bilgi:</strong> Genellikle aynı gün içinde geri dönüş
          yapılır. Acil bir durum varsa derneğimizi telefonla arayabilirsiniz.
        </div>
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link
            href="/giris"
            className="inline-flex items-center justify-center h-11 px-5 rounded-md bg-brand-900 text-white text-sm font-medium hover:bg-brand-800 transition-colors"
          >
            Giriş sayfasına dön
          </Link>
          <Link
            href="/iletisim"
            className="inline-flex items-center justify-center h-11 px-5 rounded-md border border-border text-brand-900 text-sm font-medium hover:bg-muted/40 transition-colors"
          >
            İletişim bilgileri
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/giris"
        className="text-sm text-muted-foreground hover:text-brand-900 inline-flex items-center gap-1 mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Girişe dön
      </Link>

      <h1 className="text-3xl font-semibold text-brand-900">
        Şifremi Unuttum
      </h1>
      <p className="mt-2 text-muted-foreground">
        Aşağıdaki bilgileri doldurun; dernek yöneticilerimiz sizi telefonla
        arayarak teyit alacak ve yeni şifrenizi güvenli bir kanaldan size
        iletecek.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <Field label="Üyelik e-posta adresiniz" required>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9"
              placeholder="ornek@eposta.com"
              autoComplete="email"
              disabled={submitting}
            />
          </div>
        </Field>

        <Field label="Telefon numaranız (opsiyonel)" hint="Hızlı iletişim için.">
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="pl-9"
              placeholder="+90 5xx xxx xx xx"
              autoComplete="tel"
              disabled={submitting}
              maxLength={64}
            />
          </div>
        </Field>

        <Field
          label="Eklemek istediğiniz not (opsiyonel)"
          hint="Örn: kayıtlı numaram değişti, yeni numaram budur."
        >
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="pl-9 min-h-[88px]"
              placeholder="İstediğiniz herhangi bir bilgiyi ekleyebilirsiniz."
              disabled={submitting}
              maxLength={1000}
            />
          </div>
        </Field>

        <div className="rounded-md border border-amber-200 bg-amber-50/60 px-3 py-2 text-xs text-amber-900">
          <strong>Güvenlik:</strong> Talep onayı için dernek tarafından
          telefonla aranacaksınız. Yeni şifreyi e-posta ile göndermiyoruz —
          telefon görüşmesinde size iletilir.
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={submitting || !email}
          leftIcon={
            submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <KeyRound className="h-4 w-4" />
            )
          }
        >
          {submitting ? "Gönderiliyor…" : "Sıfırlama Talebi Gönder"}
        </Button>
      </form>
    </div>
  );
}
