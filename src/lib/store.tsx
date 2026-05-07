"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  ActivityReport,
  Aga,
  Announcement,
  AnnouncementCategory,
  ApplicationStatus,
  BankAccount,
  BoardMember,
  ContactMessage,
  DonationPreset,
  DonationUse,
  Donor,
  EventCategory,
  EventItem,
  Faq,
  FinanceItem,
  LegalPage,
  Milestone,
  Neighborhood,
  NewsCategory,
  NewsItem,
  Photo,
  PhotoCategory,
  RequiredDocument,
  ScholarshipApplication,
  ScholarshipProgram,
  ScholarshipTimelineStep,
  SiteSettings,
  Sponsor,
  SponsorTier,
  Testimonial,
  User,
  Video,
  VideoCategory,
} from "./types";
import { uid } from "./utils";

// İçerik tabloları için tip eşlemesi
type ContentMap = {
  "board-members": BoardMember;
  milestones: Milestone;
  "activity-reports": ActivityReport;
  "scholarship-programs": ScholarshipProgram;
  "required-documents": RequiredDocument;
  "scholarship-timeline": ScholarshipTimelineStep;
  faqs: Faq;
  testimonials: Testimonial;
  "donation-presets": DonationPreset;
  "donation-uses": DonationUse;
  "news-categories": NewsCategory;
  "event-categories": EventCategory;
  "legal-pages": LegalPage;
  agalar: Aga;
  "finance-items": FinanceItem;
  "announcement-categories": AnnouncementCategory;
  announcements: Announcement;
  "bank-accounts": BankAccount;
  "sponsor-tiers": SponsorTier;
  sponsors: Sponsor;
  neighborhoods: Neighborhood;
  donors: Donor;
  "photo-categories": PhotoCategory;
  photos: Photo;
  "video-categories": VideoCategory;
  videos: Video;
};
export type ContentType = keyof ContentMap;

type State = {
  users: User[];
  applications: ScholarshipApplication[];
  news: NewsItem[];
  events: EventItem[];
  messages: ContactMessage[];
  // İçerik
  siteSettings: SiteSettings;
  pageBlocks: Record<string, unknown>;
  boardMembers: BoardMember[];
  milestones: Milestone[];
  activityReports: ActivityReport[];
  scholarshipPrograms: ScholarshipProgram[];
  requiredDocuments: RequiredDocument[];
  scholarshipTimeline: ScholarshipTimelineStep[];
  faqs: Faq[];
  testimonials: Testimonial[];
  donationPresets: DonationPreset[];
  donationUses: DonationUse[];
  newsCategories: NewsCategory[];
  eventCategories: EventCategory[];
  legalPages: LegalPage[];
  agalar: Aga[];
  financeItems: FinanceItem[];
  announcementCategories: AnnouncementCategory[];
  announcements: Announcement[];
  bankAccounts: BankAccount[];
  sponsorTiers: SponsorTier[];
  sponsors: Sponsor[];
  neighborhoods: Neighborhood[];
  donors: Donor[];
  photoCategories: PhotoCategory[];
  photos: Photo[];
  videoCategories: VideoCategory[];
  videos: Video[];
  /**
   * Login olan kullanıcının kayıtlı olduğu etkinliklerin id'leri.
   * Anonim kullanıcı için her zaman boş.
   */
  myEventRegistrations: string[];
};

type LoginResult =
  | { ok: true; user: User }
  | { ok: false; error: string };

// Hangi state alanı hangi içerik tipine karşılık gelir?
const CONTENT_STATE_KEY: Record<ContentType, keyof State> = {
  "board-members": "boardMembers",
  milestones: "milestones",
  "activity-reports": "activityReports",
  "scholarship-programs": "scholarshipPrograms",
  "required-documents": "requiredDocuments",
  "scholarship-timeline": "scholarshipTimeline",
  faqs: "faqs",
  testimonials: "testimonials",
  "donation-presets": "donationPresets",
  "donation-uses": "donationUses",
  "news-categories": "newsCategories",
  "event-categories": "eventCategories",
  "legal-pages": "legalPages",
  agalar: "agalar",
  "finance-items": "financeItems",
  "announcement-categories": "announcementCategories",
  announcements: "announcements",
  "bank-accounts": "bankAccounts",
  "sponsor-tiers": "sponsorTiers",
  sponsors: "sponsors",
  neighborhoods: "neighborhoods",
  donors: "donors",
  "photo-categories": "photoCategories",
  photos: "photos",
  "video-categories": "videoCategories",
  videos: "videos",
};

type StoreContextValue = State & {
  ready: boolean;
  currentUser: User | null;
  login: (email: string, password: string) => Promise<LoginResult>;
  register: (
    payload: Omit<User, "id" | "role" | "joinedAt"> & { password: string },
  ) => Promise<LoginResult>;
  logout: () => Promise<void>;

  submitApplication: (
    application: Omit<
      ScholarshipApplication,
      "id" | "status" | "submittedAt" | "applicantId"
    > & { applicantId?: string },
  ) => Promise<ScholarshipApplication>;
  updateApplicationStatus: (
    id: string,
    status: ApplicationStatus,
    note?: string,
    score?: number,
  ) => void;
  /**
   * Mevcut bir başvurunun alanlarını ve belgelerini günceller.
   * Owner sadece submitted/in_review durumunda kullanabilir; admin
   * istediği zaman kullanabilir. Sunucu güvenlik kontrolü yapar.
   */
  updateApplication: (
    id: string,
    payload: Omit<
      ScholarshipApplication,
      "id" | "status" | "submittedAt" | "applicantId" | "reviewedAt" | "reviewerNote" | "score"
    >,
  ) => Promise<ScholarshipApplication>;

  upsertNews: (item: NewsItem) => void;
  removeNews: (id: string) => void;
  upsertEvent: (item: EventItem) => void;
  removeEvent: (id: string) => void;

  /**
   * Mevcut kullanıcıyı verilen etkinliğe kaydeder. Sunucu yanıtındaki
   * `registered` sayısı ile yerel etkinlik state'i ve myEventRegistrations
   * güncellenir. Kontenjan dolu / zaten kayıtlı durumlarında reject olur.
   */
  registerEvent: (eventId: string) => Promise<void>;
  /** Mevcut kullanıcının verilen etkinlikteki kaydını iptal eder. */
  cancelEventRegistration: (eventId: string) => Promise<void>;

  addMessage: (
    payload: Omit<ContactMessage, "id" | "createdAt" | "read">,
  ) => ContactMessage;
  toggleMessageRead: (id: string, read: boolean) => void;
  removeMessage: (id: string) => void;

  // İçerik mutation'ları
  updateSiteSettings: (next: Partial<SiteSettings>) => void;
  updatePageBlock: (key: string, data: unknown) => void;
  upsertContent: <T extends ContentType>(
    type: T,
    item: ContentMap[T],
  ) => Promise<void>;
  removeContent: (type: ContentType, id: string) => Promise<void>;

  resetDemo: () => void;
  /** Tüm state'i sunucudan yeniden çeker (örn. yedek geri yüklendikten sonra). */
  bootstrap: () => Promise<void>;
};

const StoreContext = createContext<StoreContextValue | null>(null);

const fallbackSettings: SiteSettings = {
  name: "",
  shortName: "",
  founded: 2008,
  slogan: "",
  description: "",
  logoUrl: "",
  logoSubtitle: "",
  contactAddress: "",
  contactPhone: "",
  contactEmail: "",
  contactWorkingHours: "",
  mapEmbedUrl: "",
  socialFacebook: "",
  socialInstagram: "",
  socialTwitter: "",
  socialLinkedin: "",
  socialYoutube: "",
  statYearsActive: 0,
  statScholarshipsGiven: 0,
  statActiveMembers: 0,
  statCompletedProjects: 0,
  seoTitle: "",
  seoTitleTemplate: "",
  seoDescription: "",
  seoOgImage: "",
  seoFaviconUrl: "",
  gaMeasurementId: "",
  gtmContainerId: "",
  metaPixelId: "",
  adsensePublisherId: "",
  customTrackingHtml: "",
};

const emptyState: State = {
  users: [],
  applications: [],
  news: [],
  events: [],
  messages: [],
  siteSettings: fallbackSettings,
  pageBlocks: {},
  boardMembers: [],
  milestones: [],
  activityReports: [],
  scholarshipPrograms: [],
  requiredDocuments: [],
  scholarshipTimeline: [],
  faqs: [],
  testimonials: [],
  donationPresets: [],
  donationUses: [],
  newsCategories: [],
  eventCategories: [],
  legalPages: [],
  agalar: [],
  financeItems: [],
  announcementCategories: [],
  announcements: [],
  bankAccounts: [],
  sponsorTiers: [],
  sponsors: [],
  neighborhoods: [],
  donors: [],
  photoCategories: [],
  photos: [],
  videoCategories: [],
  videos: [],
  myEventRegistrations: [],
};

type BootstrapPayload = State & { currentUser: User | null };

async function fetchBootstrap(): Promise<BootstrapPayload> {
  const res = await fetch("/api/bootstrap", {
    cache: "no-store",
    credentials: "same-origin",
  });
  if (!res.ok) {
    throw new Error(`Bootstrap başarısız: ${res.status}`);
  }
  return (await res.json()) as BootstrapPayload;
}

function logBgError(label: string) {
  return (err: unknown) => {
    if (typeof console !== "undefined") {
      console.error(`[store] ${label}`, err);
    }
  };
}

function bySort<T extends { sort: number }>(a: T, b: T) {
  return a.sort - b.sort;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(emptyState);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  const reload = useCallback(async () => {
    try {
      const data = await fetchBootstrap();
      setState({
        users: data.users,
        applications: data.applications,
        news: data.news,
        events: data.events,
        messages: data.messages,
        siteSettings: data.siteSettings ?? fallbackSettings,
        pageBlocks: data.pageBlocks ?? {},
        boardMembers: data.boardMembers ?? [],
        milestones: data.milestones ?? [],
        activityReports: data.activityReports ?? [],
        scholarshipPrograms: data.scholarshipPrograms ?? [],
        requiredDocuments: data.requiredDocuments ?? [],
        scholarshipTimeline: data.scholarshipTimeline ?? [],
        faqs: data.faqs ?? [],
        testimonials: data.testimonials ?? [],
        donationPresets: data.donationPresets ?? [],
        donationUses: data.donationUses ?? [],
        newsCategories: data.newsCategories ?? [],
        eventCategories: data.eventCategories ?? [],
        legalPages: data.legalPages ?? [],
        agalar: data.agalar ?? [],
        financeItems: data.financeItems ?? [],
        announcementCategories: data.announcementCategories ?? [],
        announcements: data.announcements ?? [],
        bankAccounts: data.bankAccounts ?? [],
        sponsorTiers: data.sponsorTiers ?? [],
        sponsors: data.sponsors ?? [],
        neighborhoods: data.neighborhoods ?? [],
        donors: data.donors ?? [],
        photoCategories: data.photoCategories ?? [],
        photos: data.photos ?? [],
        videoCategories: data.videoCategories ?? [],
        videos: data.videos ?? [],
        myEventRegistrations: data.myEventRegistrations ?? [],
      });
      setCurrentUser(data.currentUser ?? null);
    } catch (err) {
      logBgError("bootstrap")(err);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const login: StoreContextValue["login"] = useCallback(
    async (email, password) => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = (await res.json()) as
          | { user: User }
          | { error: string };
        if (!res.ok || !("user" in data)) {
          const error = "error" in data ? data.error : "Giriş başarısız oldu.";
          return { ok: false, error };
        }
        const user: User = { ...data.user, password: "" };
        setCurrentUser(user);
        void reload();
        return { ok: true, user };
      } catch (err) {
        logBgError("login")(err);
        return { ok: false, error: "Sunucuya ulaşılamadı." };
      }
    },
    [reload],
  );

  const register: StoreContextValue["register"] = useCallback(
    async (payload) => {
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: payload.fullName,
            email: payload.email,
            password: payload.password,
            phone: payload.phone,
            city: payload.city,
          }),
        });
        const data = (await res.json()) as
          | { user: User }
          | { error: string };
        if (!res.ok || !("user" in data)) {
          const error = "error" in data ? data.error : "Kayıt başarısız oldu.";
          return { ok: false, error };
        }
        const user: User = { ...data.user, password: "" };
        setCurrentUser(user);
        void reload();
        return { ok: true, user };
      } catch (err) {
        logBgError("register")(err);
        return { ok: false, error: "Sunucuya ulaşılamadı." };
      }
    },
    [reload],
  );

  const logout = useCallback(async () => {
    setCurrentUser(null);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
    } catch (err) {
      logBgError("logout")(err);
    }
  }, []);

  const submitApplication: StoreContextValue["submitApplication"] = useCallback(
    async (payload) => {
      // ID'yi sunucu üretir (yıllık sıralı: 2026burs01 vs.); body'de id yollamıyoruz.
      const requestBody = {
        applicantId: payload.applicantId ?? currentUser?.id ?? "guest",
        ...payload,
      };
      const res = await fetch("/api/applications", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { application: ScholarshipApplication };
      const application = json.application;
      setState((prev) => ({
        ...prev,
        applications: [application, ...prev.applications],
      }));
      return application;
    },
    [currentUser],
  );

  const updateApplication: StoreContextValue["updateApplication"] = useCallback(
    async (id, payload) => {
      const res = await fetch(`/api/applications/${encodeURIComponent(id)}`, {
        method: "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json().catch(() => null)) as
        | { application?: ScholarshipApplication; error?: string; code?: string }
        | null;
      if (!res.ok || !json?.application) {
        const err = new Error(
          json?.error || `Başvuru güncellenemedi (HTTP ${res.status})`,
        ) as Error & { code?: string; status?: number };
        err.code = json?.code;
        err.status = res.status;
        throw err;
      }
      const updated = json.application;
      setState((prev) => ({
        ...prev,
        applications: prev.applications.map((a) =>
          a.id === id ? updated : a,
        ),
      }));
      return updated;
    },
    [],
  );

  const updateApplicationStatus: StoreContextValue["updateApplicationStatus"] =
    useCallback((id, status, note, score) => {
      setState((prev) => ({
        ...prev,
        applications: prev.applications.map((app) =>
          app.id === id
            ? {
                ...app,
                status,
                reviewerNote: note ?? app.reviewerNote,
                score: score ?? app.score,
                reviewedAt: new Date().toISOString(),
              }
            : app,
        ),
      }));
      void fetch(`/api/applications/${encodeURIComponent(id)}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note, score }),
      })
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
        })
        .catch(logBgError("updateApplicationStatus"));
    }, []);

  const upsertNews: StoreContextValue["upsertNews"] = useCallback((item) => {
    setState((prev) => {
      const exists = prev.news.some((n) => n.id === item.id);
      return {
        ...prev,
        news: exists
          ? prev.news.map((n) => (n.id === item.id ? item : n))
          : [item, ...prev.news],
      };
    });
    void fetch("/api/news", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
      })
      .catch(logBgError("upsertNews"));
  }, []);

  const removeNews: StoreContextValue["removeNews"] = useCallback((id) => {
    setState((prev) => ({
      ...prev,
      news: prev.news.filter((n) => n.id !== id),
    }));
    void fetch(`/api/news/${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "same-origin",
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
      })
      .catch(logBgError("removeNews"));
  }, []);

  const upsertEvent: StoreContextValue["upsertEvent"] = useCallback((item) => {
    setState((prev) => {
      const exists = prev.events.some((e) => e.id === item.id);
      return {
        ...prev,
        events: exists
          ? prev.events.map((e) => (e.id === item.id ? item : e))
          : [item, ...prev.events],
      };
    });
    void fetch("/api/events", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
      })
      .catch(logBgError("upsertEvent"));
  }, []);

  const removeEvent: StoreContextValue["removeEvent"] = useCallback((id) => {
    setState((prev) => ({
      ...prev,
      events: prev.events.filter((e) => e.id !== id),
    }));
    void fetch(`/api/events/${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "same-origin",
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
      })
      .catch(logBgError("removeEvent"));
  }, []);

  const registerEvent: StoreContextValue["registerEvent"] = useCallback(
    async (eventId) => {
      const res = await fetch(
        `/api/events/${encodeURIComponent(eventId)}/register`,
        { method: "POST", credentials: "same-origin" },
      );
      const body = (await res.json().catch(() => null)) as
        | { ok?: boolean; registered?: number; error?: string; code?: string }
        | null;
      if (!res.ok) {
        const err = new Error(body?.error || `HTTP ${res.status}`) as Error & {
          code?: string;
          status?: number;
        };
        err.code = body?.code;
        err.status = res.status;
        throw err;
      }
      const newRegistered = body?.registered;
      setState((prev) => ({
        ...prev,
        events: prev.events.map((e) =>
          e.id === eventId
            ? { ...e, registered: newRegistered ?? e.registered + 1 }
            : e,
        ),
        myEventRegistrations: prev.myEventRegistrations.includes(eventId)
          ? prev.myEventRegistrations
          : [...prev.myEventRegistrations, eventId],
      }));
    },
    [],
  );

  const cancelEventRegistration: StoreContextValue["cancelEventRegistration"] =
    useCallback(async (eventId) => {
      const res = await fetch(
        `/api/events/${encodeURIComponent(eventId)}/register`,
        { method: "DELETE", credentials: "same-origin" },
      );
      const body = (await res.json().catch(() => null)) as
        | { ok?: boolean; registered?: number; error?: string }
        | null;
      if (!res.ok) {
        throw new Error(body?.error || `HTTP ${res.status}`);
      }
      const newRegistered = body?.registered;
      setState((prev) => ({
        ...prev,
        events: prev.events.map((e) =>
          e.id === eventId
            ? {
                ...e,
                registered:
                  newRegistered ?? Math.max(e.registered - 1, 0),
              }
            : e,
        ),
        myEventRegistrations: prev.myEventRegistrations.filter(
          (id) => id !== eventId,
        ),
      }));
    }, []);

  const addMessage: StoreContextValue["addMessage"] = useCallback((payload) => {
    const message: ContactMessage = {
      id: `m-${uid()}`,
      createdAt: new Date().toISOString(),
      read: false,
      ...payload,
    };
    setState((prev) => ({
      ...prev,
      messages: [message, ...prev.messages],
    }));
    void fetch("/api/messages", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
      })
      .catch(logBgError("addMessage"));
    return message;
  }, []);

  const toggleMessageRead: StoreContextValue["toggleMessageRead"] = useCallback(
    (id, read) => {
      setState((prev) => ({
        ...prev,
        messages: prev.messages.map((m) => (m.id === id ? { ...m, read } : m)),
      }));
      void fetch(`/api/messages/${encodeURIComponent(id)}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read }),
      })
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
        })
        .catch(logBgError("toggleMessageRead"));
    },
    [],
  );

  const removeMessage: StoreContextValue["removeMessage"] = useCallback(
    (id) => {
      setState((prev) => ({
        ...prev,
        messages: prev.messages.filter((m) => m.id !== id),
      }));
      void fetch(`/api/messages/${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "same-origin",
      })
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
        })
        .catch(logBgError("removeMessage"));
    },
    [],
  );

  const updateSiteSettings: StoreContextValue["updateSiteSettings"] = useCallback(
    (next) => {
      setState((prev) => ({
        ...prev,
        siteSettings: { ...prev.siteSettings, ...next },
      }));
      void fetch("/api/admin/site-settings", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      })
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
        })
        .catch(logBgError("updateSiteSettings"));
    },
    [],
  );

  const updatePageBlock: StoreContextValue["updatePageBlock"] = useCallback(
    (key, data) => {
      setState((prev) => ({
        ...prev,
        pageBlocks: { ...prev.pageBlocks, [key]: data },
      }));
      void fetch(`/api/admin/page-blocks/${encodeURIComponent(key)}`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      })
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
        })
        .catch(logBgError("updatePageBlock"));
    },
    [],
  );

  const upsertContent: StoreContextValue["upsertContent"] = useCallback(
    async (type, item) => {
      const stateKey = CONTENT_STATE_KEY[type];
      let prevSnapshot: { id: string }[] | null = null;
      setState((prev) => {
        const list = (prev[stateKey] as { id: string }[]) ?? [];
        prevSnapshot = list;
        const exists = list.some((x) => x.id === item.id);
        const next = exists
          ? list.map((x) => (x.id === item.id ? item : x))
          : [...list, item];
        if (next.length && "sort" in next[0]) {
          (next as unknown as { sort: number }[]).sort(bySort);
        }
        return { ...prev, [stateKey]: next };
      });
      try {
        const res = await fetch(`/api/admin/list/${encodeURIComponent(type)}`, {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        });
        if (!res.ok) {
          let msg = `HTTP ${res.status}`;
          try {
            const data = (await res.json()) as { error?: string };
            if (data?.error) msg = data.error;
          } catch {
            /* ignore json parse */
          }
          throw new Error(msg);
        }
      } catch (err) {
        if (prevSnapshot) {
          const rollback = prevSnapshot;
          setState((prev) => ({ ...prev, [stateKey]: rollback }));
        }
        logBgError(`upsertContent(${type})`)(err);
        throw err;
      }
    },
    [],
  );

  const removeContent: StoreContextValue["removeContent"] = useCallback(
    async (type, id) => {
      const stateKey = CONTENT_STATE_KEY[type];
      let prevSnapshot: { id: string }[] | null = null;
      setState((prev) => {
        const list = prev[stateKey] as { id: string }[];
        prevSnapshot = list;
        return { ...prev, [stateKey]: list.filter((x) => x.id !== id) };
      });
      try {
        const res = await fetch(
          `/api/admin/list/${encodeURIComponent(type)}/${encodeURIComponent(id)}`,
          {
            method: "DELETE",
            credentials: "same-origin",
          },
        );
        if (!res.ok) {
          let msg = `HTTP ${res.status}`;
          try {
            const data = (await res.json()) as { error?: string };
            if (data?.error) msg = data.error;
          } catch {
            /* ignore */
          }
          throw new Error(msg);
        }
      } catch (err) {
        if (prevSnapshot) {
          const rollback = prevSnapshot;
          setState((prev) => ({ ...prev, [stateKey]: rollback }));
        }
        logBgError(`removeContent(${type})`)(err);
        throw err;
      }
    },
    [],
  );

  const resetDemo = useCallback(() => {
    void fetch("/api/admin/reset", {
      method: "POST",
      credentials: "same-origin",
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        setCurrentUser(null);
        await reload();
      })
      .catch(logBgError("resetDemo"));
  }, [reload]);

  const value = useMemo<StoreContextValue>(
    () => ({
      ...state,
      ready,
      currentUser,
      login,
      register,
      logout,
      submitApplication,
      updateApplicationStatus,
      updateApplication,
      upsertNews,
      removeNews,
      upsertEvent,
      removeEvent,
      registerEvent,
      cancelEventRegistration,
      addMessage,
      toggleMessageRead,
      removeMessage,
      updateSiteSettings,
      updatePageBlock,
      upsertContent,
      removeContent,
      resetDemo,
      bootstrap: reload,
    }),
    [
      state,
      ready,
      currentUser,
      login,
      register,
      logout,
      submitApplication,
      updateApplicationStatus,
      updateApplication,
      upsertNews,
      removeNews,
      upsertEvent,
      removeEvent,
      registerEvent,
      cancelEventRegistration,
      addMessage,
      toggleMessageRead,
      removeMessage,
      updateSiteSettings,
      updatePageBlock,
      upsertContent,
      removeContent,
      resetDemo,
      reload,
    ],
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error("useStore must be used within StoreProvider");
  }
  return ctx;
}
