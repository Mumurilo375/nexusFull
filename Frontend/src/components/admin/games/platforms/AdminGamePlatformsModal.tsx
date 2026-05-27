import { useMemo, useRef } from "react";
import Pagination from "../../../globals/Pagination";
import { resolvePlatformLogoUrl } from "../../../../services/assets";
import {
  formatGameKeyValue,
  getGameKeyLineSections,
  getPastedGameKeyValues,
  keyColumnSize,
  keyGridBlockSize,
  keyGridColumnCount,
  pasteGameKeyLineText,
  sanitizePlatformPrice,
  updateGameKeyLineText,
} from "./AdminGamePlatforms.helpers";
import {
  AdminButton,
  AdminNotice,
  AdminTextField,
  AdminToggleField,
  getKeyStatusBadgeClass,
} from "../../shared/adminShared";
import type {
  PlatformConfirmationState,
  PlatformFormState,
  PlatformKeysState,
  PlatformMonitorItem,
} from "../../shared/admin.types";

type AdminGamePlatformsModalProps = {
  platform: PlatformMonitorItem;
  formState: PlatformFormState;
  keysState: PlatformKeysState;
  pendingConfirmation: PlatformConfirmationState | null;
  selectedKeysCount: number;
  onClose: () => void;
  onPriceChange: (value: string) => void;
  onActiveChange: (checked: boolean) => void;
  onSave: () => void;
  onNewKeysTextChange: (value: string) => void;
  onAddKeys: () => void;
  onRemoveSelected: () => void;
  onToggleSelectedKey: (keyId: number) => void;
  onPageChange: (page: number) => void;
  onCancelConfirmation: () => void;
  onConfirmConfirmation: () => void;
};

function PlatformKeysPanel({
  platform,
  formState,
  keysState,
  onNewKeysTextChange,
  onAddKeys,
  onRemoveSelected,
  onToggleSelectedKey,
  onPageChange,
}: Pick<
  AdminGamePlatformsModalProps,
  | "platform"
  | "formState"
  | "keysState"
  | "onNewKeysTextChange"
  | "onAddKeys"
  | "onRemoveSelected"
  | "onToggleSelectedKey"
  | "onPageChange"
>) {
  const gameKeyInputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const keyLineSections = useMemo(
    () => getGameKeyLineSections(formState.newKeysText),
    [formState.newKeysText],
  );

  const focusGameKeyInput = (lineIndex: number) => {
    requestAnimationFrame(() => {
      gameKeyInputRefs.current[lineIndex]?.focus();
    });
  };

  return (
    <>
      <section className="rounded-[24px] border border-slate-800 bg-slate-900/35 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white">Novas keys</h3>
            <p className="mt-1 text-xs text-slate-400">Formato XXXX-XXXX-XXXX</p>
          </div>
          <AdminButton
            type="button"
            disabled={formState.isAddingKeys || !platform.hasListing}
            onClick={onAddKeys}
          >
            {formState.isAddingKeys ? "Adicionando..." : "Adicionar"}
          </AdminButton>
        </div>

        <div className="mt-3 overflow-hidden rounded-[22px] border border-slate-700 bg-slate-950/80">
          {keyLineSections.map((gameKeyLineSection, keySectionIndex) => (
            <div
              key={keySectionIndex}
              className={keySectionIndex === 0 ? "" : "border-t border-slate-800"}
            >
              <div className="grid xl:grid-cols-3">
                {Array.from({ length: keyGridColumnCount }, (_, keyColumnIndex) => {
                  const keyColumnLines = gameKeyLineSection.slice(
                    keyColumnIndex * keyColumnSize,
                    keyColumnIndex * keyColumnSize + keyColumnSize,
                  );

                  return (
                    <div
                      key={keyColumnIndex}
                      className={keyColumnIndex === 0 ? "" : "xl:border-l xl:border-slate-800"}
                    >
                      {keyColumnLines.map((keyLineValue, keyLineIndex) => {
                        const lineIndex =
                          keySectionIndex * keyGridBlockSize +
                          keyColumnIndex * keyColumnSize +
                          keyLineIndex;

                        return (
                          <div
                            key={lineIndex}
                            className={keyLineIndex === 0 ? "" : "border-t border-slate-800"}
                          >
                            <input
                              ref={(inputElement) => {
                                gameKeyInputRefs.current[lineIndex] = inputElement;
                              }}
                              type="text"
                              value={keyLineValue}
                              placeholder={lineIndex === 0 ? "AAAA-BBBB-CCCC" : ""}
                              onChange={({ target }) => {
                                const nextValue = formatGameKeyValue(target.value);

                                onNewKeysTextChange(
                                  updateGameKeyLineText(formState.newKeysText, lineIndex, nextValue),
                                );

                                if (nextValue.replace(/[^A-Z0-9]/g, "").length === 12) {
                                  focusGameKeyInput(lineIndex + 1);
                                }
                              }}
                              onPaste={(event) => {
                                event.preventDefault();
                                const pastedText = event.clipboardData.getData("text");
                                const pastedKeyValues = getPastedGameKeyValues(pastedText);

                                onNewKeysTextChange(
                                  pasteGameKeyLineText(formState.newKeysText, lineIndex, pastedText),
                                );
                                focusGameKeyInput(lineIndex + Math.max(pastedKeyValues.length, 1));
                              }}
                              className="w-full border-0 bg-transparent px-4 py-4 font-mono text-xs uppercase tracking-[0.14em] text-white outline-none placeholder:text-slate-600"
                            />
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {!platform.hasListing && (
          <p className="mt-3 text-sm text-slate-400">Salve o preço para liberar o estoque.</p>
        )}
      </section>

      <section className="rounded-[24px] border border-slate-800 bg-slate-900/35 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white">Keys cadastradas</h3>
            <p className="mt-1 text-xs text-slate-400">{keysState.meta.total} no estoque</p>
          </div>
          <AdminButton
            type="button"
            tone="subtleDanger"
            disabled={keysState.isRemoving || keysState.selectedIds.length === 0}
            onClick={onRemoveSelected}
          >
            {keysState.isRemoving ? "Removendo..." : "Remover selecionadas"}
          </AdminButton>
        </div>

        {keysState.error && (
          <div className="mt-3">
            <AdminNotice>{keysState.error}</AdminNotice>
          </div>
        )}

        {keysState.isLoading ? (
          <p className="mt-3 text-sm text-slate-300">Carregando keys...</p>
        ) : keysState.items.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-slate-800 bg-slate-900/45 p-4 text-sm text-slate-300">
            Nenhuma key cadastrada.
          </p>
        ) : (
          <div className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
            {keysState.items.map((gameKey) => (
              <label
                key={gameKey.id}
                className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/45 p-3"
              >
                <input
                  type="checkbox"
                  checked={keysState.selectedIds.includes(gameKey.id)}
                  disabled={gameKey.status !== "available"}
                  onChange={() => onToggleSelectedKey(gameKey.id)}
                />
                <span className="break-all rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 font-mono text-xs tracking-[0.18em] text-white">
                  {formatGameKeyValue(gameKey.keyValue)}
                </span>
                <span className={getKeyStatusBadgeClass(gameKey.status)}>{gameKey.status}</span>
              </label>
            ))}
          </div>
        )}

        <Pagination
          page={keysState.page}
          totalPages={keysState.meta.totalPages}
          scrollToTop={false}
          onPageChange={onPageChange}
        />
      </section>
    </>
  );
}

function PlatformConfirmModal({
  title,
  message,
  confirmLabel,
  tone = "primary",
  onCancel,
  onConfirm,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  tone?: "primary" | "danger";
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/75 px-4 py-6">
      <div className="w-full max-w-md rounded-[28px] border border-slate-800 bg-slate-950 p-5 shadow-[0_30px_80px_rgba(2,6,23,0.6)]">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-300">{message}</p>
        <div className="mt-5 flex flex-wrap justify-end gap-3">
          <AdminButton type="button" tone="secondary" onClick={onCancel}>
            Cancelar
          </AdminButton>
          <AdminButton type="button" tone={tone === "danger" ? "danger" : "primary"} onClick={onConfirm}>
            {confirmLabel}
          </AdminButton>
        </div>
      </div>
    </div>
  );
}

export default function AdminGamePlatformsModal({
  platform,
  formState,
  keysState,
  pendingConfirmation,
  selectedKeysCount,
  onClose,
  onPriceChange,
  onActiveChange,
  onSave,
  onNewKeysTextChange,
  onAddKeys,
  onRemoveSelected,
  onToggleSelectedKey,
  onPageChange,
  onCancelConfirmation,
  onConfirmConfirmation,
}: AdminGamePlatformsModalProps) {
  return (
    <>
      <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 px-4 py-6">
        <div className="flex max-h-[75vh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-slate-800 bg-slate-950 shadow-[0_30px_80px_rgba(2,6,23,0.6)]">
          <div className="flex items-center justify-between gap-4 border-b border-slate-800 p-5">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/90 p-2">
                <img
                  src={resolvePlatformLogoUrl(platform.platform.name, platform.platform.iconUrl)}
                  alt={platform.platform.name}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-xl font-semibold text-white">
                  {platform.platform.name}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  {platform.stock.available} keys disponíveis
                </p>
              </div>
            </div>

            <AdminButton type="button" tone="secondary" onClick={onClose}>
              Fechar
            </AdminButton>
          </div>

          <div className="overflow-y-auto p-5">
            <div className="grid gap-4 xl:grid-cols-[240px_minmax(0,1fr)]">
              <section className="space-y-4">
                <div className="rounded-[24px] border border-slate-800 bg-slate-900/35 p-4">
                  <div className="max-w-[180px]">
                    <AdminTextField
                      label="Preço"
                      type="text"
                      inputMode="decimal"
                      placeholder="10,00"
                      value={formState.price}
                      onChange={({ target }) => onPriceChange(sanitizePlatformPrice(target.value))}
                    />
                  </div>

                  <div className="mt-3">
                    <AdminToggleField
                      label="Plataforma ativa"
                      checked={formState.isActive}
                      onChange={onActiveChange}
                    />
                  </div>

                  <AdminButton type="button" className="mt-3 w-full" disabled={formState.isSaving} onClick={onSave}>
                    {formState.isSaving ? "Salvando..." : "Salvar"}
                  </AdminButton>
                </div>
              </section>

              <div className="grid gap-4">
                {(formState.error || formState.success) && (
                  <div className="grid gap-3">
                    {formState.error && <AdminNotice>{formState.error}</AdminNotice>}
                    {formState.success && <AdminNotice tone="success">{formState.success}</AdminNotice>}
                  </div>
                )}

                <PlatformKeysPanel
                  platform={platform}
                  formState={formState}
                  keysState={keysState}
                  onNewKeysTextChange={onNewKeysTextChange}
                  onAddKeys={onAddKeys}
                  onRemoveSelected={onRemoveSelected}
                  onToggleSelectedKey={onToggleSelectedKey}
                  onPageChange={onPageChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {pendingConfirmation && (
        <PlatformConfirmModal
          title={
            pendingConfirmation.type === "priceChange"
              ? "Confirmar novo preço"
              : "Remover keys selecionadas"
          }
          message={
            pendingConfirmation.type === "priceChange"
              ? `Esse novo preço será aplicado a todas as keys existentes e futuras de ${platform.platform.name}.`
              : `${selectedKeysCount} key(s) disponível(is) selecionada(s) será(ão) removida(s) agora.`
          }
          confirmLabel={
            pendingConfirmation.type === "priceChange" ? "Salvar novo preço" : "Remover keys"
          }
          tone={pendingConfirmation.type === "priceChange" ? "primary" : "danger"}
          onCancel={onCancelConfirmation}
          onConfirm={onConfirmConfirmation}
        />
      )}
    </>
  );
}



