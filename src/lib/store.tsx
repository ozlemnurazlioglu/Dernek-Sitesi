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
import {
  seedApplications,
  seedEvents,
  seedMessages,
  seedNews,
  seedUsers,
} from "./seed-data";
import type {
  ApplicationStatus,
  ContactMessage,
  EventItem,
  NewsItem,
  ScholarshipApplication,
  User,
} from "./types";
import { uid } from "./utils";

const STORAGE_KEY = "umut-dernegi-store-v1";
const SESSION_KEY = "umut-dernegi-session-v1";

type State = {
  users: User[];
  applications: ScholarshipApplication[];
  news: NewsItem[];
  events: EventItem[];
  messages: ContactMessage[];
};

type StoreContextValue = State & {
  ready: boolean;
  currentUser: User | null;
  login: (
    email: string,
    password: string,
  ) => { ok: true; user: User } | { ok: false; error: string };
  register: (
    payload: Omit<User, "id" | "role" | "joinedAt"> & { password: string },
  ) => { ok: true; user: User } | { ok: false; error: string };
  logout: () => void;

  submitApplication: (
    application: Omit<
      ScholarshipApplication,
      "id" | "status" | "submittedAt" | "applicantId"
    > & { applicantId?: string },
  ) => ScholarshipApplication;
  updateApplicationStatus: (
    id: string,
    status: ApplicationStatus,
    note?: string,
    score?: number,
  ) => void;

  upsertNews: (item: NewsItem) => void;
  removeNews: (id: string) => void;
  upsertEvent: (item: EventItem) => void;
  removeEvent: (id: string) => void;

  addMessage: (
    payload: Omit<ContactMessage, "id" | "createdAt" | "read">,
  ) => ContactMessage;
  toggleMessageRead: (id: string, read: boolean) => void;
  removeMessage: (id: string) => void;

  resetDemo: () => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

function initialState(): State {
  return {
    users: seedUsers,
    applications: seedApplications,
    news: seedNews,
    events: seedEvents,
    messages: seedMessages,
  };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(() => initialState());
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as State;
        setState({
          users: parsed.users ?? seedUsers,
          applications: parsed.applications ?? seedApplications,
          news: parsed.news ?? seedNews,
          events: parsed.events ?? seedEvents,
          messages: parsed.messages ?? seedMessages,
        });
      }
      const session = window.localStorage.getItem(SESSION_KEY);
      if (session) {
        const sessionUser = JSON.parse(session) as User;
        setCurrentUser(sessionUser);
      }
    } catch {
      // ignore corrupted storage in demo
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready || typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, ready]);

  useEffect(() => {
    if (!ready || typeof window === "undefined") return;
    if (currentUser) {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
    } else {
      window.localStorage.removeItem(SESSION_KEY);
    }
  }, [currentUser, ready]);

  const login: StoreContextValue["login"] = useCallback(
    (email, password) => {
      const normalized = email.trim().toLowerCase();
      const user = state.users.find(
        (u) => u.email.toLowerCase() === normalized && u.password === password,
      );
      if (!user) {
        return { ok: false, error: "E-posta veya şifre hatalı." };
      }
      setCurrentUser(user);
      return { ok: true, user };
    },
    [state.users],
  );

  const register: StoreContextValue["register"] = useCallback(
    (payload) => {
      const normalized = payload.email.trim().toLowerCase();
      const exists = state.users.some(
        (u) => u.email.toLowerCase() === normalized,
      );
      if (exists) {
        return {
          ok: false,
          error: "Bu e-posta ile kayıtlı bir hesap zaten mevcut.",
        };
      }
      const newUser: User = {
        id: `u-${uid()}`,
        fullName: payload.fullName,
        email: payload.email,
        password: payload.password,
        phone: payload.phone,
        city: payload.city,
        role: "member",
        joinedAt: new Date().toISOString(),
      };
      setState((prev) => ({ ...prev, users: [...prev.users, newUser] }));
      setCurrentUser(newUser);
      return { ok: true, user: newUser };
    },
    [state.users],
  );

  const logout = useCallback(() => setCurrentUser(null), []);

  const submitApplication: StoreContextValue["submitApplication"] = useCallback(
    (payload) => {
      const application: ScholarshipApplication = {
        id: `a-${uid()}`,
        applicantId: payload.applicantId ?? currentUser?.id ?? "guest",
        status: "submitted",
        submittedAt: new Date().toISOString(),
        ...payload,
      };
      setState((prev) => ({
        ...prev,
        applications: [application, ...prev.applications],
      }));
      return application;
    },
    [currentUser],
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
  }, []);

  const removeNews: StoreContextValue["removeNews"] = useCallback((id) => {
    setState((prev) => ({
      ...prev,
      news: prev.news.filter((n) => n.id !== id),
    }));
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
  }, []);

  const removeEvent: StoreContextValue["removeEvent"] = useCallback((id) => {
    setState((prev) => ({
      ...prev,
      events: prev.events.filter((e) => e.id !== id),
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
    return message;
  }, []);

  const toggleMessageRead: StoreContextValue["toggleMessageRead"] = useCallback(
    (id, read) => {
      setState((prev) => ({
        ...prev,
        messages: prev.messages.map((m) => (m.id === id ? { ...m, read } : m)),
      }));
    },
    [],
  );

  const removeMessage: StoreContextValue["removeMessage"] = useCallback(
    (id) => {
      setState((prev) => ({
        ...prev,
        messages: prev.messages.filter((m) => m.id !== id),
      }));
    },
    [],
  );

  const resetDemo = useCallback(() => {
    setState(initialState());
    setCurrentUser(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(SESSION_KEY);
    }
  }, []);

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
      upsertNews,
      removeNews,
      upsertEvent,
      removeEvent,
      addMessage,
      toggleMessageRead,
      removeMessage,
      resetDemo,
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
      upsertNews,
      removeNews,
      upsertEvent,
      removeEvent,
      addMessage,
      toggleMessageRead,
      removeMessage,
      resetDemo,
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
