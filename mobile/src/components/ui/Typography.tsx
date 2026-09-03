import {
  forwardRef,
  type ComponentProps,
  type ElementRef,
} from "react";
import {
  StyleSheet,
  Text as NativeText,
  TextInput as NativeTextInput,
  type TextInputProps,
  type TextProps,
} from "react-native";

export const nexusFonts = {
  light: "SpaceGrotesk_300Light",
  regular: "SpaceGrotesk_400Regular",
  medium: "SpaceGrotesk_500Medium",
  semibold: "SpaceGrotesk_600SemiBold",
  bold: "SpaceGrotesk_700Bold",
} as const;

function resolveTypographyStyle(style: TextProps["style"] | TextInputProps["style"]) {
  const flattenedStyle = StyleSheet.flatten(style);
  if (flattenedStyle?.fontFamily) return { fontFamily: flattenedStyle.fontFamily };

  const weight = Number.parseInt(String(flattenedStyle?.fontWeight ?? "400"), 10);
  const fontFamily = weight <= 300
    ? nexusFonts.light
    : weight >= 700
      ? nexusFonts.bold
      : weight >= 600
        ? nexusFonts.semibold
        : weight >= 500
          ? nexusFonts.medium
          : nexusFonts.regular;

  return { fontFamily, fontWeight: "normal" as const };
}

export const Text = forwardRef<ElementRef<typeof NativeText>, TextProps>(function NexusText(
  { style, ...props },
  ref,
) {
  return <NativeText ref={ref} style={[style, resolveTypographyStyle(style)]} {...props} />;
});

export const TextInput = forwardRef<ElementRef<typeof NativeTextInput>, TextInputProps>(function NexusTextInput(
  { style, ...props },
  ref,
) {
  return <NativeTextInput ref={ref} style={[style, resolveTypographyStyle(style)]} {...props} />;
});

export type NexusTextProps = ComponentProps<typeof Text>;
