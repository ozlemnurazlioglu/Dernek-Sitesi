"use client";

import { Home, MapPin, Phone, User } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { Container } from "@/components/ui/section";
import { useStore } from "@/lib/store";

/**
 * `/hakkimizda/mahallelerimiz` — Mahalle adı, muhtar ve iletişim telefonunu
 * tablo halinde listeler. İçerik admin/mahallelerimiz sayfasından yönetilir.
 */
export default function MahallelerimizPage() {
  const { neighborhoods, siteSettings } = useStore();

  const sorted = [...neighborhoods].sort((a, b) => a.sort - b.sort);

  return (
    <>
      <PageHeader
        title="Mahallelerimiz"
        description={`${siteSettings.shortName || "Derneğimiz"} kapsamındaki mahalleler, görevli muhtarlar ve iletişim bilgileri.`}
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Hakkımızda", href: "/hakkimizda" },
          { label: "Mahallelerimiz" },
        ]}
      />

      <section>
        <Container className="py-16">
          {sorted.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-8 py-16 text-center">
              <Home className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-base font-medium text-brand-900">
                Henüz mahalle eklenmemiş
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Yetkili kullanıcılar yönetim panelinden mahalle ekleyebilir.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-white overflow-hidden">
              {/* Geniş ekran: tablo */}
              <div className="hidden md:block">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-brand-900">
                    <tr className="text-left">
                      <th className="px-6 py-4 font-semibold w-12">#</th>
                      <th className="px-6 py-4 font-semibold">Mahalle</th>
                      <th className="px-6 py-4 font-semibold">Muhtar</th>
                      <th className="px-6 py-4 font-semibold">Telefon</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {sorted.map((n, i) => (
                      <tr key={n.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 text-muted-foreground font-mono text-xs">
                          {i + 1}
                        </td>
                        <td className="px-6 py-4 font-medium text-brand-900">
                          {n.name}
                        </td>
                        <td className="px-6 py-4 text-brand-800">
                          {n.headman || (
                            <span className="text-muted-foreground italic">
                              Belirtilmemiş
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {n.phone ? (
                            <a
                              href={`tel:${n.phone.replace(/\s+/g, "")}`}
                              className="inline-flex items-center gap-1.5 text-brand-800 hover:text-gold-600 font-medium"
                              title="Aramak için tıklayın"
                            >
                              <Phone className="h-3.5 w-3.5" />
                              {n.phone}
                            </a>
                          ) : (
                            <span className="text-muted-foreground italic text-xs">
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobil: kart listesi */}
              <ul className="md:hidden divide-y divide-border">
                {sorted.map((n) => (
                  <li key={n.id} className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-brand-50 text-brand-700 inline-flex items-center justify-center shrink-0">
                        <Home className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-brand-900">
                          {n.name}
                        </div>
                        {n.headman && (
                          <div className="mt-1 flex items-center gap-1.5 text-sm text-brand-800">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            {n.headman}
                          </div>
                        )}
                        {n.phone && (
                          <a
                            href={`tel:${n.phone.replace(/\s+/g, "")}`}
                            className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-brand-800 hover:text-gold-600 font-medium"
                            title="Aramak için tıklayın"
                          >
                            <Phone className="h-3.5 w-3.5" />
                            {n.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="mt-6 text-xs text-muted-foreground flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            Bilgileri güncellemek için lütfen muhtarlığınızla iletişime geçin.
          </p>
        </Container>
      </section>
    </>
  );
}
