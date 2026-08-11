import { useEffect, useState } from "react";
import AdminLayout from "../../shared/AdminLayout";
import AdminGamePlatformCard from "./AdminGamePlatformCard";
import AdminGamePlatformsHeader from "./AdminGamePlatformsHeader";
import AdminGamePlatformsModal from "./AdminGamePlatformsModal";
import {
  createFallbackPlatformMonitorItem,
  createPlatformFormState,
  createPlatformKeysState,
  getGameKeyValues,
  keysPageSize,
  parsePlatformPrice,
  shouldWarnAboutGlobalPriceChange,
  emptyKeysMeta,
} from "./AdminGamePlatforms.helpers";
import { AdminPageState } from "../../shared/adminShared";
import api from "../../../../services/api";
import { getApiErrorMessage, type PaginatedResponse } from "../../../../services/http";
import type {
  DeleteKeysResponse,
  GameKey,
  GamePlatformsResponse,
  PlatformConfirmationState,
  PlatformFormState,
  PlatformKeysState,
  PlatformMonitorItem,
  SaveKeysResponse,
  StockSummary,
} from "../../shared/admin.types";

function createFormFallback(platformId: number) {
  return createPlatformFormState(createFallbackPlatformMonitorItem(platformId));
}

function updateStateById<T>(
  setState: React.Dispatch<React.SetStateAction<Record<number, T>>>,
  platformId: number,
  fallbackState: T,
  updateState: (currentState: T) => T,
) {
  setState((currentState) => ({
    ...currentState,
    [platformId]: updateState(currentState[platformId] ?? fallbackState),
  }));
}

export default function AdminGamePlatforms({ gameId }: { gameId?: string }) {
  const [game, setGame] = useState<GamePlatformsResponse["game"] | null>(null);
  const [platforms, setPlatforms] = useState<PlatformMonitorItem[]>([]);
  const [platformBeingManaged, setPlatformBeingManaged] = useState<number | null>(null);
  const [platformFormStateById, setPlatformFormStateById] =
    useState<Record<number, PlatformFormState>>({});
  const [platformKeysStateById, setPlatformKeysStateById] =
    useState<Record<number, PlatformKeysState>>({});
  const [pendingConfirmation, setPendingConfirmation] =
    useState<PlatformConfirmationState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const syncPlatformState = (items: PlatformMonitorItem[]) => {
    setPlatformFormStateById((currentState) =>
      Object.fromEntries(
        items.map((platform) => [
          platform.platform.id,
          {
            ...createPlatformFormState(platform),
            newKeysText: currentState[platform.platform.id]?.newKeysText ?? "",
          },
        ]),
      ),
    );
    setPlatformKeysStateById((currentState) =>
      Object.fromEntries(
        items.map((platform) => [
          platform.platform.id,
          currentState[platform.platform.id] ?? createPlatformKeysState(),
        ]),
      ),
    );
  };

  const findPlatform = (platformId: number) =>
    platforms.find((platform) => platform.platform.id === platformId) ?? null;

  const updatePlatformForm = (
    platformId: number,
    updateForm: (currentState: PlatformFormState) => PlatformFormState,
  ) => {
    updateStateById(
      setPlatformFormStateById,
      platformId,
      createFormFallback(platformId),
      updateForm,
    );
  };

  const patchPlatformForm = (platformId: number, changes: Partial<PlatformFormState>) => {
    updatePlatformForm(platformId, (currentState) => ({ ...currentState, ...changes }));
  };

  const updatePlatformKeys = (
    platformId: number,
    updateKeys: (currentState: PlatformKeysState) => PlatformKeysState,
  ) => {
    updateStateById(
      setPlatformKeysStateById,
      platformId,
      createPlatformKeysState(),
      updateKeys,
    );
  };

  const patchPlatformKeys = (platformId: number, changes: Partial<PlatformKeysState>) => {
    updatePlatformKeys(platformId, (currentState) => ({ ...currentState, ...changes }));
  };

  const replacePlatform = (nextPlatform: PlatformMonitorItem) => {
    setPlatforms((currentPlatforms) =>
      currentPlatforms.map((platform) =>
        platform.platform.id === nextPlatform.platform.id ? nextPlatform : platform,
      ),
    );
  };

  const updatePlatformStock = (platformId: number, stock: StockSummary, listingId?: number) => {
    setPlatforms((currentPlatforms) =>
      currentPlatforms.map((platform) =>
        platform.platform.id !== platformId
          ? platform
          : {
              ...platform,
              stock,
              listingId: listingId ?? platform.listingId,
              hasListing: Boolean(listingId ?? platform.listingId),
            },
      ),
    );
  };

  const fetchPlatformKeysPage = async (platformId: number, page = 1) => {
    const platform = findPlatform(platformId);

    if (!platform?.listingId) return;

    try {
      patchPlatformKeys(platformId, { isLoading: true, error: "", page });

      const { data } = await api.get<PaginatedResponse<GameKey>>("/game-keys", {
        params: { listingId: platform.listingId, page, limit: keysPageSize },
      });

      patchPlatformKeys(platformId, {
        isLoading: false,
        items: data.items ?? [],
        meta: data.meta ?? emptyKeysMeta,
        page,
        selectedIds: [],
      });
    } catch (error) {
      patchPlatformKeys(platformId, {
        isLoading: false,
        items: [],
        meta: emptyKeysMeta,
        error: getApiErrorMessage(error, "Não foi possível carregar as keys."),
      });
    }
  };

  useEffect(() => {
    const fetchPlatformMonitor = async () => {
      if (!gameId) {
        setIsLoading(false);
        setErrorMessage("Jogo inválido.");
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage("");

        const { data } = await api.get<GamePlatformsResponse>(`/games/${gameId}/platforms`);
        setGame(data.game);
        setPlatforms(data.platforms ?? []);
        syncPlatformState(data.platforms ?? []);
      } catch (error) {
        setGame(null);
        setPlatforms([]);
        setErrorMessage(
          getApiErrorMessage(error, "Não foi possível carregar as plataformas do jogo."),
        );
      } finally {
        setIsLoading(false);
      }
    };

    void fetchPlatformMonitor();
  }, [gameId]);

  const openPlatformManagementModal = async (platformId: number) => {
    const platform = findPlatform(platformId);
    if (!platform) return;

    setPlatformBeingManaged(platformId);
    setPendingConfirmation(null);
    updatePlatformForm(platformId, () => createPlatformFormState(platform));

    if (!platform.listingId) {
      patchPlatformKeys(platformId, createPlatformKeysState());
      return;
    }

    await fetchPlatformKeysPage(platformId, 1);
  };

  const closePlatformManagementModal = () => {
    setPlatformBeingManaged(null);
    setPendingConfirmation(null);
  };

  const savePlatformSettings = async (platformId: number) => {
    const platform = findPlatform(platformId);
    const formState = platformFormStateById[platformId];

    if (!platform || !formState || !gameId) return;

    const parsedPrice = formState.price.trim() ? parsePlatformPrice(formState.price) : null;

    if (formState.price.trim() && parsedPrice === null) {
      patchPlatformForm(platformId, { error: "Informe um preço válido usando vírgula ou ponto." });
      return;
    }

    if (!platform.hasListing && parsedPrice === null) {
      patchPlatformForm(platformId, { error: "Informe um preço para configurar a plataforma." });
      return;
    }

    try {
      patchPlatformForm(platformId, { isSaving: true, error: "", success: "" });

      const payload: { price?: number; isActive: boolean } = { isActive: formState.isActive };
      if (parsedPrice !== null) {
        payload.price = parsedPrice;
      }

      const { data } = await api.put<PlatformMonitorItem>(
        `/games/${gameId}/platforms/${platformId}`,
        payload,
      );

      replacePlatform(data);
      updatePlatformForm(platformId, (currentState) => ({
        ...createPlatformFormState(data),
        newKeysText: currentState.newKeysText,
        success: "Plataforma salva.",
      }));
    } catch (error) {
      patchPlatformForm(platformId, {
        isSaving: false,
        error: getApiErrorMessage(error, "Não foi possível salvar a plataforma."),
      });
    }
  };

  const requestPlatformSettingsSave = (platformId: number) => {
    const platform = findPlatform(platformId);
    const formState = platformFormStateById[platformId];

    if (!platform || !formState) return;

    if (shouldWarnAboutGlobalPriceChange(platform, formState)) {
      setPendingConfirmation({ type: "priceChange", platformId });
      return;
    }

    void savePlatformSettings(platformId);
  };

  const addKeysToPlatform = async (platformId: number) => {
    const platform = findPlatform(platformId);
    const formState = platformFormStateById[platformId];

    if (!platform || !formState || !gameId) return;

    if (!platform.hasListing) {
      patchPlatformForm(platformId, { error: "Salve o preço antes de adicionar keys." });
      return;
    }

    const { keyValues, hasIncompleteKey } = getGameKeyValues(formState.newKeysText);

    if (!keyValues.length) {
      patchPlatformForm(platformId, { error: "Cole pelo menos uma key." });
      return;
    }

    if (hasIncompleteKey) {
      patchPlatformForm(platformId, {
        error: "Complete todas as keys no formato XXXX-XXXX-XXXX.",
      });
      return;
    }

    try {
      patchPlatformForm(platformId, { isAddingKeys: true, error: "", success: "" });

      const { data } = await api.post<SaveKeysResponse>(
        `/games/${gameId}/platforms/${platformId}/keys`,
        { keyValues },
      );

      updatePlatformStock(platformId, data.stock, data.listingId);
      updatePlatformForm(platformId, (currentState) => ({
        ...currentState,
        isAddingKeys: false,
        newKeysText: "",
        success: data.skippedCount
          ? `${data.createdCount} adicionadas, ${data.skippedCount} ignoradas.`
          : `${data.createdCount} adicionadas.`,
      }));
      await fetchPlatformKeysPage(platformId, 1);
    } catch (error) {
      patchPlatformForm(platformId, {
        isAddingKeys: false,
        error: getApiErrorMessage(error, "Não foi possível adicionar as keys."),
      });
    }
  };

  const toggleSelectedKey = (platformId: number, keyId: number) => {
    updatePlatformKeys(platformId, (currentState) => ({
      ...currentState,
      selectedIds: currentState.selectedIds.includes(keyId)
        ? currentState.selectedIds.filter((selectedId) => selectedId !== keyId)
        : [...currentState.selectedIds, keyId],
    }));
  };

  const removeSelectedPlatformKeys = async (platformId: number) => {
    const platform = findPlatform(platformId);
    const keysState = platformKeysStateById[platformId];

    if (!platform?.listingId || !keysState || keysState.selectedIds.length === 0) return;

    try {
      patchPlatformKeys(platformId, { isRemoving: true, error: "" });

      const { data } = await api.post<DeleteKeysResponse>("/game-keys/bulk-delete", {
        listingId: platform.listingId,
        ids: keysState.selectedIds,
      });

      updatePlatformStock(platformId, data.stock);
      await fetchPlatformKeysPage(platformId, keysState.page);
      updatePlatformForm(platformId, (currentState) => ({
        ...currentState,
        success: "Keys removidas.",
      }));
      updatePlatformKeys(platformId, (currentState) => ({
        ...currentState,
        isRemoving: false,
        selectedIds: [],
      }));
    } catch (error) {
      patchPlatformKeys(platformId, {
        isRemoving: false,
        error: getApiErrorMessage(error, "Não foi possível remover as keys."),
      });
    }
  };

  const requestSelectedKeysRemoval = (platformId: number) => {
    if ((platformKeysStateById[platformId]?.selectedIds.length ?? 0) > 0) {
      setPendingConfirmation({ type: "removeKeys", platformId });
    }
  };

  const confirmPendingAction = () => {
    if (!pendingConfirmation) return;

    const { platformId, type } = pendingConfirmation;
    setPendingConfirmation(null);
    void (type === "priceChange"
      ? savePlatformSettings(platformId)
      : removeSelectedPlatformKeys(platformId));
  };

  const availableKeysCount = platforms.reduce(
    (total, platform) => total + Number(platform.stock.available ?? 0),
    0,
  );
  const managedPlatform = platformBeingManaged === null ? null : findPlatform(platformBeingManaged);
  const managedPlatformId = managedPlatform?.platform.id ?? null;
  const managedPlatformFormState =
    managedPlatformId === null ? null : platformFormStateById[managedPlatformId] ?? null;
  const managedPlatformKeysState =
    managedPlatformId === null ? null : platformKeysStateById[managedPlatformId] ?? null;
  const selectedKeysCount =
    pendingConfirmation?.type === "removeKeys"
      ? platformKeysStateById[pendingConfirmation.platformId]?.selectedIds.length ?? 0
      : 0;

  return (
    <AdminLayout title="Plataformas" backTo="/admin/games" backLabel="Voltar para jogos">
      <AdminPageState
        loading={isLoading}
        error={errorMessage}
        isEmpty={platforms.length === 0}
        loadingText="Carregando plataformas..."
        emptyText="Nenhuma plataforma cadastrada no sistema."
      >
        <>
          <AdminGamePlatformsHeader
            gameTitle={game?.title}
            coverImageUrl={game?.coverImageUrl}
            availableKeysCount={availableKeysCount}
          />

          <section className="grid gap-4 xl:grid-cols-2">
            {platforms.map((platform) => (
              <AdminGamePlatformCard
                key={platform.platform.id}
                platform={platform}
                onManage={() => {
                  void openPlatformManagementModal(platform.platform.id);
                }}
              />
            ))}
          </section>

          {managedPlatform && managedPlatformFormState && managedPlatformKeysState && managedPlatformId !== null && (
            <AdminGamePlatformsModal
              platform={managedPlatform}
              formState={managedPlatformFormState}
              keysState={managedPlatformKeysState}
              pendingConfirmation={pendingConfirmation}
              selectedKeysCount={selectedKeysCount}
              onClose={closePlatformManagementModal}
              onPriceChange={(price) => patchPlatformForm(managedPlatformId, { price })}
              onActiveChange={(isActive) => patchPlatformForm(managedPlatformId, { isActive })}
              onSave={() => requestPlatformSettingsSave(managedPlatformId)}
              onNewKeysTextChange={(newKeysText) =>
                patchPlatformForm(managedPlatformId, { newKeysText })
              }
              onAddKeys={() => {
                void addKeysToPlatform(managedPlatformId);
              }}
              onRemoveSelected={() => requestSelectedKeysRemoval(managedPlatformId)}
              onToggleSelectedKey={(keyId) => toggleSelectedKey(managedPlatformId, keyId)}
              onPageChange={(page) => {
                void fetchPlatformKeysPage(managedPlatformId, page);
              }}
              onCancelConfirmation={() => setPendingConfirmation(null)}
              onConfirmConfirmation={confirmPendingAction}
            />
          )}
        </>
      </AdminPageState>
    </AdminLayout>
  );
}



