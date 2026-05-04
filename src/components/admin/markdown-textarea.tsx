"use client";

import { useState } from "react";
import { Eye, FileText, HelpCircle } from "lucide-react";
import { Textarea } from "@/components/ui/input";
import { Markdown } from "@/lib/markdown";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  invalid?: boolean;
};

/**
 * Yaz / Önizle sekmeli markdown destekli textarea. Tasarım dilini
 * `<Textarea>` ile aynı tutar.
 */
export function MarkdownTextarea({
  value,
  onChange,
  placeholder,
  rows = 8,
  invalid,
}: Props) {
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="inline-flex bg-muted/60 rounded-md p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setTab("write")}
            className={cn(
              "inline-flex items-center gap-1.5 h-8 px-3 rounded-md font-medium transition-colors",
              tab === "write"
                ? "bg-white text-brand-900 shadow-sm"
                : "text-muted-foreground hover:text-brand-800",
            )}
          >
            <FileText className="h-3.5 w-3.5" /> Yaz
          </button>
          <button
            type="button"
            onClick={() => setTab("preview")}
            className={cn(
              "inline-flex items-center gap-1.5 h-8 px-3 rounded-md font-medium transition-colors",
              tab === "preview"
                ? "bg-white text-brand-900 shadow-sm"
                : "text-muted-foreground hover:text-brand-800",
            )}
          >
            <Eye className="h-3.5 w-3.5" /> Önizle
          </button>
        </div>
        <button
          type="button"
          onClick={() => setHelpOpen((v) => !v)}
          className="inline-flex items-center gap-1 h-8 px-2 text-xs text-muted-foreground hover:text-brand-800"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          Markdown ipuçları
        </button>
      </div>

      {helpOpen && (
        <div className="rounded-md border border-border bg-muted/30 px-4 py-3 mb-2 text-xs space-y-1 text-muted-foreground">
          <div>
            <code className="bg-white px-1 rounded">## Başlık</code> ·{" "}
            <code className="bg-white px-1 rounded">**kalın**</code> ·{" "}
            <code className="bg-white px-1 rounded">*italik*</code> ·{" "}
            <code className="bg-white px-1 rounded">`kod`</code>
          </div>
          <div>
            <code className="bg-white px-1 rounded">[bağlantı](https://…)</code>{" "}
            ·{" "}
            <code className="bg-white px-1 rounded">- madde işareti</code> ·{" "}
            <code className="bg-white px-1 rounded">1. numaralı</code>
          </div>
          <div>
            <code className="bg-white px-1 rounded">{"> alıntı"}</code> ·{" "}
            <code className="bg-white px-1 rounded">---</code> (yatay çizgi) ·
            paragraflar boş satırla ayrılır
          </div>
        </div>
      )}

      {tab === "write" ? (
        <Textarea
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            placeholder ??
            "## Başlık\n\nİçerik buraya gelir. **Kalın yazı**, *italik*, [bağlantı](https://…) kullanabilirsiniz.\n\n- Madde 1\n- Madde 2"
          }
          invalid={invalid}
          className="font-mono text-sm leading-relaxed"
        />
      ) : (
        <div
          className={cn(
            "rounded-md border bg-white px-5 py-4 min-h-[160px] text-sm text-muted-foreground",
            invalid ? "border-red-300" : "border-border",
          )}
          style={{ minHeight: `${rows * 24}px` }}
        >
          {value.trim() ? (
            <Markdown source={value} />
          ) : (
            <p className="text-muted-foreground/60 italic">
              Önizleme için içerik girin.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
