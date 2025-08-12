"use client";

import Link from "next/link";
import { ArrowLeft, Users, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { Parser } from "html-to-react";
import { Role, User } from "@prisma/client";

// shadcn/ui components
import { Button } from "@/components/shadcn/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn/ui/table";
import { Badge } from "@/components/shadcn/ui/badge";
import { Input } from "@/components/shadcn/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/shadcn/ui/tooltip";
import { Skeleton } from "@/components/shadcn/ui/skeleton";
import { Separator } from "@/components/shadcn/ui/separator";
import { ScrollArea } from "@/components/shadcn/ui/scroll-area";
import { useRouter } from "next/navigation";

export default function ClientsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [clients, setClients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (session) {
      getClients();
    }
  }, [session]);

  // Get all clients from database
  async function getClients() {
    try {
      const request = await fetch(
        `${process.env.NEXT_PUBLIC_DOMAIN}/api/user/getUsers`,
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
        signOut();
      } else if (response.users) {
        setClients(response.users);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  }

  // Filter clients based on search term
  const filteredClients = clients.filter((client) => {
    return (
      client.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.nip?.includes(searchTerm) ||
      client.phone?.includes(searchTerm)
    );
  });

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "destructive";
      case "USER":
        return "default";
      default:
        return "secondary";
    }
  };

  if (!session || session.user.role !== Role.ADMIN) {
    router.push("/");
  }

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

        {/* Card skeleton */}
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
            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">
                      <Skeleton className="h-4 w-8" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-24" />
                    </TableHead>
                    <TableHead className="w-32">
                      <Skeleton className="h-4 w-12" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-16" />
                    </TableHead>
                    <TableHead className="w-32">
                      <Skeleton className="h-4 w-20" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-16" />
                    </TableHead>
                    <TableHead className="w-24">
                      <Skeleton className="h-4 w-12" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(8)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="w-16">
                        <Skeleton className="h-4 w-8" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-48" />
                      </TableCell>
                      <TableCell className="w-32">
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-40" />
                      </TableCell>
                      <TableCell className="w-32">
                        <Skeleton className="h-4 w-28" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-64" />
                      </TableCell>
                      <TableCell className="w-24">
                        <Skeleton className="h-6 w-16 rounded-full" />
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
            <h1 className="text-2xl font-semibold">Klienci</h1>
          </div>
        </div>

        {/* Clients Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Zarejestrowani Klienci
                <Badge variant="secondary" className="ml-2">
                  {filteredClients.length}
                </Badge>
              </CardTitle>
              <div className="relative w-full md:w-80 mt-4 md:mt-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Szukaj klientów..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-220px)]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">ID</TableHead>
                    <TableHead>Nazwa Firmy</TableHead>
                    <TableHead className="w-32">NIP</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="w-32">Telefon</TableHead>
                    <TableHead>Adres</TableHead>
                    <TableHead className="w-24">Rola</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-muted-foreground"
                      >
                        {searchTerm
                          ? "Brak klientów spełniających kryteria wyszukiwania"
                          : "Brak zarejestrowanych klientów"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredClients.map((client) => (
                      <TableRow key={client.id} className="hover:bg-muted/50">
                        <TableCell className="font-mono text-sm">
                          {client.id}
                        </TableCell>
                        <TableCell>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="max-w-48 truncate">
                                {Parser().parse(client.company || "")}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="max-w-xs">
                                {Parser().parse(client.company || "")}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {client.nip}
                        </TableCell>
                        <TableCell>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="max-w-48 truncate">
                                {client.email}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div>{client.email}</div>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {client.phone}
                        </TableCell>
                        <TableCell>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="max-w-64 truncate">
                                {Parser().parse(client.address || "")},{" "}
                                {client.city} - {client.country}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="max-w-xs">
                                {Parser().parse(client.address || "")},{" "}
                                {client.city} - {client.country}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(client.role)}>
                            {client.role}
                          </Badge>
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
    </TooltipProvider>
  );
}
