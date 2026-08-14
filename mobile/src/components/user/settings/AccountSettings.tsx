import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../contexts/useAuth";
import { resolveAssetUrl } from "../../../services/assets";
import api from "../../../services/api";
import { getApiErrorMessage } from "../../../services/http";
import {
  buildUserFormData,
  EMAIL_PATTERN,
  formatCpf,
  getPasswordError,
  isValidCpf,
  type AvatarFile,
} from "../userForm.utils";
import type { UserProfile } from "./accountSettings.types";

const MAX_AVATAR_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

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

function getAvatarFileName(mimeType: string): string {
  const extension = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
  return `avatar.${extension}`;
}

export default function AccountSettings() {
  const { isAuthenticated, isReady, logout, syncUser, user: authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPickingImage, setIsPickingImage] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [flashMessage, setFlashMessage] = useState<FlashMessage | null>(null);
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
      const mimeType = asset.mimeType?.toLowerCase() ?? "";

      if (!ALLOWED_AVATAR_TYPES.has(mimeType)) {
        setErrorMessage("Escolha uma imagem JPG, PNG ou WEBP válida.");
        return;
      }

      if (asset.fileSize !== undefined && asset.fileSize > MAX_AVATAR_FILE_SIZE) {
        setErrorMessage("A imagem enviada é maior do que o permitido. Escolha uma imagem menor.");
        return;
      }

      setFormValues((currentValues) => ({
        ...currentValues,
        avatarFile: {
          uri: asset.uri,
          mimeType,
          name: getAvatarFileName(mimeType),
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

  const handleSubmit = async () => {
    const fullName = formValues.fullName.trim();
    const username = formValues.username.trim();
    const password = formValues.password.trim();
    const confirmPassword = formValues.confirmPassword.trim();

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

    if (password || confirmPassword) {
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
      setIsSubmitting(true);
      setErrorMessage("");
      const data = await api.put<UserProfile>(
        `/users/${authUser.id}`,
        buildUserFormData({
          fullName,
          username,
          cpf: formValues.cpf,
          password,
          avatarFile: formValues.avatarFile,
        }),
      );
      const savedAvatarUrl = data.avatarUrl ?? null;

      await syncUser({
        id: data.id,
        email: data.email,
        username: data.username,
        avatarUrl: savedAvatarUrl,
        isAdmin: Boolean(data.isAdmin),
      });
      setFormValues((currentValues) => ({
        ...currentValues,
        fullName: data.fullName ?? currentValues.fullName,
        username: data.username ?? currentValues.username,
        cpf: formatCpf(data.cpf ?? currentValues.cpf),
        email: data.email ?? currentValues.email,
        password: "",
        confirmPassword: "",
        avatarFile: null,
      }));
      setAvatarPreview(resolveAssetUrl(savedAvatarUrl));
      setFlashMessage({ kind: "success", text: "Suas alterações foram salvas com sucesso." });
    } catch (error) {
      const message = getApiErrorMessage(error, "Não foi possível atualizar seus dados agora. Tente novamente.");
      setErrorMessage(message);
      setFlashMessage({ kind: "error", text: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsSigningOut(true);
      await logout();
      router.replace("/login");
    } finally {
      setIsSigningOut(false);
    }
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
                    <View style={styles.photoIcon}><Ionicons name="image-outline" size={22} color="#60a5fa" /></View>
                    <View style={styles.photoHeadingText}>
                      <Text style={styles.photoTitle}>Foto de perfil</Text>
                      <Text style={styles.photoDescription}>Atualize sua foto e personalize como você aparece.</Text>
                    </View>
                  </View>
                  <Pressable accessibilityRole="button" accessibilityLabel="Escolher imagem de perfil" accessibilityState={{ disabled: isPickingImage }} disabled={isPickingImage} onPress={() => void handleChooseAvatar()} style={({ pressed }) => [styles.imageButton, (pressed || isPickingImage) && styles.buttonPressed]}>
                    {isPickingImage ? <ActivityIndicator color="#e2e8f0" /> : <><Ionicons name="cloud-upload-outline" size={19} color="#e2e8f0" /><Text style={styles.imageButtonText}>Escolher imagem</Text></>}
                  </Pressable>
                  <Text style={styles.photoHint}>Recomendado: imagem quadrada, no mínimo 400x400px.{"\n"}Formatos: JPG, PNG ou WEBP. Máx. 5MB.</Text>
                </View>
              </View>

              <View style={styles.form}>
                {flashMessage ? <FeedbackMessage message={flashMessage} /> : null}
                <Field label="Nome completo" value={formValues.fullName} onChangeText={updateFormValue("fullName")} editable={!isSubmitting} autoComplete="name" />
                <Field label="Nome de usuário" value={formValues.username} onChangeText={updateFormValue("username")} editable={!isSubmitting} autoCapitalize="none" autoCorrect={false} />
                <Field label="CPF" value={formValues.cpf} onChangeText={(value) => { setFormValues((currentValues) => ({ ...currentValues, cpf: formatCpf(value) })); setErrorMessage(""); setFlashMessage(null); }} editable={!isSubmitting} keyboardType="numeric" maxLength={14} />
                <Field label="Email" value={formValues.email} editable={false} keyboardType="email-address" autoCapitalize="none" />
                <Field label="Senha" value={formValues.password} onChangeText={updateFormValue("password")} editable={!isSubmitting} secureTextEntry autoComplete="new-password" placeholder="Digite sua nova senha (opcional)" />
                <Field label="Confirmar senha" value={formValues.confirmPassword} onChangeText={updateFormValue("confirmPassword")} editable={!isSubmitting} secureTextEntry autoComplete="new-password" placeholder="Repita a senha" returnKeyType="done" onSubmitEditing={() => void handleSubmit()} />
                <Text style={styles.passwordHint}>Se quiser alterar a senha, use um padrão forte: 8 caracteres, letras maiúsculas e minúsculas, número e caractere especial.</Text>
                {errorMessage && flashMessage?.text !== errorMessage ? <FeedbackMessage message={{ kind: "error", text: errorMessage }} /> : null}
                <Pressable accessibilityRole="button" accessibilityLabel="Salvar alterações" accessibilityState={{ disabled: isSubmitting, busy: isSubmitting }} disabled={isSubmitting} onPress={() => void handleSubmit()} style={({ pressed }) => [styles.saveButton, (pressed || isSubmitting) && styles.buttonPressed]}>
                  {isSubmitting ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.saveButtonText}>Salvar alterações</Text>}
                </Pressable>

                {authUser.isAdmin || authUser.is_admin ? (
                  <View style={styles.adminSection}>
                    <Text style={styles.logoutTitle}>Administração</Text>
                    <Text style={styles.logoutDescription}>Acesse o painel de gestão do catálogo, pedidos e ofertas.</Text>
                    <Pressable accessibilityRole="button" accessibilityLabel="Abrir painel administrativo" onPress={() => router.push("/admin" as never)} style={({ pressed }) => [styles.adminButton, pressed && styles.buttonPressed]}>
                      <Ionicons name="shield-checkmark-outline" size={19} color="#bfdbfe" />
                      <Text style={styles.adminButtonText}>Abrir painel admin</Text>
                    </Pressable>
                  </View>
                ) : null}

                <View style={styles.logoutSection}>
                  <Text style={styles.logoutTitle}>Sessão</Text>
                  <Text style={styles.logoutDescription}>Encerre a sessão deste dispositivo quando terminar.</Text>
                  <Pressable accessibilityRole="button" accessibilityLabel="Sair da conta" accessibilityState={{ disabled: isSigningOut, busy: isSigningOut }} disabled={isSigningOut} onPress={() => void handleLogout()} style={({ pressed }) => [styles.logoutButton, (pressed || isSigningOut) && styles.buttonPressed]}>
                    {isSigningOut ? <ActivityIndicator color="#fecdd3" /> : <><Ionicons name="log-out-outline" size={19} color="#fecdd3" /><Text style={styles.logoutButtonText}>Sair da conta</Text></>}
                  </Pressable>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
  photoCard: { gap: 16, borderWidth: 1, borderColor: "#1e293b", borderRadius: 16, backgroundColor: "#020617", padding: 16 },
  photoCardHeading: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  photoIcon: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#1e293b", borderRadius: 12, backgroundColor: "#0f172a" },
  photoHeadingText: { flex: 1 },
  photoTitle: { color: "#f1f5f9", fontSize: 16, fontWeight: "700" },
  photoDescription: { marginTop: 3, color: "#cbd5e1", fontSize: 13, lineHeight: 19 },
  imageButton: { minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, borderWidth: 1, borderColor: "#334155", borderRadius: 12, backgroundColor: "#0f172a", paddingHorizontal: 16 },
  imageButtonText: { color: "#e2e8f0", fontSize: 14, fontWeight: "700" },
  photoHint: { color: "#94a3b8", fontSize: 12, lineHeight: 18 },
  form: { gap: 16, borderWidth: 1, borderColor: "#1e293b", borderRadius: 16, backgroundColor: "#0f172a", padding: 20 },
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
  logoutSection: { gap: 10, marginTop: 8, borderTopWidth: 1, borderTopColor: "#1e293b", paddingTop: 20 },
  adminSection: { gap: 10, marginTop: 8, borderTopWidth: 1, borderTopColor: "#1e293b", paddingTop: 20 },
  adminButton: { minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, borderWidth: 1, borderColor: "rgba(59,130,246,0.45)", borderRadius: 12, backgroundColor: "rgba(37,99,235,0.12)", paddingHorizontal: 16 },
  adminButtonText: { color: "#bfdbfe", fontSize: 14, fontWeight: "700" },
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
