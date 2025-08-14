export type ParsedAddress = {
  street: string | null;
  number: string | null;
  apartment: string | null;
  staircase?: string | null;
  entrance?: string | null;
  building?: string | null;
  notes?: string | null;
  confidence: number;
  warnings: string[];
  raw: string;
};

const STREET_PREFIXES =
  /^(ul\.?|ulica|al\.?|aleja|aleje|pl\.?|plac|os\.?|osiedle|rondo|bulw\.?|bulwar)$/i;
const APT_TOKENS =
  /^(m\.|mieszk(?:anie)?\.?|miesz\.?|lok\.?|lokal\.?|apt\.?)$/i;
const STAIRCASE_TOKENS = /^(kl\.?|klatka)$/i;
const ENTRANCE_TOKENS = /^(wej(?:ście|scie)?)$/i;
const BUILDING_TOKENS = /^(bud\.?|budynek)$/i;

const HOUSE_PATTERN = /^\d+[a-zA-Z]?$|^\d+[a-zA-Z]?\/\d+[a-zA-Z]?$/.source;
const HOUSE_RE = new RegExp(HOUSE_PATTERN, "i");
const SLASH_RE = /^\d+[a-zA-Z]?\/[a-zA-Z]?\d+$/i;

function normalize(input: string) {
  return input
    .replace(/,/g, " ")
    .replace(/\s+/g, " ")
    .replace(/-\s+/g, "-")
    .trim();
}

function splitTokens(input: string): string[] {
  return input
    .replace(/(m\.|lok\.?|apt\.?)\s*([A-Za-z]?\d+)/gi, "$1 $2")
    .split(" ")
    .filter(Boolean);
}

function stripStreetPrefix(tokens: string[]): string[] {
  if (tokens.length && STREET_PREFIXES.test(tokens[0])) {
    return tokens.slice(1);
  }
  return tokens;
}

function stripLeadingCity(tokens: string[], expectedCity?: string) {
  if (!expectedCity) return tokens;
  const cityTokens = expectedCity
    .replace(/,/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
  if (cityTokens.length === 0) return tokens;
  const head = tokens.slice(0, cityTokens.length);
  if (head.join(" ").toLowerCase() === cityTokens.join(" ").toLowerCase()) {
    return tokens.slice(cityTokens.length);
  }
  return tokens;
}

export function parseAddressPL(
  input: string,
  opts?: { expectedCity?: string }
): ParsedAddress {
  const raw = input;
  const warnings: string[] = [];
  const out: ParsedAddress = {
    street: null,
    number: null,
    apartment: null,
    staircase: null,
    entrance: null,
    building: null,
    notes: null,
    confidence: 0.5,
    warnings,
    raw,
  };

  const normalized = normalize(input);
  if (!normalized) return out;

  let tokens = splitTokens(normalized);
  tokens = stripStreetPrefix(tokens);
  tokens = stripLeadingCity(tokens, opts?.expectedCity);

  // 1) Szukaj "m." / "lok." itp.
  for (let i = tokens.length - 2; i >= 0; i--) {
    if (APT_TOKENS.test(tokens[i]) && !out.apartment) {
      const next = tokens[i + 1];
      if (next) {
        out.apartment = next;
        tokens.splice(i, 2);
        break;
      }
    }
  }

  // 2) Szukaj numerów w formacie "x/y"
  for (let i = tokens.length - 1; i >= 0; i--) {
    if (SLASH_RE.test(tokens[i])) {
      const [num, apt] = tokens[i].split("/");
      if (!out.number) out.number = num;
      if (!out.apartment) out.apartment = apt;
      tokens.splice(i, 1);
      break;
    }
  }

  // 3) Szukaj numeru domu bez "/"
  for (let i = tokens.length - 1; i >= 0; i--) {
    if (HOUSE_RE.test(tokens[i]) && !out.number) {
      out.number = tokens[i];
      tokens.splice(i, 1);
      break;
    }
  }

  // 4) Pozostałe to ulica
  if (tokens.length > 0) out.street = tokens.join(" ");

  // Confidence
  out.confidence = 0.5;
  if (out.street && out.number) out.confidence = 0.85;
  if (out.street && out.number && out.apartment) out.confidence = 0.9;
  if (!out.street && out.number && !out.apartment) out.confidence = 0.4;

  if (!out.number) warnings.push("Brak numeru domu");
  if (!out.street) warnings.push("Brak ulicy");

  return out;
}
