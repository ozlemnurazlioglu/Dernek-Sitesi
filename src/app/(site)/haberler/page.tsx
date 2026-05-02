"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { Container } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { formatDateTR } from "@/lib/utils";

const categories = ["Tümü", "Duyuru", "Haber", "Basın", "Proje"] as const;

export default function HaberlerPage() {
  const { news } = useStore();
  const [active, setActive] = useState<(typeof categories)[number]>("Tümü");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return news
      .filter((n) => (active === "Tümü" ? true : n.category === active))
      .filter((n) =>
        query
          ? `${n.title} ${n.excerpt}`
              .toLocaleLowerCase("tr-TR")
              .includes(query.toLocaleLowerCase("tr-TR"))
          : true,
      )
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() -
          new Date(a.publishedAt).getTime(),
      );
  }, [news, active, query]);

  return (
    <>
      <PageHeader
        title="Haberler & Duyurular"
        description="Derneğimizin son haberleri, projeleri ve duyurularına buradan ulaşabilirsiniz."
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Haberler" },
        ]}
      />
      <Container className="py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setActive(c)}
                className={
                  "h-9 px-4 rounded-full text-sm font-medium border transition-colors " +
                  (active === c
                    ? "bg-brand-900 text-white border-brand-900"
                    : "bg-white text-brand-800 border-border hover:border-brand-200")
                }
              >
                {c}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Haberlerde ara..."
              className="pl-9"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-2xl">
            <p className="text-muted-foreground">
              Aradığınız kriterlere uygun haber bulunamadı.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => (
              <Link
                key={item.id}
                href={`/haberler/${item.slug}`}
                className="group rounded-2xl border border-border bg-white overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={item.cover}
                    alt={item.title}
                    className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <Badge tone="brand" className="absolute top-3 left-3 bg-white">
                    {item.category}
                  </Badge>
                </div>
                <div className="p-5">
                  <div className="text-xs text-muted-foreground">
                    {formatDateTR(item.publishedAt)} · {item.author}
                  </div>
                  <h3 className="text-lg font-semibold text-brand-900 mt-2 leading-tight group-hover:text-brand-700">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                    {item.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
