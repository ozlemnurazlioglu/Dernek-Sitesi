"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Archive,
  ChevronRight,
  Download,
  FileSpreadsheet,
  Filter,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { StatusBadge, statusOptions } from "@/components/status";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import { formatDateTimeTR } from "@/lib/utils";
import type { ApplicationStatus, ScholarshipApplication } from "@/lib/types";

/**
 * Gelişmiş filtreler — küçük inline panel. Boş alanlar atlanır
 * (yani değer girilmezse o kriter uygulanmaz).
 *
 *   istanbul: "all" — atla, "in" — sadece İstanbul, "out" — İstanbul dışı.
 *   city:     serbest metin (case-insensitive substring eşleşmesi)
 *   gpaMin/Max: ondalık sayı; öğrencinin GPA'sı bu aralığa düşmeli
 *   incomeMax: anne+baba toplam max ₺ (üstü filtrelenir)
 *   year:     YYYY; başvuru tarihinin yılı eşleşmeli
 */
type AdvFilters = {
  city: string;
  istanbul: "all" | "in" | "out";
  schoolType: "all" | ScholarshipApplication["schoolType"];
  department: string;
  fatherJob: string;
  motherJob: string;
  gender: "all" | ScholarshipApplication["gender"];
  gpaMin: string;
  gpaMax: string;
  incomeMax: string;
  ffMin: string;
  year: string;
};

const EMPTY_FILTERS: AdvFilters = {
  city: "",
  istanbul: "all",
  schoolType: "all",
  department: "",
  fatherJob: "",
  motherJob: "",
  gender: "all",
  gpaMin: "",
  gpaMax: "",
  incomeMax: "",
  ffMin: "",
  year: "",
};

const SCHOOL_LABELS: Record<ScholarshipApplication["schoolType"], string> = {
  lise: "Lise",
  onlisans: "Ön Lisans",
  lisans: "Lisans",
  yuksek_lisans: "Yüksek Lisans",
  doktora: "Doktora",
};

/**
 * Toplu ZIP indirme limiti. Backend (`/api/applications/zip`) tarafında da
 * `MAX_IDS = 50` sabit; bu limiti UI'da senkron tutuyoruz ki kullanıcı
 * 50'yi aşan bir seçim yapınca buton önceden disabled olsun.
 */
const MAX_BULK = 50;

/**
 * Filtre + arama sonucu görünür başvuruların belgelerini tek ZIP'te indirme
 * URL'i. Kullanıcı seçim yapmasa bile, sayfada gördüğü her başvuru için
 * tek tıkla "Tümünü İndir" hızı sağlar.
 */
function buildAllZipHref(ids: string[]) {
  if (ids.length === 0) return "#";
  return `/api/applications/zip?ids=${encodeURIComponent(ids.join(","))}`;
}

/**
 * Filtrelenmiş başvuruları CSV olarak indirir. Tarayıcıda blob URL üzerinden
 * inerek; harici endpoint gerekmez. UTF-8 BOM eklenir → Excel TR karakterleri
 * doğru gösterir. Alanlar standart RFC 4180: tırnaklarla sarılı, içerideki
 * tırnaklar `""` ile escape edilir, yeni satırlar koruınur.
 */
/** CSV/Excel için ortak başlık + satır üreteci — 30+ alan. */
function buildExportRows(rows: ScholarshipApplication[]) {
  const headers = [
    "ID",
    "Ad Soyad",
    "T.C. Kimlik",
    "Doğum Tarihi",
    "Cinsiyet",
    "E-posta",
    "Telefon",
    "Adres",
    "Şehir",
    "Kademe",
    "Okul",
    "Bölüm",
    "Sınıf",
    "GANO",
    "FF Sayısı",
    "Tahmini Mezuniyet",
    "Baba Adı",
    "Baba Mesleği",
    "Baba Geliri",
    "Anne Adı",
    "Anne Mesleği",
    "Anne Geliri",
    "Toplam Gelir",
    "Kardeş",
    "Çalışan Sayısı",
    "Önceki Burs",
    "Referans Adı",
    "Referans Telefon",
    "Referans Yakınlık",
    "Veli/İlgili Adı",
    "Veli/İlgili Telefon",
    "IBAN",
    "Durum",
    "Otomatik Red Sebebi",
    "Komisyon Puanı",
    "Komisyon Notu",
    "KVKK Onayı",
    "Başvuru Tarihi",
  ];

  const statusLabel = (s: ApplicationStatus) =>
    statusOptions.find((o) => o.value === s)?.label ?? s;

  const data = rows.map((r) => {
    const fi = Number(r.fatherIncome) || 0;
    const mi = Number(r.motherIncome) || 0;
    return [
      r.id,
      r.fullName,
      r.nationalId,
      r.birthDate,
      r.gender === "kadin" ? "Kadın" : r.gender === "erkek" ? "Erkek" : "—",
      r.email,
      r.phone,
      r.address,
      r.city,
      r.schoolType,
      r.schoolName,
      r.department,
      r.grade,
      r.gpa,
      r.failedCourses ?? 0,
      r.expectedGradYear ?? "",
      r.fatherName,
      r.fatherJob,
      fi,
      r.motherName,
      r.motherJob,
      mi,
      fi + mi,
      r.siblings,
      r.workingMembers,
      r.previousScholarship
        ? r.previousScholarshipDetail || "Evet"
        : "Hayır",
      r.referenceName,
      r.referencePhone,
      r.referenceRelation,
      r.parentReferenceName,
      r.parentReferencePhone,
      r.iban,
      statusLabel(r.status),
      r.autoRejectedReason || "",
      r.score ?? "",
      r.reviewerNote ?? "",
      r.kvkkConsentAt ? formatDateTimeTR(r.kvkkConsentAt) : "",
      formatDateTimeTR(r.submittedAt),
    ];
  });

  return { headers, data };
}

/**
 * Tarayıcı bağımsız "dosya indirme" yardımcısı. Edge/Chrome bazı sürümlerde
 * `<a download="...">` attribute'unu blob URL'inde yoksayıp UUID adı veriyor
 * (kullanıcının indirmesi uzantısız bir dosya olarak iniyor). Bunu önlemek
 * için:
 *  1) Blob'u `File` objesine sarıyoruz → tarayıcı dosya adını koruyor.
 *  2) IE/Edge eski sürümler için `navigator.msSaveBlob` fallback'i.
 *  3) Anchor'a `rel="noopener"` ve DOM'a ekleme garantisi.
 */
function triggerDownload(blob: Blob, filename: string) {
  const file = new File([blob], filename, { type: blob.type });
  // Eski Edge/IE
  const navAny = navigator as unknown as {
    msSaveBlob?: (blob: Blob, name: string) => boolean;
  };
  if (typeof navAny.msSaveBlob === "function") {
    navAny.msSaveBlob(file, filename);
    return;
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}

function downloadApplicationsCsv(rows: ScholarshipApplication[]) {
  const { headers, data } = buildExportRows(rows);
  const escape = (v: unknown) => {
    const s =
      v === null || v === undefined
        ? ""
        : typeof v === "string"
          ? v
          : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };
  const lines = [headers.map(escape).join(",")];
  for (const row of data) {
    lines.push(row.map(escape).join(","));
  }
  const blob = new Blob(["\uFEFF" + lines.join("\r\n")], {
    type: "text/csv;charset=utf-8",
  });
  const stamp = new Date().toISOString().slice(0, 10);
  triggerDownload(blob, `Basvurular-${stamp}-${rows.length}adet.csv`);
}

/**
 * XLSX olarak indir — sunucu endpoint'i `exceljs` ile gerçek .xlsx üretir.
 * Burada da aynı görünür filtre uygulansın diye seçili id'leri sunucuya
 * gönderiyoruz; sunucu DB'den taze veri çekip yazıyor.
 */
/**
 * XLSX indir — tarayıcının kendi indirme yöneticisini tetikler (gizli iframe
 * ile GET endpoint'e navigate). Bu yöntem Edge dahil tüm modern tarayıcılarda
 * Content-Disposition header'ından dosya adını doğru okur; blob/anchor
 * pattern'inde Edge bazen UUID üretiyordu. ID listesi ~500'e kadar güvenle
 * URL'e sığar; üstü için POST blob fallback'i çağrılır.
 */
async function downloadApplicationsXlsx(ids: string[]) {
  if (ids.length === 0) return;

  // URL fazla uzayacaksa (Tarayıcı/Sunucu limiti ~8KB) POST blob fallback'ine
  // düş. ID prefix'i kısa olduğu için ~600 ID güvenli sınır.
  if (ids.length <= 500) {
    const url = `/api/admin/applications/export-xlsx?ids=${encodeURIComponent(ids.join(","))}`;
    // Gizli iframe — sayfayı yenilemeden direkt indirir. window.location
    // kullanılsaydı bazen mevcut sayfa unmount oluyor.
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = url;
    document.body.appendChild(iframe);
    // 60 saniye sonra DOM temizliği — indirme başladıysa iframe'in kalmasına
    // gerek yok.
    setTimeout(() => {
      try {
        document.body.removeChild(iframe);
      } catch {
        /* zaten kaldırılmış */
      }
    }, 60_000);
    return;
  }

  // 500+ ID — büyük seçim, POST + blob (fallback). Edge UUID adı verebilir
  // ama bu durum çok nadir; kullanıcı uzantıyı manuel düzeltir.
  const res = await fetch("/api/admin/applications/export-xlsx", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) {
    throw new Error(`XLSX indirilemedi (HTTP ${res.status})`);
  }
  const buf = await res.arrayBuffer();
  const blob = new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const stamp = new Date().toISOString().slice(0, 10);
  triggerDownload(blob, `Basvurular-${stamp}-${ids.length}adet.xlsx`);
}

/**
 * Silme modali için hedef. "single" tek başvuru, "bulk" çoklu seçim.
 * Bu state null değilse modal açıktır.
 */
type DeleteTarget =
  | { kind: "single"; app: ScholarshipApplication }
  | { kind: "bulk"; ids: string[] };

export default function AdminApplicationsPage() {
  const { applications, bootstrap } = useStore();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | ApplicationStatus>("all");
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [advOpen, setAdvOpen] = useState(false);
  const [adv, setAdv] = useState<AdvFilters>(EMPTY_FILTERS);
  const [exporting, setExporting] = useState<"csv" | "xlsx" | null>(null);

  const counts = useMemo(() => {
    const map: Record<ApplicationStatus | "all", number> = {
      all: applications.length,
      submitted: 0,
      in_review: 0,
      approved: 0,
      rejected: 0,
      needs_update: 0,
    };
    applications.forEach((a) => {
      map[a.status] += 1;
    });
    return map;
  }, [applications]);

  const filtered = useMemo(() => {
    const q = query.toLocaleLowerCase("tr-TR");
    const isIstanbul = (city: string) =>
      city.toLocaleLowerCase("tr-TR").includes("istanbul") ||
      city.toLocaleLowerCase("tr-TR").includes("i̇stanbul");
    const parseNum = (s: string) => {
      const trimmed = s.trim();
      if (!trimmed) return null;
      const n = Number(trimmed.replace(",", "."));
      return Number.isFinite(n) ? n : null;
    };
    const gpaMin = parseNum(adv.gpaMin);
    const gpaMax = parseNum(adv.gpaMax);
    const incomeMax = parseNum(adv.incomeMax);
    const ffMin = parseNum(adv.ffMin);
    const year = adv.year ? Number(adv.year) : null;

    return applications
      .filter((a) => (filter === "all" ? true : a.status === filter))
      .filter((a) => {
        if (!q) return true;
        return `${a.fullName} ${a.email} ${a.schoolName} ${a.id} ${a.nationalId}`
          .toLocaleLowerCase("tr-TR")
          .includes(q);
      })
      .filter((a) => {
        if (adv.istanbul === "in" && !isIstanbul(a.city)) return false;
        if (adv.istanbul === "out" && isIstanbul(a.city)) return false;
        if (adv.city) {
          if (
            !a.city
              .toLocaleLowerCase("tr-TR")
              .includes(adv.city.toLocaleLowerCase("tr-TR"))
          ) {
            return false;
          }
        }
        if (adv.schoolType !== "all" && a.schoolType !== adv.schoolType)
          return false;
        if (
          adv.department &&
          !a.department
            .toLocaleLowerCase("tr-TR")
            .includes(adv.department.toLocaleLowerCase("tr-TR"))
        )
          return false;
        if (
          adv.fatherJob &&
          !a.fatherJob
            .toLocaleLowerCase("tr-TR")
            .includes(adv.fatherJob.toLocaleLowerCase("tr-TR"))
        )
          return false;
        if (
          adv.motherJob &&
          !a.motherJob
            .toLocaleLowerCase("tr-TR")
            .includes(adv.motherJob.toLocaleLowerCase("tr-TR"))
        )
          return false;
        if (adv.gender !== "all" && a.gender !== adv.gender) return false;
        const gpa = parseNum(a.gpa);
        if (gpaMin != null && (gpa == null || gpa < gpaMin)) return false;
        if (gpaMax != null && (gpa == null || gpa > gpaMax)) return false;
        if (incomeMax != null) {
          const total = (Number(a.fatherIncome) || 0) + (Number(a.motherIncome) || 0);
          if (total > incomeMax) return false;
        }
        if (ffMin != null && (a.failedCourses ?? 0) < ffMin) return false;
        if (year != null) {
          const y = new Date(a.submittedAt).getFullYear();
          if (y !== year) return false;
        }
        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.submittedAt).getTime() -
          new Date(a.submittedAt).getTime(),
      );
  }, [applications, filter, query, adv]);

  const activeAdvCount =
    (adv.city ? 1 : 0) +
    (adv.istanbul !== "all" ? 1 : 0) +
    (adv.schoolType !== "all" ? 1 : 0) +
    (adv.department ? 1 : 0) +
    (adv.fatherJob ? 1 : 0) +
    (adv.motherJob ? 1 : 0) +
    (adv.gender !== "all" ? 1 : 0) +
    (adv.gpaMin ? 1 : 0) +
    (adv.gpaMax ? 1 : 0) +
    (adv.incomeMax ? 1 : 0) +
    (adv.ffMin ? 1 : 0) +
    (adv.year ? 1 : 0);

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

  /**
   * Tek veya toplu silme işlemini gerçekleştirir. Backend hem fiziksel
   * dosyaları (Vercel Blob / yerel disk) hem de DB kayıtlarını
   * (`applications` + CASCADE ile `application_documents`) temizler.
   * Sonrasında `bootstrap()` ile yerel store DB ile senkronlanır; UI'da
   * silinen başvurular anında kaybolur.
   */
  async function executeDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.kind === "single") {
        const app = deleteTarget.app;
        const res = await fetch(
          `/api/admin/applications/${encodeURIComponent(app.id)}`,
          { method: "DELETE", credentials: "same-origin" },
        );
        if (!res.ok) {
          const body = (await res
            .json()
            .catch(() => ({}))) as { error?: string };
          throw new Error(body.error ?? "Silme işlemi başarısız.");
        }
        toast({
          tone: "success",
          title: "Başvuru silindi",
          description: `${app.id} (${app.fullName}) ve yüklenmiş evraklar kaldırıldı.`,
        });
        setSelected((prev) => {
          const next = new Set(prev);
          next.delete(app.id);
          return next;
        });
      } else {
        const res = await fetch("/api/admin/applications/bulk-delete", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: deleteTarget.ids }),
        });
        const body = (await res.json().catch(() => ({}))) as {
          error?: string;
          deleted?: number;
        };
        if (!res.ok) {
          throw new Error(body.error ?? "Silme işlemi başarısız.");
        }
        toast({
          tone: "success",
          title: "Başvurular silindi",
          description: `${body.deleted ?? 0} başvuru ve evrakları kaldırıldı.`,
        });
        setSelected(new Set());
      }
      await bootstrap();
      setDeleteTarget(null);
    } catch (err) {
      toast({
        tone: "error",
        title: "Hata",
        description:
          err instanceof Error ? err.message : "Beklenmedik bir hata oluştu.",
      });
    } finally {
      setDeleting(false);
    }
  }

  // Toplu zip URL'i — yalnızca seçim varken render edilir.
  const bulkZipHref =
    selectedCount > 0
      ? `/api/applications/zip?ids=${encodeURIComponent(
          Array.from(selected).join(","),
        )}`
      : "#";

  // Filtreli (görünür) tüm başvuruların ZIP'i. Seçim gerekmez — kullanıcı
  // doğrudan "şu an gördüğüm tüm başvuruların belgelerini indir" diyebilir.
  const filteredIds = filtered.map((a) => a.id);
  const allFilteredZipHref = buildAllZipHref(filteredIds);
  const filteredCount = filtered.length;
  const filteredTooMany = filteredCount > MAX_BULK;
  const filterLabel =
    filter === "all"
      ? "Tümü"
      : (statusOptions.find((o) => o.value === filter)?.label ?? "");

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
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setExporting("csv");
              try {
                downloadApplicationsCsv(filtered);
              } finally {
                window.setTimeout(() => setExporting(null), 500);
              }
            }}
            disabled={filteredCount === 0 || exporting !== null}
            className="inline-flex items-center gap-2 h-11 px-4 rounded-md border border-border bg-white text-sm font-medium hover:bg-brand-50 text-brand-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
            title={
              filteredCount === 0
                ? "İndirilecek başvuru yok"
                : `${filterLabel} (${filteredCount}) başvurularını CSV olarak indir`
            }
          >
            <Download className="h-4 w-4" /> CSV İndir
          </button>
          <button
            type="button"
            onClick={async () => {
              setExporting("xlsx");
              try {
                await downloadApplicationsXlsx(filtered.map((a) => a.id));
              } catch (err) {
                toast({
                  tone: "error",
                  title: "Excel indirilemedi",
                  description: String(err instanceof Error ? err.message : err),
                });
              } finally {
                setExporting(null);
              }
            }}
            disabled={filteredCount === 0 || exporting !== null}
            className="inline-flex items-center gap-2 h-11 px-4 rounded-md bg-emerald-700 text-white text-sm font-medium hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed"
            title={
              filteredCount === 0
                ? "İndirilecek başvuru yok"
                : `${filterLabel} (${filteredCount}) başvurularını Excel (.xlsx) olarak indir`
            }
          >
            <FileSpreadsheet className="h-4 w-4" /> Excel İndir
          </button>
          {/*
            Tümünü ZIP olarak indirme butonu. "Tümü" filtresinde ise tüm
            başvurular; başka filtrede ise yalnızca o filtreye uyanlar
            indirilir. Filtreli sayı 50'yi aşarsa buton disabled — kullanıcı
            önce filtreyi daraltmalı veya elle seçim yapmalı. Bu, backend
            tarafındaki MAX_IDS=50 limiti ile uyumlu.
          */}
          {filteredTooMany ? (
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-2 h-11 px-4 rounded-md bg-muted text-muted-foreground text-sm font-semibold cursor-not-allowed"
              title={`Tek seferde en fazla ${MAX_BULK} başvuru indirilebilir. Lütfen filtreyi daraltın veya manuel seçim yapın.`}
            >
              <Archive className="h-4 w-4" />
              {filterLabel} ({filteredCount}) ·{" "}
              <span className="font-normal">limit {MAX_BULK}</span>
            </button>
          ) : (
            <a
              href={allFilteredZipHref}
              aria-disabled={filteredCount === 0}
              onClick={(e) => {
                if (filteredCount === 0) e.preventDefault();
              }}
              className={
                "inline-flex items-center gap-2 h-11 px-4 rounded-md text-sm font-semibold " +
                (filteredCount === 0
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-brand-900 text-white hover:bg-brand-800")
              }
              title={
                filteredCount === 0
                  ? "İndirilecek başvuru yok"
                  : `${filterLabel} (${filteredCount}) başvurunun TÜM belgelerini tek ZIP olarak indir`
              }
            >
              <Archive className="h-4 w-4" />
              {filterLabel} ({filteredCount}) belgelerini ZIP indir
            </a>
          )}
        </div>
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
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ad, e-posta, okul, ID..."
                className="pl-9"
              />
            </div>
            <button
              type="button"
              onClick={() => setAdvOpen((v) => !v)}
              className={
                "inline-flex items-center gap-1.5 h-11 px-3 rounded-md border text-sm font-medium transition-colors " +
                (advOpen || activeAdvCount > 0
                  ? "border-brand-700 bg-brand-50 text-brand-900"
                  : "border-border bg-white text-brand-800 hover:bg-muted")
              }
              title="Gelişmiş filtreler"
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Gelişmiş</span>
              {activeAdvCount > 0 && (
                <span className="rounded-full bg-brand-700 text-white text-[10px] font-semibold h-5 min-w-5 px-1.5 inline-flex items-center justify-center">
                  {activeAdvCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {advOpen && (
          <div className="px-4 sm:px-6 py-4 border-b border-border bg-muted/30 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-brand-900 mb-1 block">
                  Şehir
                </label>
                <Input
                  placeholder="İstanbul, Ankara, …"
                  value={adv.city}
                  onChange={(e) => setAdv({ ...adv, city: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-brand-900 mb-1 block">
                  İstanbul içi/dışı
                </label>
                <Select
                  value={adv.istanbul}
                  onChange={(e) =>
                    setAdv({
                      ...adv,
                      istanbul: e.target.value as AdvFilters["istanbul"],
                    })
                  }
                >
                  <option value="all">Tümü</option>
                  <option value="in">Sadece İstanbul içi</option>
                  <option value="out">Sadece İstanbul dışı</option>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-brand-900 mb-1 block">
                  Kademe
                </label>
                <Select
                  value={adv.schoolType}
                  onChange={(e) =>
                    setAdv({
                      ...adv,
                      schoolType: e.target.value as AdvFilters["schoolType"],
                    })
                  }
                >
                  <option value="all">Hepsi</option>
                  {(Object.keys(SCHOOL_LABELS) as ScholarshipApplication["schoolType"][]).map(
                    (k) => (
                      <option key={k} value={k}>
                        {SCHOOL_LABELS[k]}
                      </option>
                    ),
                  )}
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-brand-900 mb-1 block">
                  Bölüm içerir
                </label>
                <Input
                  placeholder="Hukuk, mühendislik…"
                  value={adv.department}
                  onChange={(e) =>
                    setAdv({ ...adv, department: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-medium text-brand-900 mb-1 block">
                  Baba mesleği içerir
                </label>
                <Input
                  placeholder="Emekli, işçi…"
                  value={adv.fatherJob}
                  onChange={(e) => setAdv({ ...adv, fatherJob: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-brand-900 mb-1 block">
                  Anne mesleği içerir
                </label>
                <Input
                  placeholder="Ev hanımı, …"
                  value={adv.motherJob}
                  onChange={(e) => setAdv({ ...adv, motherJob: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-brand-900 mb-1 block">
                  Cinsiyet
                </label>
                <Select
                  value={adv.gender}
                  onChange={(e) =>
                    setAdv({
                      ...adv,
                      gender: e.target.value as AdvFilters["gender"],
                    })
                  }
                >
                  <option value="all">Hepsi</option>
                  <option value="kadin">Kadın</option>
                  <option value="erkek">Erkek</option>
                  <option value="belirtmek_istemiyorum">Belirtilmemiş</option>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-brand-900 mb-1 block">
                  GANO Min
                </label>
                <Input
                  placeholder="2.50"
                  value={adv.gpaMin}
                  onChange={(e) => setAdv({ ...adv, gpaMin: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-brand-900 mb-1 block">
                  GANO Max
                </label>
                <Input
                  placeholder="4.00"
                  value={adv.gpaMax}
                  onChange={(e) => setAdv({ ...adv, gpaMax: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-brand-900 mb-1 block">
                  Aile Geliri Max (₺)
                </label>
                <Input
                  placeholder="20000"
                  value={adv.incomeMax}
                  onChange={(e) => setAdv({ ...adv, incomeMax: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-brand-900 mb-1 block">
                  FF Min
                </label>
                <Input
                  placeholder="4"
                  value={adv.ffMin}
                  onChange={(e) => setAdv({ ...adv, ffMin: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-brand-900 mb-1 block">
                  Başvuru Yılı
                </label>
                <Input
                  placeholder={String(new Date().getFullYear())}
                  value={adv.year}
                  onChange={(e) => setAdv({ ...adv, year: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                {activeAdvCount > 0
                  ? `${activeAdvCount} kriter aktif · ${filtered.length} sonuç`
                  : `Hiç kriter seçilmedi · ${filtered.length} sonuç`}
              </p>
              <button
                type="button"
                onClick={() => setAdv(EMPTY_FILTERS)}
                disabled={activeAdvCount === 0}
                className="h-9 px-3 rounded-md text-xs font-medium border border-border bg-white text-brand-800 hover:bg-muted inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="h-3.5 w-3.5" /> Temizle
              </button>
            </div>
          </div>
        )}

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
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSelected(new Set())}
                disabled={deleting}
                className="h-9 px-3 rounded-md text-xs font-medium border border-border bg-white text-brand-800 hover:bg-muted disabled:opacity-50"
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
              {/* Toplu silme — kırmızı, dikkat çekici. ZIP limiti olan
                  MAX_BULK=50 burada geçerli değil; backend MAX=1000'e
                  kadar destekler. */}
              <button
                type="button"
                disabled={deleting || selectedCount === 0}
                onClick={() =>
                  setDeleteTarget({
                    kind: "bulk",
                    ids: Array.from(selected),
                  })
                }
                className="h-9 px-3 rounded-md text-xs font-semibold bg-red-600 text-white hover:bg-red-700 inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                title={`Seçili ${selectedCount} başvuruyu ve tüm evraklarını kalıcı olarak sil`}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Seçilenleri Sil ({selectedCount})
              </button>
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
                    onDelete={() => setDeleteTarget({ kind: "single", app })}
                    deleting={deleting}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Silme onay modali — hem tek başvuru hem toplu silme için. */}
      <Modal
        open={!!deleteTarget}
        onClose={() => (deleting ? undefined : setDeleteTarget(null))}
        title={
          deleteTarget?.kind === "bulk"
            ? `${deleteTarget.ids.length} başvuruyu sil`
            : "Başvuruyu sil"
        }
      >
        {deleteTarget && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Bu işlem <strong>geri alınamaz</strong>. Başvuruya ait yüklenmiş
              tüm evraklar (kimlik fotokopisi, transkript, gelir belgesi vb.)
              da diskten kalıcı olarak silinecek.
            </p>
            {deleteTarget.kind === "single" ? (
              <div className="rounded-md border border-border bg-muted/40 px-3 py-2.5 text-sm">
                <div className="font-mono text-xs text-muted-foreground">
                  {deleteTarget.app.id}
                </div>
                <div className="font-medium text-brand-900">
                  {deleteTarget.app.fullName}
                </div>
                <div className="text-xs text-muted-foreground">
                  {deleteTarget.app.email}
                </div>
              </div>
            ) : (
              <div className="rounded-md border border-border bg-muted/40 px-3 py-2.5 text-sm">
                <strong className="text-brand-900">
                  {deleteTarget.ids.length}
                </strong>{" "}
                başvuru ve bu başvurulara ait tüm evraklar silinecek.
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Vazgeç
              </Button>
              <Button
                type="button"
                onClick={executeDelete}
                disabled={deleting}
                leftIcon={<Trash2 className="h-4 w-4" />}
                className="bg-red-600 hover:bg-red-700 border-red-600"
              >
                {deleting
                  ? "Siliniyor..."
                  : deleteTarget.kind === "bulk"
                    ? `Evet, ${deleteTarget.ids.length} başvuruyu sil`
                    : "Evet, kalıcı olarak sil"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function ApplicationRow({
  app,
  selected,
  onToggle,
  onDelete,
  deleting,
}: {
  app: ScholarshipApplication;
  selected: boolean;
  onToggle: () => void;
  onDelete: () => void;
  deleting: boolean;
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
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="text-red-600 hover:text-red-800 inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            title="Bu başvuruyu ve evraklarını kalıcı olarak sil"
            aria-label={`${app.fullName} başvurusunu sil`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
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
