import jwt from "jsonwebtoken";



const DEFAULT_SIGN_OPTION = {
  expiresIn: process.env.JWT_EXPIRE,
}

export function generateToken(id) {
  const secret_key = process.env.JWT_SECRET;
  const token = jwt.sign({ id }, secret_key, DEFAULT_SIGN_OPTION);

  return token;
}

export function verifyJwt(token) {
  const secret_key = process.env.JWT_SECRET;
  try {
    const decoded = jwt.verify(token, secret_key);
    return decoded;
  } catch (error) {
    console.error("JWT verification failed: ", error.message);
    return null;
  }
}
