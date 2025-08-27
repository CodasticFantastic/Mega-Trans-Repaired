"use client";
import Link from "next/link";
import InstructionsSideBar from "../../components/sidebars/InstructionsSideBar";
import { useEffect, useState, use } from "react";
import { v4 as uuid4 } from "uuid";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Parser } from "html-to-react";
import { useQueryClient } from "@tanstack/react-query";
import { OrderItem } from "types/order.types";
import { CommodityType, Package } from "@prisma/client";
import {
  ArrowLeft,
  Trash2,
  Package as PackageIcon,
  User,
  CreditCard,
  MapPin,
  FileText,
  ShoppingCart,
  Save,
  X,
  AlertTriangle,
} from "lucide-react";

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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/shadcn/ui/dialog";

export default function UpdateOrder({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const [commodityItem, setCommodityItem] = useState<OrderItem>({
    orderCommodityType: "Paczka" as CommodityType,
    orderCommodityId: uuid4(),
    orderCommodityName: "",
    orderCommodityNote: "",
  });

  const [orderForm, setOrderForm] = useState({
    orderId: "",
    orderStatus: "",
    orderType: "",
    orderCountry: "",
    orderStreet: "",
    orderStreetNumber: "",
    orderFlatNumber: "",
    orderCity: "",
    orderPostCode: "",
    orderState: "",
    orderNote: "",
    orderClientName: "",
    orderClientPhone: "",
    orderClientEmail: "",
    orderPaymentType: "",
    orderPrice: 0,
    orderSupplierId: "",
    packageManualCount: 0,
  });
  const [countryState, setCountryState] = useState("Polska");

  const [commodityList, setCommodityList] = useState<OrderItem[]>([]);
  const [formError, setFormError] = useState<string>();
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  useEffect(() => {
    if (session) getOrderData();
  }, [session]);

  // Actions - Get Order Data from Backend
  async function getOrderData() {
    try {
      const request = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/order/getOrder?id=${id}`, {
        method: "GET",
        headers: {
          Authorization: session?.accessToken || "",
        },
      });

      const response = await request.json();

      if (response.error) {
        setFormError(response.error);
      } else if (response.order) {
        setCommodityList(
          response.order.packages.map((item: Package) => {
            return {
              orderCommodityType: item.commodityType,
              orderCommodityId: item.packageId,
              orderCommodityName: Parser().parse(item.commodityName),
              orderCommodityNote: Parser().parse(item.commodityNote),
            };
          })
        );

        setOrderForm({
          orderStatus: response.order.status,
          orderId: response.order.orderId,
          orderType: response.order.orderType,
          orderCountry: response.order.orderCountry,
          orderStreet: Parser().parse(response.order.orderStreet),
          orderStreetNumber: response.order.orderStreetNumber,
          orderFlatNumber: response.order.orderFlatNumber,
          orderCity: response.order.orderCity,
          orderPostCode: response.order.orderPostCode,
          orderState: response.order.orderState,
          orderNote: Parser().parse(response.order.orderNote),
          orderClientName: Parser().parse(response.order.recipientName),
          orderClientPhone: response.order.recipientPhone,
          orderClientEmail: response.order.recipientEmail,
          orderPaymentType: response.order.orderPaymentType,
          orderPrice: response.order.orderPrice,
          orderSupplierId: response.order.orderSupplierId,
          packageManualCount: response.order.packageManualCount,
        });

        setCountryState(response.order.orderCountry);
      }
    } catch (error) {
      console.error("Error fetching order data:", error);
      setFormError("Błąd podczas pobierania danych zlecenia");
    }
  }

  // Actions - Update Order
  async function updateOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(undefined);

    if (commodityList.length < 1) {
      setFormError("Brak Towarów w Zleceniu");
      return;
    }

    try {
      const data = new FormData(event.currentTarget);
      const orderDataUpdate = {
        orderId: orderForm.orderId,
        userId: session?.user.id,
        orderType: data.get("orderType"),
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
        orderItems: commodityList,
      };

      const request = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/order/updateOrder`, {
        method: "POST",
        body: JSON.stringify(orderDataUpdate),
        headers: {
          Authorization: session?.accessToken || "",
          "Content-Type": "application/json",
        },
      });

      const response = await request.json();

      if (response.error) {
        setFormError(response.error);
      } else if (response.Success) {
        setUpdateSuccess(true);
      }
    } catch (error) {
      console.error("Error updating order:", error);
      setFormError("Błąd podczas aktualizacji zlecenia");
    }
  }

  // Actions - Cancel Order
  async function cancelOrder() {
    try {
      const request = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/order/cancelOrder?id=${id}`, {
        method: "GET",
        headers: {
          Authorization: session?.accessToken || "",
        },
      });

      const response = await request.json();

      if (response.error) {
        setFormError(response.error);
      } else if (response.Success) {
        queryClient.invalidateQueries({ queryKey: ["allUserOrder"] });
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error canceling order:", error);
      setFormError("Błąd podczas anulowania zlecenia");
    }
  }

  // Modal handlers
  const openCancelDialog = () => setCancelDialogOpen(true);
  const closeCancelDialog = () => setCancelDialogOpen(false);
  const confirmCancelOrder = () => {
    closeCancelDialog();
    cancelOrder();
  };

  return (
    <div className="flex h-screen bg-background">
      <InstructionsSideBar orderId={orderForm.orderId} />
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
              <h1 className="text-2xl font-semibold">Aktualizuj Zlecenie</h1>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={updateOrder} className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-[480px_1fr] gap-6 lg:gap-8">
              {/* Left Column - Address */}
              <div className="space-y-6 min-w-0">
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
                        <Select
                          name="orderType"
                          value={orderForm.orderType}
                          onValueChange={(value) => {
                            setOrderForm((prevState) => ({
                              ...prevState,
                              orderType: value,
                            }));
                          }}
                        >
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
                        <Label htmlFor="orderCountry">Kraj Zlecenia</Label>
                        <Select
                          name="orderCountry"
                          value={orderForm.orderCountry}
                          onValueChange={(value) => {
                            setOrderForm((prevState) => ({
                              ...prevState,
                              orderCountry: value,
                            }));
                          }}
                          disabled
                        >
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
                      <Input
                        name="orderStreet"
                        value={orderForm.orderStreet}
                        onChange={(e) => {
                          setOrderForm((prevState) => ({
                            ...prevState,
                            orderStreet: e.target.value,
                          }));
                        }}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="orderStreetNumber">Numer Budynku *</Label>
                        <Input
                          name="orderStreetNumber"
                          pattern="[A-Za-z0-9]{1,}"
                          value={orderForm.orderStreetNumber}
                          onChange={(e) => {
                            setOrderForm((prevState) => ({
                              ...prevState,
                              orderStreetNumber: e.target.value,
                            }));
                          }}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="orderFlatNumber">Numer Lokalu</Label>
                        <Input
                          name="orderFlatNumber"
                          value={orderForm.orderFlatNumber}
                          onChange={(e) => {
                            setOrderForm((prevState) => ({
                              ...prevState,
                              orderFlatNumber: e.target.value,
                            }));
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="orderCity">Miejscowość *</Label>
                      <Input
                        name="orderCity"
                        value={orderForm.orderCity}
                        onChange={(e) => {
                          setOrderForm((prevState) => ({
                            ...prevState,
                            orderCity: e.target.value,
                          }));
                        }}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="orderPostCode">
                          {orderForm.orderCountry === "Polska" ? "Kod Pocztowy (##-###) *" : "Kod Pocztowy (### ##) *"}
                        </Label>
                        <Input
                          name="orderPostCode"
                          value={orderForm.orderPostCode}
                          onChange={(e) => {
                            setOrderForm((prevState) => ({
                              ...prevState,
                              orderPostCode: e.target.value,
                            }));
                          }}
                          pattern={orderForm.orderCountry === "Polska" ? "[0-9]{2}-[0-9]{3}" : "[0-9]{3} [0-9]{2}"}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="orderState">Województwo *</Label>
                        <Input
                          name="orderState"
                          value={orderForm.orderState}
                          onChange={(e) => {
                            setOrderForm((prevState) => ({
                              ...prevState,
                              orderState: e.target.value,
                            }));
                          }}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="orderSupplierId">ID z systemu Zleceniodawcy</Label>
                      <Input
                        placeholder="np. Shop-123-456-789"
                        name="orderSupplierId"
                        value={orderForm.orderSupplierId}
                        onChange={(e) => {
                          setOrderForm((prevState) => ({
                            ...prevState,
                            orderSupplierId: e.target.value,
                          }));
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="orderNote">Notatka do zamówienia</Label>
                      <Textarea
                        name="orderNote"
                        value={orderForm.orderNote}
                        onChange={(e) => {
                          setOrderForm((prevState) => ({
                            ...prevState,
                            orderNote: e.target.value,
                          }));
                        }}
                        rows={6}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Client & Items */}
              <div className="space-y-6 min-w-0">
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
                      <Input
                        name="orderClientName"
                        value={orderForm.orderClientName}
                        onChange={(e) => {
                          setOrderForm((prevState) => ({
                            ...prevState,
                            orderClientName: e.target.value,
                          }));
                        }}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="orderClientPhone">
                        {orderForm.orderCountry === "Polska" ? "Telefon (Bez spacji) *" : "Telefon (Bez spacji) *"}
                      </Label>
                      <Input
                        name="orderClientPhone"
                        value={orderForm.orderClientPhone}
                        onChange={(e) => {
                          setOrderForm((prevState) => ({
                            ...prevState,
                            orderClientPhone: e.target.value,
                          }));
                        }}
                        pattern={orderForm.orderCountry === "Polska" ? "[0-9]{9}" : "[0-9]{9}"}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="orderClientEmail">Email Klienta</Label>
                      <Input
                        name="orderClientEmail"
                        value={orderForm.orderClientEmail}
                        onChange={(e) => {
                          setOrderForm((prevState) => ({
                            ...prevState,
                            orderClientEmail: e.target.value,
                          }));
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Payment and Package List Row */}
                <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 lg:gap-6">
                  {/* Commodity Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-600">
                        <PackageIcon className="h-5 w-5" />
                        Informacje o Przesyłce
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="orderCommodityType">Rodzaj Towaru *</Label>
                          <Select value={commodityItem.orderCommodityType} disabled>
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
                            disabled
                          />
                        </div>
                      </div>

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
                          disabled
                        />
                      </div>
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
                        <Select name="orderPaymentType" value={orderForm.orderPaymentType} disabled>
                          <SelectTrigger className="w-full cursor-pointer">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Przelew">Przelew</SelectItem>
                            <SelectItem value="Pobranie">Pobranie</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {orderForm.orderPrice !== 0 && (
                        <div className="space-y-2">
                          <Label htmlFor="orderPaymentAmount">Kwota Płatności {countryState === "Polska" ? "(PLN)" : "(EUR)"}</Label>
                          <Input name="orderPaymentAmount" type="number" value={orderForm.orderPrice} disabled />
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
                        {orderForm.packageManualCount || commodityList.length}
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
              {updateSuccess && (
                <Alert>
                  <AlertDescription>Aktualizacja danych przesyłki przebiegła prawidłowo</AlertDescription>
                </Alert>
              )}
              <div className="flex gap-4">
                <Button type="submit" size="lg" className="w-fit" disabled={orderForm.orderStatus === "Anulowane"}>
                  <Save className="h-4 w-4 mr-2" />
                  {orderForm.orderStatus === "Anulowane" ? "Zlecenie zostało anulowane" : "Aktualizuj Zlecenie"}
                </Button>
                {orderForm.orderStatus !== "Anulowane" && (
                  <Button type="button" variant="destructive" size="lg" onClick={openCancelDialog}>
                    <X className="h-4 w-4 mr-2" />
                    Anuluj Zlecenie
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Cancel Order Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Potwierdź anulowanie zlecenia
            </DialogTitle>
            <DialogDescription>Czy na pewno chcesz anulować to zlecenie? Ta operacja jest nieodwracalna.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeCancelDialog}>
              Anuluj
            </Button>
            <Button variant="destructive" onClick={confirmCancelOrder}>
              <X className="h-4 w-4 mr-2" />
              Tak, anuluj zlecenie
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
