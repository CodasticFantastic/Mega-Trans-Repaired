"use client";
import { signOut } from "next-auth/react";
import { Button } from "@/components/shadcn/ui/button";
import { LogOutIcon } from "lucide-react";

export default function LogoutButton() {
  return (
    <Button
      variant="destructive-outline"
      onClick={() => signOut()}
      className="w-full"
      size="sm"
    >
      <LogOutIcon size={18} />
      <p className="logoutText">Wyloguj</p>
    </Button>
  );
}
