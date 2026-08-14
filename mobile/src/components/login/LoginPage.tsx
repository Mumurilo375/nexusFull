import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Link, router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/useAuth";
import api from "../../services/api";
import { getApiErrorMessage } from "../../services/http";
import type { LoginResponse } from "./login.types";

const logoImage = require("../../../assets/home/utils/logo.png");
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getSafeReturnPath(value: string | string[] | undefined): string {
  const path = Array.isArray(value) ? value[0] : value;
  return path?.startsWith("/") && !path.startsWith("//") && path !== "/login"
    ? path
    : "/(tabs)/perfil";
}

export default function LoginPage() {
  const { from } = useLocalSearchParams<{ from?: string }>();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setErrorMessage("Digite um email válido.");
      return;
    }

    if (!password) {
      setErrorMessage("Digite sua senha para continuar.");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const data = await api.post<LoginResponse>("/auth/login", {
        email: normalizedEmail,
        password,
      });
      await login(data.token, data.user);
      router.replace(getSafeReturnPath(from) as never);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "Não foi possível fazer login agora. Tente novamente."),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        style={styles.keyboardAvoider}
        behavior={Platform.select({ ios: "padding", default: undefined })}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.panel}>
            <Image source={logoImage} style={styles.logo} resizeMode="contain" accessibilityLabel="Logo Nexus" />
            <Text accessibilityRole="header" style={styles.title}>Entrar</Text>
            <Text style={styles.subtitle}>Entre com seu email e senha.</Text>

            <View style={styles.formSurface}>
              <View style={styles.field}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  accessibilityLabel="Email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                  keyboardType="email-address"
                  placeholder="email@gmail.com"
                  placeholderTextColor="#94a3b8"
                  value={email}
                  onChangeText={(value) => { setEmail(value); setErrorMessage(""); }}
                  editable={!isSubmitting}
                  returnKeyType="next"
                  style={styles.input}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Senha</Text>
                <View style={styles.passwordField}>
                  <TextInput
                    accessibilityLabel="Senha"
                    autoComplete="current-password"
                    placeholder="*****"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!isPasswordVisible}
                    value={password}
                    onChangeText={(value) => { setPassword(value); setErrorMessage(""); }}
                    editable={!isSubmitting}
                    returnKeyType="go"
                    onSubmitEditing={() => void handleSubmit()}
                    style={[styles.input, styles.passwordInput]}
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={isPasswordVisible ? "Ocultar senha" : "Mostrar senha"}
                    onPress={() => setPasswordVisible((visible) => !visible)}
                    disabled={isSubmitting}
                    hitSlop={10}
                    style={styles.passwordToggle}
                  >
                    <Ionicons name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} size={21} color="#cbd5e1" />
                  </Pressable>
                </View>
              </View>
            </View>

            {errorMessage ? (
              <View accessibilityLiveRegion="polite" style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={20} color="#fda4af" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Entrar"
              accessibilityState={{ disabled: isSubmitting, busy: isSubmitting }}
              disabled={isSubmitting}
              onPress={() => void handleSubmit()}
              style={({ pressed }) => [styles.submitButton, (pressed || isSubmitting) && styles.submitButtonPressed]}
            >
              {isSubmitting ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.submitText}>Entrar</Text>}
            </Pressable>

            <Text style={styles.registerText}>
              Não possui conta?{" "}
              <Link href="/cadastro" style={styles.registerLink}>Criar conta</Link>
            </Text>
          </View>

          <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={19} color="#cbd5e1" />
            <Text style={styles.backText}>Voltar</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#020617" },
  keyboardAvoider: { flex: 1 },
  content: { flexGrow: 1, justifyContent: "center", padding: 24 },
  panel: { width: "100%", maxWidth: 480, alignSelf: "center", borderWidth: 1, borderColor: "#1e293b", borderRadius: 24, backgroundColor: "#020617", padding: 24 },
  logo: { alignSelf: "center", width: 144, height: 44 },
  title: { marginTop: 28, color: "#ffffff", textAlign: "center", fontSize: 30, fontWeight: "700", letterSpacing: -0.6 },
  subtitle: { marginTop: 8, color: "#cbd5e1", textAlign: "center", fontSize: 15, lineHeight: 22 },
  formSurface: { marginTop: 32, gap: 20, borderWidth: 1, borderColor: "#1e293b", borderRadius: 16, backgroundColor: "#0f172a", padding: 20 },
  field: { gap: 8 },
  label: { color: "#f1f5f9", fontSize: 15, fontWeight: "600" },
  input: { minHeight: 50, borderWidth: 1, borderColor: "#334155", borderRadius: 12, backgroundColor: "#0f172a", paddingHorizontal: 16, color: "#ffffff", fontSize: 16 },
  passwordField: { position: "relative" },
  passwordInput: { paddingRight: 52 },
  passwordToggle: { position: "absolute", top: 0, right: 0, width: 52, height: 50, alignItems: "center", justifyContent: "center" },
  errorBox: { marginTop: 16, flexDirection: "row", gap: 10, alignItems: "flex-start", borderWidth: 1, borderColor: "rgba(244,63,94,0.4)", borderRadius: 12, backgroundColor: "rgba(244,63,94,0.1)", padding: 14 },
  errorText: { flex: 1, color: "#fecdd3", fontSize: 14, lineHeight: 20 },
  submitButton: { minHeight: 50, marginTop: 16, alignItems: "center", justifyContent: "center", borderRadius: 999, backgroundColor: "#2563eb", paddingHorizontal: 20 },
  submitButtonPressed: { opacity: 0.72 },
  submitText: { color: "#ffffff", fontSize: 15, fontWeight: "700" },
  registerText: { marginTop: 28, color: "#94a3b8", textAlign: "center", fontSize: 14, lineHeight: 22 },
  registerLink: { color: "#93c5fd", fontWeight: "700" },
  backButton: { alignSelf: "center", flexDirection: "row", alignItems: "center", gap: 8, minHeight: 44, marginTop: 24, paddingHorizontal: 12 },
  backText: { color: "#cbd5e1", fontSize: 14, fontWeight: "600" },
});
