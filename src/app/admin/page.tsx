"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  ArrowUpRight,
  Calendar,
  GraduationCap,
  Newspaper,
  Users,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status";
import { formatDateTimeTR } from "@/lib/utils";

export default function AdminDashboardPage() {
  const { applications, users, news, events, messages } = useStore();

  const stats = useMemo(() => {
    const total = applications.length;
    const approved = applications.filter((a) => a.status === "approved").length;
    const rejected = applications.filter((a) => a.status === "rejected").length;
    const pending = applications.filter(
      (a) => a.status === "submitted" || a.status === "in_review",
    ).length;
    return { total, approved, rejected, pending };
  }, [applications]);

  const recent = useMemo(
    () =>
      [...applications]
        .sort(
          (a, b) =>
            new Date(b.submittedAt).getTime() -
            new Date(a.submittedAt).getTime(),
        )
        .slice(0, 6),
    [applications],
  );

  const monthlyBuckets = useMemo(() => {
    const buckets: Record<string, number> = {};
    applications.forEach((a) => {
      const d = new Date(a.submittedAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      buckets[key] = (buckets[key] ?? 0) + 1;
    });
    const ordered = Object.entries(buckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6);
    const max = Math.max(1, ...ordered.map(([, v]) => v));
    return { ordered, max };
  }, [applications]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-brand-900">
            Genel Bakış
          </h1>
          <p className="text-muted-foreground mt-1">
            Derneğinizin son 30 günündeki performans ve aktivite özeti.
          </p>
        </div>
        <Badge tone="success">
          <CheckCircle2 className="h-3 w-3" /> Tüm sistemler çalışıyor
        </Badge>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Toplam Başvuru"
          value={stats.total}
          icon={GraduationCap}
          delta="+12%"
        />
        <StatCard
          label="Onaylanan"
          value={stats.approved}
          icon={CheckCircle2}
          tone="emerald"
          delta="+4"
        />
        <StatCard
          label="Beklemede"
          value={stats.pending}
          icon={Clock}
          tone="amber"
        />
        <StatCard
          label="Reddedilen"
          value={stats.rejected}
          icon={XCircle}
          tone="red"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-white p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-brand-900">
                Aylık Başvurular
              </h3>
              <p className="text-xs text-muted-foreground">Son 6 ay</p>
            </div>
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="grid grid-cols-6 gap-3 h-44 items-end">
            {monthlyBuckets.ordered.map(([key, value]) => {
              const h = Math.max(8, Math.round((value / monthlyBuckets.max) * 100));
              const [, mm] = key.split("-");
              const monthNames = [
                "Oca",
                "Şub",
                "Mar",
                "Nis",
                "May",
                "Haz",
                "Tem",
                "Ağu",
                "Eyl",
                "Eki",
                "Kas",
                "Ara",
              ];
              const label = monthNames[Number(mm) - 1];
              return (
                <div
                  key={key}
                  className="flex flex-col items-center justify-end gap-2"
                >
                  <div className="text-xs font-semibold text-brand-900">
                    {value}
                  </div>
                  <div
                    className="w-full rounded-t-md bg-gradient-to-b from-brand-700 to-brand-900 hover:from-brand-600 transition-colors"
                    style={{ height: `${h}%` }}
                  />
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6">
          <h3 className="text-base font-semibold text-brand-900">
            Hızlı Özet
          </h3>
          <ul className="mt-5 space-y-4">
            <SummaryRow
              icon={Users}
              label="Üyeler"
              value={users.filter((u) => u.role === "member").length}
              href="/admin/uyeler"
            />
            <SummaryRow
              icon={Newspaper}
              label="Haberler"
              value={news.length}
              href="/admin/haberler"
            />
            <SummaryRow
              icon={Calendar}
              label="Etkinlikler"
              value={events.length}
              href="/admin/etkinlikler"
            />
            <SummaryRow
              icon={FileText}
              label="Yeni Mesajlar"
              value={messages.filter((m) => !m.read).length}
              href="/admin/mesajlar"
              tone="warning"
            />
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-base font-semibold text-brand-900">
            Son Burs Başvuruları
          </h3>
          <Link
            href="/admin/basvurular"
            className="text-sm font-medium text-brand-700 hover:text-brand-900 inline-flex items-center gap-1"
          >
            Tümünü Gör <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-6 py-3">Başvuran</th>
                <th className="text-left font-medium px-4 py-3">Okul</th>
                <th className="text-left font-medium px-4 py-3">GANO</th>
                <th className="text-left font-medium px-4 py-3">Tarih</th>
                <th className="text-left font-medium px-4 py-3">Durum</th>
                <th className="text-right font-medium px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recent.map((app) => (
                <tr key={app.id} className="hover:bg-muted/30">
                  <td className="px-6 py-3.5">
                    <div className="font-medium text-brand-900">
                      {app.fullName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {app.email}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-brand-900">{app.schoolName}</td>
                  <td className="px-4 py-3.5">{app.gpa}</td>
                  <td className="px-4 py-3.5 text-muted-foreground">
                    {formatDateTimeTR(app.submittedAt)}
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <Link
                      href={`/admin/basvurular/${app.id}`}
                      className="text-sm font-medium text-brand-700 hover:text-brand-900"
                    >
                      İncele →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  delta,
  tone = "brand",
}: {
  label: string;
  value: number;
  icon: typeof GraduationCap;
  delta?: string;
  tone?: "brand" | "emerald" | "amber" | "red";
}) {
  const tones = {
    brand: "bg-brand-50 text-brand-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
  };
  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      <div className="flex items-start justify-between">
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
        {delta && (
          <span className="text-xs font-medium text-emerald-700 inline-flex items-center gap-0.5">
            <TrendingUp className="h-3 w-3" /> {delta}
          </span>
        )}
      </div>
      <div className="mt-5 text-3xl font-semibold text-brand-900">{value}</div>
      <div className="text-sm text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

function SummaryRow({
  icon: Icon,
  label,
  value,
  href,
  tone,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  href: string;
  tone?: "warning";
}) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-center gap-3 -mx-2 px-2 py-2 rounded-md hover:bg-muted/50"
      >
        <div className={`h-9 w-9 rounded-md flex items-center justify-center ${tone === "warning" ? "bg-amber-50 text-amber-700" : "bg-brand-50 text-brand-700"}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-brand-900">{label}</div>
        </div>
        <div className="text-base font-semibold text-brand-900">{value}</div>
      </Link>
    </li>
  );
}
