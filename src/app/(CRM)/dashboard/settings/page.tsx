"use client";

import Link from "next/link";
import { ArrowLeft, Settings, Save, Key } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Parser } from "html-to-react";

// shadcn/ui components
import { Button } from "@/components/shadcn/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/ui/card";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { Separator } from "@/components/shadcn/ui/separator";
import { Alert, AlertDescription } from "@/components/shadcn/ui/alert";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [formError, setFormError] = useState<string | false>(false);
  const [formSuccess, setFormSuccess] = useState<string | false>(false);
  const [settingsForm, setSettingsForm] = useState({
    companyName: "",
    email: "",
    phone: "",
    nip: "",
    country: "",
    city: "",
    address: "",
  });

  useEffect(() => {
    if (session) {
      getUserData();
    }
  }, [session]);

  // Get user data from database
  async function getUserData() {
    try {
      let request = await fetch(
        `${process.env.NEXT_PUBLIC_DOMAIN}/api/user/getUser`,
        {
          method: "GET",
          headers: {
            Authorization: session?.accessToken || "",
            "Content-Type": "application/json",
          },
        }
      );

      const response = await request.json();

      if (response.error) {
        setFormError(response.error);
      } else if (response.success) {
        setSettingsForm({
          companyName: Parser().parse(response.success.company),
          email: Parser().parse(response.success.email),
          phone: response.success.phone,
          nip: response.success.nip,
          country: response.success.country,
          city: response.success.city,
          address: Parser().parse(response.success.address),
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setFormError("Błąd podczas pobierania danych użytkownika");
    }
  }

  // Update user data request
  async function updateUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(false);
    setFormSuccess(false);

    try {
      const data = new FormData(event.currentTarget);
      const userData = {
        companyName: data.get("companyName"),
        email: data.get("email"),
        phone: data.get("phone"),
        nip: data.get("nip"),
        country: data.get("country"),
        city: data.get("city"),
        address: data.get("address"),
      };

      const request = await fetch(
        `${process.env.NEXT_PUBLIC_DOMAIN}/api/user/updateUser`,
        {
          method: "POST",
          body: JSON.stringify(userData),
          headers: {
            Authorization: session?.accessToken || "",
            "Content-Type": "application/json",
          },
        }
      );

      const response = await request.json();

      if (response.error) {
        setFormError(response.error);
      } else if (response.success) {
        setFormSuccess("Dane zaktualizowane pomyślnie");
      }
    } catch (error) {
      console.error("Error updating user data:", error);
      setFormError("Błąd podczas aktualizacji danych");
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Powrót do pulpitu
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-2xl font-semibold">Ustawienia</h1>
        </div>
      </div>

      {/* Settings Form */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Dane Firmy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={updateUser} className="space-y-6">
            {/* Company Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informacje o Firmie</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nazwa Firmy</Label>
                  <Input
                    type="text"
                    name="companyName"
                    id="companyName"
                    value={settingsForm.companyName}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({
                        ...prev,
                        companyName: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Firmowy</Label>
                  <Input
                    type="email"
                    name="email"
                    id="email"
                    value={settingsForm.email}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon Kontaktowy</Label>
                  <Input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={settingsForm.phone}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nip">NIP</Label>
                  <Input
                    type="text"
                    name="nip"
                    id="nip"
                    value={settingsForm.nip}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({
                        ...prev,
                        nip: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Adres</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Kraj</Label>
                  <Input
                    type="text"
                    name="country"
                    id="country"
                    value={settingsForm.country}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({
                        ...prev,
                        country: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Miasto</Label>
                  <Input
                    type="text"
                    name="city"
                    id="city"
                    value={settingsForm.city}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({
                        ...prev,
                        city: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Adres</Label>
                <Input
                  type="text"
                  name="address"
                  id="address"
                  value={settingsForm.address}
                  onChange={(e) =>
                    setSettingsForm((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button type="submit" className="w-fit">
                <Save className="h-4 w-4 mr-2" />
                Aktualizuj Dane Firmy
              </Button>
              <Button variant="outline" asChild>
                <Link href="/resetPassword">
                  <Key className="h-4 w-4 mr-2" />
                  Zrestartuj hasło
                </Link>
              </Button>
            </div>

            {/* Messages */}
            {formError && (
              <Alert variant="destructive">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}
            {formSuccess && (
              <Alert>
                <AlertDescription>{formSuccess}</AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
