"use client";

import {
  useState,
  useMemo,
  useRef,
  type ChangeEvent,
  type ReactNode,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  CreditCard,
  FileText,
  GraduationCap,
  Image as ImageIcon,
  Loader2,
  Lock,
  ShieldCheck,
  Trash2,
  Upload,
  User,
  Users,
} from "lucide-react";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import type {
  ApplicationDocument,
  ApplicationFormText,
  BursApplicationClosedText,
  DocumentKey,
  ScholarshipApplication,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { normalizeBurseRules, checkApplicationWindow } from "@/lib/burs-rules-shared";
import { normalizeBursApplicationClosed } from "@/lib/defaults/burs-application-closed";
import { DEFAULT_KVKK_TEXT } from "@/lib/defaults/kvkk";
import { computeExpectedGradYear, isGraduatingThisYear } from "@/lib/graduation";

const DEFAULT_FORM_TEXT: ApplicationFormText = {
  steps: {
    personal: {
      title: "Kişisel Bilgiler",
      description:
        "Lütfen kimlik bilgilerinizi resmi belgelerinizle birebir aynı girin.",
    },
    education: {
      title: "Eğitim Bilgileri",
      description:
        "Halen devam ettiğiniz eğitim kademesi ve okul bilgilerinizi girin.",
    },
    family: {
      title: "Aile Bilgileri",
      description:
        "Burs değerlendirmemizde gelir durumu önemli kriterlerden biridir.",
    },
    documents: {
      title: "Belgeler",
      description:
        "Lütfen aşağıdaki belgeleri PDF veya JPG formatında, her biri en fazla 10 MB olacak şekilde yükleyin.",
    },
    finalize: {
      title: "Son Adım: Banka & Motivasyon",
      description:
        "Burs onaylanması durumunda ödemenin yapılacağı IBAN ve motivasyon mektubunuzu giriniz.",
    },
  },
  consentText:
    "Verdiğim bilgilerin ve yüklediğim belgelerin doğruluğunu kabul ederim. Yanlış beyan halinde başvurum geçersiz sayılacaktır. Verilerim KVKK kapsamında işlenir.",
  buttons: { prev: "Geri", next: "Devam Et", submit: "Başvuruyu Gönder" },
  success: {
    title: "Başvurunuz başarıyla alındı",
    description:
      "Başvurunuz komisyonumuz tarafından incelenecektir. Sonuç durumunu üyelik panelinizden ve e-posta adresinizden takip edebilirsiniz.",
    newApplicationButton: "Yeni Başvuru",
    accountButton: "Hesabıma Git",
  },
};

type FormData = Omit<
  ScholarshipApplication,
  | "id"
  | "applicantId"
  | "status"
  | "submittedAt"
  | "documents"
  | "autoRejectedReason"
  | "kvkkConsentAt"
  | "expectedGradYear"
  | "updateRequest"
  | "failedCourses"
  | "referenceName"
  | "referencePhone"
  | "referenceRelation"
  | "parentReferenceName"
  | "parentReferencePhone"
> & {
  documents: Partial<Record<DocumentKey, ApplicationDocument>>;
  /**
   * Aşağıdaki yeni alanlar tipte opsiyonel; ancak form'da blankData
   * boş string / 0 ile başlatır → input bind'ı `data.x` (controlled) güvenli.
   */
  failedCourses: number;
  referenceName: string;
  referencePhone: string;
  referenceRelation: string;
  parentReferenceName: string;
  parentReferencePhone: string;
  /** Modal'da KVKK onayı verildikten sonra ISO timestamp; başvuruyla beraber gönderilir. */
  kvkkConsentAt?: string;
};

/**
 * Form'un yeni başvuru ya da var olan bir başvurunun güncellemesi
 * için kullanılacağını belirtir.
 *
 *   "new"  → POST /api/applications
 *   "edit" → PUT  /api/applications/{id}
 */
export type ApplicationFormMode = "new" | "edit";

export type ApplicationFormProps = {
  mode?: ApplicationFormMode;
  /** edit modunda zorunlu: hangi başvurunun düzenleneceği. */
  applicationId?: string;
  /** Form alanları için başlangıç değerleri (mevcut başvurunun snapshot'ı). */
  initial?: ScholarshipApplication;
};

/**
 * Başvuru formundaki dosya yükleme alanlarını tanımlayan, admin tarafından
 * "İstenen Belgeler" sayfasından düzenlenen liste boşsa kullanılan yedek
 * varsayılan. Üretimde gerçekçi bir liste kayıtlı olduğu sürece görünmez.
 */
const FALLBACK_DOCS: {
  key: DocumentKey;
  label: string;
  description: string;
  required: boolean;
}[] = [
  {
    key: "id_card",
    label: "Nüfus Cüzdanı / Kimlik",
    description: "Ön ve arka yüzü, PDF veya JPG",
    required: true,
  },
];

const blankData = (): FormData => ({
  fullName: "",
  nationalId: "",
  birthDate: "",
  gender: "kadin",
  email: "",
  phone: "",
  address: "",
  city: "",
  schoolType: "lisans",
  schoolName: "",
  department: "",
  grade: "",
  gpa: "",
  failedCourses: 0,
  fatherName: "",
  fatherJob: "",
  fatherIncome: "",
  motherName: "",
  motherJob: "",
  motherIncome: "",
  siblings: 0,
  workingMembers: 0,
  previousScholarship: false,
  previousScholarshipDetail: "",
  referenceName: "",
  referencePhone: "",
  referenceRelation: "",
  parentReferenceName: "",
  parentReferencePhone: "",
  iban: "",
  motivationLetter: "",
  documents: {},
  kvkkConsentAt: undefined,
});

/**
 * Mevcut bir başvurudan form state üretir. `app.documents` zaten
 * `Partial<Record<DocumentKey, ApplicationDocument>>` formatında
 * geldiği için kopyalamak yeterli.
 */
const dataFromApplication = (app: ScholarshipApplication): FormData => {
  const docs: Partial<Record<DocumentKey, ApplicationDocument>> = {
    ...(app.documents ?? {}),
  };
  return {
    fullName: app.fullName,
    nationalId: app.nationalId,
    birthDate: app.birthDate,
    gender: app.gender,
    email: app.email,
    phone: app.phone,
    address: app.address,
    city: app.city,
    schoolType: app.schoolType,
    schoolName: app.schoolName,
    department: app.department,
    grade: app.grade,
    gpa: app.gpa,
    failedCourses: app.failedCourses ?? 0,
    fatherName: app.fatherName,
    fatherJob: app.fatherJob,
    fatherIncome: app.fatherIncome,
    motherName: app.motherName,
    motherJob: app.motherJob,
    motherIncome: app.motherIncome,
    siblings: app.siblings,
    workingMembers: app.workingMembers,
    previousScholarship: app.previousScholarship,
    previousScholarshipDetail: app.previousScholarshipDetail ?? "",
    referenceName: app.referenceName ?? "",
    referencePhone: app.referencePhone ?? "",
    referenceRelation: app.referenceRelation ?? "",
    parentReferenceName: app.parentReferenceName ?? "",
    parentReferencePhone: app.parentReferencePhone ?? "",
    iban: app.iban,
    motivationLetter: app.motivationLetter,
    documents: docs,
    kvkkConsentAt: app.kvkkConsentAt,
  };
};

const STEP_DEFS = [
  { key: "personal", icon: User },
  { key: "education", icon: GraduationCap },
  { key: "family", icon: Users },
  { key: "documents", icon: FileText },
  { key: "finalize", icon: CreditCard },
] as const;

type StepKey = (typeof STEP_DEFS)[number]["key"];

export function ApplicationForm({
  mode = "new",
  applicationId,
  initial,
}: ApplicationFormProps = {}) {
  const router = useRouter();
  const {
    currentUser,
    submitApplication,
    updateApplication,
    pageBlocks,
    requiredDocuments,
  } = useStore();
  const { toast } = useToast();
  const isEdit = mode === "edit";
  const formText =
    (pageBlocks["burs.application_form"] as ApplicationFormText | undefined) ??
    DEFAULT_FORM_TEXT;
  // Admin panelinden yönetilen burs kuralları — başvuru penceresi, FF
  // toggle'ı ve diğer şartlar burada okunur. pageBlocks'tan parse edilir.
  const rules = useMemo(
    () => normalizeBurseRules(pageBlocks["burs.rules"]),
    [pageBlocks],
  );
  /**
   * Admin panelinde yönetilen KVKK aydınlatma metni
   * (`page_blocks.legal.kvkk`). Boş ise yedek metin kullanılır.
   */
  const kvkkContent =
    typeof pageBlocks["legal.kvkk"] === "string" &&
    (pageBlocks["legal.kvkk"] as string).trim()
      ? (pageBlocks["legal.kvkk"] as string)
      : DEFAULT_KVKK_TEXT;
  const closedReason = useMemo(
    () => (isEdit ? null : checkApplicationWindow(rules)),
    [rules, isEdit],
  );
  const closedContent = useMemo(
    () => normalizeBursApplicationClosed(pageBlocks["burs.application_closed"]),
    [pageBlocks],
  );
  const steps = STEP_DEFS.map((s) => ({
    ...s,
    title: formText.steps[s.key as StepKey].title,
    description: formText.steps[s.key as StepKey].description,
  }));
  const docs = requiredDocuments.length
    ? requiredDocuments.map((d) => ({
        key: d.docKey as DocumentKey,
        label: d.title,
        description: d.description ?? "",
        required: d.required,
      }))
    : FALLBACK_DOCS;
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(() =>
    initial ? dataFromApplication(initial) : blankData(),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [updatedOk, setUpdatedOk] = useState(false);
  // Şu anda sunucuya yüklenmekte olan belgeler — bu süre boyunca alanın
  // üzerinde spinner gösterip yeniden seçim engellenir.
  const [uploadingKeys, setUploadingKeys] = useState<Set<DocumentKey>>(
    () => new Set(),
  );
  /**
   * KVKK modal'ı yeni başvurularda zorunludur. Edit modunda, mevcut
   * başvuruda zaten consent varsa modal açılmaz. Yeni başvurularda ilk
   * mount'ta açılır.
   */
  const [kvkkOpen, setKvkkOpen] = useState(
    () => !isEdit && !data.kvkkConsentAt,
  );
  // Mezuniyet yılı uyarısı (madde 6) — schoolType + grade değişince güncellenir
  const expectedGradYear = useMemo(
    () => computeExpectedGradYear(data.schoolType, data.grade),
    [data.schoolType, data.grade],
  );
  const graduatingThisYear = isGraduatingThisYear(expectedGradYear);

  useEffect(() => {
    if (isEdit) return; // edit modunda mevcut başvurunun verisi korunur
    if (currentUser) {
      setData((prev) => ({
        ...prev,
        fullName: prev.fullName || currentUser.fullName,
        email: prev.email || currentUser.email,
        phone: prev.phone || currentUser.phone || "",
        city: prev.city || currentUser.city || "",
      }));
    }
  }, [currentUser, isEdit]);

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key as string];
      return next;
    });
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (step === 0) {
      if (!data.fullName.trim()) newErrors.fullName = "Ad soyad zorunludur";
      if (!/^\d{11}$/.test(data.nationalId))
        newErrors.nationalId = "11 haneli T.C. kimlik no giriniz";
      if (!data.birthDate) newErrors.birthDate = "Doğum tarihi zorunludur";
      if (!/^\S+@\S+\.\S+$/.test(data.email))
        newErrors.email = "Geçerli bir e-posta giriniz";
      if (!data.phone.trim()) newErrors.phone = "Telefon zorunludur";
      if (!data.address.trim()) newErrors.address = "Adres zorunludur";
      if (!data.city.trim()) newErrors.city = "Şehir zorunludur";
    } else if (step === 1) {
      if (!data.schoolName.trim())
        newErrors.schoolName = "Okul adı zorunludur";
      if (!data.department.trim())
        newErrors.department = "Bölüm zorunludur";
      if (!data.grade.trim()) newErrors.grade = "Sınıf zorunludur";
      if (!data.gpa.trim()) newErrors.gpa = "Not ortalaması zorunludur";
      // failedCourses negatif olmasın; özellik kapalıysa kontrol etme.
      if (rules.failedCoursesEnabled) {
        const ff = data.failedCourses ?? 0;
        if (!Number.isFinite(ff) || ff < 0 || ff > 50) {
          newErrors.failedCourses =
            "0 ile 50 arasında bir sayı giriniz (yoksa 0)";
        }
      }
    } else if (step === 2) {
      if (!data.fatherName.trim())
        newErrors.fatherName = "Baba adı zorunludur";
      if (!data.fatherJob.trim())
        newErrors.fatherJob = "Baba mesleği zorunludur";
      if (!data.motherName.trim())
        newErrors.motherName = "Anne adı zorunludur";
      if (!data.motherJob.trim())
        newErrors.motherJob = "Anne mesleği zorunludur";
      // Referans alanları zorunlu — komisyon başvuru sonrası teyit
      // arayabilsin. Telefon serbest format kabul ediyor; sunucu normalize
      // edip kontrol edebilir.
      if (!data.referenceName.trim())
        newErrors.referenceName = "Referans kişi adı zorunludur";
      if (!data.referencePhone.trim())
        newErrors.referencePhone = "Referans telefonu zorunludur";
      if (!data.referenceRelation.trim())
        newErrors.referenceRelation = "Yakınlık derecesi zorunludur";
      if (!data.parentReferenceName.trim())
        newErrors.parentReferenceName = "Veli/iletişim kişisi adı zorunludur";
      if (!data.parentReferencePhone.trim())
        newErrors.parentReferencePhone = "Veli/iletişim telefonu zorunludur";
    } else if (step === 3) {
      const missing = docs
        .filter((d) => d.required)
        .filter((d) => !data.documents[d.key]);
      if (missing.length > 0) {
        // Eksik belgelerin isimlerini virgülle göster (madde 10) — kullanıcı
        // listenin sonuna kadar inip aramak zorunda kalmasın.
        const names = missing.map((d) => d.label).join(", ");
        newErrors._docs = `Eksik zorunlu belge: ${names}`;
      } else if (uploadingKeys.size > 0) {
        // Yüklenmekte olan dosya varken sonraki adıma geçmek dosya kaybına
        // yol açar (component unmount → upload state kaybolur).
        newErrors._docs = "Dosya yüklemesi tamamlanmadı, lütfen bekleyin.";
      }
    } else if (step === 4) {
      if (!/^TR/i.test(data.iban.replace(/\s/g, "")))
        newErrors.iban = "Geçerli bir IBAN giriniz (TR ile başlamalı)";
      if (data.motivationLetter.trim().length < 80)
        newErrors.motivationLetter =
          "Lütfen en az 80 karakterlik bir motivasyon mektubu yazın";
      // KVKK onayı yoksa son adımı bitirme — modal'ı zorla aç.
      if (!isEdit && !data.kvkkConsentAt) {
        newErrors._kvkk =
          "Başvuruyu tamamlamak için KVKK aydınlatma onayı gereklidir.";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const next = () => {
    if (!validateStep()) return;
    if (step < steps.length - 1) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        fullName: data.fullName,
        nationalId: data.nationalId,
        birthDate: data.birthDate,
        gender: data.gender,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        schoolType: data.schoolType,
        schoolName: data.schoolName,
        department: data.department,
        grade: data.grade,
        gpa: data.gpa,
        failedCourses: rules.failedCoursesEnabled
          ? Number(data.failedCourses) || 0
          : 0,
        expectedGradYear,
        fatherName: data.fatherName,
        fatherJob: data.fatherJob,
        fatherIncome: data.fatherIncome,
        motherName: data.motherName,
        motherJob: data.motherJob,
        motherIncome: data.motherIncome,
        siblings: data.siblings,
        workingMembers: data.workingMembers,
        previousScholarship: data.previousScholarship,
        previousScholarshipDetail: data.previousScholarshipDetail,
        referenceName: data.referenceName,
        referencePhone: data.referencePhone,
        referenceRelation: data.referenceRelation,
        parentReferenceName: data.parentReferenceName,
        parentReferencePhone: data.parentReferencePhone,
        iban: data.iban,
        motivationLetter: data.motivationLetter,
        kvkkConsentAt: data.kvkkConsentAt,
        documents: data.documents,
      };

      if (isEdit && applicationId) {
        await updateApplication(applicationId, payload);
        setUpdatedOk(true);
        toast({
          tone: "success",
          title: "Başvurunuz güncellendi",
          description: "Yaptığınız değişiklikler kaydedildi.",
        });
      } else {
        const application = await submitApplication({
          applicantId: currentUser?.id,
          ...payload,
        });
        setSubmittedId(application.id);
        toast({
          tone: "success",
          title: "Başvurunuz alındı",
          description: `Başvuru numaranız: ${application.id}`,
        });
      }
    } catch (err) {
      console.error(
        isEdit ? "Başvuru güncellenemedi:" : "Başvuru gönderilemedi:",
        err,
      );
      const e = err as { message?: string; code?: string };
      toast({
        tone: "error",
        title: isEdit ? "Başvuru güncellenemedi" : "Başvuru gönderilemedi",
        description:
          e?.message ||
          "Bir aksilik oldu. Lütfen birkaç saniye sonra tekrar deneyin.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFile = async (
    key: DocumentKey,
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        tone: "error",
        title: "Dosya çok büyük",
        description: "Her dosya en fazla 10 MB olabilir.",
      });
      input.value = "";
      return;
    }

    setUploadingKeys((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("docKey", key);
      const res = await fetch("/api/applications/upload", {
        method: "POST",
        body: fd,
        credentials: "same-origin",
      });

      if (!res.ok) {
        let msg = "Yükleme başarısız";
        try {
          const body = (await res.json()) as { error?: string };
          if (body?.error) msg = body.error;
        } catch {
          // JSON gelmediyse genel mesaj göster
        }
        toast({ tone: "error", title: "Belge yüklenemedi", description: msg });
        return;
      }

      const payload = (await res.json()) as {
        url: string;
        size: number;
        type: string;
        name: string;
      };

      const doc: ApplicationDocument = {
        key,
        fileName: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        url: payload.url,
      };
      update("documents", { ...data.documents, [key]: doc });
      toast({
        tone: "success",
        title: "Belge yüklendi",
        description: file.name,
      });
    } catch (err) {
      console.error("[application-form] upload hatası", err);
      toast({
        tone: "error",
        title: "Belge yüklenemedi",
        description: "Bağlantınızı kontrol edip yeniden deneyin.",
      });
    } finally {
      setUploadingKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
      // input.value temizliği — aynı dosyayı silip tekrar seçince
      // change event'i tetiklensin diye gerekli.
      input.value = "";
    }
  };

  const removeFile = (key: DocumentKey) => {
    const next = { ...data.documents };
    delete next[key];
    update("documents", next);
  };

  if (submittedId) {
    return (
      <SuccessScreen
        id={submittedId}
        text={formText.success}
        onView={() => router.push("/hesabim")}
      />
    );
  }

  if (updatedOk) {
    return <UpdatedScreen onView={() => router.push("/hesabim")} />;
  }

  if (!isEdit && closedReason) {
    return <ClosedScreen reason={closedReason} content={closedContent} />;
  }

  return (
    <>
      {!isEdit && kvkkOpen && (
        <KvkkModal
          content={kvkkContent}
          onAccept={() => {
            const ts = new Date().toISOString();
            setData((prev) => ({ ...prev, kvkkConsentAt: ts }));
            setErrors((prev) => {
              const n = { ...prev };
              delete n._kvkk;
              return n;
            });
            setKvkkOpen(false);
          }}
          onClose={() => setKvkkOpen(false)}
          alreadyAccepted={!!data.kvkkConsentAt}
        />
      )}
    <div className="grid md:grid-cols-12 gap-8">
      <aside className="md:col-span-3">
        <ol className="space-y-2 sticky top-24">
          {steps.map((s, i) => {
            const status =
              i < step ? "done" : i === step ? "active" : "upcoming";
            return (
              <li
                key={s.key}
                className={cn(
                  "flex items-start gap-3 rounded-xl border p-3.5 transition-colors",
                  status === "active" &&
                    "bg-brand-900 text-white border-brand-900",
                  status === "done" && "bg-emerald-50 border-emerald-200",
                  status === "upcoming" && "bg-white border-border",
                )}
              >
                <div
                  className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0",
                    status === "active" && "bg-gold-400 text-brand-900",
                    status === "done" && "bg-emerald-600 text-white",
                    status === "upcoming" && "bg-muted text-muted-foreground",
                  )}
                >
                  {status === "done" ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <s.icon className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] uppercase tracking-wider opacity-70">
                    Adım {i + 1}
                  </div>
                  <div className="text-sm font-medium leading-tight">
                    {s.title}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </aside>

      <div className="md:col-span-9">
        <div className="rounded-2xl border border-border bg-white p-6 md:p-8">
          {step === 0 && (
            <StepWrap
              title={formText.steps.personal.title}
              description={formText.steps.personal.description}
            >
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Ad Soyad" required error={errors.fullName}>
                  <Input
                    value={data.fullName}
                    onChange={(e) => update("fullName", e.target.value)}
                    invalid={!!errors.fullName}
                    placeholder="Adınız Soyadınız"
                  />
                </Field>
                <Field
                  label="T.C. Kimlik No"
                  required
                  error={errors.nationalId}
                >
                  <Input
                    inputMode="numeric"
                    maxLength={11}
                    value={data.nationalId}
                    onChange={(e) =>
                      update("nationalId", e.target.value.replace(/\D/g, ""))
                    }
                    invalid={!!errors.nationalId}
                    placeholder="11 haneli kimlik no"
                  />
                </Field>
                <Field
                  label="Doğum Tarihi"
                  required
                  error={errors.birthDate}
                >
                  <Input
                    type="date"
                    value={data.birthDate}
                    onChange={(e) => update("birthDate", e.target.value)}
                    invalid={!!errors.birthDate}
                  />
                </Field>
                <Field label="Cinsiyet" required>
                  <Select
                    value={data.gender}
                    onChange={(e) =>
                      update("gender", e.target.value as FormData["gender"])
                    }
                  >
                    <option value="kadin">Kadın</option>
                    <option value="erkek">Erkek</option>
                    <option value="belirtmek_istemiyorum">
                      Belirtmek istemiyorum
                    </option>
                  </Select>
                </Field>
                <Field label="E-posta" required error={errors.email}>
                  <Input
                    type="email"
                    value={data.email}
                    onChange={(e) => update("email", e.target.value)}
                    invalid={!!errors.email}
                    placeholder="ornek@eposta.com"
                  />
                </Field>
                <Field label="Telefon" required error={errors.phone}>
                  <Input
                    type="tel"
                    value={data.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    invalid={!!errors.phone}
                    placeholder="+90 5xx xxx xx xx"
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Adres" required error={errors.address}>
                    <Textarea
                      value={data.address}
                      onChange={(e) => update("address", e.target.value)}
                      invalid={!!errors.address}
                      rows={3}
                      placeholder="Mahalle, sokak, daire no"
                    />
                  </Field>
                </div>
                <Field label="Şehir" required error={errors.city}>
                  <Input
                    value={data.city}
                    onChange={(e) => update("city", e.target.value)}
                    invalid={!!errors.city}
                    placeholder="İl"
                  />
                </Field>
              </div>
            </StepWrap>
          )}

          {step === 1 && (
            <StepWrap
              title={formText.steps.education.title}
              description={formText.steps.education.description}
            >
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Eğitim Kademesi" required>
                  <Select
                    value={data.schoolType}
                    onChange={(e) =>
                      update(
                        "schoolType",
                        e.target.value as FormData["schoolType"],
                      )
                    }
                  >
                    <option value="lise">Lise</option>
                    <option value="onlisans">Ön Lisans</option>
                    <option value="lisans">Lisans</option>
                    <option value="yuksek_lisans">Yüksek Lisans</option>
                    <option value="doktora">Doktora</option>
                  </Select>
                </Field>
                <Field label="Okul Adı" required error={errors.schoolName}>
                  <Input
                    value={data.schoolName}
                    onChange={(e) => update("schoolName", e.target.value)}
                    invalid={!!errors.schoolName}
                    placeholder="Üniversite / Okul"
                  />
                </Field>
                <Field label="Bölüm" required error={errors.department}>
                  <Input
                    value={data.department}
                    onChange={(e) => update("department", e.target.value)}
                    invalid={!!errors.department}
                    placeholder="Bölüm / Program"
                  />
                </Field>
                <Field label="Sınıf" required error={errors.grade}>
                  <Input
                    value={data.grade}
                    onChange={(e) => update("grade", e.target.value)}
                    invalid={!!errors.grade}
                    placeholder="Hazırlık / 1 / 2 / 3 / 4"
                  />
                </Field>
                <Field
                  label="Genel Not Ortalaması (4 üzerinden veya 100)"
                  required
                  error={errors.gpa}
                  hint="Örn: 3.42 veya 84.5"
                >
                  <Input
                    value={data.gpa}
                    onChange={(e) => update("gpa", e.target.value)}
                    invalid={!!errors.gpa}
                  />
                </Field>
                {rules.failedCoursesEnabled && (
                  <Field
                    label="Başarısız (FF/FD) ders sayısı"
                    error={errors.failedCourses}
                    hint="Transkriptinize göre toplam başarısız ders sayısı; yoksa 0 yazın. Komisyon değerlendirmede dikkate alır."
                  >
                    <Input
                      type="number"
                      min={0}
                      max={50}
                      value={
                        data.failedCourses === 0 ? "" : data.failedCourses
                      }
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (raw === "") {
                          update("failedCourses", 0);
                          return;
                        }
                        const n = parseInt(raw, 10);
                        if (!Number.isNaN(n)) {
                          update(
                            "failedCourses",
                            Math.min(50, Math.max(0, n)),
                          );
                        }
                      }}
                      invalid={!!errors.failedCourses}
                    />
                  </Field>
                )}
                {expectedGradYear && (
                  <div className="sm:col-span-2 rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-900 flex items-start gap-2">
                    <GraduationCap className="h-4 w-4 mt-0.5 shrink-0" />
                    <div>
                      Sistem hesaplaması: <strong>{expectedGradYear}</strong>{" "}
                      yılında mezun olmanız bekleniyor.
                      {graduatingThisYear && (
                        <span className="block mt-1 text-orange-700">
                          Bu yıl son sınıftasınız — komisyon başvurunuzu bu
                          bilgiyle değerlendirir.
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </StepWrap>
          )}

          {step === 2 && (
            <StepWrap
              title={formText.steps.family.title}
              description={formText.steps.family.description}
            >
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Baba Adı" required error={errors.fatherName}>
                  <Input
                    value={data.fatherName}
                    onChange={(e) => update("fatherName", e.target.value)}
                    invalid={!!errors.fatherName}
                  />
                </Field>
                <Field label="Baba Mesleği" required error={errors.fatherJob}>
                  <Input
                    value={data.fatherJob}
                    onChange={(e) => update("fatherJob", e.target.value)}
                    invalid={!!errors.fatherJob}
                  />
                </Field>
                <Field label="Baba Aylık Gelir (₺)">
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={data.fatherIncome}
                    onChange={(e) => update("fatherIncome", e.target.value)}
                    placeholder="0"
                  />
                </Field>
                <Field label="Anne Adı" required error={errors.motherName}>
                  <Input
                    value={data.motherName}
                    onChange={(e) => update("motherName", e.target.value)}
                    invalid={!!errors.motherName}
                  />
                </Field>
                <Field label="Anne Mesleği" required error={errors.motherJob}>
                  <Input
                    value={data.motherJob}
                    onChange={(e) => update("motherJob", e.target.value)}
                    invalid={!!errors.motherJob}
                  />
                </Field>
                <Field label="Anne Aylık Gelir (₺)">
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={data.motherIncome}
                    onChange={(e) => update("motherIncome", e.target.value)}
                    placeholder="0"
                  />
                </Field>
                <Field label="Kardeş Sayısı">
                  <Input
                    type="number"
                    min={0}
                    value={data.siblings}
                    onChange={(e) =>
                      update("siblings", Number(e.target.value) || 0)
                    }
                  />
                </Field>
                <Field label="Evde Çalışan Kişi Sayısı">
                  <Input
                    type="number"
                    min={0}
                    value={data.workingMembers}
                    onChange={(e) =>
                      update("workingMembers", Number(e.target.value) || 0)
                    }
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Daha önce burs aldınız mı?">
                    <div className="flex gap-3">
                      {[
                        { v: false, l: "Hayır" },
                        { v: true, l: "Evet" },
                      ].map((o) => (
                        <button
                          type="button"
                          key={String(o.v)}
                          onClick={() => update("previousScholarship", o.v)}
                          className={cn(
                            "h-11 px-5 rounded-md border text-sm font-medium",
                            data.previousScholarship === o.v
                              ? "bg-brand-900 text-white border-brand-900"
                              : "bg-white text-brand-800 border-border hover:border-brand-200",
                          )}
                        >
                          {o.l}
                        </button>
                      ))}
                    </div>
                  </Field>
                </div>
                {data.previousScholarship && (
                  <div className="sm:col-span-2">
                    <Field
                      label="Hangi kurumdan, ne kadar süreyle?"
                      hint="Örn: KYK – 2 yıl"
                    >
                      <Input
                        value={data.previousScholarshipDetail ?? ""}
                        onChange={(e) =>
                          update("previousScholarshipDetail", e.target.value)
                        }
                      />
                    </Field>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-border">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-brand-900">
                    Referans Bilgileri
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Komisyonumuzun gerektiğinde teyit için arayabileceği, sizi
                    yakından tanıyan bir referans (öğretmen, komşu, akraba) ve
                    veli/iletişim kişisi.
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field
                    label="Referans Ad Soyad"
                    required
                    error={errors.referenceName}
                  >
                    <Input
                      value={data.referenceName}
                      onChange={(e) => update("referenceName", e.target.value)}
                      invalid={!!errors.referenceName}
                      placeholder="Adı Soyadı"
                    />
                  </Field>
                  <Field
                    label="Referans Telefonu"
                    required
                    error={errors.referencePhone}
                  >
                    <Input
                      type="tel"
                      value={data.referencePhone}
                      onChange={(e) =>
                        update("referencePhone", e.target.value)
                      }
                      invalid={!!errors.referencePhone}
                      placeholder="0 5XX XXX XX XX"
                    />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field
                      label="Yakınlık derecesi"
                      required
                      error={errors.referenceRelation}
                      hint="Örn: Sınıf öğretmeni, mahalleden komşu, dayı"
                    >
                      <Input
                        value={data.referenceRelation}
                        onChange={(e) =>
                          update("referenceRelation", e.target.value)
                        }
                        invalid={!!errors.referenceRelation}
                      />
                    </Field>
                  </div>
                  <Field
                    label="Veli / İletişim Kişisi Ad Soyad"
                    required
                    error={errors.parentReferenceName}
                    hint="Anne/baba dışında acil iletişim kişisi olabilir."
                  >
                    <Input
                      value={data.parentReferenceName}
                      onChange={(e) =>
                        update("parentReferenceName", e.target.value)
                      }
                      invalid={!!errors.parentReferenceName}
                    />
                  </Field>
                  <Field
                    label="Veli / İletişim Telefonu"
                    required
                    error={errors.parentReferencePhone}
                  >
                    <Input
                      type="tel"
                      value={data.parentReferencePhone}
                      onChange={(e) =>
                        update("parentReferencePhone", e.target.value)
                      }
                      invalid={!!errors.parentReferencePhone}
                      placeholder="0 5XX XXX XX XX"
                    />
                  </Field>
                </div>
              </div>
            </StepWrap>
          )}

          {step === 3 && (
            <StepWrap
              title={formText.steps.documents.title}
              description={formText.steps.documents.description}
            >
              {errors._docs && (
                <div className="mb-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  {errors._docs}
                </div>
              )}
              <div className="grid sm:grid-cols-2 gap-4">
                {docs.map((d) => {
                  const file = data.documents[d.key];
                  const isUploading = uploadingKeys.has(d.key);
                  return (
                    <div
                      key={d.key}
                      className={cn(
                        "rounded-xl border-2 border-dashed p-4 transition-colors",
                        file
                          ? "border-emerald-300 bg-emerald-50/40"
                          : isUploading
                            ? "border-brand-300 bg-brand-50/30"
                            : "border-border bg-muted/30 hover:border-brand-300",
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-brand-900">
                              {d.label}
                            </span>
                            {d.required && (
                              <Badge tone="danger">Zorunlu</Badge>
                            )}
                          </div>
                          {d.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {d.description}
                            </p>
                          )}
                        </div>
                        {d.key === "photo" ? (
                          <ImageIcon className="h-5 w-5 text-muted-foreground shrink-0" />
                        ) : (
                          <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                        )}
                      </div>

                      {file ? (
                        <div className="mt-4 flex items-center justify-between gap-3 rounded-md bg-white border border-border px-3 py-2">
                          <div className="min-w-0">
                            <div className="text-xs font-medium text-emerald-700 inline-flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Yüklendi
                            </div>
                            <div className="text-sm text-brand-900 truncate">
                              {file.fileName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {(file.size / 1024).toFixed(0)} KB
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(d.key)}
                            className="text-red-600 hover:bg-red-50 h-9 w-9 rounded-md inline-flex items-center justify-center shrink-0"
                            aria-label="Kaldır"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <label
                          className={cn(
                            "mt-4 inline-flex w-full items-center justify-center gap-2 h-11 rounded-md bg-white border border-border text-sm font-medium text-brand-800",
                            isUploading
                              ? "opacity-60 cursor-wait"
                              : "hover:bg-brand-50 cursor-pointer",
                          )}
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Yükleniyor…
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4" /> Dosya Seç
                            </>
                          )}
                          <input
                            type="file"
                            className="sr-only"
                            accept=".pdf,.jpg,.jpeg,.png"
                            disabled={isUploading}
                            onChange={(e) => handleFile(d.key, e)}
                          />
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>
            </StepWrap>
          )}

          {step === 4 && (
            <StepWrap
              title={formText.steps.finalize.title}
              description={formText.steps.finalize.description}
            >
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <Field
                    label="IBAN"
                    required
                    hint="TR ile başlayan 26 haneli IBAN'ınızı boşluksuz veya boşluklu girebilirsiniz"
                    error={errors.iban}
                  >
                    <Input
                      value={data.iban}
                      onChange={(e) =>
                        update("iban", e.target.value.toUpperCase())
                      }
                      invalid={!!errors.iban}
                      placeholder="TR00 0000 0000 0000 0000 0000 00"
                    />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field
                    label="Motivasyon Mektubu"
                    required
                    hint="Neden bursa ihtiyaç duyduğunuzu, akademik ve kariyer hedeflerinizi anlatın (en az 80 karakter)."
                    error={errors.motivationLetter}
                  >
                    <Textarea
                      value={data.motivationLetter}
                      onChange={(e) =>
                        update("motivationLetter", e.target.value)
                      }
                      invalid={!!errors.motivationLetter}
                      rows={6}
                      placeholder="Saygıdeğer komisyon üyeleri..."
                    />
                  </Field>
                </div>
                <div className="sm:col-span-2 rounded-xl bg-brand-50 border border-brand-100 p-4">
                  <p className="text-sm text-brand-900">
                    <span className="font-semibold">Onay:</span>{" "}
                    {formText.consentText}
                  </p>
                </div>

                {!isEdit && (
                  <div className="sm:col-span-2">
                    {data.kvkkConsentAt ? (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 flex items-start gap-2">
                        <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0" />
                        <div>
                          KVKK aydınlatma metni okundu ve onaylandı (
                          {new Date(data.kvkkConsentAt).toLocaleString("tr-TR")}).
                          <button
                            type="button"
                            onClick={() => setKvkkOpen(true)}
                            className="ml-2 underline text-emerald-900 hover:text-emerald-700"
                          >
                            Tekrar görüntüle
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                        <div>
                          Başvuruyu tamamlamak için KVKK aydınlatma metnini
                          onaylamanız gerekir.
                          <button
                            type="button"
                            onClick={() => setKvkkOpen(true)}
                            className="ml-2 underline text-amber-950 hover:text-amber-700 font-medium"
                          >
                            Metni aç ve onayla
                          </button>
                        </div>
                      </div>
                    )}
                    {errors._kvkk && (
                      <p className="text-xs text-red-600 mt-2">{errors._kvkk}</p>
                    )}
                  </div>
                )}
              </div>
            </StepWrap>
          )}

          <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-6">
            {step > 0 ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(step - 1)}
                leftIcon={<ArrowLeft className="h-4 w-4" />}
              >
                {formText.buttons.prev}
              </Button>
            ) : (
              <span />
            )}
            <Button
              type="button"
              variant={step === steps.length - 1 ? "gold" : "primary"}
              onClick={next}
              loading={submitting}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              {step === steps.length - 1
                ? isEdit
                  ? "Değişiklikleri Kaydet"
                  : formText.buttons.submit
                : formText.buttons.next}
            </Button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

function StepWrap({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="animate-float-up">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-brand-900">{title}</h2>
        <p className="text-muted-foreground mt-1.5">{description}</p>
      </div>
      {children}
    </div>
  );
}

function UpdatedScreen({ onView }: { onView: () => void }) {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-10 text-center">
      <div className="h-16 w-16 mx-auto rounded-full bg-emerald-600 text-white flex items-center justify-center">
        <CheckCircle2 className="h-8 w-8" />
      </div>
      <h2 className="text-2xl font-semibold text-brand-900 mt-5">
        Başvurunuz güncellendi
      </h2>
      <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
        Yaptığınız değişiklikler başarıyla kaydedildi. Komisyonumuz güncel
        bilgileriniz üzerinden değerlendirmesini sürdürecektir.
      </p>
      <div className="mt-7 flex items-center justify-center gap-3">
        <Button variant="primary" onClick={onView}>
          Hesabıma Git
        </Button>
      </div>
    </div>
  );
}

function KvkkModal({
  content,
  onAccept,
  onClose,
  alreadyAccepted,
}: {
  content: string;
  onAccept: () => void;
  onClose: () => void;
  alreadyAccepted: boolean;
}) {
  const [scrolled, setScrolled] = useState(false);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    // Metin modal'a tamamen sığıyorsa scroll mümkün değil — direkt okundu say.
    if (el.scrollHeight <= el.clientHeight + 4) {
      setScrolled(true);
    }
  }, [content]);
  return (
    <div
      className="fixed inset-0 z-50 bg-brand-950/60 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="kvkk-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col">
        <div className="px-6 pt-6 pb-3 border-b border-border">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="kvkk-modal-title"
                className="text-lg font-semibold text-brand-900"
              >
                KVKK Aydınlatma Metni
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Başvurunuza devam etmek için lütfen metni okuyup onaylayın.
              </p>
            </div>
          </div>
        </div>
        <div
          ref={scrollerRef}
          className="flex-1 overflow-y-auto px-6 py-4 text-sm text-brand-900 whitespace-pre-line leading-relaxed"
          onScroll={(e) => {
            const el = e.currentTarget;
            if (
              !scrolled &&
              el.scrollTop + el.clientHeight >= el.scrollHeight - 20
            ) {
              setScrolled(true);
            }
          }}
        >
          {content}
        </div>
        <div className="px-6 py-4 border-t border-border bg-muted/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            {scrolled
              ? "Metni okuduğunuzu doğruladık."
              : "Metni en alta kaydırdığınızda onay butonu açılır."}
          </p>
          <div className="flex items-center gap-2">
            {alreadyAccepted && (
              <Button type="button" variant="outline" onClick={onClose}>
                Kapat
              </Button>
            )}
            <Button
              type="button"
              variant="primary"
              onClick={onAccept}
              disabled={!scrolled}
              leftIcon={<ShieldCheck className="h-4 w-4" />}
            >
              Okudum, onaylıyorum
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ClosedScreen({
  reason,
  content,
}: {
  reason: string;
  content: BursApplicationClosedText;
}) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-10 text-center">
      <div className="h-16 w-16 mx-auto rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
        <Lock className="h-8 w-8" />
      </div>
      <h2 className="text-2xl font-semibold text-brand-900 mt-5">
        {content.title}
      </h2>
      <p className="text-muted-foreground mt-2 max-w-lg mx-auto whitespace-pre-line">
        {content.description}
      </p>
      {content.showSystemDate && reason && (
        <p className="text-sm text-amber-900/90 mt-3 max-w-lg mx-auto font-medium">
          {reason}
        </p>
      )}
      {content.footnote.trim() && (
        <p className="text-xs text-muted-foreground mt-4 max-w-lg mx-auto whitespace-pre-line">
          {content.footnote}
        </p>
      )}
    </div>
  );
}

function SuccessScreen({
  id,
  text,
  onView,
}: {
  id: string;
  text: ApplicationFormText["success"];
  onView: () => void;
}) {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-10 text-center">
      <div className="h-16 w-16 mx-auto rounded-full bg-emerald-600 text-white flex items-center justify-center">
        <CheckCircle2 className="h-8 w-8" />
      </div>
      <h2 className="text-2xl font-semibold text-brand-900 mt-5">{text.title}</h2>
      <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
        {text.description}
      </p>
      <div className="mt-6 inline-flex items-center gap-2 rounded-md bg-white border border-border px-4 h-11 font-mono text-sm">
        Başvuru No:{" "}
        <span className="text-brand-900 font-semibold">{id}</span>
      </div>
      <div className="mt-7 flex items-center justify-center gap-3">
        <Button variant="outline" onClick={() => window.location.reload()}>
          {text.newApplicationButton}
        </Button>
        <Button variant="primary" onClick={onView}>
          {text.accountButton}
        </Button>
      </div>
    </div>
  );
}
