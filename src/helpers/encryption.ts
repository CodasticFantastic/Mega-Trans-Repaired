import crypto from "crypto";

// Klucz szyfrowania - w produkcji powinien być przechowywany w zmiennych środowiskowych
const ALGORITHM = "aes-256-cbc";
const IV = Buffer.from("0123456789abcdef0123456789abcdef", "hex");
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;

if (!ENCRYPTION_KEY) {
  throw new Error("ENCRYPTION_KEY is not set");
}

/**
 * Szyfruje tekst używając stałego IV (deterministyczne szyfrowanie)
 * @param text - Tekst do zaszyfrowania
 * @returns Zaszyfrowany tekst w formacie base64
 */
export function encryptApiKey(text: string): string {
  try {
    // Twórz klucz z hasła używając PBKDF2
    const key = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32);

    // Twórz cipher używając nowoczesnego API
    const cipher = crypto.createCipheriv(ALGORITHM, key, IV);

    // Szyfruj tekst
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    // Zwróć zaszyfrowany tekst w base64 (bez IV, bo jest stały)
    return Buffer.from(encrypted, "hex").toString("base64");
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt data");
  }
}

/**
 * Deszyfruje tekst zaszyfrowany przez funkcję encryptApiKey
 * @param encryptedText - Zaszyfrowany tekst w formacie base64
 * @returns Odszyfrowany tekst
 */
export function decryptApiKey(encryptedText: string): string {
  try {
    // Konwertuj z base64
    const encrypted = Buffer.from(encryptedText, "base64").toString("hex");

    // Twórz klucz z hasła używając PBKDF2
    const key = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32);

    // Twórz decipher używając nowoczesnego API
    const decipher = crypto.createDecipheriv(ALGORITHM, key, IV);

    // Deszyfruj tekst
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt data");
  }
}
