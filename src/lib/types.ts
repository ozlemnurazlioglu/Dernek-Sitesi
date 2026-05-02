export type Role = "admin" | "member";

export type User = {
  id: string;
  fullName: string;
  email: string;
  password: string;
  role: Role;
  joinedAt: string;
  phone?: string;
  city?: string;
};

export type ApplicationStatus =
  | "submitted"
  | "in_review"
  | "approved"
  | "rejected";

export type DocumentKey =
  | "id_card"
  | "student_certificate"
  | "transcript"
  | "income_proof"
  | "residence"
  | "photo";

export type ApplicationDocument = {
  key: DocumentKey;
  fileName: string;
  size: number;
  uploadedAt: string;
};

export type ScholarshipApplication = {
  id: string;
  applicantId: string;
  status: ApplicationStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewerNote?: string;
  score?: number;

  // Step 1 — Personal
  fullName: string;
  nationalId: string;
  birthDate: string;
  gender: "kadin" | "erkek" | "belirtmek_istemiyorum";
  email: string;
  phone: string;
  address: string;
  city: string;

  // Step 2 — Education
  schoolType: "lise" | "onlisans" | "lisans" | "yuksek_lisans" | "doktora";
  schoolName: string;
  department: string;
  grade: string;
  gpa: string;

  // Step 3 — Family
  fatherName: string;
  fatherJob: string;
  fatherIncome: string;
  motherName: string;
  motherJob: string;
  motherIncome: string;
  siblings: number;
  workingMembers: number;
  previousScholarship: boolean;
  previousScholarshipDetail?: string;

  // Step 4 — Bank & motivation
  iban: string;
  motivationLetter: string;

  // Documents
  documents: Partial<Record<DocumentKey, ApplicationDocument>>;
};

export type NewsItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  cover: string;
  category: "Duyuru" | "Haber" | "Basın" | "Proje";
  publishedAt: string;
  author: string;
};

export type EventItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  cover: string;
  startsAt: string;
  endsAt: string;
  location: string;
  capacity: number;
  registered: number;
  category: "Eğitim" | "Sosyal" | "Yardım" | "Konferans";
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
};
