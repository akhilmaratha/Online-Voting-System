export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase())
    .join("");
}

export function toCSV(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "";
  }

  const headers = Object.keys(rows[0]);
  const escaped = (value) => {
    const str = String(value ?? "");
    if (str.includes(",") || str.includes("\"") || str.includes("\n")) {
      return `\"${str.replaceAll("\"", "\"\"")}\"`;
    }
    return str;
  };

  const lines = rows.map((row) => headers.map((h) => escaped(row[h])).join(","));
  return [headers.join(","), ...lines].join("\n");
}
