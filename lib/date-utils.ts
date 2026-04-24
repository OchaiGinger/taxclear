export function getLast12MonthsRange(): {
  startDate: string;
  endDate: string;
} {
  const now = new Date();
  const end = now.toISOString().split("T")[0];
  const start = new Date(new Date().setFullYear(now.getFullYear() - 1))
    .toISOString()
    .split("T")[0];
  return { startDate: start, endDate: end };
}
