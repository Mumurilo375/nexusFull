import { useState } from "react";
import { Link, router } from "expo-router";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../../services/api";
import { getApiErrorMessage } from "../../services/http";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function isStrongPassword(value: string): boolean {
  return value.length >= 8 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value) && /[^a-zA-Z0-9]/.test(value);
}

export default function RegisterPage() {
  const { width } = useWindowDimensions();
  const compact = width < 560;
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const update = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setErrorMessage("");
  };

  async function handleSubmit() {
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim();
    const cleanFullName = fullName.trim();
    const cleanCpf = cpf.replace(/\D/g, "");

    if (!cleanUsername || !cleanFullName || !cleanEmail || !password || !confirmPassword || !cleanCpf) {
      setErrorMessage("Preencha os campos obrigatórios para continuar.");
      return;
    }
    if (!EMAIL_PATTERN.test(cleanEmail)) {
      setErrorMessage("Digite um email válido.");
      return;
    }
    if (cleanUsername.length < 3) {
      setErrorMessage("O nome de usuário precisa ter pelo menos 3 caracteres.");
      return;
    }
    if (!isStrongPassword(password)) {
      setErrorMessage("A senha precisa ter 8 caracteres, maiúscula, minúscula, número e caractere especial.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("As senhas não conferem.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/users", { username: cleanUsername, fullName: cleanFullName, cpf: cleanCpf, email: cleanEmail, password });
      router.replace("/login");
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Não foi possível concluir o cadastro agora. Tente novamente."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.select({ ios: "padding", default: undefined })}>
        <ScrollView contentContainerStyle={[styles.content, compact && styles.contentCompact]} keyboardShouldPersistTaps="handled">
          <View style={[styles.panel, compact && styles.panelCompact]}>
            <Text accessibilityRole="header" style={styles.title}>Criar conta</Text>
            <Text style={styles.subtitle}>Crie seu acesso à demonstração acadêmica.</Text>
            <View style={styles.form}>
              <Field label="Nome de usuário" value={username} onChangeText={update(setUsername)} autoCapitalize="none" autoCorrect={false} maxLength={50} />
              <Field label="Nome completo" value={fullName} onChangeText={update(setFullName)} maxLength={120} />
              <Field label="CPF" note="Usado somente para validar o cadastro da demonstração." value={cpf} onChangeText={(value) => { setCpf(formatCpf(value)); setErrorMessage(""); }} keyboardType="numeric" maxLength={14} />
              <Field label="Email" value={email} onChangeText={update(setEmail)} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" maxLength={254} />
              <Field label="Senha" note="Use 8+ caracteres, com maiúscula, minúscula, número e símbolo." value={password} onChangeText={update(setPassword)} secureTextEntry maxLength={128} autoComplete="new-password" />
              <Field label="Confirmar senha" value={confirmPassword} onChangeText={update(setConfirmPassword)} secureTextEntry maxLength={128} autoComplete="new-password" onSubmitEditing={() => void handleSubmit()} />
            </View>
            {errorMessage ? <View accessibilityLiveRegion="polite" style={styles.error}><Text style={styles.errorText}>{errorMessage}</Text></View> : null}
            <Pressable disabled={isSubmitting} onPress={() => void handleSubmit()} style={({ pressed }) => [styles.button, (pressed || isSubmitting) && styles.buttonPressed]}>
              {isSubmitting ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>Criar conta</Text>}
            </Pressable>
            <Text style={styles.loginText}>Já possui uma conta? <Link href="/login" style={styles.loginLink}>Entrar</Link></Text>
          </View>
          <Pressable onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>Voltar</Text></Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type FieldProps = React.ComponentProps<typeof TextInput> & { label: string; note?: string };

function Field({ label, note, ...props }: FieldProps) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput {...props} editable={props.editable ?? true} placeholder={label} placeholderTextColor="#94a3b8" style={styles.input} />{note ? <Text style={styles.note}>{note}</Text> : null}</View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#020617" }, keyboard: { flex: 1 }, content: { flexGrow: 1, padding: 24, justifyContent: "center" }, contentCompact: { justifyContent: "flex-start", paddingHorizontal: 20, paddingVertical: 22 },
  panel: { width: "100%", maxWidth: 560, alignSelf: "center", borderWidth: 1, borderColor: "#1e293b", borderRadius: 24, backgroundColor: "#020617", padding: 24 },
  panelCompact: { borderWidth: 0, borderRadius: 0, padding: 0 },
  title: { color: "#fff", fontSize: 30, textAlign: "center", fontWeight: "700" }, subtitle: { color: "#cbd5e1", textAlign: "center", marginTop: 8, fontSize: 15 },
  form: { marginTop: 28, gap: 16, borderWidth: 1, borderColor: "#1e293b", borderRadius: 16, backgroundColor: "#0f172a", padding: 20 }, field: { gap: 8 }, label: { color: "#f1f5f9", fontSize: 15, fontWeight: "600" }, note: { color: "#94a3b8", fontSize: 12, lineHeight: 18 },
  input: { minHeight: 50, borderWidth: 1, borderColor: "#334155", borderRadius: 12, color: "#fff", paddingHorizontal: 16, fontSize: 16 }, error: { marginTop: 16, borderWidth: 1, borderColor: "rgba(244,63,94,0.4)", borderRadius: 12, backgroundColor: "rgba(244,63,94,0.1)", padding: 14 }, errorText: { color: "#fecdd3", fontSize: 14 },
  button: { minHeight: 50, marginTop: 16, alignItems: "center", justifyContent: "center", borderRadius: 999, backgroundColor: "#2563eb" }, buttonPressed: { opacity: 0.72 }, buttonText: { color: "#fff", fontWeight: "700" },
  loginText: { marginTop: 24, color: "#94a3b8", textAlign: "center" }, loginLink: { color: "#93c5fd", fontWeight: "700" }, back: { alignSelf: "center", minHeight: 44, justifyContent: "center", marginTop: 20, paddingHorizontal: 16 }, backText: { color: "#cbd5e1", fontWeight: "600" },
});
