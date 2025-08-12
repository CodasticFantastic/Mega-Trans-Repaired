"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  Truck,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import xlsx from "xlsx";
import { useState } from "react";
import { useSession } from "next-auth/react";

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
import { Label } from "@/components/shadcn/ui/label";
import { Checkbox } from "@/components/shadcn/ui/checkbox";
import { Separator } from "@/components/shadcn/ui/separator";
import { ScrollArea } from "@/components/shadcn/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/shadcn/ui/alert";

interface OrderData {
  id: string;
  driver: string;
  deliveryDate: string;
}

interface DisplayOrder {
  id: number;
  orderId: string;
  address: string;
  courier: string;
  deliveryDate: string;
}

export default function DeliveryPage() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<OrderData[]>([]);
  const [displayData, setDisplayData] = useState<DisplayOrder[]>([]);
  const [success, setSuccess] = useState<string | false>(false);
  const [error, setError] = useState<string | false>(false);
  const [isUpdateChecked, setIsUpdateChecked] = useState(false);

  async function uploadFile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const file = formData.get("file") as File;

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      const data = e.target?.result;
      if (!data) return;

      const workbook = xlsx.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[2];
      const worksheet = workbook.Sheets[sheetName];
      const json = xlsx.utils.sheet_to_json(worksheet);

      json.shift();
      json.pop();
      json.pop();

      let isMultiDay = false;

      setDisplayData(
        json.map((order: any, index: number) => {
          let deliveryDate = order["Data dojazdu z godziną"].split(" ");
          let date = deliveryDate[0].split(".");
          let day = date[0];
          let month = date[1];
          let year = date[2];
          let time = deliveryDate[1].split(":");
          let hours = +time[0];

          let finalDate;
          let finalHour;

          // Check if the delivery is multi day
          if (isMultiDay) {
            let currnetDateString = new Date(
              `${month}.${day}.${year} ${deliveryDate[1]}`
            );
            let multiDayDate = addHours(currnetDateString, 11);

            hours = multiDayDate.getHours();

            if (hours < 7 || hours >= 20) {
              isMultiDay = true;
              let currnetDateStringCheck = new Date(multiDayDate);
              let multiDayDateCheck = addHours(currnetDateStringCheck, 11);

              // Return Final Date and Hour if the delivery is multi multi day
              finalDate = `${multiDayDateCheck.getDate()}.${
                (multiDayDateCheck.getMonth() + 1).toString().length == 1
                  ? `0${multiDayDateCheck.getMonth() + 1}`
                  : multiDayDateCheck.getMonth() + 1
              }.${multiDayDateCheck.getFullYear()}`;
              finalHour = multiDayDateCheck.getHours();
            } else {
              // Return Final Date and Hour if the delivery is multi day
              finalDate = `${multiDayDate.getDate()}.${
                (multiDayDate.getMonth() + 1).toString().length == 1
                  ? `0${multiDayDate.getMonth() + 1}`
                  : multiDayDate.getMonth() + 1
              }.${multiDayDate.getFullYear()}`;
              finalHour = multiDayDate.getHours();
            }
          } else {
            if (hours < 7 || hours >= 20) {
              isMultiDay = true;

              let currnetDateString = new Date(
                `${month}.${day}.${year} ${deliveryDate[1]}`
              );
              let multiDayDate = addHours(currnetDateString, 11);

              // Return Final Date and Hour if detected first instance of multi day
              finalDate = `${multiDayDate.getDate()}.${
                (multiDayDate.getMonth() + 1).toString().length == 1
                  ? `0${multiDayDate.getMonth() + 1}`
                  : multiDayDate.getMonth() + 1
              }.${multiDayDate.getFullYear()}`;
              finalHour = multiDayDate.getHours();
            } else {
              // Return Final Date and Hour if the delivery is not multi day
              finalDate = deliveryDate[0];
              finalHour = hours;
            }
          }

          // Set Hours Range for the delivery
          let hoursRangeFrom;

          if (finalHour === 0) {
            hoursRangeFrom = 23;
          } else {
            hoursRangeFrom = finalHour - 1;
          }
          let hoursRangeTo = finalHour + 2;

          setData((prev) => [
            ...prev,
            {
              id: order["Nazwa obiektu"],
              driver: order.Kierowca,
              deliveryDate: `${finalDate} ${hoursRangeFrom}:00-${hoursRangeTo}:00`,
            },
          ]);

          return {
            id: index + 1,
            orderId: order["Nazwa obiektu"],
            address: order.Adres,
            courier: order.Kierowca,
            deliveryDate: `${finalDate} ${hoursRangeFrom}:00-${hoursRangeTo}:00`,
          };
        })
      );
    };

    function addHours(date: Date, hours: number) {
      date.setTime(date.getTime() + hours * 60 * 60 * 1000);
      return date;
    }

    reader.readAsArrayBuffer(file);
  }

  async function updateStatus(e: React.FormEvent<HTMLFormElement>) {
    setError(false);
    setSuccess(false);
    e.preventDefault();

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_DOMAIN}/api/order/attachDriver`,
        {
          method: "PATCH",
          headers: {
            Authorization: session?.accessToken || "",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      const json = await response.json();

      if (json.error) {
        setError(json.error);
      } else if (json.success) {
        setSuccess(json.success);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      setError("Błąd podczas aktualizacji statusów");
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
        <Separator orientation="vertical" className="h-6" />
        <div className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-2xl font-semibold">
            Poinformuj Klientów o Dostawie
          </h1>
        </div>
      </div>

      {/* Instructions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Step 1 - Upload File */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              1. Wgraj Zlecenia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={uploadFile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">Wybierz plik Excel</Label>
                <Input
                  type="file"
                  name="file"
                  id="file"
                  accept=".xlsx,.xls"
                  required
                />
              </div>
              <Button type="submit" className="w-fit">
                <Upload className="h-4 w-4 mr-2" />
                Wgraj Plik
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Step 2 - Update Statuses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              2. Aktualizuj Statusy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={updateStatus} className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="update"
                  checked={isUpdateChecked}
                  onCheckedChange={(checked) =>
                    setIsUpdateChecked(checked as boolean)
                  }
                  required
                />
                <Label
                  htmlFor="update"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Chcę zaktualizować statusy
                </Label>
              </div>
              <Button
                type="submit"
                className="w-fit"
                disabled={!isUpdateChecked}
              >
                <Truck className="h-4 w-4 mr-2" />
                Aktualizuj Statusy
              </Button>
              {success && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Loaded Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Zaczytane Zlecenia
            <Badge variant="secondary" className="ml-2">
              {displayData.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {displayData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Brak zaczytanych zleceń. Wgraj plik, aby zobaczyć dane.
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">No.</TableHead>
                    <TableHead>ID Paczki</TableHead>
                    <TableHead>Adres</TableHead>
                    <TableHead>Kurier</TableHead>
                    <TableHead>Data Dostawy</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayData.map((order) => (
                    <TableRow key={order.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {order.orderId}
                      </TableCell>
                      <TableCell>{order.address}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{order.courier}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {order.deliveryDate}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
