"use client";

import Link from "next/link";
import { ArrowLeft, Users, Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Driver, Role } from "@prisma/client";
import { Button } from "@/components/shadcn/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/shadcn/ui/table";
import { Badge } from "@/components/shadcn/ui/badge";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/shadcn/ui/tooltip";
import { Skeleton } from "@/components/shadcn/ui/skeleton";
import { ScrollArea } from "@/components/shadcn/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/shadcn/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/shadcn/ui/dialog";
import { useRouter } from "next/navigation";

export default function DriversPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [formError, setFormError] = useState<string | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [driversForm, setDriversForm] = useState({
    driverName: "",
    driverEmail: "",
    driverPhone: "",
    driverPassword: "",
    driverPasswordConfirm: "",
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState<Driver | null>(null);

  useEffect(() => {
    if (session) {
      getDrivers();
    }
  }, [session]);

  // Get all drivers from database
  async function getDrivers() {
    try {
      const request = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/drivers/getDrivers`, {
        method: "GET",
        headers: {
          Authorization: session?.accessToken || "",
          "Content-Type": "application/json",
        },
      });

      const response = await request.json();

      if (response.error) {
        setFormError(response.error);
      } else if (response.drivers) {
        setDrivers(response.drivers);
      }
    } catch (error) {
      console.error("Error fetching drivers:", error);
      setFormError("Błąd podczas pobierania kierowców");
    } finally {
      setLoading(false);
    }
  }

  // Add new driver request
  async function addDriver(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const data = new FormData(event.currentTarget);
    const driverData = {
      driverName: data.get("name"),
      driverEmail: data.get("email"),
      driverPhone: data.get("phone"),
      driverPassword: data.get("password"),
      driverPasswordConfirm: data.get("passwordConfirm"),
    };

    try {
      const request = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/drivers/createDriver`, {
        method: "POST",
        body: JSON.stringify(driverData),
        headers: {
          Authorization: session?.accessToken || "",
          "Content-Type": "application/json",
        },
      });

      const response = await request.json();

      if (response.error) {
        setFormError(response.error);
      } else if (response.Success) {
        getDrivers();
        setDriversForm({
          driverName: "",
          driverEmail: "",
          driverPhone: "",
          driverPassword: "",
          driverPasswordConfirm: "",
        });
      }
    } catch (error) {
      console.error("Error adding driver:", error);
      setFormError("Błąd podczas dodawania kierowcy");
    }
  }

  // Open delete confirmation dialog
  function openDeleteDialog(driver: Driver) {
    setDriverToDelete(driver);
    setDeleteDialogOpen(true);
  }

  // Close delete confirmation dialog
  function closeDeleteDialog() {
    setDeleteDialogOpen(false);
    setDriverToDelete(null);
  }

  // Delete driver
  async function confirmDeleteDriver() {
    if (!driverToDelete) return;

    try {
      const request = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/drivers/deleteDriver?id=${driverToDelete.id}`, {
        method: "GET",
        headers: {
          Authorization: session?.accessToken || "",
          "Content-Type": "application/json",
        },
      });

      const response = await request.json();

      if (response.error) {
        setFormError(response.error);
      } else if (response.Succes) {
        getDrivers();
        closeDeleteDialog();
      }
    } catch (error) {
      console.error("Error deleting driver:", error);
      setFormError("Błąd podczas usuwania kierowcy");
    }
  }

  // Filter drivers based on search term
  const filteredDrivers = drivers.filter((driver) => {
    return (
      driver.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.phone?.includes(searchTerm)
    );
  });

  useEffect(() => {
    if (!session || session.user.role !== Role.ADMIN) {
      router.push("/");
    }
  }, [session, router]);

  // Skeleton
  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-8 w-24" />
        </div>

        {/* Form skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-9 w-32" />
          </CardContent>
        </Card>

        {/* Drivers table skeleton */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-5 w-8" />
              </div>
              <Skeleton className="h-9 w-80" />
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Skeleton className="h-4 w-24" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-32" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-28" />
                    </TableHead>
                    <TableHead className="w-24">
                      <Skeleton className="h-4 w-16" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-40" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-28" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-20" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
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
            <Users className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-2xl font-semibold">Kierowcy</h1>
          </div>
        </div>

        {/* Main Content - Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side - Add Driver Form */}
          <Card className="lg:sticky lg:top-6 lg:h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Dodaj Nowego Kierowcę
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={addDriver} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Imię Kierowcy</Label>
                    <Input
                      type="text"
                      name="name"
                      id="name"
                      required
                      value={driversForm.driverName}
                      onChange={(e) =>
                        setDriversForm((prev) => ({
                          ...prev,
                          driverName: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Kierowcy</Label>
                    <Input
                      type="email"
                      name="email"
                      id="email"
                      required
                      value={driversForm.driverEmail}
                      onChange={(e) =>
                        setDriversForm((prev) => ({
                          ...prev,
                          driverEmail: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon Kierowcy</Label>
                    <Input
                      type="tel"
                      name="phone"
                      id="phone"
                      required
                      value={driversForm.driverPhone}
                      onChange={(e) =>
                        setDriversForm((prev) => ({
                          ...prev,
                          driverPhone: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Hasło</Label>
                    <Input
                      type="password"
                      name="password"
                      id="password"
                      required
                      value={driversForm.driverPassword}
                      onChange={(e) =>
                        setDriversForm((prev) => ({
                          ...prev,
                          driverPassword: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passwordConfirm">Potwierdź Hasło</Label>
                    <Input
                      type="password"
                      name="passwordConfirm"
                      id="passwordConfirm"
                      required
                      value={driversForm.driverPasswordConfirm}
                      onChange={(e) =>
                        setDriversForm((prev) => ({
                          ...prev,
                          driverPasswordConfirm: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <Button type="submit" className="w-fit">
                  <Plus className="h-4 w-4 mr-2" />
                  Dodaj Kierowcę
                </Button>
                {formError && (
                  <Alert variant="destructive">
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Right Side - Drivers Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Zarejestrowani Kierowcy
                  <Badge variant="secondary" className="ml-2">
                    {filteredDrivers.length}
                  </Badge>
                </CardTitle>
                <div className="w-full sm:w-80">
                  <Input placeholder="Szukaj kierowców..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] lg:h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Imię</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Telefon</TableHead>
                      <TableHead className="w-24">Akcje</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDrivers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          {searchTerm ? "Brak kierowców spełniających kryteria wyszukiwania" : "Brak zarejestrowanych kierowców"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDrivers.map((driver) => (
                        <TableRow key={driver.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">{driver.name}</TableCell>
                          <TableCell>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="max-w-48 truncate">{driver.email}</div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div>{driver.email}</div>
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{driver.phone}</TableCell>
                          <TableCell>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(driver)} className="h-8 w-8 p-0">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Usuń kierowcę</p>
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Potwierdź usunięcie kierowcy</DialogTitle>
              <DialogDescription>
                Czy na pewno chcesz usunąć kierowcę <span className="font-semibold">{driverToDelete?.name}</span>? Ta operacja jest
                nieodwracalna.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={closeDeleteDialog}>
                Anuluj
              </Button>
              <Button variant="destructive" onClick={confirmDeleteDriver}>
                Usuń kierowcę
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
