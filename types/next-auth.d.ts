import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    user: {
      id: string
      email: string
      role: "ADMIN" | "USER" | "DRIVER"
      name?: string
    }
  }

  interface User {
    id: string
    email: string
    role: "ADMIN" | "USER" | "DRIVER"
    name?: string
    accessToken?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    role?: "ADMIN" | "USER" | "DRIVER"
  }
}