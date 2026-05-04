"use client";

import {
  useState,
  type ChangeEvent,
  type ReactNode,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  CreditCard,
  FileText,
  GraduationCap,
  Image as ImageIcon,
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
  DocumentKey,
  ScholarshipApplication,
} from "@/lib/types";
import { cn } from "@/lib/utils";

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
  "id" | "applicantId" | "status" | "submittedAt" | "documents"
> & {
  documents: Partial<Record<DocumentKey, ApplicationDocument>>;
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

const initialData = (): FormData => ({
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
  iban: "",
  motivationLetter: "",
  documents: {},
});

const STEP_DEFS = [
  { key: "personal", icon: User },
  { key: "education", icon: GraduationCap },
  { key: "family", icon: Users },
  { key: "documents", icon: FileText },
  { key: "finalize", icon: CreditCard },
] as const;

type StepKey = (typeof STEP_DEFS)[number]["key"];

export function ApplicationForm() {
  const router = useRouter();
  const {
    currentUser,
    submitApplication,
    pageBlocks,
    requiredDocuments,
  } = useStore();
  const { toast } = useToast();
  const formText =
    (pageBlocks["burs.application_form"] as ApplicationFormText | undefined) ??
    DEFAULT_FORM_TEXT;
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
  const [data, setData] = useState<FormData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      setData((prev) => ({
        ...prev,
        fullName: prev.fullName || currentUser.fullName,
        email: prev.email || currentUser.email,
        phone: prev.phone || currentUser.phone || "",
        city: prev.city || currentUser.city || "",
      }));
    }
  }, [currentUser]);

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
    } else if (step === 2) {
      if (!data.fatherName.trim())
        newErrors.fatherName = "Baba adı zorunludur";
      if (!data.fatherJob.trim())
        newErrors.fatherJob = "Baba mesleği zorunludur";
      if (!data.motherName.trim())
        newErrors.motherName = "Anne adı zorunludur";
      if (!data.motherJob.trim())
        newErrors.motherJob = "Anne mesleği zorunludur";
    } else if (step === 3) {
      const missing = docs
        .filter((d) => d.required)
        .filter((d) => !data.documents[d.key]);
      if (missing.length > 0) {
        newErrors._docs = `${missing.length} zorunlu belge eksik`;
      }
    } else if (step === 4) {
      if (!/^TR/i.test(data.iban.replace(/\s/g, "")))
        newErrors.iban = "Geçerli bir IBAN giriniz (TR ile başlamalı)";
      if (data.motivationLetter.trim().length < 80)
        newErrors.motivationLetter =
          "Lütfen en az 80 karakterlik bir motivasyon mektubu yazın";
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

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      const application = submitApplication({
        applicantId: currentUser?.id,
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
        iban: data.iban,
        motivationLetter: data.motivationLetter,
        documents: data.documents,
      });
      setSubmittedId(application.id);
      toast({
        tone: "success",
        title: "Başvurunuz alındı",
        description: `Başvuru numaranız: ${application.id}`,
      });
      setSubmitting(false);
    }, 800);
  };

  const handleFile = (key: DocumentKey, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({
        tone: "error",
        title: "Dosya çok büyük",
        description: "Her dosya en fazla 10 MB olabilir.",
      });
      return;
    }
    const doc: ApplicationDocument = {
      key,
      fileName: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    };
    update("documents", { ...data.documents, [key]: doc });
    toast({ tone: "success", title: "Belge yüklendi", description: file.name });
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

  return (
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
                  return (
                    <div
                      key={d.key}
                      className={cn(
                        "rounded-xl border-2 border-dashed p-4 transition-colors",
                        file
                          ? "border-emerald-300 bg-emerald-50/40"
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
                        <label className="mt-4 inline-flex w-full items-center justify-center gap-2 h-11 rounded-md bg-white border border-border text-sm font-medium text-brand-800 hover:bg-brand-50 cursor-pointer">
                          <Upload className="h-4 w-4" /> Dosya Seç
                          <input
                            type="file"
                            className="sr-only"
                            accept=".pdf,.jpg,.jpeg,.png"
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
                ? formText.buttons.submit
                : formText.buttons.next}
            </Button>
          </div>
        </div>
      </div>
    </div>
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
