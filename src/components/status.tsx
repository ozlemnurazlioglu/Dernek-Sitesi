import { Badge } from "@/components/ui/badge";
import type { ApplicationStatus } from "@/lib/types";

const map: Record<
  ApplicationStatus,
  { label: string; tone: "info" | "warning" | "success" | "danger" }
> = {
  submitted: { label: "Beklemede", tone: "info" },
  in_review: { label: "İnceleniyor", tone: "warning" },
  approved: { label: "Onaylandı", tone: "success" },
  rejected: { label: "Reddedildi", tone: "danger" },
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const config = map[status];
  return <Badge tone={config.tone}>{config.label}</Badge>;
}

export const statusOptions = Object.entries(map).map(([key, value]) => ({
  value: key as ApplicationStatus,
  label: value.label,
}));
