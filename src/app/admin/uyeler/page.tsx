"use client";

import { useMemo, useState } from "react";
import { Search, Mail, Phone, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { formatDateTR, initials } from "@/lib/utils";

export default function AdminMembersPage() {
  const { users, applications } = useStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "admin" | "member">("all");

  const filtered = useMemo(() => {
    return users
      .filter((u) => (filter === "all" ? true : u.role === filter))
      .filter((u) =>
        query
          ? `${u.fullName} ${u.email}`
              .toLocaleLowerCase("tr-TR")
              .includes(query.toLocaleLowerCase("tr-TR"))
          : true,
      )
      .sort(
        (a, b) =>
          new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime(),
      );
  }, [users, query, filter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-brand-900">
          Üyeler
        </h1>
        <p className="text-muted-foreground mt-1">
          Toplam {users.length} kayıtlı kullanıcı.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-white">
        <div className="px-4 sm:px-6 py-3 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {[
              { key: "all", label: `Tümü (${users.length})` },
              {
                key: "member",
                label: `Üyeler (${users.filter((u) => u.role === "member").length})`,
              },
              {
                key: "admin",
                label: `Yöneticiler (${users.filter((u) => u.role === "admin").length})`,
              },
            ].map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setFilter(opt.key as typeof filter)}
                className={
                  "h-9 px-3.5 rounded-full text-xs font-medium border transition-colors " +
                  (filter === opt.key
                    ? "bg-brand-900 text-white border-brand-900"
                    : "bg-white text-brand-800 border-border hover:border-brand-200")
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ad, e-posta ile ara"
              className="pl-9"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-6 py-3">Üye</th>
                <th className="text-left font-medium px-4 py-3">İletişim</th>
                <th className="text-left font-medium px-4 py-3">Şehir</th>
                <th className="text-left font-medium px-4 py-3">Rol</th>
                <th className="text-left font-medium px-4 py-3">Başvuru</th>
                <th className="text-left font-medium px-6 py-3">Üyelik</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((u) => {
                const apps = applications.filter(
                  (a) => a.applicantId === u.id || a.email === u.email,
                ).length;
                return (
                  <tr key={u.id} className="hover:bg-muted/30">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-brand-800 text-white text-sm font-semibold flex items-center justify-center">
                          {initials(u.fullName)}
                        </div>
                        <div>
                          <div className="font-medium text-brand-900">
                            {u.fullName}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {u.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-brand-900 inline-flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        {u.email}
                      </div>
                      {u.phone && (
                        <div className="text-xs text-muted-foreground inline-flex items-center gap-1.5 mt-0.5">
                          <Phone className="h-3 w-3" />
                          {u.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {u.city && (
                        <span className="inline-flex items-center gap-1.5 text-brand-900">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          {u.city}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge tone={u.role === "admin" ? "gold" : "brand"}>
                        {u.role === "admin" ? "Yönetici" : "Üye"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      {apps > 0 ? (
                        <Badge tone="success">{apps} başvuru</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-muted-foreground whitespace-nowrap">
                      {formatDateTR(u.joinedAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
