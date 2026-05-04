import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import MaliTabloClient from "./client";

export const dynamic = "force-dynamic";

/**
 * Mali tablo sayfası yalnızca admin kullanıcılar tarafından görüntülenebilir.
 * Oturum açmamış veya admin olmayan ziyaretçilere 404 döndürürüz.
 */
export default async function MaliTabloPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    notFound();
  }
  return <MaliTabloClient />;
}
