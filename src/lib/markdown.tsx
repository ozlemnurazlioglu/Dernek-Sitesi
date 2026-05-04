/**
 * Hafif, dependency'siz, XSS-güvenli markdown render'ı.
 *
 * Çıktıyı asla `dangerouslySetInnerHTML` ile değil, React öğeleri olarak
 * üretir; bu yüzden istemcinin yazdığı HTML hiçbir zaman çalıştırılmaz.
 * Sadece desteklenen alt küme:
 *
 *   - # / ## / ### başlıklar
 *   - **kalın**, *italik*, `inline code`
 *   - [metin](url)  — sadece http(s):, mailto:, tel:, / başlangıçlı
 *   - - veya 1. ile başlayan listeler
 *   - > blockquote
 *   - ---  yatay çizgi
 *   - paragraf (boş satır = ayrım)
 *
 * Diğer markdown sözdizimi (resim, tablo, kod blokları, vs.) bilinçli olarak
 * desteklenmiyor; içerik metinlerinde gerek yok ve genişletilebilir.
 */

import type { ReactNode } from "react";

/** Etkin satır içi token'lar — sıra önemli; daha uzun olanlar önce gelir. */
type Inline =
  | { kind: "text"; value: string }
  | { kind: "bold"; children: Inline[] }
  | { kind: "italic"; children: Inline[] }
  | { kind: "code"; value: string }
  | { kind: "link"; href: string; children: Inline[] };

/** Blok seviyesinde öğeler. */
type Block =
  | { kind: "heading"; level: 1 | 2 | 3; children: Inline[] }
  | { kind: "paragraph"; children: Inline[] }
  | { kind: "ulist"; items: Inline[][] }
  | { kind: "olist"; items: Inline[][] }
  | { kind: "quote"; children: Inline[] }
  | { kind: "hr" };

/* ------------------------- inline parsing ------------------------- */

function parseInline(src: string): Inline[] {
  const out: Inline[] = [];
  let i = 0;
  let buf = "";

  const flush = () => {
    if (buf) {
      out.push({ kind: "text", value: buf });
      buf = "";
    }
  };

  while (i < src.length) {
    const ch = src[i];

    // `inline code`
    if (ch === "`") {
      const end = src.indexOf("`", i + 1);
      if (end !== -1) {
        flush();
        out.push({ kind: "code", value: src.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }

    // **bold** veya __bold__
    if (
      (ch === "*" && src[i + 1] === "*") ||
      (ch === "_" && src[i + 1] === "_")
    ) {
      const marker = ch + ch;
      const end = src.indexOf(marker, i + 2);
      if (end !== -1) {
        flush();
        out.push({ kind: "bold", children: parseInline(src.slice(i + 2, end)) });
        i = end + 2;
        continue;
      }
    }

    // *italic* veya _italic_  (tek karakter)
    if (ch === "*" || ch === "_") {
      // Word içindeki snake_case'i italic olarak yorumlama: önceki karakter
      // alfasayısalsa atla.
      const prev = src[i - 1];
      const isWordBoundary = !prev || /[\s\W]/.test(prev);
      if (isWordBoundary) {
        const end = src.indexOf(ch, i + 1);
        if (end !== -1 && end > i + 1) {
          flush();
          out.push({
            kind: "italic",
            children: parseInline(src.slice(i + 1, end)),
          });
          i = end + 1;
          continue;
        }
      }
    }

    // [text](url)
    if (ch === "[") {
      const closeBracket = src.indexOf("]", i + 1);
      if (
        closeBracket !== -1 &&
        src[closeBracket + 1] === "(" &&
        src.indexOf(")", closeBracket + 2) !== -1
      ) {
        const closeParen = src.indexOf(")", closeBracket + 2);
        const text = src.slice(i + 1, closeBracket);
        const href = src.slice(closeBracket + 2, closeParen);
        const safe = sanitizeHref(href);
        if (safe) {
          flush();
          out.push({
            kind: "link",
            href: safe,
            children: parseInline(text),
          });
          i = closeParen + 1;
          continue;
        }
      }
    }

    buf += ch;
    i++;
  }

  flush();
  return out;
}

/**
 * URL'leri doğrula. javascript:, data:, vbscript: gibi tehlikeli protokolleri
 * tamamen reddet. Göreli yollara (/foo) ve mailto:/tel: gibi güvenli protokollere
 * izin ver.
 */
function sanitizeHref(href: string): string | null {
  const trimmed = href.trim();
  if (!trimmed) return null;
  // İlk olarak göreli yollar
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) return trimmed;
  // Protokol bağlamı
  const m = /^([a-z][a-z0-9+\-.]*):/i.exec(trimmed);
  if (m) {
    const proto = m[1].toLowerCase();
    if (
      proto === "http" ||
      proto === "https" ||
      proto === "mailto" ||
      proto === "tel"
    ) {
      return trimmed;
    }
    return null;
  }
  // Protokolsüz → http:// varsay
  return `http://${trimmed}`;
}

/* ------------------------- block parsing ------------------------- */

export function parseMarkdown(input: string): Block[] {
  if (!input) return [];
  // \r\n → \n normalize, sondaki boşlukları temizle
  const lines = input.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Boş satır → blok ayırıcı
    if (!line.trim()) {
      i++;
      continue;
    }

    // ---  yatay çizgi
    if (/^---+\s*$/.test(line.trim())) {
      blocks.push({ kind: "hr" });
      i++;
      continue;
    }

    // ### / ## / # heading
    const h = /^(#{1,3})\s+(.+)$/.exec(line);
    if (h) {
      const level = h[1].length as 1 | 2 | 3;
      blocks.push({
        kind: "heading",
        level,
        children: parseInline(h[2].trim()),
      });
      i++;
      continue;
    }

    // > blockquote — birden fazla satır birleşir
    if (line.startsWith(">")) {
      const buf: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) {
        buf.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      blocks.push({
        kind: "quote",
        children: parseInline(buf.join(" ")),
      });
      continue;
    }

    // - veya * ile madde işaretli liste
    if (/^[-*]\s+/.test(line)) {
      const items: Inline[][] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(parseInline(lines[i].replace(/^[-*]\s+/, "")));
        i++;
      }
      blocks.push({ kind: "ulist", items });
      continue;
    }

    // 1. 2. ... numaralı liste
    if (/^\d+\.\s+/.test(line)) {
      const items: Inline[][] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(parseInline(lines[i].replace(/^\d+\.\s+/, "")));
        i++;
      }
      blocks.push({ kind: "olist", items });
      continue;
    }

    // Paragraf — boş satır ya da blok başlığına kadar topla
    const buf: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,3})\s+/.test(lines[i]) &&
      !lines[i].startsWith(">") &&
      !/^[-*]\s+/.test(lines[i]) &&
      !/^\d+\.\s+/.test(lines[i]) &&
      !/^---+\s*$/.test(lines[i].trim())
    ) {
      buf.push(lines[i]);
      i++;
    }
    if (buf.length) {
      blocks.push({
        kind: "paragraph",
        children: parseInline(buf.join(" ")),
      });
    }
  }

  return blocks;
}

/* ------------------------- React rendering ------------------------- */

function renderInline(nodes: Inline[], keyPrefix = ""): ReactNode {
  return nodes.map((node, idx) => {
    const k = `${keyPrefix}-${idx}`;
    switch (node.kind) {
      case "text":
        return <span key={k}>{node.value}</span>;
      case "bold":
        return (
          <strong key={k} className="font-semibold text-brand-900">
            {renderInline(node.children, k)}
          </strong>
        );
      case "italic":
        return <em key={k}>{renderInline(node.children, k)}</em>;
      case "code":
        return (
          <code
            key={k}
            className="rounded bg-muted px-1.5 py-0.5 text-[0.9em] font-mono text-brand-900"
          >
            {node.value}
          </code>
        );
      case "link": {
        const isExternal = /^https?:/i.test(node.href);
        return (
          <a
            key={k}
            href={node.href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            className="text-brand-700 underline underline-offset-2 hover:text-brand-900"
          >
            {renderInline(node.children, k)}
          </a>
        );
      }
    }
  });
}

/**
 * Markdown metnini güvenli şekilde React öğelerine dönüştürür.
 * `className` kapsayıcı `<div>`'e uygulanır.
 */
export function Markdown({
  source,
  className,
}: {
  source: string;
  className?: string;
}) {
  const blocks = parseMarkdown(source);
  return (
    <div className={className}>
      {blocks.map((b, idx) => {
        const k = `b-${idx}`;
        switch (b.kind) {
          case "heading": {
            const Tag = (`h${b.level + 1}` as "h2" | "h3" | "h4");
            const cls =
              b.level === 1
                ? "text-2xl font-semibold text-brand-900 mt-8 mb-3"
                : b.level === 2
                  ? "text-xl font-semibold text-brand-900 mt-7 mb-3"
                  : "text-lg font-semibold text-brand-900 mt-6 mb-2";
            return (
              <Tag key={k} className={cls}>
                {renderInline(b.children, k)}
              </Tag>
            );
          }
          case "paragraph":
            return (
              <p key={k} className="leading-loose mb-4 last:mb-0">
                {renderInline(b.children, k)}
              </p>
            );
          case "ulist":
            return (
              <ul
                key={k}
                className="list-disc pl-6 my-4 space-y-1.5 marker:text-brand-400"
              >
                {b.items.map((item, j) => (
                  <li key={`${k}-${j}`} className="leading-relaxed">
                    {renderInline(item, `${k}-${j}`)}
                  </li>
                ))}
              </ul>
            );
          case "olist":
            return (
              <ol
                key={k}
                className="list-decimal pl-6 my-4 space-y-1.5 marker:text-brand-400"
              >
                {b.items.map((item, j) => (
                  <li key={`${k}-${j}`} className="leading-relaxed">
                    {renderInline(item, `${k}-${j}`)}
                  </li>
                ))}
              </ol>
            );
          case "quote":
            return (
              <blockquote
                key={k}
                className="border-l-4 border-brand-300 bg-brand-50/50 pl-4 py-2 my-4 italic text-brand-900/85"
              >
                {renderInline(b.children, k)}
              </blockquote>
            );
          case "hr":
            return <hr key={k} className="my-8 border-border" />;
        }
      })}
    </div>
  );
}
