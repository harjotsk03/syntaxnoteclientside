export function formatSmartDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();

  const isSameYear = date.getFullYear() === now.getFullYear();

  if (isSameYear) {
    return date.toLocaleDateString("en-US", {
      month: "short", // 👈 3-letter month
      day: "numeric",
    });
  }

  // Format dd/mm/yy
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yy = String(date.getFullYear()).slice(-2);

  return `${dd}/${mm}/${yy}`;
}
