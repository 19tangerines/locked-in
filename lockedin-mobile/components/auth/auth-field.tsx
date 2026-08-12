import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

export type AuthPalette = {
  background: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryText: string;
  danger: string;
};

type AuthFieldProps = TextInputProps & {
  label: string;
  colors: AuthPalette;
  error?: string;
  secureToggle?: {
    hidden: boolean;
    onToggle: () => void;
  };
};

export function AuthField({ label, colors, error, secureToggle, style, ...props }: AuthFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <View
        style={[
          styles.inputShell,
          { backgroundColor: colors.surface, borderColor: error ? colors.danger : colors.border },
        ]}>
        <TextInput
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.primary}
          style={[styles.input, { color: colors.text }, style]}
          {...props}
        />
        {secureToggle ? (
          <Pressable
            accessibilityLabel={secureToggle.hidden ? 'Show password' : 'Hide password'}
            accessibilityRole="button"
            hitSlop={8}
            onPress={secureToggle.onToggle}
            style={({ pressed }) => [styles.visibilityButton, pressed && styles.pressed]}>
            <MaterialIcons
              name={secureToggle.hidden ? 'visibility' : 'visibility-off'}
              size={20}
              color={colors.textMuted}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 7 },
  label: { fontSize: 13, fontWeight: '700' },
  inputShell: {
    alignItems: 'center',
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 52,
  },
  input: { flex: 1, fontSize: 16, paddingHorizontal: 15, paddingVertical: 13 },
  visibilityButton: { alignItems: 'center', alignSelf: 'stretch', justifyContent: 'center', paddingHorizontal: 14 },
  pressed: { opacity: 0.65 },
  error: { fontSize: 12, lineHeight: 17 },
});
