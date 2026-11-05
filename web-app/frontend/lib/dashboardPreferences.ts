export const themes = ["light", "dark", "system"] as const;
export const accents = ["cyan", "violet", "rose"] as const;
export const widgets = {
  steam: "Steam activity",
  spotify: "Spotify activity",
  mal: "Anime activity",
  timer: "Focus timer",
  notes: "Notes",
  reminders: "Reminders",
} as const;

export type WidgetId = keyof typeof widgets;
export type Preferences = {
  theme: (typeof themes)[number];
  accent: (typeof accents)[number];
  hidden: WidgetId[];
};

export const defaults: Preferences = { theme: "dark", accent: "cyan", hidden: [] };

export function readPreferences(key: string): Preferences {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? "null");
    return {
      theme: themes.includes(value?.theme) ? value.theme : defaults.theme,
      accent: accents.includes(value?.accent) ? value.accent : defaults.accent,
      hidden: Array.isArray(value?.hidden)
        ? (Object.keys(widgets) as WidgetId[]).filter((id) => value.hidden.includes(id))
        : [],
    };
  } catch {
    return defaults;
  }
}
