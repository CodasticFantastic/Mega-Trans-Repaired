import { Role } from "@prisma/client";

// Typ dla użytkownika bez hasła (dla API response)
export interface UserWithoutPassword {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  nip: string;
  country: string;
  city: string;
  address: string;
  role: Role;
}

// Typ dla request body (jeśli potrzebny)
export interface CreateUserRequest {
  company: string;
  email: string;
  phone: string;
  password: string;
  nip: string;
  country: string;
  city: string;
  address: string;
  role?: Role;
}

// Typ dla update user request
export interface UpdateUserRequest {
  company?: string;
  email?: string;
  phone?: string;
  nip?: string;
  country?: string;
  city?: string;
  address?: string;
  role?: Role;
}

// Typ dla API response
export interface GetUsersResponse {
  users: UserWithoutPassword[];
}

export interface CreateUserResponse {
  success: string;
  userId?: number;
}

export interface UpdateUserResponse {
  success: string;
}

export interface DeleteUserResponse {
  success: string;
}
