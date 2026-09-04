import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { Text } from "../ui/Typography";

type LogoutConfirmModalProps = {
  visible: boolean;
  processing?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function LogoutConfirmModal({ visible, processing = false, onCancel, onConfirm }: LogoutConfirmModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <View
          accessibilityViewIsModal
          style={styles.card}
          accessibilityLabel="Confirmação para sair da conta"
        >
          <View style={styles.iconWrap}>
            <Ionicons name="log-out-outline" size={25} color="#67e8f9" />
          </View>
          <Text style={styles.eyebrow}>NEXUS FULL</Text>
          <Text accessibilityRole="header" style={styles.title}>Sair da sua conta?</Text>
          <Text style={styles.description}>
            Sua sessão será encerrada neste dispositivo. Você poderá entrar novamente quando quiser.
          </Text>
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Continuar conectado"
              accessibilityState={{ disabled: processing }}
              disabled={processing}
              onPress={onCancel}
              style={({ pressed }) => [styles.cancelButton, (pressed || processing) && styles.pressed]}
            >
              <Text style={styles.cancelText}>Continuar conectado</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sair da conta"
              accessibilityState={{ disabled: processing, busy: processing }}
              disabled={processing}
              onPress={onConfirm}
              style={({ pressed }) => [styles.confirmButton, (pressed || processing) && styles.pressed]}
            >
              {processing ? <Text style={styles.confirmText}>Saindo...</Text> : <><Ionicons name="log-out-outline" size={18} color="#fecdd3" /><Text style={styles.confirmText}>Sair da conta</Text></>}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20, backgroundColor: "rgba(0,0,0,0.78)" },
  card: { width: "100%", maxWidth: 420, alignItems: "center", borderWidth: 1, borderColor: "#26344d", borderRadius: 24, backgroundColor: "#07101f", padding: 24, shadowColor: "#000000", shadowOffset: { width: 0, height: 18 }, shadowOpacity: 0.35, shadowRadius: 28, elevation: 18 },
  iconWrap: { width: 56, height: 56, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(34,211,238,0.35)", borderRadius: 18, backgroundColor: "rgba(8,145,178,0.12)" },
  eyebrow: { marginTop: 18, color: "#67e8f9", fontSize: 11, fontWeight: "700", letterSpacing: 1.8 },
  title: { marginTop: 8, color: "#ffffff", textAlign: "center", fontSize: 23, fontWeight: "800", letterSpacing: -0.35 },
  description: { marginTop: 10, color: "#cbd5e1", textAlign: "center", fontSize: 14, lineHeight: 21 },
  actions: { width: "100%", gap: 10, marginTop: 24 },
  cancelButton: { minHeight: 48, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#334155", borderRadius: 13, backgroundColor: "#020617", paddingHorizontal: 16 },
  cancelText: { color: "#e2e8f0", fontSize: 14, fontWeight: "700" },
  confirmButton: { minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1, borderColor: "rgba(244,63,94,0.5)", borderRadius: 13, backgroundColor: "rgba(244,63,94,0.12)", paddingHorizontal: 16 },
  confirmText: { color: "#fecdd3", fontSize: 14, fontWeight: "800" },
  pressed: { opacity: 0.7 },
});
