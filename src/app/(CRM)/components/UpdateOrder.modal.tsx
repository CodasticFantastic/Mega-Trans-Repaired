"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { OrderWithUserAndPackages } from "types/order.types";
import { OrderType } from "@prisma/client";

// shadcn/ui components
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/shadcn/ui/dialog";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { Textarea } from "@/components/shadcn/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shadcn/ui/select";
import { Loader2Icon, EditIcon } from "lucide-react";
import { CustomToast } from "@/components/shadcn/custom/toast";
import { Separator } from "@/components/shadcn/ui/separator";
import { ScrollArea } from "@/components/shadcn/ui/scroll-area";
import { Parser } from "html-to-react";

interface UpdateOrderModalProps {
  order: OrderWithUserAndPackages;
  trigger?: React.ReactNode;
}

interface UpdateOrderFormData {
  orderType: OrderType;
  orderStreet: string;
  orderStreetNumber: string;
  orderFlatNumber: string;
  orderCity: string;
  orderPostCode: string;
  orderState: string;
  orderNote: string;
  orderClientName: string;
  orderClientPhone: string;
  orderClientEmail: string;
  orderSupplierId: string;
}

export default function UpdateOrderModal({ order, trigger }: UpdateOrderModalProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data with current order values
  const [formData, setFormData] = useState<UpdateOrderFormData>({
    orderType: order.orderType,
    orderStreet: order.orderStreet,
    orderStreetNumber: order.orderStreetNumber,
    orderFlatNumber: order.orderFlatNumber || "",
    orderCity: order.orderCity,
    orderPostCode: order.orderPostCode,
    orderState: order.orderState,
    orderNote: order.orderNote || "",
    orderClientName: order.recipientName,
    orderClientPhone: order.recipientPhone,
    orderClientEmail: order.recipientEmail || "",
    orderSupplierId: order.orderSupplierId || "",
  });

  const handleInputChange = (field: keyof UpdateOrderFormData, value: string | OrderType) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.orderType) newErrors.orderType = "Typ zamówienia jest wymagany";
    if (!formData.orderStreet) newErrors.orderStreet = "Ulica jest wymagana";
    if (!formData.orderStreetNumber) newErrors.orderStreetNumber = "Numer ulicy jest wymagany";
    if (!formData.orderCity) newErrors.orderCity = "Miasto jest wymagane";
    if (!formData.orderPostCode) newErrors.orderPostCode = "Kod pocztowy jest wymagany";
    if (!formData.orderState) newErrors.orderState = "Województwo jest wymagane";
    if (!formData.orderClientName) newErrors.orderClientName = "Nazwa klienta jest wymagana";
    if (!formData.orderClientPhone) newErrors.orderClientPhone = "Telefon klienta jest wymagany";

    // Email validation
    if (formData.orderClientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.orderClientEmail)) {
      newErrors.orderClientEmail = "Nieprawidłowy format email";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/order/updateOrder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: session?.accessToken || "",
        },
        body: JSON.stringify({
          orderId: order.orderId,
          ...formData,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Optymistyczna aktualizacja danych w cache
        // Aktualizujemy wszystkie instancje query z kluczem "allUserOrder"
        // To zapewnia natychmiastowe odzwierciedlenie zmian w UI bez przeładowywania całej listy
        queryClient.setQueriesData({ queryKey: ["allUserOrder"] }, (oldData: any) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            allUserOrder: oldData.allUserOrder.map((o: OrderWithUserAndPackages) =>
              o.orderId === order.orderId
                ? {
                    ...o,
                    orderType: formData.orderType,
                    orderStreet: formData.orderStreet,
                    orderStreetNumber: formData.orderStreetNumber,
                    orderFlatNumber: formData.orderFlatNumber,
                    orderCity: formData.orderCity,
                    orderPostCode: formData.orderPostCode,
                    orderState: formData.orderState,
                    orderNote: formData.orderNote,
                    recipientName: formData.orderClientName,
                    recipientPhone: formData.orderClientPhone,
                    recipientEmail: formData.orderClientEmail,
                    orderSupplierId: formData.orderSupplierId,
                  }
                : o
            ),
          };
        });

        CustomToast("success", "Zamówienie zostało zaktualizowane pomyślnie", {
          duration: 3000,
        });

        setDialogOpen(false);

        // Dodatkowa invalidacja w celu synchronizacji liczników i innych stron
        await queryClient.invalidateQueries({ queryKey: ["allUserOrder"] });
        // Wymuś refetch aktywnych list po invalidacji (pewne wysłanie GET)
        await queryClient.refetchQueries({ queryKey: ["allUserOrder"], type: "active" });
      } else {
        CustomToast("error", result.error || "Wystąpił błąd podczas aktualizacji zamówienia", {
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Update order error:", error);
      CustomToast("error", "Wystąpił błąd podczas aktualizacji zamówienia", {
        duration: 3000,
      });
      // W przypadku błędu, odświeżamy dane aby upewnić się, że mamy aktualne informacje
      queryClient.invalidateQueries({ queryKey: ["allUserOrder"] });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetInitialData = () => {
    // Reset form data to original values
    setFormData({
      orderType: order.orderType,
      orderStreet: Parser().parse(order.orderStreet),
      orderStreetNumber: Parser().parse(order.orderStreetNumber),
      orderFlatNumber: Parser().parse(order.orderFlatNumber || ""),
      orderCity: Parser().parse(order.orderCity),
      orderPostCode: Parser().parse(order.orderPostCode),
      orderState: Parser().parse(order.orderState),
      orderNote: Parser().parse(order.orderNote || ""),
      orderClientName: Parser().parse(order.recipientName),
      orderClientPhone: Parser().parse(order.recipientPhone),
      orderClientEmail: Parser().parse(order.recipientEmail || ""),
      orderSupplierId: order.orderSupplierId || "",
    });
    setErrors({});
  };

  const handleToggleModal = (open: boolean) => {
    console.log("open", open);
    setDialogOpen(open);

    if (open) {
      handleSetInitialData();
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={handleToggleModal}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <EditIcon className="h-4 w-4 mr-2" />
            Edytuj
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="pr-2">
        <DialogHeader>
          <DialogTitle>Edytuj zamówienie</DialogTitle>
          <Separator />
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <form onSubmit={handleSubmit} className="space-y-6 min-w-0 mb-4" id="update-order-form">
            {/* Typ zamówienia */}
            <div className="space-y-2 min-w-0">
              <Label htmlFor="orderType">Typ zamówienia *</Label>
              <Select value={formData.orderType} onValueChange={(value) => handleInputChange("orderType", value)}>
                <SelectTrigger className={errors.orderType ? "border-red-500" : ""}>
                  <SelectValue placeholder="Wybierz typ zamówienia" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(OrderType).map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.orderType && <p className="text-sm text-red-500">{errors.orderType}</p>}
            </div>

            {/* Adres dostawy */}
            <div className="space-y-4 min-w-0">
              <h3 className="text-lg font-semibold">Adres dostawy</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
                <div className="space-y-2 min-w-0">
                  <Label htmlFor="orderStreet">Ulica *</Label>
                  <Input
                    id="orderStreet"
                    value={formData.orderStreet}
                    onChange={(e) => handleInputChange("orderStreet", e.target.value)}
                    className={`${errors.orderStreet ? "border-red-500" : ""} break-words`}
                  />
                  {errors.orderStreet && <p className="text-sm text-red-500">{errors.orderStreet}</p>}
                </div>

                <div className="space-y-2 min-w-0">
                  <Label htmlFor="orderStreetNumber">Numer ulicy *</Label>
                  <Input
                    id="orderStreetNumber"
                    value={formData.orderStreetNumber}
                    onChange={(e) => handleInputChange("orderStreetNumber", e.target.value)}
                    className={`${errors.orderStreetNumber ? "border-red-500" : ""} break-words`}
                  />
                  {errors.orderStreetNumber && <p className="text-sm text-red-500">{errors.orderStreetNumber}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-w-0">
                <div className="space-y-2 min-w-0">
                  <Label htmlFor="orderFlatNumber">Numer mieszkania</Label>
                  <Input
                    id="orderFlatNumber"
                    value={formData.orderFlatNumber}
                    onChange={(e) => handleInputChange("orderFlatNumber", e.target.value)}
                    className="break-words"
                  />
                </div>

                <div className="space-y-2 min-w-0">
                  <Label htmlFor="orderCity">Miasto *</Label>
                  <Input
                    id="orderCity"
                    value={formData.orderCity}
                    onChange={(e) => handleInputChange("orderCity", e.target.value)}
                    className={`${errors.orderCity ? "border-red-500" : ""} break-words`}
                  />
                  {errors.orderCity && <p className="text-sm text-red-500">{errors.orderCity}</p>}
                </div>

                <div className="space-y-2 min-w-0">
                  <Label htmlFor="orderPostCode">Kod pocztowy *</Label>
                  <Input
                    id="orderPostCode"
                    value={formData.orderPostCode}
                    onChange={(e) => handleInputChange("orderPostCode", e.target.value)}
                    className={`${errors.orderPostCode ? "border-red-500" : ""} break-words`}
                  />
                  {errors.orderPostCode && <p className="text-sm text-red-500">{errors.orderPostCode}</p>}
                </div>
              </div>

              <div className="space-y-2 min-w-0">
                <Label htmlFor="orderState">Województwo *</Label>
                <Input
                  id="orderState"
                  value={formData.orderState}
                  onChange={(e) => handleInputChange("orderState", e.target.value)}
                  className={`${errors.orderState ? "border-red-500" : ""} break-words`}
                />
                {errors.orderState && <p className="text-sm text-red-500">{errors.orderState}</p>}
              </div>
            </div>

            {/* Dane odbiorcy */}
            <div className="space-y-4 min-w-0">
              <h3 className="text-lg font-semibold">Dane odbiorcy</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
                <div className="space-y-2 min-w-0">
                  <Label htmlFor="orderClientName">Nazwa odbiorcy *</Label>
                  <Input
                    id="orderClientName"
                    value={formData.orderClientName}
                    onChange={(e) => handleInputChange("orderClientName", e.target.value)}
                    className={`${errors.orderClientName ? "border-red-500" : ""} break-words`}
                  />
                  {errors.orderClientName && <p className="text-sm text-red-500">{errors.orderClientName}</p>}
                </div>

                <div className="space-y-2 min-w-0">
                  <Label htmlFor="orderClientPhone">Telefon *</Label>
                  <Input
                    id="orderClientPhone"
                    value={formData.orderClientPhone}
                    onChange={(e) => handleInputChange("orderClientPhone", e.target.value)}
                    className={`${errors.orderClientPhone ? "border-red-500" : ""} break-words`}
                  />
                  {errors.orderClientPhone && <p className="text-sm text-red-500">{errors.orderClientPhone}</p>}
                </div>
              </div>

              <div className="space-y-2 min-w-0">
                <Label htmlFor="orderClientEmail">Email</Label>
                <Input
                  id="orderClientEmail"
                  type="email"
                  value={formData.orderClientEmail}
                  onChange={(e) => handleInputChange("orderClientEmail", e.target.value)}
                  className={`${errors.orderClientEmail ? "border-red-500" : ""} break-words`}
                />
                {errors.orderClientEmail && <p className="text-sm text-red-500">{errors.orderClientEmail}</p>}
              </div>
            </div>

            {/* Dodatkowe informacje */}
            <div className="space-y-4 min-w-0">
              <h3 className="text-lg font-semibold">Dodatkowe informacje</h3>

              <div className="space-y-2 min-w-0">
                <Label htmlFor="orderSupplierId">ID dostawcy</Label>
                <Input
                  id="orderSupplierId"
                  value={formData.orderSupplierId}
                  onChange={(e) => handleInputChange("orderSupplierId", e.target.value)}
                  className="break-words"
                />
              </div>

              <div className="space-y-2 min-w-0">
                <Label htmlFor="orderNote">Notatka</Label>
                <Textarea
                  id="orderNote"
                  value={formData.orderNote}
                  onChange={(e) => handleInputChange("orderNote", e.target.value)}
                  rows={3}
                  placeholder="Dodatkowe informacje o zamówieniu..."
                  className="resize-none overflow-y-auto max-h-32"
                />
              </div>
            </div>
          </form>
        </ScrollArea>
        <Separator />
        <DialogFooter className="pr-4">
          <Button type="button" variant="outline" onClick={handleSetInitialData} disabled={isLoading}>
            Anuluj
          </Button>
          <Button type="submit" disabled={isLoading} form="update-order-form">
            {isLoading ? (
              <>
                <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
                Zapisywanie...
              </>
            ) : (
              "Zapisz zmiany"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
