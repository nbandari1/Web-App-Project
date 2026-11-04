export function filterTasks<T extends { title: string; status: string; priority?: string }>(tasks: T[], query: string, status: string, priority: string): T[] {
  return tasks.filter(task => task.title.toLowerCase().includes(query.trim().toLowerCase()) && (status === "all" || task.status === status) && (priority === "all" || (task.priority ?? "medium") === priority));
}
