import Image from "next/image";
import Logo from "@/images/LogoBlue.png";
import LogoutButton from "../LogoutButton";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Info,
  ChevronDown,
  FileText,
  QrCode,
  Settings,
  Package,
} from "lucide-react";

// shadcn/ui components
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/shadcn/ui/accordion";
import { Button } from "@/components/shadcn/ui/button";
import { Separator } from "@/components/shadcn/ui/separator";

export default function InstructionsSideBar({ orderId }: { orderId: string }) {
  let pathname = usePathname();
  pathname = pathname.split("/")[1];

  return (
    <aside className="sm:max-h-screen sm:h-screen w-full sm:w-78 sm:min-w-64 overflow-hidden p-4 bg-background shadow-lg flex flex-col">
      {/* Logo */}
      <div className="max-w-32 mx-auto mb-8">
        <Image src={Logo} alt="Logo" />
      </div>

      {/* Instructions */}
      <div className="flex-1 overflow-y-auto">
        <Accordion type="multiple" className="space-y-2">
          {/* Zasady wypełniania pól */}
          <AccordionItem value="filling-rules" className="border rounded-lg">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">
                  Zasady wypełniania pól
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                W celu utworzenia lub aktualizacji zlecenia, wypełnij wszystkie
                obowiązkowe pola oznaczone gwiazdką (*).
              </p>
            </AccordionContent>
          </AccordionItem>

          {/* Oznaczanie Paczek */}
          <AccordionItem value="package-marking" className="border rounded-lg">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">Oznaczanie Paczek</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Jeśli dany towar składa się z więcej niż 1 elementu a "Rodzaj
                płatności" to pobranie wpisz kwotę pobrania tylko do pierwszego
                elementu.
              </p>
              <div>
                <p className="text-sm font-medium mb-2">Elementy oznacz np:</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Sofa Część 1</li>
                  <li>Sofa Część 2</li>
                  <li>Fotel Biurowy</li>
                  <li>Stół Duży</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Informacja SMS */}
          <AccordionItem value="sms-info" className="border rounded-lg">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">Informacja SMS</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Pamiętaj aby podać prawidłowy numer telefonu. Na dany telefon
                będą wysyłane informacje z aktualizacją statusu przesyłki.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Print Links - only for updateOrder */}
        {pathname === "updateOrder" && (
          <div className="mt-6 space-y-2">
            <Separator />
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <Link href={`/updateOrder/${orderId}/waybill`} target="_blank">
                  <FileText className="h-4 w-4 mr-2" />
                  List Przewozowy
                </Link>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <Link href={`/updateOrder/${orderId}/label`} target="_blank">
                  <QrCode className="h-4 w-4 mr-2" />
                  Etykiety 10x15
                </Link>
              </Button>

              {/* <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <Link
                  href={`/updateOrder/${orderId}/shortDocumentation`}
                  target="_blank"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Etykiety A4
                </Link>
              </Button> */}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
