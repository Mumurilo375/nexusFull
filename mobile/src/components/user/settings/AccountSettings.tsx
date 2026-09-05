import { Text, TextInput } from "@/src/components/ui/Typography";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../contexts/useAuth";
import { resolveAssetUrl } from "../../../services/assets";
import api from "../../../services/api";
import { getApiErrorMessage } from "../../../services/http";
import { getImageFileName } from "../../../services/image-upload";
import { LogoutConfirmModal } from "../../globals/LogoutConfirmModal";
import {
  buildPasswordFormData,
  buildUserFormData,
  EMAIL_PATTERN,
  formatCpf,
  getPasswordError,
  isValidCpf,
  type AvatarFile,
} from "../userForm.utils";
import type { UserProfile } from "./accountSettings.types";

type AccountFormValues = {
  fullName: string;
  username: string;
  cpf: string;
  email: string;
  password: string;
  confirmPassword: string;
  avatarFile: AvatarFile | null;
};

type FlashMessage = {
  kind: "success" | "error";
  text: string;
  target: "profile" | "password";
};

const emptyAccountForm: AccountFormValues = {
  fullName: "",
  username: "",
  cpf: "",
  email: "",
  password: "",
  confirmPassword: "",
  avatarFile: null,
};

export default function AccountSettings() {
  const { isAuthenticated, isReady, logout, syncUser, user: authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submittingTarget, setSubmittingTarget] = useState<"profile" | "password" | null>(null);
  const [isPickingImage, setIsPickingImage] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [feedbackTarget, setFeedbackTarget] = useState<"profile" | "password">("profile");
  const [flashMessage, setFlashMessage] = useState<FlashMessage | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [formValues, setFormValues] = useState(emptyAccountForm);
  const [avatarPreview, setAvatarPreview] = useState(resolveAssetUrl(authUser?.avatarUrl));

  useEffect(() => {
    const loadProfile = async () => {
      if (!authUser?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setErrorMessage("");
        const data = await api.get<UserProfile>(`/users/${authUser.id}`);
        const savedAvatarUrl = data.avatarUrl ?? authUser.avatarUrl ?? null;

        setFormValues({
          fullName: data.fullName ?? "",
          username: data.username ?? "",
          cpf: formatCpf(data.cpf ?? ""),
          email: data.email ?? authUser.email ?? "",
          password: "",
          confirmPassword: "",
          avatarFile: null,
        });
        setAvatarPreview(resolveAssetUrl(savedAvatarUrl));
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error, "Não foi possível carregar seus dados."));
      } finally {
        setLoading(false);
      }
    };

    if (isReady && isAuthenticated) {
      void loadProfile();
    }
  }, [authUser?.avatarUrl, authUser?.email, authUser?.id, isAuthenticated, isReady]);

  if (!isReady) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated || !authUser) {
    return <AccessRequiredScreen />;
  }

  const profileLabel = formValues.fullName || authUser.username || "Usuário Nexus";

  const updateFormValue = (field: keyof Omit<AccountFormValues, "avatarFile">) => (value: string) => {
    setFormValues((currentValues) => ({ ...currentValues, [field]: value }));
    setErrorMessage("");
    setFlashMessage(null);
  };

  const handleChooseAvatar = async () => {
    try {
      setFeedbackTarget("profile");
      setIsPickingImage(true);
      setErrorMessage("");
      setFlashMessage(null);

      if (Platform.OS !== "web") {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          setErrorMessage("Permita o acesso às suas fotos para escolher uma imagem de perfil.");
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      if (!asset) {
        setErrorMessage("Não foi possível identificar a imagem escolhida. Tente novamente.");
        return;
      }
      const mimeType = asset.mimeType?.toLowerCase() ?? "image/jpeg";
      const name = asset.fileName ?? getImageFileName("avatar", mimeType);
      setFormValues((currentValues) => ({
        ...currentValues,
        avatarFile: {
          uri: asset.uri,
          mimeType,
          name,
          file: asset.file,
        },
      }));
      setAvatarPreview(asset.uri);
    } catch {
      setErrorMessage("Não foi possível abrir suas fotos agora. Tente novamente.");
    } finally {
      setIsPickingImage(false);
    }
  };

  const handleSubmit = async (target: "profile" | "password") => {
    setFeedbackTarget(target);
    const password = formValues.password;
    const confirmPassword = formValues.confirmPassword;

    if (target === "profile") {
      const fullName = formValues.fullName.trim();
      const username = formValues.username.trim();

      if (!fullName || !username || !formValues.cpf.trim()) {
        setErrorMessage("Preencha os campos obrigatórios: nome, usuário e CPF.");
        return;
      }

      if (!EMAIL_PATTERN.test(formValues.email)) {
        setErrorMessage("O email exibido está inválido.");
        return;
      }

      if (!isValidCpf(formValues.cpf)) {
        setErrorMessage("CPF inválido.");
        return;
      }
    }

    if (target === "password" && !password && !confirmPassword) {
      setErrorMessage("Digite e confirme a nova senha.");
      setFlashMessage({ kind: "error", text: "Digite e confirme a nova senha.", target });
      return;
    }

    if (target === "password") {
      const passwordError = getPasswordError(password);
      if (passwordError) {
        setErrorMessage(passwordError);
        return;
      }

      if (password !== confirmPassword) {
        setErrorMessage("As senhas não conferem.");
        return;
      }
    }

    try {
      setSubmittingTarget(target);
      setErrorMessage("");
      const data = await api.put<UserProfile>(
        `/users/${authUser.id}`,
        target === "password"
          ? buildPasswordFormData(password)
          : buildUserFormData({
              fullName: formValues.fullName.trim(),
              username: formValues.username.trim(),
              cpf: formValues.cpf,
              avatarFile: formValues.avatarFile,
            }),
      );
      const savedAvatarUrl = data.avatarUrl ?? null;

      await syncUser({
        id: data.id,
        email: data.email,
        username: data.username,
        avatarUrl: savedAvatarUrl,
        roles: data.roles ?? [],
        permissions: data.permissions ?? [],
      });
      setFormValues((currentValues) => ({
        ...currentValues,
        fullName: data.fullName ?? currentValues.fullName,
        username: data.username ?? currentValues.username,
        cpf: formatCpf(data.cpf ?? currentValues.cpf),
        email: data.email ?? currentValues.email,
        password: target === "password" ? "" : currentValues.password,
        confirmPassword: target === "password" ? "" : currentValues.confirmPassword,
        avatarFile: null,
      }));
      setAvatarPreview(resolveAssetUrl(savedAvatarUrl));
      setFlashMessage({ kind: "success", text: target === "password" ? "Sua senha foi atualizada." : "Seus dados pessoais foram atualizados.", target });
    } catch (error) {
      const message = getApiErrorMessage(error, "Não foi possível atualizar seus dados agora. Tente novamente.");
      setErrorMessage(message);
      setFlashMessage({ kind: "error", text: message, target });
    } finally {
      setSubmittingTarget(null);
    }
  };

  const handleLogout = async () => {
    try {
      setShowLogoutConfirmation(false);
      setIsSigningOut(true);
      await logout();
      router.replace("/login");
    } finally {
      setIsSigningOut(false);
    }
  };

  const confirmLogout = () => {
    if (isSigningOut) return;
    setShowLogoutConfirmation(true);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <KeyboardAvoidingView style={styles.keyboardAvoider} behavior={Platform.select({ ios: "padding", default: undefined })}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.pageHeader}>
            <Text accessibilityRole="header" style={styles.title}>Configurações da conta</Text>
          </View>

          {loading ? <LoadingScreen /> : (
            <View style={styles.panel}>
              <View style={styles.profileSection}>
                <View style={styles.profileOverview}>
                  {avatarPreview ? (
                    <Image source={{ uri: avatarPreview }} accessibilityLabel="Preview da foto" onError={() => setAvatarPreview("")} style={styles.avatar} />
                  ) : (
                    <View accessibilityLabel="Sem foto de perfil" style={styles.emptyAvatar}><Text style={styles.emptyAvatarText}>Sem foto</Text></View>
                  )}
                  <View style={styles.profileText}>
                    <Text style={styles.profileName}>{profileLabel}</Text>
                    <Text style={styles.profileDescription}>Gerencie suas informações e preferências da conta.</Text>
                  </View>
                </View>

                <View style={styles.photoCard}>
                  <View style={styles.photoCardHeading}>
                    <View style={styles.photoIcon}><Ionicons name="image-outline" size={20} color="#60a5fa" /></View>
                    <View style={styles.photoHeadingText}>
                      <Text style={styles.photoTitle}>Foto de perfil</Text>
                      <Text style={styles.photoDescription}>JPG, PNG ou WEBP · até 5 MB.</Text>
                    </View>
                  </View>
                  <Pressable accessibilityRole="button" accessibilityLabel="Escolher imagem de perfil" accessibilityState={{ disabled: isPickingImage }} disabled={isPickingImage} onPress={() => void handleChooseAvatar()} style={({ pressed }) => [styles.imageButton, (pressed || isPickingImage) && styles.buttonPressed]}>
                    {isPickingImage ? <ActivityIndicator color="#e2e8f0" /> : <><Ionicons name="cloud-upload-outline" size={18} color="#e2e8f0" /><Text style={styles.imageButtonText}>Trocar foto</Text></>}
                  </Pressable>
                </View>
              </View>

              <View style={styles.form}>
                {flashMessage?.target === "profile" ? <FeedbackMessage message={flashMessage} /> : null}
                {errorMessage && feedbackTarget === "profile" && flashMessage?.text !== errorMessage ? <FeedbackMessage message={{ kind: "error", text: errorMessage, target: "profile" }} /> : null}
                <View style={styles.settingsSectionFirst}>
                  <Text style={styles.sectionTitle}>Dados pessoais</Text>
                  <Text style={styles.sectionDescription}>Atualize como sua conta aparece no Nexus.</Text>
                  <Field label="Nome completo" value={formValues.fullName} onChangeText={updateFormValue("fullName")} editable={!submittingTarget} autoComplete="name" maxLength={120} />
                  <Field label="Nome de usuário" value={formValues.username} onChangeText={updateFormValue("username")} editable={!submittingTarget} autoCapitalize="none" autoCorrect={false} maxLength={50} />
                  <Field label="CPF" value={formValues.cpf} onChangeText={(value) => { setFormValues((currentValues) => ({ ...currentValues, cpf: formatCpf(value) })); setErrorMessage(""); setFlashMessage(null); }} editable={!submittingTarget} keyboardType="numeric" maxLength={14} />
                  <Field label="Email" value={formValues.email} editable={false} keyboardType="email-address" autoCapitalize="none" />
                  <Pressable accessibilityRole="button" accessibilityLabel="Salvar dados pessoais" accessibilityState={{ disabled: Boolean(submittingTarget), busy: submittingTarget === "profile" }} disabled={Boolean(submittingTarget)} onPress={() => void handleSubmit("profile")} style={({ pressed }) => [styles.saveButton, (pressed || Boolean(submittingTarget)) && styles.buttonPressed]}>{submittingTarget === "profile" ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.saveButtonText}>Salvar dados pessoais</Text>}</Pressable>
                </View>
              </View>

              <View style={styles.securityPanel}>
                <View style={styles.securityHeader}>
                  <View style={styles.securityIcon}><Ionicons name="lock-closed-outline" size={20} color="#94a3b8" /></View>
                  <View style={styles.securityCopy}><Text style={styles.sectionTitle}>Senha e segurança</Text><Text style={styles.sectionDescription}>Altere sua senha apenas quando necessário.</Text></View>
                  <Pressable accessibilityRole="button" accessibilityLabel={showPasswordForm ? "Fechar alteração de senha" : "Alterar senha"} accessibilityState={{ expanded: showPasswordForm }} onPress={() => { setShowPasswordForm((current) => !current); setErrorMessage(""); setFlashMessage(null); }} style={({ pressed }) => [styles.passwordToggle, pressed && styles.buttonPressed]}><Text style={styles.passwordToggleText}>{showPasswordForm ? "Fechar" : "Alterar senha"}</Text><Ionicons name={showPasswordForm ? "chevron-up" : "chevron-down"} size={16} color="#94a3b8" /></Pressable>
                </View>
                {showPasswordForm ? <View style={styles.passwordFields}>
                  {flashMessage?.target === "password" ? <FeedbackMessage message={flashMessage} /> : null}
                  {errorMessage && feedbackTarget === "password" && flashMessage?.text !== errorMessage ? <FeedbackMessage message={{ kind: "error", text: errorMessage, target: "password" }} /> : null}
                  <Field label="Nova senha" value={formValues.password} onChangeText={updateFormValue("password")} editable={!submittingTarget} secureTextEntry autoComplete="new-password" maxLength={128} placeholder="Digite sua nova senha" />
                  <Field label="Confirmar nova senha" value={formValues.confirmPassword} onChangeText={updateFormValue("confirmPassword")} editable={!submittingTarget} secureTextEntry autoComplete="new-password" maxLength={128} placeholder="Repita a nova senha" returnKeyType="done" onSubmitEditing={() => void handleSubmit("password")} />
                  <Text style={styles.passwordHint}>Mínimo de 8 caracteres, com maiúscula, minúscula, número e caractere especial.</Text>
                  <Pressable accessibilityRole="button" accessibilityLabel="Atualizar senha" accessibilityState={{ disabled: Boolean(submittingTarget), busy: submittingTarget === "password" }} disabled={Boolean(submittingTarget)} onPress={() => void handleSubmit("password")} style={({ pressed }) => [styles.secondarySaveButton, (pressed || Boolean(submittingTarget)) && styles.buttonPressed]}>{submittingTarget === "password" ? <ActivityIndicator color="#bfdbfe" /> : <Text style={styles.secondarySaveButtonText}>Atualizar senha</Text>}</Pressable>
                </View> : null}
              </View>

              <View style={styles.quickLinksSection}>
                <Text style={styles.quickLinksTitle}>Sua conta</Text>
                <Text style={styles.quickLinksDescription}>Acesse rapidamente suas compras e jogos salvos.</Text>
                <View style={styles.quickLinksList}>
                  <AccountShortcut icon="key-outline" title="Biblioteca e keys" description="Consulte suas keys entregues" onPress={() => router.push("/biblioteca" as never)} />
                  <AccountShortcut icon="receipt-outline" title="Meus pedidos" description="Acompanhe pedidos e detalhes" onPress={() => router.push("/pedidos" as never)} />
                  <AccountShortcut icon="time-outline" title="Histórico de compras" description="Revise suas compras anteriores" onPress={() => router.push("/historico" as never)} />
                  <AccountShortcut icon="heart-outline" title="Favoritos" description="Veja os jogos que você salvou" onPress={() => router.push("/favoritos" as never)} />
                </View>
              </View>

              <View style={styles.logoutSection}>
                <Text style={styles.logoutTitle}>Sessão</Text>
                <Text style={styles.logoutDescription}>Encerre a sessão deste dispositivo quando terminar.</Text>
                <Pressable accessibilityRole="button" accessibilityLabel="Sair da conta" accessibilityState={{ disabled: isSigningOut, busy: isSigningOut }} disabled={isSigningOut} onPress={confirmLogout} style={({ pressed }) => [styles.logoutButton, (pressed || isSigningOut) && styles.buttonPressed]}>{isSigningOut ? <ActivityIndicator color="#fecdd3" /> : <><Ionicons name="log-out-outline" size={19} color="#fecdd3" /><Text style={styles.logoutButtonText}>Sair da conta</Text></>}</Pressable>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
      <LogoutConfirmModal visible={showLogoutConfirmation} processing={isSigningOut} onCancel={() => setShowLogoutConfirmation(false)} onConfirm={() => void handleLogout()} />
    </SafeAreaView>
  );
}

function LoadingScreen() {
  return <View style={styles.loading}><ActivityIndicator color="#60a5fa" /></View>;
}

function AccessRequiredScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.accessRequiredContent}>
        <View style={styles.accessRequiredPanel}>
          <View style={styles.accessRequiredIcon}>
            <Ionicons name="lock-closed-outline" size={28} color="#60a5fa" />
          </View>
          <Text accessibilityRole="header" style={styles.accessRequiredTitle}>Entre para acessar seu perfil</Text>
          <Text style={styles.accessRequiredDescription}>
            Você está deslogado. Faça login para gerenciar seus dados e preferências da conta.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Abrir tela de login"
            onPress={() => router.push({ pathname: "/login", params: { from: "/(tabs)/perfil" } })}
            style={({ pressed }) => [styles.accessRequiredButton, pressed && styles.buttonPressed]}
          >
            <Ionicons name="log-in-outline" size={19} color="#ffffff" />
            <Text style={styles.accessRequiredButtonText}>Abrir tela de login</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function FeedbackMessage({ message }: { message: FlashMessage }) {
  const isSuccess = message.kind === "success";
  return <View accessibilityLiveRegion="polite" style={[styles.feedback, isSuccess ? styles.successFeedback : styles.errorFeedback]}><Ionicons name={isSuccess ? "checkmark-circle-outline" : "alert-circle-outline"} size={20} color={isSuccess ? "#6ee7b7" : "#fda4af"} /><Text style={[styles.feedbackText, isSuccess ? styles.successText : styles.errorText]}>{message.text}</Text></View>;
}

type FieldProps = React.ComponentProps<typeof TextInput> & { label: string };

function Field({ label, editable = true, ...props }: FieldProps) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput accessibilityLabel={label} editable={editable} placeholderTextColor="#64748b" style={[styles.input, !editable && styles.disabledInput]} {...props} /></View>;
}

function AccountShortcut({ icon, title, description, onPress }: { icon: React.ComponentProps<typeof Ionicons>["name"]; title: string; description: string; onPress: () => void }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.quickLink, pressed && styles.buttonPressed]}><View style={styles.quickLinkIcon}><Ionicons name={icon} size={20} color="#67e8f9" /></View><View style={styles.quickLinkCopy}><Text style={styles.quickLinkTitle}>{title}</Text><Text style={styles.quickLinkDescription}>{description}</Text></View><Ionicons name="chevron-forward" size={18} color="#64748b" /></Pressable>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#020617" },
  keyboardAvoider: { flex: 1 },
  content: { flexGrow: 1, padding: 20, paddingBottom: 44 },
  pageHeader: { width: "100%", maxWidth: 680, alignSelf: "center", marginBottom: 20 },
  title: { color: "#ffffff", fontSize: 26, fontWeight: "700", letterSpacing: -0.4 },
  panel: { width: "100%", maxWidth: 680, alignSelf: "center", gap: 18 },
  profileSection: { gap: 16, borderWidth: 1, borderColor: "#1e293b", borderRadius: 16, backgroundColor: "#0f172a", padding: 20 },
  profileOverview: { flexDirection: "row", alignItems: "center", gap: 16 },
  avatar: { width: 92, height: 92, borderRadius: 46, borderWidth: 1, borderColor: "rgba(16,185,129,0.4)", backgroundColor: "#020617" },
  emptyAvatar: { width: 92, height: 92, alignItems: "center", justifyContent: "center", borderRadius: 46, borderWidth: 1, borderColor: "#334155", backgroundColor: "#020617" },
  emptyAvatarText: { color: "#94a3b8", fontSize: 12 },
  profileText: { flex: 1 },
  profileName: { color: "#ffffff", fontSize: 22, fontWeight: "700", letterSpacing: -0.35 },
  profileDescription: { marginTop: 7, color: "#cbd5e1", fontSize: 14, lineHeight: 20 },
  photoCard: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 12, borderWidth: 1, borderColor: "#1e293b", borderRadius: 16, backgroundColor: "#020617", padding: 14 },
  photoCardHeading: { minWidth: 180, flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  photoIcon: { width: 38, height: 38, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#1e293b", borderRadius: 11, backgroundColor: "#0f172a" },
  photoHeadingText: { flex: 1 },
  photoTitle: { color: "#f1f5f9", fontSize: 14, fontWeight: "700" },
  photoDescription: { marginTop: 3, color: "#cbd5e1", fontSize: 12, lineHeight: 18 },
  imageButton: { minWidth: 132, minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1, borderColor: "#334155", borderRadius: 12, backgroundColor: "#0f172a", paddingHorizontal: 14 },
  imageButtonText: { color: "#e2e8f0", fontSize: 13, fontWeight: "700" },
  quickLinksSection: { gap: 8, borderWidth: 1, borderColor: "#1e293b", borderRadius: 16, backgroundColor: "#0f172a", padding: 16 },
  quickLinksTitle: { color: "#ffffff", fontSize: 18, fontWeight: "800" },
  quickLinksDescription: { color: "#94a3b8", fontSize: 13, lineHeight: 19 },
  quickLinksList: { marginTop: 4, borderTopWidth: 1, borderTopColor: "#1e293b" },
  quickLink: { minHeight: 68, paddingVertical: 10, flexDirection: "row", alignItems: "center", gap: 11, borderBottomWidth: 1, borderBottomColor: "#1e293b" },
  quickLinkIcon: { width: 38, height: 38, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(34,211,238,0.32)", borderRadius: 11, backgroundColor: "rgba(8,145,178,0.1)" },
  quickLinkCopy: { flex: 1 },
  quickLinkTitle: { color: "#f8fafc", fontSize: 14, fontWeight: "800" },
  quickLinkDescription: { marginTop: 3, color: "#94a3b8", fontSize: 12 },
  form: { gap: 16, borderWidth: 1, borderColor: "#1e293b", borderRadius: 16, backgroundColor: "#0f172a", padding: 20 },
  settingsSectionFirst: { gap: 14 },
  securityPanel: { gap: 16, borderWidth: 1, borderColor: "#1e293b", borderRadius: 16, backgroundColor: "#0f172a", padding: 18 },
  securityHeader: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 11 },
  securityIcon: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#334155", borderRadius: 12, backgroundColor: "#020617" },
  securityCopy: { minWidth: 170, flex: 1 },
  passwordToggle: { minHeight: 44, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, borderWidth: 1, borderColor: "#334155", borderRadius: 12, backgroundColor: "#020617" },
  passwordToggleText: { color: "#cbd5e1", fontSize: 12, lineHeight: 17, fontWeight: "700" },
  passwordFields: { gap: 14, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#1e293b" },
  sectionTitle: { color: "#f8fafc", fontSize: 18, fontWeight: "800" },
  sectionDescription: { maxWidth: 460, marginTop: 4, color: "#94a3b8", fontSize: 13, lineHeight: 19 },
  field: { gap: 8 },
  label: { color: "#f1f5f9", fontSize: 14, fontWeight: "600" },
  input: { minHeight: 50, borderWidth: 1, borderColor: "#334155", borderRadius: 12, backgroundColor: "#0f172a", paddingHorizontal: 15, color: "#ffffff", fontSize: 16 },
  disabledInput: { borderColor: "#1e293b", backgroundColor: "#020617", color: "#64748b" },
  passwordHint: { color: "#94a3b8", fontSize: 12, lineHeight: 19 },
  feedback: { flexDirection: "row", alignItems: "flex-start", gap: 10, borderWidth: 1, borderRadius: 12, padding: 14 },
  successFeedback: { borderColor: "rgba(16,185,129,0.4)", backgroundColor: "rgba(16,185,129,0.1)" },
  errorFeedback: { borderColor: "rgba(244,63,94,0.4)", backgroundColor: "rgba(244,63,94,0.1)" },
  feedbackText: { flex: 1, fontSize: 14, lineHeight: 20 },
  successText: { color: "#a7f3d0" },
  errorText: { color: "#fecdd3" },
  saveButton: { minHeight: 52, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: "#2563eb", paddingHorizontal: 20 },
  saveButtonText: { color: "#ffffff", fontSize: 15, fontWeight: "700" },
  secondarySaveButton: { minHeight: 48, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#475569", borderRadius: 12, backgroundColor: "#020617", paddingHorizontal: 20 },
  secondarySaveButtonText: { color: "#bfdbfe", fontSize: 14, fontWeight: "700" },
  logoutSection: { gap: 10, borderWidth: 1, borderColor: "#1e293b", borderRadius: 16, backgroundColor: "#0f172a", padding: 20 },
  logoutTitle: { color: "#f1f5f9", fontSize: 16, fontWeight: "700" },
  logoutDescription: { color: "#94a3b8", fontSize: 13, lineHeight: 19 },
  logoutButton: { minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, borderWidth: 1, borderColor: "rgba(244,63,94,0.5)", borderRadius: 12, backgroundColor: "rgba(244,63,94,0.08)", paddingHorizontal: 16 },
  logoutButtonText: { color: "#fecdd3", fontSize: 14, fontWeight: "700" },
  buttonPressed: { opacity: 0.72 },
  loading: { flex: 1, minHeight: 240, alignItems: "center", justifyContent: "center" },
  accessRequiredContent: { flex: 1, justifyContent: "center", padding: 20, paddingBottom: 44 },
  accessRequiredPanel: { width: "100%", maxWidth: 460, alignSelf: "center", alignItems: "center", borderWidth: 1, borderColor: "#1e293b", borderRadius: 16, backgroundColor: "#0f172a", padding: 24 },
  accessRequiredIcon: { width: 56, height: 56, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#334155", borderRadius: 28, backgroundColor: "#020617" },
  accessRequiredTitle: { marginTop: 20, color: "#ffffff", textAlign: "center", fontSize: 22, fontWeight: "700", letterSpacing: -0.3 },
  accessRequiredDescription: { marginTop: 10, color: "#cbd5e1", textAlign: "center", fontSize: 15, lineHeight: 22 },
  accessRequiredButton: { width: "100%", minHeight: 50, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, marginTop: 24, borderRadius: 12, backgroundColor: "#2563eb", paddingHorizontal: 20 },
  accessRequiredButtonText: { color: "#ffffff", fontSize: 15, fontWeight: "700" },
});
