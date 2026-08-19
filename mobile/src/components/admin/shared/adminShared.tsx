import Ionicons from "@expo/vector-icons/Ionicons";
import { router, usePathname } from "expo-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { PaginationMeta } from "./admin.types";

export const adminColors = {
  canvas: "#020617",
  surface: "#0f172a",
  deep: "#020617",
  border: "#334155",
  softBorder: "#1e293b",
  white: "#ffffff",
  secondary: "#cbd5e1",
  muted: "#94a3b8",
  primary: "#2563eb",
  primarySoft: "rgba(37,99,235,0.14)",
  cyan: "#22d3ee",
  success: "#10b981",
  successSoft: "rgba(16,185,129,0.12)",
  danger: "#f43f5e",
  dangerSoft: "rgba(244,63,94,0.12)",
  warning: "#fbbf24",
};

export const adminStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: adminColors.canvas },
  scroll: { flex: 1 },
  content: { width: "100%", maxWidth: 1120, alignSelf: "center", padding: 20, paddingBottom: 48, gap: 16 },
  panel: { borderWidth: 1, borderColor: adminColors.softBorder, borderRadius: 24, backgroundColor: adminColors.deep, padding: 18, gap: 16 },
  card: { borderWidth: 1, borderColor: adminColors.softBorder, borderRadius: 18, backgroundColor: adminColors.surface, padding: 16 },
  title: { color: adminColors.white, fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
  description: { color: adminColors.secondary, fontSize: 14, lineHeight: 21 },
  sectionTitle: { color: adminColors.white, fontSize: 18, fontWeight: "700" },
  label: { color: "#f1f5f9", fontSize: 14, fontWeight: "600" },
  input: { minHeight: 48, borderWidth: 1, borderColor: adminColors.border, borderRadius: 12, backgroundColor: adminColors.surface, paddingHorizontal: 14, paddingVertical: 11, color: adminColors.white, fontSize: 15 },
  textArea: { minHeight: 110, textAlignVertical: "top" },
  muted: { color: adminColors.muted, fontSize: 13, lineHeight: 19 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});

export type AdminButtonTone = "primary" | "secondary" | "danger" | "subtleDanger";
export function AdminButton({
  children,
  tone = "primary",
  onPress,
  disabled = false,
  accessibilityLabel,
  style,
}: {
  children: ReactNode;
  tone?: AdminButtonTone;
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: object;
}) {
  const toneStyle = {
    primary: { backgroundColor: adminColors.primary, borderColor: adminColors.primary },
    secondary: { backgroundColor: adminColors.deep, borderColor: adminColors.border },
    danger: { backgroundColor: adminColors.danger, borderColor: adminColors.danger },
    subtleDanger: { backgroundColor: adminColors.dangerSoft, borderColor: "rgba(244,63,94,0.42)" },
  }[tone];
  const textColor = tone === "subtleDanger" ? "#fecdd3" : adminColors.white;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, toneStyle, disabled && styles.disabled, pressed && styles.pressed, style]}
    >
      {typeof children === "string" ? <Text style={[styles.buttonText, { color: textColor }]}>{children}</Text> : children}
    </Pressable>
  );
}

export function AdminLinkButton({ children, to, tone = "secondary", style }: { children: string; to: string; tone?: AdminButtonTone; style?: object }) {
  return <AdminButton tone={tone} onPress={() => router.push(to as never)} style={style}>{children}</AdminButton>;
}

function Field({ label, note, children }: { label: string; note?: string; children: ReactNode }) {
  return <View style={styles.field}><Text style={adminStyles.label}>{label}</Text>{children}{note ? <Text style={adminStyles.muted}>{note}</Text> : null}</View>;
}

export function AdminTextField({ label, value, onChangeText, placeholder, note, keyboardType, secureTextEntry, editable = true, autoCapitalize = "sentences" }: { label: string; value: string; onChangeText: (value: string) => void; placeholder?: string; note?: string; keyboardType?: "default" | "numeric" | "decimal-pad" | "email-address"; secureTextEntry?: boolean; editable?: boolean; autoCapitalize?: "none" | "sentences" | "words" | "characters" }) {
  return <Field label={label} note={note}><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#64748b" keyboardType={keyboardType} secureTextEntry={secureTextEntry} editable={editable} autoCapitalize={autoCapitalize} style={[adminStyles.input, !editable && styles.readonly]} /></Field>;
}

export function AdminTextareaField({ label, value, onChangeText, placeholder, note }: { label: string; value: string; onChangeText: (value: string) => void; placeholder?: string; note?: string }) {
  return <Field label={label} note={note}><TextInput multiline value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#64748b" style={[adminStyles.input, adminStyles.textArea]} /></Field>;
}

export function AdminSelectField({ label, value, options, onChange, note }: { label: string; value: string; options: { label: string; value: string }[]; onChange: (value: string) => void; note?: string }) {
  const [open, setOpen] = useState(false);
  const current = options.find((option) => option.value === value)?.label ?? "Selecione";
  return <>
    <Field label={label} note={note}><Pressable accessibilityRole="button" onPress={() => setOpen(true)} style={adminStyles.input}><Text style={{ color: value ? adminColors.white : adminColors.muted, fontSize: 15 }}>{current}</Text><Ionicons name="chevron-down" size={18} color={adminColors.muted} style={styles.selectIcon} /></Pressable></Field>
    <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
      <View style={styles.modalBackdrop}><View style={styles.selectModal}><Text style={adminStyles.sectionTitle}>{label}</Text><ScrollView style={{ maxHeight: 360 }}>{options.map((option) => <Pressable key={option.value} onPress={() => { onChange(option.value); setOpen(false); }} style={[styles.option, option.value === value && styles.optionSelected]}><Text style={{ color: adminColors.white, fontSize: 15 }}>{option.label}</Text>{option.value === value ? <Ionicons name="checkmark" size={18} color={adminColors.cyan} /> : null}</Pressable>)}</ScrollView><AdminButton tone="secondary" onPress={() => setOpen(false)}>Cancelar</AdminButton></View></View>
    </Modal>
  </>;
}

export function AdminReadonlyField({ label, value }: { label: string; value: string }) { return <Field label={label}><TextInput value={value} editable={false} style={[adminStyles.input, styles.readonly]} /></Field>; }
export function AdminToggleField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <Pressable accessibilityRole="switch" accessibilityState={{ checked }} onPress={() => onChange(!checked)} style={styles.toggleRow}><Text style={adminStyles.label}>{label}</Text><View style={[styles.toggle, checked && styles.toggleOn]}><View style={[styles.toggleKnob, checked && styles.toggleKnobOn]} /></View></Pressable>;
}
export function AdminNotice({ children, tone = "error" }: { children: ReactNode; tone?: "error" | "success" }) { return <View style={[styles.notice, tone === "success" ? styles.successNotice : styles.errorNotice]}><Ionicons name={tone === "success" ? "checkmark-circle-outline" : "alert-circle-outline"} size={20} color={tone === "success" ? "#6ee7b7" : "#fda4af"} /><Text style={tone === "success" ? styles.successText : styles.errorText}>{children}</Text></View>; }
export function AdminStatusBadge({ active, activeLabel = "Ativo", inactiveLabel = "Inativo" }: { active?: boolean; activeLabel?: string; inactiveLabel?: string }) { return <View style={[styles.badge, active === false ? styles.inactiveBadge : styles.activeBadge]}><Text style={{ color: active === false ? adminColors.secondary : "#bfdbfe", fontSize: 12, fontWeight: "700" }}>{active === false ? inactiveLabel : activeLabel}</Text></View>; }
export function AdminSideCard({ eyebrow, children }: { eyebrow: string; children: ReactNode }) { return <View style={adminStyles.card}><Text style={styles.eyebrow}>{eyebrow}</Text>{children}</View>; }

export function AdminPageState({ loading, error, isEmpty, loadingText, emptyText, children }: { loading: boolean; error?: string; isEmpty?: boolean; loadingText: string; emptyText: string; children: ReactNode }) {
  if (loading) return <View style={styles.state}><ActivityIndicator color={adminColors.cyan} /><Text style={adminStyles.muted}>{loadingText}</Text></View>;
  if (error) return <AdminNotice>{error}</AdminNotice>;
  if (isEmpty) return <View style={styles.empty}><Text style={adminStyles.muted}>{emptyText}</Text></View>;
  return children;
}

export function AdminPagination({ meta, onPageChange }: { meta: PaginationMeta; onPageChange: (page: number) => void }) {
  return <View style={styles.pagination}><AdminButton tone="secondary" disabled={meta.page <= 1} onPress={() => onPageChange(meta.page - 1)}>Anterior</AdminButton><Text style={adminStyles.muted}>Página {meta.page} de {Math.max(1, meta.totalPages)}</Text><AdminButton tone="secondary" disabled={meta.page >= meta.totalPages} onPress={() => onPageChange(meta.page + 1)}>Próxima</AdminButton></View>;
}

export function AdminFormActions({ onCancel, onSubmit, submitLabel, saving = false }: { onCancel: () => void; onSubmit: () => void; submitLabel: string; saving?: boolean }) { return <View style={adminStyles.wrap}><AdminButton disabled={saving} onPress={onSubmit}>{saving ? "Salvando..." : submitLabel}</AdminButton><AdminButton tone="secondary" onPress={onCancel}>Cancelar</AdminButton></View>; }
export const createEmptyMeta = (limit: number): PaginationMeta => ({ page: 1, limit, total: 0, totalPages: 1 });
export const formatMoney = (value: number | string = 0) => `R$ ${Number(value ?? 0).toFixed(2).replace(".", ",")}`;
export const formatDate = (value?: string | null) => value ? new Date(value).toLocaleDateString("pt-BR") : "-";
export const formatDateTime = (value?: string | null) => { if (!value) return "-"; const date = new Date(value); return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString("pt-BR"); };
export const formatReleaseDate = (value?: string) => value ? new Date(`${value}T00:00:00`).toLocaleDateString("pt-BR") : "-";
export const getKeyStatusColor = (status: string) => status === "sold" ? "#fda4af" : status === "reserved" ? "#fcd34d" : "#6ee7b7";

export default function AdminLayout({ title, description, children, backTo, actions }: { title: string; description?: string; children: ReactNode; backTo?: string; actions?: ReactNode }) {
  const { width } = useWindowDimensions();
  const pathname = usePathname();
  const compact = width < 600;
  const links = [
    { to: "/admin", label: "Visão geral" },
    { to: "/admin/games", label: "Jogos" },
    { to: "/admin/orders", label: "Pedidos" },
    { to: "/admin/ofertas", label: "Ofertas" },
    { to: "/admin/platforms", label: "Plataformas" },
    { to: "/admin/categories", label: "Categorias" },
    { to: "/admin/price-history", label: "Preços" },
  ];
  const activeLink = links.find((link) => pathname === link.to || (link.to !== "/admin" && pathname.startsWith(`${link.to}/`)))?.to ?? "/admin";
  const isAdminTabRoute = pathname === "/admin-tab" || pathname.startsWith("/admin-tab/");
  return <SafeAreaView style={adminStyles.screen} edges={["top", "bottom"]}><ScrollView style={adminStyles.scroll} contentContainerStyle={[adminStyles.content, compact && styles.contentCompact]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
    <View style={[adminStyles.panel, compact && styles.panelCompact]}>
      <View style={styles.adminSectionPicker}><AdminSelectField label="Seção administrativa" value={activeLink} options={links.map(({ label, to }) => ({ label, value: to }))} onChange={(to) => router.push(to as never)} /></View>
      <View style={[styles.header, compact && styles.headerCompact]}><View style={{ flex: 1, gap: 6 }}>{backTo ? <AdminButton tone="secondary" onPress={() => router.push(backTo as never)} style={styles.backButton}><Ionicons name="arrow-back" size={17} color={adminColors.secondary} /><Text style={styles.backText}>Voltar</Text></AdminButton> : null}<Text accessibilityRole="header" style={adminStyles.title}>{title}</Text>{description ? <Text style={adminStyles.description}>{description}</Text> : null}</View>{actions ? <View style={[styles.actions, compact && styles.actionsCompact]}>{actions}</View> : null}</View>
      {children}
    </View>
  </ScrollView>{!isAdminTabRoute ? <AdminBottomNav pathname={pathname} /> : null}</SafeAreaView>;
}

const adminBottomNavItems = [
  { path: "/(tabs)", label: "Início", icon: "home-outline" as const, activeIcon: "home" as const },
  { path: "/(tabs)/loja", label: "Loja", icon: "game-controller-outline" as const, activeIcon: "game-controller" as const },
  { path: "/(tabs)/carrinho", label: "Carrinho", icon: "cart-outline" as const, activeIcon: "cart" as const },
  { path: "/(tabs)/perfil", label: "Perfil", icon: "person-outline" as const, activeIcon: "person" as const },
  { path: "/admin", label: "Admin", icon: "shield-outline" as const, activeIcon: "shield" as const },
];

function AdminBottomNav({ pathname }: { pathname: string }) {
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => setKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => setKeyboardVisible(false));

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  if (keyboardVisible) return null;

  return <View style={styles.bottomNav} accessibilityRole="tablist">
    {adminBottomNavItems.map((item) => {
      const visiblePath = item.path.replace("/(tabs)", "") || "/";
      const isActive = item.path === "/admin" ? pathname.startsWith("/admin") : pathname === item.path || pathname === visiblePath;
      return <Pressable key={item.path} accessibilityRole="tab" accessibilityLabel={item.label} accessibilityState={{ selected: isActive }} onPress={() => router.replace(item.path as never)} style={({ pressed }) => [styles.bottomNavButton, isActive && styles.bottomNavButtonActive, pressed && styles.pressed]}>
        <Ionicons name={isActive ? item.activeIcon : item.icon} size={21} color={isActive ? adminColors.white : adminColors.muted} />
        {isActive ? <Text style={styles.bottomNavLabel}>{item.label}</Text> : null}
      </Pressable>;
    })}
  </View>;
}

export function AdminConfirmModal({ visible, title, message, onCancel, onConfirm, processing = false, tone = "primary" }: { visible: boolean; title: string; message: string; onCancel: () => void; onConfirm: () => void; processing?: boolean; tone?: AdminButtonTone }) {
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}><View style={styles.modalBackdrop}><View style={styles.confirmModal}><Text style={adminStyles.sectionTitle}>{title}</Text><Text style={[adminStyles.description, { marginTop: 10 }]}>{message}</Text><View style={[adminStyles.wrap, { justifyContent: "flex-end", marginTop: 14 }]}><AdminButton tone="secondary" disabled={processing} onPress={onCancel}>Cancelar</AdminButton><AdminButton tone={tone} disabled={processing} onPress={onConfirm}>{processing ? "Processando..." : "Confirmar"}</AdminButton></View></View></View></Modal>;
}

export function AdminSuccessToast({ title, message, onDismiss }: { title: string; message: string; onDismiss: () => void }) {
  useEffect(() => { const timer = setTimeout(onDismiss, 6000); return () => clearTimeout(timer); }, [onDismiss]);
  return <View style={styles.toast}><Text style={styles.toastTitle}>{title}</Text><Text style={styles.toastMessage}>{message}</Text></View>;
}

const styles = StyleSheet.create({
  button: { minHeight: 48, alignItems: "center", justifyContent: "center", borderWidth: 1, borderRadius: 12, paddingHorizontal: 16 },
  buttonText: { fontSize: 13, fontWeight: "700" },
  disabled: { opacity: 0.48 }, pressed: { opacity: 0.72 }, adminSectionPicker: { maxWidth: 420 },
  field: { gap: 8 }, readonly: { color: adminColors.muted, opacity: 0.78 },
  selectIcon: { position: "absolute", right: 14, top: 14 }, option: { minHeight: 48, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: adminColors.softBorder }, optionSelected: { backgroundColor: adminColors.primarySoft },
  modalBackdrop: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20, backgroundColor: "rgba(0,0,0,0.78)" }, selectModal: { width: "100%", maxWidth: 520, gap: 16, borderWidth: 1, borderColor: adminColors.softBorder, borderRadius: 20, backgroundColor: adminColors.deep, padding: 18 }, confirmModal: { width: "100%", maxWidth: 480, borderWidth: 1, borderColor: adminColors.softBorder, borderRadius: 20, backgroundColor: adminColors.deep, padding: 20 },
  toggleRow: { minHeight: 52, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, borderWidth: 1, borderColor: adminColors.softBorder, borderRadius: 14, backgroundColor: adminColors.surface, paddingHorizontal: 14 }, toggle: { width: 48, height: 28, justifyContent: "center", borderWidth: 1, borderColor: adminColors.border, borderRadius: 999, backgroundColor: adminColors.deep, padding: 3 }, toggleOn: { borderColor: "rgba(59,130,246,0.7)", backgroundColor: adminColors.primarySoft }, toggleKnob: { width: 20, height: 20, borderRadius: 10, backgroundColor: adminColors.muted }, toggleKnobOn: { alignSelf: "flex-end", backgroundColor: adminColors.white },
  notice: { flexDirection: "row", alignItems: "flex-start", gap: 10, borderWidth: 1, borderRadius: 12, padding: 13 }, errorNotice: { borderColor: "rgba(244,63,94,0.42)", backgroundColor: adminColors.dangerSoft }, successNotice: { borderColor: "rgba(16,185,129,0.42)", backgroundColor: adminColors.successSoft }, errorText: { flex: 1, color: "#fecdd3", fontSize: 14, lineHeight: 20 }, successText: { flex: 1, color: "#a7f3d0", fontSize: 14, lineHeight: 20 }, badge: { alignSelf: "flex-start", borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 }, activeBadge: { borderColor: "rgba(59,130,246,0.32)", backgroundColor: adminColors.primarySoft }, inactiveBadge: { borderColor: adminColors.border, backgroundColor: adminColors.deep }, eyebrow: { color: "#bfdbfe", fontSize: 11, fontWeight: "800", letterSpacing: 1.6, textTransform: "uppercase", marginBottom: 10 }, state: { minHeight: 130, alignItems: "center", justifyContent: "center", gap: 10 }, empty: { borderWidth: 1, borderColor: adminColors.softBorder, borderRadius: 16, backgroundColor: adminColors.surface, padding: 18 }, pagination: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }, contentCompact: { paddingHorizontal: 16 }, panelCompact: { borderWidth: 0, borderRadius: 0, padding: 0 }, header: { flexDirection: "row", alignItems: "flex-start", gap: 12 }, headerCompact: { flexDirection: "column" }, actions: { flexShrink: 1, alignItems: "flex-end", gap: 8 }, actionsCompact: { width: "100%", alignItems: "stretch" }, navButton: { minHeight: 44, paddingHorizontal: 13 }, backButton: { alignSelf: "flex-start", minHeight: 44, paddingHorizontal: 12, flexDirection: "row", gap: 7 }, backText: { color: adminColors.secondary, fontSize: 13, fontWeight: "700" }, bottomNav: { minHeight: 68, flexDirection: "row", alignItems: "center", justifyContent: "space-around", borderTopWidth: 1, borderTopColor: adminColors.softBorder, backgroundColor: adminColors.surface, paddingHorizontal: 6 }, bottomNavButton: { minHeight: 56, minWidth: 58, flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, borderRadius: 12 }, bottomNavButtonActive: { flexGrow: 1.45, backgroundColor: adminColors.primary, paddingHorizontal: 10 }, bottomNavLabel: { color: adminColors.white, fontSize: 12, fontWeight: "700" }, toast: { position: "absolute", top: 24, left: 20, right: 20, borderWidth: 1, borderColor: "rgba(16,185,129,0.45)", borderRadius: 16, backgroundColor: "#020617", padding: 16 }, toastTitle: { color: "#a7f3d0", fontSize: 13, fontWeight: "700" }, toastMessage: { color: adminColors.white, marginTop: 5, fontSize: 16, fontWeight: "800" },
});
