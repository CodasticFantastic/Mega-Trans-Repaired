export type ParsedAddress = {
  street: string | null;
  number: string | null;
  apartment: string | null;
  confidence: number;
  warnings: string[];
  raw: string;
};

const STREET_PREFIXES = /^(ul\.?|ulica|al\.?|aleja|aleje|pl\.?|plac|os\.?|osiedle|rondo|bulw\.?|bulwar|skwer|park|ogród|wyspa|most|tunel|wiadukt|róg|narożnik|rod)$/i;

const APT_TOKENS = /^(m\.|mieszk(?:anie)?\.?|miesz\.?|lok\.?|lokal\.?|apt\.?)$/i;

const HOUSE_NUM_RE = /^\d+[A-Za-z]?$/i;
const HOUSE_SLASH_RE = /^([0-9]+[A-Za-z]?)\/([A-Za-z]?[0-9]+)$/i;

const POSTAL_CODE_RE = /^\d{2}-\d{3}$/i;

function normalize(input: string) {
  return input
    .replace(/,/g, " ")
    .replace(/;/g, " ")
    .replace(/\s+/g, " ")
    .replace(/-\s+/g, "-")
    .replace(/\s+-/g, "-")
    .trim();
}

function splitTokens(input: string): string[] {
  return input
    .replace(/(m\.|lok\.?|apt\.?)\s*([A-Za-z]?\d+)/gi, "$1 $2")
    .replace(/(\d+)\s*\/\s*(\d+)/g, "$1/$2")
    .split(" ")
    .filter(Boolean);
}

function stripStreetPrefix(tokens: string[]): string[] {
  if (tokens.length && STREET_PREFIXES.test(tokens[0])) return tokens.slice(1);
  return tokens;
}

function mergeNumberLetterTokens(tokens: string[]): string[] {
  for (let i = 0; i < tokens.length - 1; i++) {
    const cur = tokens[i];
    const next = tokens[i + 1];

    if (/^\d+$/.test(cur) && /^[A-Za-z]$/.test(next)) {
      tokens[i] = cur + next;
      tokens.splice(i + 1, 1);
      i--;
      continue;
    }
    if (/^\d+$/.test(cur) && /^[A-Za-z]\/\d+[A-Za-z]?$/i.test(next)) {
      tokens[i] = cur + next;
      tokens.splice(i + 1, 1);
      i--;
      continue;
    }
  }
  return tokens;
}

function findStreetAndNumber(tokens: string[]): { streetTokens: string[]; number: string | null; remainingTokens: string[] } {
  if (tokens.length === 0) return { streetTokens: [], number: null, remainingTokens: [] };

  // Szukaj numeru w środku
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (HOUSE_NUM_RE.test(token) || HOUSE_SLASH_RE.test(token)) {
      return {
        streetTokens: tokens.slice(0, i),
        number: token,
        remainingTokens: tokens.slice(i + 1),
      };
    }
  }

  // Numer na końcu
  const last = tokens[tokens.length - 1];
  if (HOUSE_NUM_RE.test(last) || HOUSE_SLASH_RE.test(last)) {
    return { streetTokens: tokens.slice(0, -1), number: last, remainingTokens: [] };
  }

  // Numer na początku
  if (tokens.length > 1 && (HOUSE_NUM_RE.test(tokens[0]) || HOUSE_SLASH_RE.test(tokens[0]))) {
    return { streetTokens: tokens.slice(1), number: tokens[0], remainingTokens: [] };
  }

  // Brak numeru
  return { streetTokens: tokens, number: null, remainingTokens: [] };
}

function lastPrefixIndex(tokens: string[]): number {
  for (let i = tokens.length - 1; i >= 0; i--) {
    if (STREET_PREFIXES.test(tokens[i])) return i;
  }
  return -1;
}

export function parseAddressPL(input: string, opts?: { expectedCity?: string }): ParsedAddress {
  const raw = input;
  const warnings: string[] = [];
  const out: ParsedAddress = { street: null, number: null, apartment: null, confidence: 0.5, warnings, raw };

  const normalized = normalize(input);
  if (!normalized) return out;

  let tokens = splitTokens(normalized);
  tokens = stripStreetPrefix(tokens);
  tokens = mergeNumberLetterTokens(tokens);

  // Wyłap mieszkanie wskazane słownie
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

  const { streetTokens: preNumTokens, number, remainingTokens } = findStreetAndNumber(tokens);
  out.number = number ?? null;

  // Jeśli numer jest w formie "17c/184" w tym samym tokenie → rozłóż na number/apartment
  if (out.number) {
    const slashSame = out.number.match(HOUSE_SLASH_RE);
    if (slashSame) {
      out.number = slashSame[1];
      out.apartment = slashSame[2];
    }
  }

  // Rozszerz numer jeśli po nim występuje osobny token "17c/184"
  let extendedNumberBySlashToken = false;
  for (let i = 0; i < remainingTokens.length; i++) {
    const t = remainingTokens[i];
    const slash = t.match(HOUSE_SLASH_RE);
    if (slash && out.number) {
      const [, left, right] = slash;
      if (out.number.toLowerCase() === left.toLowerCase()) {
        // Traktuj to jako rozszerzenie numeru (nie mieszkanie)
        out.number = `${left}/${right}`;
        extendedNumberBySlashToken = true;
        continue;
      }
    }
  }

  // Mieszkanie ma pierwszeństwo, jeśli było podane słownie
  if (explicitApartment) out.apartment = explicitApartment;

  // Ulica: preferuj część po ostatnim prefiksie (np. ROD, ul., al.)
  let hadLeadingNoisePrefix = false;
  let collapsedToLastToken = false;
  let streetTokens = preNumTokens.slice();
  const prefIdx = lastPrefixIndex(preNumTokens);
  if (prefIdx >= 0) {
    hadLeadingNoisePrefix = prefIdx > 0; // były słowa przed prefiksem -> szum
    streetTokens = preNumTokens.slice(prefIdx);
  } else if (preNumTokens.length >= 3 || extendedNumberBySlashToken) {
    // Brak prefiksu: w złożonych przypadkach uprość do ostatniego tokena
    collapsedToLastToken = true;
    streetTokens = [preNumTokens[preNumTokens.length - 1]];
  } else {
    streetTokens = preNumTokens.slice();
  }

  out.street = streetTokens.length ? streetTokens.join(" ") : null;

  // Heurystyki wiarygodności (minimalne):
  const containsPostalCode = preNumTokens.some((t) => POSTAL_CODE_RE.test(t));
  const streetTooLong = streetTokens.length > 3;

  let confidence = 0.5;
  if (out.street && out.number) {
    const reliableBase = !containsPostalCode && !streetTooLong;
    if (!reliableBase || hadLeadingNoisePrefix) {
      confidence = 0.6; // wyraźnie niepewne
      if (!reliableBase) warnings.push("Parsowanie niepewne (kod pocztowy / zbyt długa nazwa)");
      if (hadLeadingNoisePrefix) warnings.push("Dodatkowe słowa przed prefiksem ulicy");
    } else if (collapsedToLastToken || extendedNumberBySlashToken) {
      confidence = 0.85; // złożony przypadek lub uproszczenie – do weryfikacji użytkownika
      if (collapsedToLastToken) warnings.push("Ulica uproszczona do ostatniego tokena");
      if (extendedNumberBySlashToken) warnings.push("Numer rozszerzony przez osobny token 'num/apt'");
    } else {
      confidence = 0.95; // pewne
    }
  } else if (out.street && !out.number) {
    confidence = 0.6;
    warnings.push("Brak numeru domu");
  } else if (!out.street && out.number) {
    confidence = 0.4;
    warnings.push("Brak ulicy");
  } else {
    confidence = 0.3;
    warnings.push("Brak ulicy i numeru domu");
  }

  out.confidence = confidence;
  return out;
}
