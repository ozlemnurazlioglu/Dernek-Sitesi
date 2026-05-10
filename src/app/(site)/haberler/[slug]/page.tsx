"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { Container } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { formatDateTR } from "@/lib/utils";
import { Markdown } from "@/lib/markdown";
import { DEFAULT_COMMON_UI } from "@/lib/defaults/ui-common";
import { ImageLightbox } from "@/components/site/image-lightbox";
import type { CommonUiText } from "@/lib/types";

export default function NewsDetailPage() {
  const params = useParams<{ slug: string }>();
  const { news, ready, pageBlocks } = useStore();
  const ui =
    (pageBlocks["ui.common"] as CommonUiText | undefined) ?? DEFAULT_COMMON_UI;
  const item = news.find((n) => n.slug === params.slug);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (!ready) {
    return (
      <Container className="py-20 text-center text-muted-foreground">
        {ui.loadingText ?? DEFAULT_COMMON_UI.loadingText}
      </Container>
    );
  }
  if (!item) return notFound();

  const others = news.filter((n) => n.id !== item.id).slice(0, 3);
  const galleryImages = item.images ?? [];

  return (
    <article>
      <div className="relative h-[420px] overflow-hidden">
        <img
          src={item.cover}
          alt={item.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/85 via-brand-900/40 to-brand-900/30" />
        <Container className="relative h-full flex flex-col justify-end pb-10 text-white">
          <Link
            href="/haberler"
            className="inline-flex items-center gap-1 text-sm text-white/75 hover:text-white mb-4"
          >
            <ArrowLeft className="h-4 w-4" />{" "}
            {ui.newsDetail?.backLink ?? DEFAULT_COMMON_UI.newsDetail.backLink}
          </Link>
          <Badge tone="gold" className="w-fit mb-3">
            {item.category}
          </Badge>
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight max-w-3xl">
            {item.title}
          </h1>
          <div className="mt-4 text-sm text-white/80 flex items-center gap-5">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4" /> {formatDateTR(item.publishedAt)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <User className="h-4 w-4" /> {item.author}
            </span>
          </div>
        </Container>
      </div>

      <Container className="py-14 grid md:grid-cols-12 gap-10">
        <div className="md:col-span-8">
          <p className="text-lg text-brand-900 font-medium leading-relaxed">
            {item.excerpt}
          </p>
          <Markdown
            source={item.body}
            className="mt-8 text-muted-foreground"
          />

          {item.images && item.images.length > 0 && (
            <section className="mt-12">
              <h2 className="text-xl md:text-2xl font-semibold text-brand-900 mb-5">
                Fotoğraf Galerisi
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                {item.images.map((url, idx) => (
                  <button
                    key={`${url}-${idx}`}
                    type="button"
                    onClick={() => {
                      setLightboxIndex(idx);
                      setLightboxOpen(true);
                    }}
                    className="group relative aspect-square overflow-hidden rounded-lg bg-muted/30 border border-border hover:border-brand-300 transition-all"
                    aria-label={`${idx + 1}. fotoğrafı büyüt`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`${item.title} – ${idx + 1}`}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
        <aside className="md:col-span-4">
          <div className="sticky top-24 rounded-2xl border border-border bg-muted/40 p-6">
            <h3 className="text-sm font-semibold text-brand-900 uppercase tracking-wider">
              {ui.newsDetail?.sidebarTitle ??
                DEFAULT_COMMON_UI.newsDetail.sidebarTitle}
            </h3>
            <div className="mt-5 space-y-4">
              {others.map((o) => (
                <Link
                  key={o.id}
                  href={`/haberler/${o.slug}`}
                  className="group flex gap-3"
                >
                  <img
                    src={o.cover}
                    alt={o.title}
                    className="h-16 w-20 rounded-md object-cover"
                  />
                  <div>
                    <div className="text-xs text-muted-foreground">
                      {formatDateTR(o.publishedAt)}
                    </div>
                    <p className="text-sm font-medium text-brand-900 leading-tight mt-1 group-hover:text-brand-700 line-clamp-2">
                      {o.title}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </Container>

      <ImageLightbox
        images={galleryImages}
        index={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onIndexChange={setLightboxIndex}
      />
    </article>
  );
}
