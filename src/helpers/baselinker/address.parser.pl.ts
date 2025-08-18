export type ParsedAddress = {
  street: string | null;
  number: string | null;
  apartment: string | null;
  confidence: number;
  warnings: string[];
  raw: string;
};

const STREET_PREFIXES =
  /^(ul\.?|ulica|al\.?|aleja|aleje|pl\.?|plac|os\.?|osiedle|rondo|bulw\.?|bulwar)$/i;

const APT_TOKENS =
  /^(m\.|mieszk(?:anie)?\.?|miesz\.?|lok\.?|lokal\.?|apt\.?)$/i;

// 15, 15A, 17c
const HOUSE_NUM_RE = /^\d+[A-Za-z]?$/i;
// 17c/184, 13B/1
const HOUSE_SLASH_RE = /^([0-9]+[A-Za-z]?)\/([A-Za-z]?[0-9]+)$/i;

function normalize(input: string) {
  return input
    .replace(/,/g, " ")
    .replace(/\s+/g, " ")
    .replace(/-\s+/g, "-")
    .trim();
}

function splitTokens(input: string): string[] {
  // rozdziel "m.18" -> "m." "18", "lok.5" -> "lok." "5"
  return input
    .replace(/(m\.|lok\.?|apt\.?)\s*([A-Za-z]?\d+)/gi, "$1 $2")
    .split(" ")
    .filter(Boolean);
}

function stripStreetPrefix(tokens: string[]): string[] {
  if (tokens.length && STREET_PREFIXES.test(tokens[0])) return tokens.slice(1);
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
  if (!cityTokens.length) return tokens;

  const head = tokens.slice(0, cityTokens.length);
  if (head.join(" ").toLowerCase() === cityTokens.join(" ").toLowerCase()) {
    return tokens.slice(cityTokens.length);
  }
  return tokens;
}

// Scalenie: "15 A" => "15A", "15 a/7" => "15a/7"
function mergeNumberLetterTokens(tokens: string[]): string[] {
  for (let i = 0; i < tokens.length - 1; i++) {
    const cur = tokens[i];
    const next = tokens[i + 1];

    // 15 + A  => 15A
    if (/^\d+$/.test(cur) && /^[A-Za-z]$/.test(next)) {
      tokens[i] = cur + next;
      tokens.splice(i + 1, 1);
      i--;
      continue;
    }
    // 15 + a/7 => 15a/7
    if (/^\d+$/.test(cur) && /^[A-Za-z]\/\d+[A-Za-z]?$/i.test(next)) {
      tokens[i] = cur + next;
      tokens.splice(i + 1, 1);
      i--;
      continue;
    }
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
    confidence: 0.5,
    warnings,
    raw,
  };

  const normalized = normalize(input);
  if (!normalized) return out;

  let tokens = splitTokens(normalized);
  tokens = stripStreetPrefix(tokens);
  tokens = stripLeadingCity(tokens, opts?.expectedCity);
  tokens = mergeNumberLetterTokens(tokens);

  // 1) Wyłap "m." / "lok." itp. (to MOŻE nadpisać mieszkanie wykryte później)
  let explicitApartment: string | null = null;
  for (let i = tokens.length - 2; i >= 0; i--) {
    if (APT_TOKENS.test(tokens[i])) {
      const next = tokens[i + 1];
      if (next) {
        explicitApartment = next;
        tokens.splice(i, 2);
        break;
      }
    }
  }

  // 2) Przejdź po tokenach i wykryj numer + ewentualny format z ukośnikiem
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];

    // 2a) token "num/apt"
    const slash = t.match(HOUSE_SLASH_RE);
    if (slash) {
      const [, left, right] = slash; // left = numer domu, right = mieszkanie
      if (!out.number) {
        out.number = left;
      } else {
        // jeśli numer już jest i lewa część zgadza się z nim → prawa to mieszkanie
        if (out.number.toLowerCase() === left.toLowerCase() && !out.apartment) {
          out.apartment = right;
        }
      }
      // usuń token slashowy z listy
      tokens.splice(i, 1);
      i--;
      continue;
    }

    // 2b) zwykły numer domu
    if (!out.number && HOUSE_NUM_RE.test(t)) {
      out.number = t;
      tokens.splice(i, 1);
      i--;
      continue;
    }
  }

  // 3) Ulica = reszta tokenów
  if (tokens.length > 0) out.street = tokens.join(" ");

  // 4) Jeśli wykryto m./lok., to ma pierwszeństwo nad slashowym mieszkaniem
  if (explicitApartment) out.apartment = explicitApartment;

  // 5) Confidence + ostrzeżenia
  out.confidence = 0.5;
  if (out.street && out.number) out.confidence = 0.85;
  if (out.street && out.number && out.apartment) out.confidence = 0.9;
  if (!out.street && out.number && !out.apartment) out.confidence = 0.4;
  if (!out.number) warnings.push("Brak numeru domu");
  if (!out.street) warnings.push("Brak ulicy");

  return out;
}
