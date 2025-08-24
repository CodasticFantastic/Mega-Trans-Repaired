"use client";
import Link from "next/link";
import InstructionsSideBar from "../components/sidebars/InstructionsSideBar";
import { useState } from "react";
import { v4 as uuid4 } from "uuid";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { OrderItem } from "types/order.types";
import { CommodityType } from "@prisma/client";
import { ArrowLeft, Plus, Trash2, Package, User, CreditCard, MapPin, FileText, ShoppingCart } from "lucide-react";

// shadcn/ui components
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { Textarea } from "@/components/shadcn/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shadcn/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/shadcn/ui/table";
import { Alert, AlertDescription } from "@/components/shadcn/ui/alert";
import { Separator } from "@/components/shadcn/ui/separator";
import { Badge } from "@/components/shadcn/ui/badge";

export default function NewOrder() {
  const router = useRouter();
  const { data: session } = useSession();
  const [commodityItem, setCommodityItem] = useState<OrderItem>({
    orderCommodityType: "Paczka",
    orderCommodityId: uuid4(),
    orderCommodityName: "",
    orderCommodityNote: "",
  });
  const [commodityList, setCommodityList] = useState<OrderItem[]>([]);
  const [commodityError, setCommodityError] = useState<string>();
  const [formError, setFormError] = useState<string>();
  const [countryState, setCountryState] = useState("Polska");
  const [paymentType, setPaymentType] = useState("Przelew");

  // Actions - Process Order to Backend
  async function processOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(undefined);
    let currency;

    if (commodityList.length < 1) {
      setFormError("Brak Towarów w Zleceniu");
      return;
    }

    if (countryState === "Polska") {
      currency = "PLN";
    } else {
      currency = "EUR";
    }

    const data = new FormData(event.currentTarget);
    const orderData = {
      orderId: uuid4(),
      userId: session?.user.id,
      status: "Producent",
      orderType: data.get("orderType"),
      orderCountry: data.get("orderCountry"),
      orderStreet: data.get("orderStreet"),
      orderStreetNumber: data.get("orderStreetNumber"),
      orderFlatNumber: data.get("orderFlatNumber"),
      orderCity: data.get("orderCity"),
      orderPostCode: data.get("orderPostCode"),
      orderState: data.get("orderState"),
      orderNote: data.get("orderNote"),
      orderClientName: data.get("orderClientName"),
      orderClientPhone: data.get("orderClientPhone"),
      orderClientEmail: data.get("orderClientEmail"),
      orderSupplierId: data.get("orderSupplierId"),
      currency: currency,
      orderPaymentType: data.get("orderPaymentType"),
      orderPaymentPrice: data.get("orderPaymentAmount"),
      orderItems: commodityList,
    };

    try {
      const request = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/order/newOrder`, {
        method: "POST",
        body: JSON.stringify(orderData),
        headers: {
          Authorization: session?.accessToken || "",
          "Content-Type": "application/json",
        },
      });

      const response = await request.json();

      if (response.error) {
        setFormError(response.error);
      } else if (response.Success) {
        router.push("/updateOrder/" + orderData.orderId);
      }
    } catch (error) {
      console.error("Error creating order:", error);
      setFormError("Błąd podczas tworzenia zlecenia");
    }
  }

  // Actions - Add Commodity Item
  function addCommodity() {
    setCommodityError(undefined);
    if (!commodityItem.orderCommodityName) {
      setCommodityError("Nazwa Towaru jest wymagana");
    } else {
      setCommodityItem((prevState) => {
        return { ...prevState, orderCommodityId: uuid4() };
      });
      setCommodityList((prevState) => {
        return [...prevState, commodityItem];
      });
      setCommodityItem({
        orderCommodityType: "Paczka" as CommodityType,
        orderCommodityId: uuid4(),
        orderCommodityName: "",
        orderCommodityNote: "",
      });
    }
  }

  // Actions - Delete Commodity Item
  function deleteCommodityFromList(id: string) {
    setCommodityList((prevState) => {
      return prevState.filter((commodity) => commodity.orderCommodityId !== id);
    });
  }

  return (
    <div className="flex h-screen bg-background">
      <InstructionsSideBar orderId={""} />
      <div className="flex-1 overflow-y-scroll">
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
              <FileText className="h-5 w-5 text-muted-foreground" />
              <h1 className="text-2xl font-semibold">Nowe Zlecenie</h1>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={processOrder} className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-[480px_1fr] gap-6 lg:gap-8">
              {/* Left Column - Address */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-600">
                      <MapPin className="h-5 w-5" />
                      Adres Realizacji Zlecenia
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="orderType">Rodzaj Zlecenia</Label>
                        <Select name="orderType" defaultValue="Dostawa">
                          <SelectTrigger className="w-full cursor-pointer">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Dostawa">Dostawa</SelectItem>
                            <SelectItem value="Odbior">Odbiór</SelectItem>
                            <SelectItem value="Zwrot">Zwrot</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="orderCountry">Kraj</Label>
                        <Select name="orderCountry" value={countryState} onValueChange={setCountryState}>
                          <SelectTrigger className="w-full cursor-pointer">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Polska">Polska</SelectItem>
                            <SelectItem value="Czechy">Czechy</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="orderStreet">Ulica *</Label>
                      <Input name="orderStreet" required />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="orderStreetNumber">Numer Budynku *</Label>
                        <Input name="orderStreetNumber" pattern="[A-Za-z0-9]{1,}" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="orderFlatNumber">Numer Lokalu</Label>
                        <Input name="orderFlatNumber" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="orderCity">Miejscowość *</Label>
                      <Input name="orderCity" required />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="orderPostCode">
                          {countryState === "Polska" ? "Kod Pocztowy (##-###) *" : "Kod Pocztowy (### ##) *"}
                        </Label>
                        <Input name="orderPostCode" pattern={countryState === "Polska" ? "[0-9]{2}-[0-9]{3}" : "[0-9]{3} [0-9]{2}"} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="orderState">Województwo *</Label>
                        <Input type="text" name="orderState" required />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="orderSupplierId">ID z systemu Zleceniodawcy</Label>
                      <Input name="orderSupplierId" placeholder="np. Shop-123-456-789" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="orderNote">Notatka do zamówienia</Label>
                      <Textarea name="orderNote" rows={6} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Client & Items */}
              <div className="space-y-6">
                {/* Client Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-600">
                      <User className="h-5 w-5" />
                      Adresat Zlecenia
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="orderClientName">Odbiorca *</Label>
                      <Input name="orderClientName" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="orderClientPhone">
                        {countryState === "Polska" ? "Telefon (Bez spacji) *" : "Telefon (Bez spacji) *"}
                      </Label>
                      <Input name="orderClientPhone" pattern={countryState === "Polska" ? "[0-9]{9}" : "[0-9]{9}"} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="orderClientEmail">Email Klienta</Label>
                      <Input name="orderClientEmail" type="email" />
                    </div>
                  </CardContent>
                </Card>

                {/* Payment and Package List Row */}
                <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 lg:gap-6">
                  {/* Commodity Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-600">
                        <Package className="h-5 w-5" />
                        Informacje o Przesyłce
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="orderCommodityType">Rodzaj Towaru *</Label>
                          <Select
                            value={commodityItem.orderCommodityType}
                            onValueChange={(value) => {
                              setCommodityItem((prevState) => ({
                                ...prevState,
                                orderCommodityType: value as CommodityType,
                              }));
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Paczka">Paczka/Karton</SelectItem>
                              <SelectItem value="Gabaryt">Gabaryt</SelectItem>
                              <SelectItem value="Paleta">Paleta</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="orderCommodityName">Nazwa Towaru *</Label>
                          <Input
                            name="orderCommodityName"
                            value={commodityItem.orderCommodityName}
                            onChange={(e) => {
                              setCommodityItem((prevState) => ({
                                ...prevState,
                                orderCommodityName: e.target.value,
                              }));
                            }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr] gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="orderCommodityNote">Notatka do przesyłki</Label>
                          <Textarea
                            name="orderCommodityNote"
                            value={commodityItem.orderCommodityNote}
                            onChange={(e) => {
                              setCommodityItem((prevState) => ({
                                ...prevState,
                                orderCommodityNote: e.target.value,
                              }));
                            }}
                            rows={4}
                          />
                        </div>
                        <div className="flex items-end">
                          <Button type="button" onClick={addCommodity} className="w-full bg-green-600 hover:bg-green-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Dodaj
                          </Button>
                        </div>
                      </div>

                      {commodityError && (
                        <Alert variant="destructive">
                          <AlertDescription>{commodityError}</AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                  {/* Payment Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-600">
                        <CreditCard className="h-5 w-5" />
                        Sposób Płatności
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="orderPaymentType">Sposób Płatności</Label>
                        <Select name="orderPaymentType" value={paymentType} onValueChange={setPaymentType}>
                          <SelectTrigger className="w-full cursor-pointer">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Przelew">Przelew</SelectItem>
                            <SelectItem value="Pobranie">Pobranie</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {paymentType === "Pobranie" && (
                        <div className="space-y-2">
                          <Label htmlFor="orderPaymentAmount">Kwota Płatności {countryState === "Polska" ? "(PLN)" : "(EUR)"}</Label>
                          <Input name="orderPaymentAmount" type="number" step="0.01" required />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                {/* Commodity List */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-600">
                      <ShoppingCart className="h-5 w-5" />
                      Wykaz Paczek
                      <Badge variant="outline" className="rounded-sm">
                        {commodityList.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {commodityList.length > 0 ? (
                      <div className="max-h-48 overflow-y-auto">
                        <div className="min-w-full overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[80px] min-w-[80px]">Rodzaj</TableHead>
                                <TableHead className="w-[200px] min-w-[200px]">Nazwa</TableHead>
                                <TableHead className="min-w-[150px]">Notatka</TableHead>
                                <TableHead className="w-[60px] min-w-[60px]">Akcje</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {commodityList.map((commodity) => (
                                <TableRow key={commodity.orderCommodityId}>
                                  <TableCell className="text-sm font-medium">{commodity.orderCommodityType}</TableCell>
                                  <TableCell className="text-sm max-w-[200px]">
                                    <div className="break-words whitespace-normal">{commodity.orderCommodityName}</div>
                                  </TableCell>
                                  <TableCell className="text-sm">
                                    <div className="break-words whitespace-normal max-w-[300px]">{commodity.orderCommodityNote}</div>
                                  </TableCell>
                                  <TableCell>
                                    <Button variant="ghost" size="sm" onClick={() => deleteCommodityFromList(commodity.orderCommodityId)}>
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">Brak Towarów</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Submit Section */}
            <div className="flex flex-col gap-4 absolute bottom-6">
              {formError && (
                <Alert variant="destructive">
                  <AlertDescription>Uwaga: {formError}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" size="lg" className="w-fit">
                <FileText className="h-4 w-4 mr-2" />
                Zamawiam Zlecenie
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
