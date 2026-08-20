export type Plan = "free" | "creator" | "studio";
export type SubStatus = "free" | "trialing" | "active" | "canceled";

export type Subscription = {
  plan: Plan;
  status: SubStatus;
  stripeSessionId?: string;
};

export const FREE_SUB: Subscription = { plan: "free", status: "free" };

export function normalizeSubscription(value?: Partial<Subscription> | null): Subscription {
  const plan = value?.plan === "creator" || value?.plan === "studio" ? value.plan : "free";
  const status =
    value?.status === "trialing" ||
    value?.status === "active" ||
    value?.status === "canceled"
      ? value.status
      : "free";
  return {
    plan: status === "free" || status === "canceled" ? "free" : plan,
    status: status === "canceled" ? "canceled" : status,
    stripeSessionId: value?.stripeSessionId,
  };
}

export function isUnlocked(sub?: Partial<Subscription> | null) {
  const next = normalizeSubscription(sub);
  return next.status === "trialing" || next.status === "active";
}

export function nicheLimit(sub?: Partial<Subscription> | null) {
  const next = normalizeSubscription(sub);
  if (next.plan === "studio") return 8;
  if (next.plan === "creator") return 3;
  return 1;
}
