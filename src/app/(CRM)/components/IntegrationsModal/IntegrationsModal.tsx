"use client";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/shadcn/ui/alert";
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
import { ApiKey } from "@prisma/client";
import {
  AlertCircleIcon,
  BlocksIcon,
  InfoIcon,
  Loader2Icon,
  Trash2Icon,
  TriangleAlertIcon,
} from "lucide-react";
import { useSession } from "next-auth/react";
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
  const [createNewApiKey, setCreateNewApiKey] = useState(false);
  const [apiKeyName, setApiKeyName] = useState("");
  const [isDataSending, setIsDataSending] = useState(false);
  const [generateApiKeyError, setGenerateApiKeyError] = useState<string | null>(
    null
  );
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
          backgroundColor: "var(--color-dark-primary)",
          color: "var(--color-text-primary)",
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
            backgroundColor: "var(--color-dark-primary)",
            color: "var(--color-text-primary)",
          },
        });

        fetchMyIntegrationsKeys();
      } else {
        toast("Nie udało się usunąć klucza", {
          duration: 2500,
          richColors: true,
          style: {
            backgroundColor: "var(--color-red)",
            color: "var(--color-text-primary)",
          },
        });
      }
    } catch (error) {
      toast("Nie udało się usunąć klucza", {
        duration: 2500,
        richColors: true,
        style: {
          backgroundColor: "var(--color-red)",
          color: "var(--color-text-primary)",
        },
      });
    } finally {
      setIsDataSending(false);
    }
  };

  const handleCreateNewApiKey = async () => {
    try {
      setGenerateApiKeyError(null);
      setIsDataSending(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_DOMAIN}/api/apiKey/generate`,
        {
          method: "POST",
          headers: { Authorization: session?.accessToken ?? "" },
          body: JSON.stringify({ apiKeyName: apiKeyName }),
        }
      );

      const responseData = await response.json();

      if (responseData.error === "API_KEY_ALREADY_EXISTS") {
        setGenerateApiKeyError("Klucz o podanej nazwie już istnieje");
      }

      if (responseData.apiKey) {
        toast("Klucz został utworzony", {
          duration: 2500,
          richColors: true,
          style: {
            backgroundColor: "var(--color-dark-primary)",
            color: "var(--color-text-primary)",
          },
        });

        fetchMyIntegrationsKeys();
        setCreateNewApiKey(false);
        setApiKeyName("");
      }
    } catch (error) {
      toast("Nie udało się utworzyć klucza", {
        duration: 2500,
        richColors: true,
        style: {
          backgroundColor: "var(--color-red)",
          color: "var(--color-text-primary)",
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
      setCreateNewApiKey(false);
      setApiKeyName("");
      setGenerateApiKeyError(null);
      setIsDataSending(false);
    }
  }, [dialogOpen]);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger className="icon-text cursor-pointer">
        <BlocksIcon size={20} />
        Moje Integracje
      </DialogTrigger>
      <DialogContent className="!p-4">
        <DialogHeader>
          <DialogTitle asChild>
            <p className="text-md">Moje Integracje</p>
          </DialogTitle>
          <DialogDescription className="text-sm">
            Zarządzaj kluczami API
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
          <div className="flex flex-col gap-2 max-h-[240px] overflow-y-auto">
            {myIntegrationsKeys.map((key) => (
              <div
                key={key.apiKey}
                className="grid grid-cols-[1fr_auto_auto] border-b !border-[var(--color-gray)] gap-3 !pb-2 items-center"
              >
                <p className="text-sm">{key.apiKeyName}</p>
                <p
                  className="text-sm cursor-pointer text-[var(--color-blue)] hover:underline"
                  onClick={() => handleCopy(key.apiKey)}
                >
                  Skopiuj wartość klucza
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
          {createNewApiKey && (
            <form
              className="flex gap-2 w-full"
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateNewApiKey();
              }}
            >
              <div className="w-full">
                <Input
                  placeholder="Nazwa klucza (np. Sklep Internetowy)"
                  className="!px-2"
                  value={apiKeyName}
                  onChange={(e) => setApiKeyName(e.target.value)}
                  required
                />
                {generateApiKeyError && (
                  <p className="text-sm text-destructive">
                    {generateApiKeyError}
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                className="!px-2 cursor-pointer"
                disabled={isDataSending}
              >
                Utwórz klucz
              </Button>
            </form>
          )}
          {!createNewApiKey && (
            <Button
              variant="outline"
              className="!px-2 cursor-pointer"
              onClick={() => setCreateNewApiKey(true)}
            >
              Utwórz klucz
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
