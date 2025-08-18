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
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/shadcn/ui/dropdown-menu";
import { DatePicker } from "@/components/date-picker";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/shadcn/ui/select";
import { ApiKey, ApiKeyType } from "@prisma/client";
import dayjs from "dayjs";
import {
  BlocksIcon,
  EyeIcon,
  InfoIcon,
  Loader2Icon,
  RefreshCwIcon,
  Trash2Icon,
  TriangleAlertIcon,
  MoreHorizontalIcon,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CustomToast } from "@/components/shadcn/custom/toast";

interface CustomApiKeyList {
  apiKey: ApiKey["apiKey"];
  apiKeyName: ApiKey["apiKeyName"];
  lastUsed: ApiKey["lastUsed"];
  type: ApiKey["type"];
}

export const IntegrationsModal = () => {
  const { data: session } = useSession();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [isDataSending, setIsDataSending] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchFromByKey, setSearchFromByKey] = useState<
    Record<string, Date | undefined>
  >({});
  const [statusIdByKey, setStatusIdByKey] = useState<
    Record<string, number | undefined>
  >({});
  const [myIntegrationsKeys, setMyIntegrationsKeys] = useState<
    CustomApiKeyList[]
  >([]);

  // Load status IDs from localStorage on component mount
  useEffect(() => {
    const savedStatusIds = localStorage.getItem("baselinker_status_ids");
    if (savedStatusIds) {
      try {
        const parsed = JSON.parse(savedStatusIds);
        setStatusIdByKey(parsed);
      } catch (error) {
        console.error("Error parsing saved status IDs:", error);
      }
    }
  }, []);

  // Save status IDs to localStorage whenever they change
  const updateStatusIdByKey = (
    newStatusIdByKey: Record<string, number | undefined>
  ) => {
    setStatusIdByKey(newStatusIdByKey);
    localStorage.setItem(
      "baselinker_status_ids",
      JSON.stringify(newStatusIdByKey)
    );
  };

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
      CustomToast("success", "Skopiowano wartość do schowka", {
        duration: 1500,
      });
    } catch {
      CustomToast("error", "Nie udało się skopiować wartości", {
        duration: 1500,
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
        CustomToast("success", "Klucz został usunięty", { duration: 2500 });
        fetchMyIntegrationsKeys();
      } else {
        CustomToast("error", "Nie udało się usunąć klucza", { duration: 2500 });
      }
    } catch (error) {
      CustomToast("error", "Nie udało się usunąć klucza", { duration: 2500 });
    } finally {
      setIsDataSending(false);
    }
  };

  enum SyncErrorCodes {
    INVALID_BASELINKER_API_KEY = "INVALID_BASELINKER_API_KEY",
    BASE_LINKER_API_KEY_NOT_FOUND = "BASE_LINKER_API_KEY_NOT_FOUND",
    UNAUTHORIZED = "UNAUTHORIZED",
    INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  }

  const errorToMessage: Record<string, string> = {
    [SyncErrorCodes.INVALID_BASELINKER_API_KEY]:
      "Nieprawidłowy klucz BaseLinker",
    [SyncErrorCodes.BASE_LINKER_API_KEY_NOT_FOUND]:
      "Brak skonfigurowanego klucza BaseLinker",
    [SyncErrorCodes.UNAUTHORIZED]: "Brak uprawnień do synchronizacji",
    [SyncErrorCodes.INTERNAL_SERVER_ERROR]: "Błąd serwera",
  };

  const handleSyncBaselinker = async (options?: {
    searchFrom?: Date;
    statusId?: number;
  }) => {
    try {
      setIsSyncing(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_DOMAIN}/api/baselinker/orders/import`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: session?.accessToken ?? "",
          },
          body: JSON.stringify({
            searchFrom: (
              options?.searchFrom ?? dayjs().subtract(8, "day").toDate()
            ).toISOString(),
            statusId: options?.statusId ?? 0,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        CustomToast(
          "info",
          <div>
            <p>Synchronizacja BaseLinker zakończona</p>
            <p>Nowo dodane zamówienia: {data?.orderNew?.length ?? 0}</p>
            <p>Zaktualizowane zamówienia: {data?.orderUpdated?.length ?? 0}</p>
            <p>
              Nie udało się zsynchronizować: {data?.orderErrors?.length ?? 0}
            </p>
          </div>,
          { duration: 5000 }
        );
      } else {
        CustomToast("error", "Nie udało się zsynchronizować zamówień", {
          duration: 3000,
        });
      }
    } catch (error) {
      CustomToast("error", "Wystąpił błąd podczas synchronizacji", {
        duration: 3000,
      });
    } finally {
      setIsSyncing(false);
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
                className="grid grid-cols-[1fr_auto] gap-3 !pb-2 items-center"
              >
                <p className="text-sm">{key.apiKeyName}</p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="xs" className="icon-text">
                      <MoreHorizontalIcon className="h-4 w-4" />
                      Zobacz więcej
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[260px]">
                    {key.type === ApiKeyType.BaseLinker && (
                      <>
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            <span className="icon-text">
                              <RefreshCwIcon className="h-4 w-4" />
                              Synchronizacja zamówień
                            </span>
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent className="w-[320px]">
                            <DropdownMenuLabel>
                              Parametry synchronizacji
                            </DropdownMenuLabel>
                            <div className="px-2 py-1.5 flex flex-col gap-2">
                              <DatePicker
                                label={<span className="text-xs">Data od</span>}
                                date={
                                  searchFromByKey[key.apiKey] ??
                                  dayjs().subtract(8, "day").toDate()
                                }
                                onDateChange={(d) =>
                                  setSearchFromByKey((prev) => ({
                                    ...prev,
                                    [key.apiKey]: d,
                                  }))
                                }
                              />
                              <div className="flex flex-col gap-1">
                                <span className="text-xs px-1">Status ID</span>
                                <Input
                                  type="number"
                                  inputMode="numeric"
                                  placeholder="np. 0"
                                  value={statusIdByKey[key.apiKey] ?? 0}
                                  onChange={(e) => {
                                    const v = parseInt(e.target.value, 10);
                                    const newValue = isNaN(v) ? 0 : v;
                                    updateStatusIdByKey({
                                      ...statusIdByKey,
                                      [key.apiKey]: newValue,
                                    });
                                  }}
                                />
                              </div>
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleSyncBaselinker({
                                    searchFrom: searchFromByKey[key.apiKey],
                                    statusId: statusIdByKey[key.apiKey] ?? 0,
                                  })
                                }
                                disabled={isDataSending || isSyncing}
                              >
                                {isSyncing ? (
                                  <>
                                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                                    Synchronizowanie...
                                  </>
                                ) : (
                                  <>
                                    <RefreshCwIcon className="mr-2 h-4 w-4" />
                                    Synchronizuj
                                  </>
                                )}
                              </Button>
                            </div>
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>

                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuGroup>
                      {key.type === ApiKeyType.CustomIntegration && (
                        <DropdownMenuItem
                          onSelect={() => handleCopy(key.apiKey)}
                        >
                          <EyeIcon /> Kopiuj klucz
                        </DropdownMenuItem>
                      )}
                      {confirmDelete === key.apiKey ? (
                        <div className="px-2 py-1.5 flex gap-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            className="!px-2"
                            onClick={() => handleDeleteApiKey(key.apiKey)}
                            disabled={isDataSending}
                          >
                            Usuń
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="!px-2"
                            onClick={() => setConfirmDelete(null)}
                            disabled={isDataSending}
                          >
                            Anuluj
                          </Button>
                        </div>
                      ) : (
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={() => setConfirmDelete(key.apiKey)}
                          disabled={isDataSending}
                        >
                          <Trash2Icon className="text-destructive" /> Usuń...
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
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

      if (responseData.error === "BASE_LINKER_API_KEY_ALREADY_EXISTS") {
        setGenerateApiKeyError(
          "Możesz posiadać tylko jeden klucz BaseLinker przypisany do swojego konta."
        );
        return;
      }

      if (responseData.apiKey) {
        CustomToast("success", "Klucz został utworzony", { duration: 2500 });
        onApiKeyCreated();
        setDialogOpen(false);
        setApiKeyName("");
        setApiKeyType(undefined);
      } else {
        CustomToast("error", "Nie udało się utworzyć klucza", {
          duration: 2500,
        });
      }
    } catch (error) {
      CustomToast("error", "Nie udało się utworzyć klucza", { duration: 2500 });
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
            <Alert variant="destructive" className="!p-2">
              <AlertTitle className="flex items-center gap-2">
                <TriangleAlertIcon size={20} /> {generateApiKeyError}
              </AlertTitle>
            </Alert>
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
