export function determinePackagesQuantity(input: string): number | null {
  if (typeof input !== "string") return null;

  // Szukaj wewnątrz nawiasów: "(... <liczba> paczka|paczki|paczek ...)"
  const match = input
    .normalize("NFKC")
    .toLowerCase()
    .match(/\((?:[^()]*)?(\d+)\s*(?:paczka|paczki|paczek)(?:[^()]*)?\)/i);

  return match ? parseInt(match[1], 10) : null;
}
