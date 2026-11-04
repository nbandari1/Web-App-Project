export function normalizeMalEntry(item: { node?: { title?: unknown; average_episode_duration?: unknown }; list_status?: { num_episodes_watched?: unknown } }) {
  const episodes = item.list_status?.num_episodes_watched;
  const duration = item.node?.average_episode_duration;
  if (typeof episodes !== "number" || !Number.isSafeInteger(episodes) || episodes < 0) return null;
  const seconds = typeof duration === "number" && Number.isFinite(duration) && duration > 0 ? episodes * duration : null;
  return { title: typeof item.node?.title === "string" ? item.node.title : "Untitled", episodes, seconds: seconds !== null && Number.isFinite(seconds) ? seconds : null };
}
