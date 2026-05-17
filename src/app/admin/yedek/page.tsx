"use client";

import { useRef, useState } from "react";
import {
  AlertTriangle,
  Database,
  Download,
  Loader2,
  ShieldAlert,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useStore } from "@/lib/store";

export default function YedekPage() {
  const { bootstrap } = useStore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  async function handleDownload() {
    setDownloading(true);
    try {
      const res = await fetch("/api/admin/export");
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Yedek indirilemedi");
      }
      const buf = await res.arrayBuffer();
      const filename = `dernek-yedek-${new Date().toISOString().slice(0, 10)}.json`;
      const file = new File([buf], filename, { type: "application/json" });
      const navAny = navigator as unknown as {
        msSaveBlob?: (b: Blob, name: string) => boolean;
      };
      if (typeof navAny.msSaveBlob === "function") {
        navAny.msSaveBlob(file, filename);
      } else {
        const url = URL.createObjectURL(file);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.rel = "noopener";
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
      toast({ tone: "success", title: "Yedek indirildi" });
    } catch (e) {
      toast({
        tone: "error",
        title: "Yedek indirilemedi",
        description: e instanceof Error ? e.message : undefined,
      });
    } finally {
      setDownloading(false);
    }
  }

  function handleFilePicked(file: File) {
    if (!file.name.endsWith(".json")) {
      toast({
        tone: "error",
        title: "Geçersiz dosya",
        description: "Lütfen .json uzantılı bir yedek dosyası seçin.",
      });
      return;
    }
    setPendingFile(file);
    setConfirmText("");
  }

  async function handleImport() {
    if (!pendingFile) return;
    setImporting(true);
    try {
      const text = await pendingFile.text();
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        throw new Error("Dosya geçerli bir JSON değil");
      }
      const res = await fetch("/api/admin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "İçe aktarma başarısız");
      }
      toast({
        tone: "success",
        title: "Yedek geri yüklendi",
        description: "Tüm içerikler yedekteki haline çevrildi.",
      });
      setPendingFile(null);
      setConfirmText("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      // Store'u tazele
      await bootstrap();
    } catch (e) {
      toast({
        tone: "error",
        title: "İçe aktarma başarısız",
        description: e instanceof Error ? e.message : undefined,
      });
    } finally {
      setImporting(false);
    }
  }

  const importEnabled =
    !!pendingFile && confirmText.trim().toUpperCase() === "GERI YUKLE";

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-brand-900">
          Yedek / İçe Aktar
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Site içeriğinin tamamını JSON yedeği olarak indirin veya bir yedeği
          geri yükleyin.
        </p>
      </div>

      {/* İNDİR */}
      <section className="rounded-2xl border border-border bg-white overflow-hidden">
        <div className="px-6 py-5 border-b border-border flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center">
            <Download className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-brand-900">
              Yedek İndir
            </h2>
            <p className="text-xs text-muted-foreground">
              Tüm içerik, başvurular, mesajlar ve üye bilgileri tek bir JSON
              dosyasına aktarılır.
            </p>
          </div>
        </div>
        <div className="px-6 py-5">
          <ul className="text-sm text-muted-foreground list-disc ml-5 space-y-1 mb-5">
            <li>Site ayarları, sayfa içerikleri, kurul/tarihçe/burs gibi tüm içerik tabloları</li>
            <li>Haberler, etkinlikler, mesajlar, başvurular ve dökümanları</li>
            <li>Üye listesi (parolalar dahil edilmez — sadece profil bilgileri)</li>
            <li>
              <strong>Yüklenen dosyalar dahil değildir</strong> —{" "}
              <code>public/uploads/</code> klasörünü ayrıca yedekleyin
            </li>
          </ul>
          <Button
            onClick={handleDownload}
            loading={downloading}
            leftIcon={<Database className="h-4 w-4" />}
          >
            JSON Yedek İndir
          </Button>
        </div>
      </section>

      {/* GERİ YÜKLE */}
      <section className="rounded-2xl border border-amber-200 bg-amber-50/30 overflow-hidden">
        <div className="px-6 py-5 border-b border-amber-200 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
            <Upload className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-amber-900">
              Yedeği Geri Yükle
            </h2>
            <p className="text-xs text-amber-800/80">
              Mevcut içerik silinir ve yedekteki içerikle değiştirilir.
            </p>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div className="rounded-lg border border-amber-300 bg-white px-4 py-3 text-sm text-amber-900 flex gap-3">
            <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <strong>Bu işlem geri alınamaz.</strong> Mevcut tüm site içeriği,
              haberler, etkinlikler ve başvurular silinip yedekteki ile
              değiştirilir. Üye hesapları (parolalar dahil) korunur — bu sayede
              giriş yapmaya devam edebilirsiniz.
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-900 mb-2">
              Yedek dosyası (.json)
            </label>
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFilePicked(f);
                }}
                className="block w-full text-sm text-brand-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
              />
            </div>
            {pendingFile && (
              <div className="mt-2 text-xs text-muted-foreground">
                Seçildi:{" "}
                <span className="text-brand-900 font-medium">
                  {pendingFile.name}
                </span>{" "}
                ({(pendingFile.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>

          {pendingFile && (
            <div className="rounded-lg bg-white border border-amber-300 px-4 py-4">
              <label className="block text-sm font-medium text-amber-900 mb-2">
                Onay için aşağıya{" "}
                <code className="font-mono bg-amber-100 px-1.5 py-0.5 rounded">
                  GERI YUKLE
                </code>{" "}
                yazın
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="GERI YUKLE"
                className="w-full h-10 px-3 rounded-md border border-border bg-white font-mono text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button
              variant="danger"
              onClick={handleImport}
              disabled={!importEnabled || importing}
              leftIcon={
                importing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )
              }
            >
              {importing ? "Geri yükleniyor…" : "Yedeği Geri Yükle"}
            </Button>
            {pendingFile && (
              <Button
                variant="ghost"
                onClick={() => {
                  setPendingFile(null);
                  setConfirmText("");
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              >
                Vazgeç
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
