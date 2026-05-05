"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Archive,
  ChevronRight,
  Download,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatusBadge, statusOptions } from "@/components/status";
import { useStore } from "@/lib/store";
import { formatDateTimeTR } from "@/lib/utils";
import type { ApplicationStatus, ScholarshipApplication } from "@/lib/types";

const MAX_BULK = 50;

export default function AdminApplicationsPage() {
  const { applications } = useStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | ApplicationStatus>("all");
  const [selected, setSelected] = useState<Set<string>>(() => new Set());

  const counts = useMemo(() => {
    const map: Record<ApplicationStatus | "all", number> = {
      all: applications.length,
      submitted: 0,
      in_review: 0,
      approved: 0,
      rejected: 0,
    };
    applications.forEach((a) => {
      map[a.status] += 1;
    });
    return map;
  }, [applications]);

  const filtered = useMemo(() => {
    return applications
      .filter((a) => (filter === "all" ? true : a.status === filter))
      .filter((a) =>
        query
          ? `${a.fullName} ${a.email} ${a.schoolName} ${a.id}`
              .toLocaleLowerCase("tr-TR")
              .includes(query.toLocaleLowerCase("tr-TR"))
          : true,
      )
      .sort(
        (a, b) =>
          new Date(b.submittedAt).getTime() -
          new Date(a.submittedAt).getTime(),
      );
  }, [applications, filter, query]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((prev) => {
      const allFilteredIds = filtered.map((a) => a.id);
      const allSelected = allFilteredIds.every((id) => prev.has(id));
      if (allSelected) {
        const next = new Set(prev);
        for (const id of allFilteredIds) next.delete(id);
        return next;
      }
      const next = new Set(prev);
      for (const id of allFilteredIds) next.add(id);
      return next;
    });
  };

  const allSelectedOnPage =
    filtered.length > 0 && filtered.every((a) => selected.has(a.id));
  const selectedCount = selected.size;
  const tooMany = selectedCount > MAX_BULK;

  // Toplu zip URL'i — yalnızca seçim varken render edilir.
  const bulkZipHref =
    selectedCount > 0
      ? `/api/applications/zip?ids=${encodeURIComponent(
          Array.from(selected).join(","),
        )}`
      : "#";

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-brand-900">
            Burs Başvuruları
          </h1>
          <p className="text-muted-foreground mt-1">
            Başvuruları inceleyin, evraklarını görüntüleyin ve durumlarını
            güncelleyin.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 h-11 px-4 rounded-md border border-border bg-white text-sm font-medium hover:bg-brand-50 text-brand-800">
          <Download className="h-4 w-4" /> CSV İndir
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-white">
        <div className="px-4 sm:px-6 pt-4 pb-3 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <FilterChip
              label={`Tümü (${counts.all})`}
              active={filter === "all"}
              onClick={() => setFilter("all")}
            />
            {statusOptions.map((opt) => (
              <FilterChip
                key={opt.value}
                label={`${opt.label} (${counts[opt.value]})`}
                active={filter === opt.value}
                onClick={() => setFilter(opt.value)}
              />
            ))}
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ad, e-posta, okul, ID..."
              className="pl-9"
            />
          </div>
        </div>

        {selectedCount > 0 && (
          <div
            className={
              "px-4 sm:px-6 py-3 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 " +
              (tooMany
                ? "border-amber-200 bg-amber-50/60"
                : "border-brand-100 bg-brand-50/40")
            }
          >
            <div className="text-sm">
              <span className="font-semibold text-brand-900">
                {selectedCount} başvuru
              </span>
              <span className="text-muted-foreground"> seçildi</span>
              {tooMany && (
                <span className="ml-2 text-amber-700 font-medium">
                  · Tek seferde en fazla {MAX_BULK} başvuru indirilebilir
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelected(new Set())}
                className="h-9 px-3 rounded-md text-xs font-medium border border-border bg-white text-brand-800 hover:bg-muted"
              >
                Seçimi Temizle
              </button>
              {tooMany ? (
                <button
                  type="button"
                  disabled
                  className="h-9 px-3 rounded-md text-xs font-semibold bg-muted text-muted-foreground inline-flex items-center gap-1.5 cursor-not-allowed"
                >
                  <Archive className="h-3.5 w-3.5" />
                  Belgeleri ZIP indir
                </button>
              ) : (
                <a
                  href={bulkZipHref}
                  className="h-9 px-3 rounded-md text-xs font-semibold bg-brand-900 text-white hover:bg-brand-800 inline-flex items-center gap-1.5"
                >
                  <Archive className="h-3.5 w-3.5" />
                  Seçili {selectedCount} başvurunun belgelerini ZIP indir
                </a>
              )}
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    aria-label="Tümünü seç"
                    checked={allSelectedOnPage}
                    onChange={toggleAll}
                    disabled={filtered.length === 0}
                    className="h-4 w-4 rounded border-border accent-brand-700 cursor-pointer disabled:cursor-not-allowed"
                  />
                </th>
                <th className="text-left font-medium px-4 py-3">ID</th>
                <th className="text-left font-medium px-4 py-3">Başvuran</th>
                <th className="text-left font-medium px-4 py-3">Eğitim</th>
                <th className="text-left font-medium px-4 py-3">GANO</th>
                <th className="text-left font-medium px-4 py-3">Belge</th>
                <th className="text-left font-medium px-4 py-3">Tarih</th>
                <th className="text-left font-medium px-4 py-3">Durum</th>
                <th className="text-right font-medium px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="text-center py-14 text-muted-foreground"
                  >
                    Sonuç bulunamadı.
                  </td>
                </tr>
              ) : (
                filtered.map((app) => (
                  <ApplicationRow
                    key={app.id}
                    app={app}
                    selected={selected.has(app.id)}
                    onToggle={() => toggle(app.id)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ApplicationRow({
  app,
  selected,
  onToggle,
}: {
  app: ScholarshipApplication;
  selected: boolean;
  onToggle: () => void;
}) {
  // Gerçekten indirilebilir belge sayısı (URL'i olanlar).
  const realDocs = Object.values(app.documents).filter(
    (d) => d && d.url,
  ).length;
  const totalDocs = Object.keys(app.documents).length;

  return (
    <tr
      className={
        "hover:bg-muted/30 " + (selected ? "bg-brand-50/40" : "")
      }
    >
      <td className="px-4 py-3.5">
        <input
          type="checkbox"
          aria-label={`${app.fullName} başvurusunu seç`}
          checked={selected}
          onChange={onToggle}
          className="h-4 w-4 rounded border-border accent-brand-700 cursor-pointer"
        />
      </td>
      <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">
        {app.id}
      </td>
      <td className="px-4 py-3.5">
        <div className="font-medium text-brand-900">{app.fullName}</div>
        <div className="text-xs text-muted-foreground">{app.email}</div>
      </td>
      <td className="px-4 py-3.5">
        <div className="text-brand-900">{app.schoolName}</div>
        <div className="text-xs text-muted-foreground">{app.department}</div>
      </td>
      <td className="px-4 py-3.5">{app.gpa}</td>
      <td className="px-4 py-3.5">
        <Badge tone={realDocs >= 4 ? "success" : "warning"}>
          {realDocs}/{totalDocs} belge
        </Badge>
      </td>
      <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap">
        {formatDateTimeTR(app.submittedAt)}
      </td>
      <td className="px-4 py-3.5">
        <StatusBadge status={app.status} />
      </td>
      <td className="px-6 py-3.5 text-right">
        <div className="inline-flex items-center gap-3">
          {realDocs > 0 && (
            <a
              href={`/api/applications/${app.id}/zip`}
              className="text-xs text-brand-700 hover:text-brand-900 inline-flex items-center gap-1"
              title="Bu başvurunun tüm belgelerini ZIP olarak indir"
            >
              <Archive className="h-3.5 w-3.5" /> ZIP
            </a>
          )}
          <Link
            href={`/admin/basvurular/${app.id}`}
            className="text-sm font-medium text-brand-700 hover:text-brand-900 inline-flex items-center"
          >
            İncele <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </td>
    </tr>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "h-9 px-3.5 rounded-full text-xs font-medium border transition-colors " +
        (active
          ? "bg-brand-900 text-white border-brand-900"
          : "bg-white text-brand-800 border-border hover:border-brand-200")
      }
    >
      {label}
    </button>
  );
}
