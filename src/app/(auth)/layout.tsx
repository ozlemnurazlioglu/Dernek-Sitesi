import Link from "next/link";
import { type ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/brand/logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex flex-col px-6 sm:px-10 py-8">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Logo />
          </Link>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-brand-900 inline-flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" /> Ana sayfaya dön
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center py-10">
          <div className="w-full max-w-md">{children}</div>
        </div>
        <div className="text-xs text-muted-foreground text-center">
          © {new Date().getFullYear()} Umut Eğitim ve Dayanışma Derneği
        </div>
      </div>
      <aside className="hidden lg:block relative bg-brand-950 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1532012197267-da84d127e765?w=1200&q=80"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-950 via-brand-900/80 to-brand-700/40" />
        <div className="relative h-full flex flex-col justify-end p-12 text-white">
          <div className="max-w-md">
            <div className="text-xs uppercase tracking-widest text-gold-300">
              Üye Topluluğumuz
            </div>
            <h2 className="text-3xl font-semibold mt-3 leading-tight">
              "Bu yolculukta birlikte olduğumuz her gönüllü, bir öğrencinin
              hayatına dokunuyor."
            </h2>
            <p className="mt-4 text-white/75">
              Üye olun, etkinliklerimizden ücretsiz yararlanın ve burs
              başvurularınızı tek panelden takip edin.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
