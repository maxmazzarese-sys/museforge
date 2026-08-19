export const NICHE_OPTIONS = [
  "Content & newsletters",
  "SaaS & startups",
  "Personal brand",
  "Product design",
  "Sales outreach",
  "YouTube & short-form",
  "Engineering systems",
  "Wellness & habits",
];

export type UserSettings = {
  displayName: string;
  timezone: string;
  sparkTime: string;
  emailDaily: boolean;
  emailProduct: boolean;
  niches: string[];
};

export const DEFAULT_SETTINGS: UserSettings = {
  displayName: "",
  timezone: "Europe/Athens",
  sparkTime: "07:30",
  emailDaily: true,
  emailProduct: false,
  niches: NICHE_OPTIONS.slice(0, 3),
};

export function normalizeSettings(input: Partial<UserSettings> | undefined): UserSettings {
  const niches = Array.isArray(input?.niches)
    ? input!.niches.filter((item) => NICHE_OPTIONS.includes(item)).slice(0, 3)
    : DEFAULT_SETTINGS.niches;

  return {
    displayName: String(input?.displayName || "").trim().slice(0, 40),
    timezone: String(input?.timezone || DEFAULT_SETTINGS.timezone),
    sparkTime: /^[0-2]\d:[0-5]\d$/.test(String(input?.sparkTime || ""))
      ? String(input?.sparkTime)
      : DEFAULT_SETTINGS.sparkTime,
    emailDaily: input?.emailDaily !== false,
    emailProduct: Boolean(input?.emailProduct),
    niches: niches.length ? niches : DEFAULT_SETTINGS.niches,
  };
}
