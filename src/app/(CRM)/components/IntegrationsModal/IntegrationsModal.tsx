"use client";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/shadcn/ui/alert";
import { Badge } from "@/components/shadcn/ui/badge";
import { Button } from "@/components/shadcn/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shadcn/ui/dialog";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/shadcn/ui/select";
import { ApiKey, ApiKeyType } from "@prisma/client";
import {
  BlocksIcon,
  EyeIcon,
  InfoIcon,
  Loader2Icon,
  Trash2Icon,
  TriangleAlertIcon,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface CustomApiKeyList {
  apiKey: ApiKey["apiKey"];
  apiKeyName: ApiKey["apiKeyName"];
  lastUsed: ApiKey["lastUsed"];
}

export const IntegrationsModal = () => {
  const { data: session } = useSession();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [isDataSending, setIsDataSending] = useState(false);
  const [myIntegrationsKeys, setMyIntegrationsKeys] = useState<
    CustomApiKeyList[]
  >([]);

  const fetchMyIntegrationsKeys = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_DOMAIN}/api/apiKey/getAll`,
        {
          headers: { Authorization: session?.accessToken ?? "" },
        }
      );

      const { apiKeys } = await response.json();

      if (apiKeys && apiKeys.length > 0) {
        setMyIntegrationsKeys(apiKeys);
      } else {
        setMyIntegrationsKeys([]);
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast("Skopiowano wartość do schowka", {
        duration: 1500,
        richColors: true,
        style: {
          backgroundColor: "var(--color-background)",
          color: "var(--color-green)",
          border: "1px solid var(--color-green)",
        },
      });
    } catch {
      toast("Nie udało się skopiować wartości", {
        duration: 1500,
        richColors: true,
        style: {
          backgroundColor: "var(--color-red)",
          color: "var(--color-text-primary)",
        },
      });
    }
  };

  const handleDeleteApiKey = async (apiKey: string) => {
    try {
      setIsDataSending(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_DOMAIN}/api/apiKey/delete`,
        {
          method: "POST",
          headers: { Authorization: session?.accessToken ?? "" },
          body: JSON.stringify({ apiKey }),
        }
      );

      const { message } = await response.json();

      if (message === "Success") {
        toast("Klucz został usunięty", {
          duration: 2500,
          richColors: true,
          style: {
            backgroundColor: "var(--color-background)",
            color: "var(--color-green)",
            border: "1px solid var(--color-green)",
          },
        });

        fetchMyIntegrationsKeys();
      } else {
        toast("Nie udało się usunąć klucza", {
          duration: 2500,
          richColors: true,
          style: {
            backgroundColor: "var(--color-background)",
            color: "var(--color-destructive)",
            border: "1px solid var(--color-destructive)",
          },
        });
      }
    } catch (error) {
      toast("Nie udało się usunąć klucza", {
        duration: 2500,
        richColors: true,
        style: {
          backgroundColor: "var(--color-background)",
          color: "var(--color-destructive)",
          border: "1px solid var(--color-destructive)",
        },
      });
    } finally {
      setIsDataSending(false);
    }
  };

  useEffect(() => {
    if (dialogOpen) {
      fetchMyIntegrationsKeys();
      setConfirmDelete(null);
      setIsDataSending(false);
    }
  }, [dialogOpen]);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger className="icon-text cursor-pointer" asChild>
        <Button variant="link" size="sm" className="!p-0">
          <BlocksIcon />
          <p>Moje Integracje</p>
        </Button>
      </DialogTrigger>
      <DialogContent className="!p-4">
        <DialogHeader>
          <DialogTitle asChild>
            <p className="text-md">Moje Integracje</p>
          </DialogTitle>
          <DialogDescription className="text-sm flex items-center justify-between w-full gap-2">
            Zarządzaj kluczami API{" "}
            <Link
              href="/apiDocs"
              className="text-[var(--color-blue)] hover:underline"
              target="_blank"
            >
              Pokaż dokumentację
            </Link>
          </DialogDescription>
        </DialogHeader>
        <Alert variant="default" className="!p-2">
          <AlertTitle className="flex items-center gap-2">
            <InfoIcon size={20} /> Automatyzacja składania zamówień
          </AlertTitle>
          <AlertDescription>
            Klucze API pozwalają na automatyzację składania zamówień.
            <br />
            Skontaktuj się z nami w celu poznania szczegółów.
            <br />
            <span className="text-sm font-bold text-destructive">
              Nie udostępniaj swoich kluczy osobom nieautoryzowanym.
            </span>
          </AlertDescription>
        </Alert>
        {isLoading && (
          <div className="flex justify-center items-center h-full gap-2">
            <Loader2Icon className="animate-spin" />
            <p className="text-sm">Ładowanie...</p>
          </div>
        )}
        {!isLoading && myIntegrationsKeys.length === 0 && (
          <Alert variant="destructive" className="!p-2">
            <AlertTitle className="flex items-center gap-2">
              <TriangleAlertIcon size={20} /> Nie posiadasz żadnych kluczy API.
            </AlertTitle>
          </Alert>
        )}
        {!isLoading && myIntegrationsKeys.length > 0 && (
          <div className="flex flex-col gap-2 max-h-[240px] overflow-y-auto divide-y divide-border">
            {myIntegrationsKeys.map((key) => (
              <div
                key={key.apiKey}
                className="grid grid-cols-[1fr_auto_auto] gap-3 !pb-2 items-center"
              >
                <p className="text-sm">{key.apiKeyName}</p>
                <p
                  className="icon-text text-primary text-xs cursor-pointer hover:underline"
                  onClick={() => handleCopy(key.apiKey)}
                >
                  <EyeIcon size={16} />
                  Kopiuj klucz
                </p>
                <div className="text-sm flex justify-end">
                  {confirmDelete === key.apiKey ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        className="!px-2 cursor-pointer"
                        onClick={() => handleDeleteApiKey(key.apiKey)}
                        disabled={isDataSending}
                      >
                        Usuń
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="!px-2 cursor-pointer"
                        onClick={() => setConfirmDelete(null)}
                        disabled={isDataSending}
                      >
                        Anuluj
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setConfirmDelete(key.apiKey)}
                      disabled={isDataSending}
                    >
                      <Trash2Icon className="text-destructive cursor-pointer" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <DialogFooter>
          <CreateNewApiKeyModal onApiKeyCreated={fetchMyIntegrationsKeys} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface CreateNewApiKeyModalProps {
  onApiKeyCreated: () => void;
}

const CreateNewApiKeyModal = ({
  onApiKeyCreated,
}: CreateNewApiKeyModalProps) => {
  const { data: session } = useSession();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [apiKeyName, setApiKeyName] = useState("");
  const [apiKeyType, setApiKeyType] = useState<ApiKeyType>();
  const [apiKeyValue, setApiKeyValue] = useState<string>();
  const [isDataSending, setIsDataSending] = useState(false);
  const [generateApiKeyError, setGenerateApiKeyError] = useState<string | null>(
    null
  );

  const handleCreateNewApiKey = async () => {
    try {
      setGenerateApiKeyError(null);
      setIsDataSending(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_DOMAIN}/api/apiKey/generate`,
        {
          method: "POST",
          headers: { Authorization: session?.accessToken ?? "" },
          body: JSON.stringify({
            apiKeyName: apiKeyName,
            apiKeyType: apiKeyType,
            apiKeyValue: apiKeyValue ?? "",
          }),
        }
      );

      const responseData = await response.json();

      if (responseData.error === "API_KEY_ALREADY_EXISTS") {
        setGenerateApiKeyError("Klucz o podanej nazwie już istnieje");
        return;
      }

      if (responseData.apiKey) {
        toast("Klucz został utworzony", {
          duration: 2500,
          richColors: true,
          style: {
            backgroundColor: "var(--color-background)",
            color: "var(--color-green)",
            border: "1px solid var(--color-green)",
          },
        });

        onApiKeyCreated();
        setDialogOpen(false);
        setApiKeyName("");
        setApiKeyType(undefined);
      } else {
        toast("Nie udało się utworzyć klucza", {
          duration: 2500,
          richColors: true,
          style: {
            backgroundColor: "var(--color-background)",
            color: "var(--color-destructive)",
            border: "1px solid var(--color-destructive)",
          },
        });
      }
    } catch (error) {
      toast("Nie udało się utworzyć klucza", {
        duration: 2500,
        richColors: true,
        style: {
          backgroundColor: "var(--color-background)",
          color: "var(--color-destructive)",
          border: "1px solid var(--color-destructive)",
        },
      });
    } finally {
      setIsDataSending(false);
    }
  };

  const handleToggleModal = () => {
    if (dialogOpen) {
      setDialogOpen(false);
    } else {
      setDialogOpen(true);
      setApiKeyName("");
      setApiKeyType(undefined);
      setGenerateApiKeyError(null);
      setIsDataSending(false);
      setApiKeyValue(undefined);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={handleToggleModal}>
      <DialogTrigger asChild>
        <Button variant="outline" className="!px-2 cursor-pointer">
          Utwórz klucz
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tworzenie nowego klucza API</DialogTitle>
          <DialogDescription>
            Utwórz nowy klucz API do integracji z systemami zewnętrznymi.
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleCreateNewApiKey();
          }}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="apiKeyType">Typ klucza</Label>
            <Select
              required
              value={apiKeyType}
              onValueChange={(value) => setApiKeyType(value as ApiKeyType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Wybierz typ klucza" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ApiKeyType.BaseLinker}>
                  BaseLinker
                </SelectItem>
                <SelectItem value={ApiKeyType.CustomIntegration}>
                  Własna Integracja
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {apiKeyType === ApiKeyType.CustomIntegration && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="apiKeyName">Nazwa klucza</Label>
              <Input
                id="apiKeyName"
                placeholder="np. Sklep internetowy"
                value={apiKeyName}
                onChange={(e) => setApiKeyName(e.target.value)}
                required
              />
            </div>
          )}

          {apiKeyType === ApiKeyType.BaseLinker && (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="apiKeyName">Nazwa klucza API</Label>
                <Input
                  id="apiKeyName"
                  placeholder="np. BaseLinker"
                  value={apiKeyName}
                  onChange={(e) => setApiKeyName(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="apiKeyName">Wartość klucza API</Label>
                <Input
                  id="apiKeyName"
                  placeholder="Hasło komunikacji z panelu BaseLinker"
                  value={apiKeyValue}
                  onChange={(e) => setApiKeyValue(e.target.value)}
                  // required
                />
              </div>
            </>
          )}

          {generateApiKeyError && (
            <p className="text-sm text-destructive">{generateApiKeyError}</p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isDataSending}
            >
              Anuluj
            </Button>
            <Button type="submit" disabled={isDataSending}>
              {isDataSending ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Tworzenie...
                </>
              ) : (
                "Utwórz klucz"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
