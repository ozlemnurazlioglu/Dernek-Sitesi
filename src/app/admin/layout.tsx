"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { useStore } from "@/lib/store";
import { AdminSidebar, AdminTopbar } from "@/components/admin/sidebar";
import { ButtonLink } from "@/components/ui/button";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { ready, currentUser } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!currentUser) {
      router.replace("/giris?redirect=/admin");
    }
  }, [ready, currentUser, router]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Yükleniyor...
      </div>
    );
  }

  if (!currentUser) return null;

  if (currentUser.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="h-16 w-16 mx-auto rounded-full bg-red-50 text-red-600 flex items-center justify-center">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-semibold text-brand-900 mt-5">
            Yetkisiz erişim
          </h1>
          <p className="text-muted-foreground mt-2">
            Bu sayfa yalnızca yönetici hesaplar tarafından görüntülenebilir.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <ButtonLink href="/" variant="outline">
              Ana sayfa
            </ButtonLink>
            <ButtonLink href="/hesabim" variant="primary">
              Hesabım
            </ButtonLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="lg:grid lg:grid-cols-[18rem_1fr]">
        <AdminSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex flex-col min-h-screen">
          <AdminTopbar onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 px-4 sm:px-6 py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
