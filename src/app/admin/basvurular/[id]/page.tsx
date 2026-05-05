"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useState } from "react";
import {
  AlertTriangle,
  Archive,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  FileText,
  GraduationCap,
  Home,
  Mail,
  Phone,
  User,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import {
  formatDateTimeTR,
  formatCurrencyTR,
} from "@/lib/utils";
import type { ApplicationStatus, DocumentKey } from "@/lib/types";

const docLabels: Record<DocumentKey, string> = {
  id_card: "Nüfus Cüzdanı",
  student_certificate: "Öğrenci Belgesi",
  transcript: "Transkript",
  income_proof: "Gelir Durumu Belgesi",
  residence: "İkametgâh Belgesi",
  photo: "Vesikalık Fotoğraf",
};

const allDocs: DocumentKey[] = [
  "id_card",
  "student_certificate",
  "transcript",
  "income_proof",
  "residence",
  "photo",
];

export default function ApplicationDetailPage() {
  const params = useParams<{ id: string }>();
  const { applications, updateApplicationStatus, requiredDocuments } =
    useStore();
  const { toast } = useToast();
  const application = applications.find((a) => a.id === params.id);

  // Gösterilecek belge anahtarları:
  //  1) Admin'in "İstenen Belgeler" listesindeki sırayla başlat,
  //  2) Bu başvuruda yüklenmiş ama listede olmayan ek anahtarları sona ekle,
  //  3) Liste boşsa eski/yedek 6 anahtar üzerinden git.
  const docKeysToShow: DocumentKey[] = (() => {
    const fromAdmin = requiredDocuments.map((d) => d.docKey as DocumentKey);
    const uploaded = application
      ? (Object.keys(application.documents) as DocumentKey[])
      : [];
    if (fromAdmin.length === 0) {
      const merged = new Set<DocumentKey>([...allDocs, ...uploaded]);
      return Array.from(merged);
    }
    const merged = [...fromAdmin];
    for (const k of uploaded) {
      if (!merged.includes(k)) merged.push(k);
    }
    return merged;
  })();

  const labelFor = (k: DocumentKey): string => {
    const fromAdmin = requiredDocuments.find((d) => d.docKey === k)?.title;
    if (fromAdmin) return fromAdmin;
    if (k in docLabels) return docLabels[k as keyof typeof docLabels]!;
    return k;
  };

  const [note, setNote] = useState(application?.reviewerNote ?? "");
  const [score, setScore] = useState<string>(
    application?.score?.toString() ?? "",
  );

  if (!application) return notFound();

  const handle = (status: ApplicationStatus) => {
    const numScore = score ? Number(score) : undefined;
    updateApplicationStatus(application.id, status, note || undefined, numScore);
    toast({
      tone:
        status === "approved"
          ? "success"
          : status === "rejected"
            ? "error"
            : "info",
      title: `Başvuru ${
        status === "approved"
          ? "onaylandı"
          : status === "rejected"
            ? "reddedildi"
            : status === "in_review"
              ? "incelemeye alındı"
              : "güncellendi"
      }`,
    });
  };

  const fatherIncome = Number(application.fatherIncome) || 0;
  const motherIncome = Number(application.motherIncome) || 0;
  const totalIncome = fatherIncome + motherIncome;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <Link
            href="/admin/basvurular"
            className="text-sm text-muted-foreground hover:text-brand-900 inline-flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="h-4 w-4" /> Tüm başvurular
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-semibold text-brand-900">
              {application.fullName}
            </h1>
            <StatusBadge status={application.status} />
          </div>
          <p className="text-muted-foreground mt-1 font-mono text-xs">
            #{application.id} ·{" "}
            {formatDateTimeTR(application.submittedAt)}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Section title="Kişisel Bilgiler" icon={User}>
            <Grid>
              <Detail label="Ad Soyad" value={application.fullName} />
              <Detail label="T.C. Kimlik No" value={application.nationalId} />
              <Detail
                label="Doğum Tarihi"
                value={new Date(application.birthDate).toLocaleDateString("tr-TR")}
              />
              <Detail
                label="Cinsiyet"
                value={
                  application.gender === "kadin"
                    ? "Kadın"
                    : application.gender === "erkek"
                      ? "Erkek"
                      : "Belirtmek istemiyorum"
                }
              />
              <Detail
                label="E-posta"
                value={application.email}
                icon={<Mail className="h-3.5 w-3.5" />}
              />
              <Detail
                label="Telefon"
                value={application.phone}
                icon={<Phone className="h-3.5 w-3.5" />}
              />
              <Detail label="Şehir" value={application.city} />
              <Detail
                label="Adres"
                value={application.address}
                wide
                icon={<Home className="h-3.5 w-3.5" />}
              />
            </Grid>
          </Section>

          <Section title="Eğitim Bilgileri" icon={GraduationCap}>
            <Grid>
              <Detail
                label="Kademe"
                value={application.schoolType.replace("_", " ").toUpperCase()}
              />
              <Detail label="Okul" value={application.schoolName} />
              <Detail label="Bölüm" value={application.department} />
              <Detail label="Sınıf" value={application.grade} />
              <Detail label="GANO" value={application.gpa} />
            </Grid>
          </Section>

          <Section title="Aile Bilgileri" icon={Users}>
            <Grid>
              <Detail label="Baba" value={application.fatherName} />
              <Detail label="Mesleği" value={application.fatherJob} />
              <Detail
                label="Aylık Gelir"
                value={fatherIncome ? formatCurrencyTR(fatherIncome) : "—"}
              />
              <Detail label="Anne" value={application.motherName} />
              <Detail label="Mesleği" value={application.motherJob} />
              <Detail
                label="Aylık Gelir"
                value={motherIncome ? formatCurrencyTR(motherIncome) : "—"}
              />
              <Detail
                label="Kardeş Sayısı"
                value={String(application.siblings)}
              />
              <Detail
                label="Çalışan Kişi"
                value={String(application.workingMembers)}
              />
              <Detail
                label="Önceki Burs"
                value={
                  application.previousScholarship
                    ? application.previousScholarshipDetail || "Var"
                    : "Yok"
                }
              />
              <Detail
                label="Toplam Aile Geliri"
                value={formatCurrencyTR(totalIncome)}
                highlight
                wide
              />
            </Grid>
          </Section>

          <Section title="Banka & Motivasyon" icon={CreditCard}>
            <Grid>
              <Detail label="IBAN" value={application.iban} wide mono />
            </Grid>
            <div className="mt-4 rounded-lg bg-muted/40 border border-border p-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Motivasyon Mektubu
              </div>
              <p className="mt-2 text-brand-900 leading-relaxed whitespace-pre-line">
                {application.motivationLetter}
              </p>
            </div>
          </Section>

          <Section title="Belgeler" icon={FileText}>
            {(() => {
              const realDocCount = docKeysToShow.filter((k) => {
                const d = application.documents[k];
                return d && d.url;
              }).length;
              return (
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="text-xs text-muted-foreground">
                    {realDocCount > 0
                      ? `${realDocCount} belge indirilebilir`
                      : "Bu başvuruda indirilebilir belge yok"}
                  </div>
                  {realDocCount > 0 ? (
                    <a
                      href={`/api/applications/${application.id}/zip`}
                      className="h-9 px-3 rounded-md text-xs font-semibold bg-brand-900 text-white hover:bg-brand-800 inline-flex items-center gap-1.5"
                    >
                      <Archive className="h-3.5 w-3.5" />
                      Tümünü .zip indir
                    </a>
                  ) : null}
                </div>
              );
            })()}
            <div className="grid sm:grid-cols-2 gap-3">
              {docKeysToShow.map((key) => {
                const doc = application.documents[key];
                const hasFile = doc && !!doc.url;
                return (
                  <div
                    key={key}
                    className={
                      "rounded-lg border p-4 " +
                      (doc
                        ? "border-emerald-200 bg-emerald-50/40"
                        : "border-dashed border-border bg-muted/30")
                    }
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-medium text-brand-900">
                        {labelFor(key)}
                      </div>
                      {doc ? (
                        hasFile ? (
                          <Badge tone="success">
                            <CheckCircle2 className="h-3 w-3" /> Yüklü
                          </Badge>
                        ) : (
                          <Badge tone="warning">
                            <AlertTriangle className="h-3 w-3" /> Eski demo
                          </Badge>
                        )
                      ) : (
                        <Badge tone="warning">Eksik</Badge>
                      )}
                    </div>
                    {doc ? (
                      <div className="mt-3 flex items-center justify-between gap-3 rounded-md bg-white border border-border px-3 py-2">
                        <div className="min-w-0">
                          <div className="text-sm text-brand-900 truncate">
                            {doc.fileName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {(doc.size / 1024).toFixed(0)} KB ·{" "}
                            {formatDateTimeTR(doc.uploadedAt)}
                          </div>
                        </div>
                        {hasFile ? (
                          <a
                            href={`/api/applications/${application.id}/documents/${encodeURIComponent(key)}`}
                            className="h-9 px-3 rounded-md text-xs font-medium border border-border hover:bg-muted text-brand-800 inline-flex items-center gap-1.5 shrink-0"
                            title={`${application.id}-{ad-soyad}-{belge}.{uzantı} adıyla iner`}
                          >
                            <Download className="h-3.5 w-3.5" /> İndir
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              toast({
                                tone: "info",
                                title: "Belge dosyası yok",
                                description:
                                  "Bu kayıt demo döneminden kalma; gerçek dosya saklanmamış.",
                              })
                            }
                            className="h-9 px-3 rounded-md text-xs font-medium border border-dashed border-border text-muted-foreground inline-flex items-center gap-1.5 shrink-0 cursor-not-allowed"
                          >
                            <Download className="h-3.5 w-3.5" /> İndirilemez
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground mt-3">
                        Bu belge başvuru sırasında yüklenmemiş.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Section>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-border bg-white p-6 sticky top-24">
            <h3 className="text-sm font-semibold text-brand-900 uppercase tracking-wider">
              Komisyon Değerlendirmesi
            </h3>

            <div className="mt-5">
              <label className="text-xs text-muted-foreground">
                Komisyon Puanı (0-100)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={score}
                onChange={(e) => setScore(e.target.value)}
                className="mt-1.5 w-full h-11 rounded-md border border-border bg-white px-3 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 focus:outline-none"
                placeholder="Örn: 78"
              />
            </div>

            <div className="mt-4">
              <label className="text-xs text-muted-foreground">
                Komisyon Notu
              </label>
              <textarea
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-1.5 w-full min-h-[110px] py-3 rounded-md border border-border bg-white px-3 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 focus:outline-none"
                placeholder="Karar gerekçesi ve notlar..."
              />
            </div>

            {application.reviewedAt && (
              <p className="mt-3 text-xs text-muted-foreground inline-flex items-center gap-1">
                <Clock className="h-3 w-3" /> Son inceleme:{" "}
                {formatDateTimeTR(application.reviewedAt)}
              </p>
            )}

            <div className="mt-6 grid gap-2">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => handle("approved")}
                leftIcon={<CheckCircle2 className="h-4 w-4" />}
              >
                Onayla
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handle("in_review")}
                leftIcon={<Clock className="h-4 w-4" />}
              >
                İncelemeye Al
              </Button>
              <Button
                variant="danger"
                className="w-full"
                onClick={() => handle("rejected")}
                leftIcon={<X className="h-4 w-4" />}
              >
                Reddet
              </Button>
            </div>

            <div className="mt-6 pt-5 border-t border-border text-xs text-muted-foreground space-y-1">
              <p className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {formatDateTimeTR(application.submittedAt)}
              </p>
              <p>Başvuru numarası: {application.id}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof User;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-6">
      <h3 className="text-sm font-semibold text-brand-900 uppercase tracking-wider flex items-center gap-2">
        <Icon className="h-4 w-4 text-brand-600" />
        {title}
      </h3>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4">{children}</div>;
}

function Detail({
  label,
  value,
  wide,
  icon,
  mono,
  highlight,
}: {
  label: string;
  value: string;
  wide?: boolean;
  icon?: React.ReactNode;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <div className="text-xs text-muted-foreground inline-flex items-center gap-1">
        {icon}
        {label}
      </div>
      <div
        className={
          "mt-1 text-sm " +
          (highlight ? "font-semibold text-brand-900" : "text-brand-900") +
          (mono ? " font-mono" : "")
        }
      >
        {value || "—"}
      </div>
    </div>
  );
}
