import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';

export type ChallengeFormPalette = {
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

export const challengeFormPalettes: Record<'light' | 'dark', ChallengeFormPalette> = {
  light: {
    background: '#F7F7F9',
    surface: '#FFFFFF',
    surfaceMuted: '#EEF3FF',
    border: '#DDE1E7',
    text: '#1D1D22',
    textMuted: '#737780',
    primary: '#155EEF',
    primaryText: '#FFFFFF',
    danger: '#C7352A',
  },
  dark: {
    background: '#101114',
    surface: '#191B20',
    surfaceMuted: '#232B3D',
    border: '#343842',
    text: '#F7F7F8',
    textMuted: '#A4A8B1',
    primary: '#6C9BFF',
    primaryText: '#0C1830',
    danger: '#FF8D82',
  },
};

export function FormHeader({
  title,
  subtitle,
  colors,
  onBack,
}: {
  title: string;
  subtitle?: string;
  colors: ChallengeFormPalette;
  onBack: () => void;
}) {
  return (
    <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      <View style={styles.headerInner}>
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          hitSlop={8}
          onPress={onBack}
          style={({ pressed }) => [
            styles.iconButton,
            { borderColor: colors.border },
            pressed && styles.pressed,
          ]}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text numberOfLines={1} style={[styles.headerTitle, { color: colors.text }]}>{title}</Text>
          {subtitle ? <Text numberOfLines={1} style={[styles.headerSubtitle, { color: colors.textMuted }]}>{subtitle}</Text> : null}
        </View>
        <View style={styles.headerSpacer} />
      </View>
    </View>
  );
}

export function StepProgress({ current, total, colors }: { current: number; total: number; colors: ChallengeFormPalette }) {
  return (
    <View style={styles.progressRow}>
      {Array.from({ length: total }, (_, index) => (
        <View
          key={index}
          style={[
            styles.progressLine,
            { backgroundColor: index < current ? colors.primary : colors.border },
          ]}
        />
      ))}
    </View>
  );
}

export function FormField({
  label,
  helper,
  error,
  colors,
  trailing,
  style,
  ...props
}: TextInputProps & {
  label: string;
  helper?: string;
  error?: string;
  colors: ChallengeFormPalette;
  trailing?: ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <View style={[styles.inputShell, { backgroundColor: colors.surface, borderColor: error ? colors.danger : colors.border }]}>
        <TextInput
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.primary}
          style={[styles.input, { color: colors.text }, style]}
          {...props}
        />
        {trailing}
      </View>
      {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
      {!error && helper ? <Text style={[styles.helper, { color: colors.textMuted }]}>{helper}</Text> : null}
    </View>
  );
}

export function PrimaryButton({
  label,
  colors,
  onPress,
  icon = 'arrow-forward',
  disabled = false,
}: {
  label: string;
  colors: ChallengeFormPalette;
  onPress: () => void;
  icon?: React.ComponentProps<typeof MaterialIcons>['name'];
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        { backgroundColor: colors.primary },
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}>
      <Text style={[styles.primaryButtonText, { color: colors.primaryText }]}>{label}</Text>
      <MaterialIcons name={icon} size={20} color={colors.primaryText} />
    </Pressable>
  );
}

export function ChoiceCard({
  title,
  description,
  icon,
  selected,
  colors,
  onPress,
}: {
  title: string;
  description: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  selected: boolean;
  colors: ChallengeFormPalette;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.choiceCard,
        {
          backgroundColor: selected ? colors.surfaceMuted : colors.surface,
          borderColor: selected ? colors.primary : colors.border,
        },
        pressed && styles.pressed,
      ]}>
      <View style={[styles.choiceIcon, { backgroundColor: selected ? colors.primary : colors.surfaceMuted }]}>
        <MaterialIcons name={icon} size={23} color={selected ? colors.primaryText : colors.primary} />
      </View>
      <View style={styles.choiceCopy}>
        <Text style={[styles.choiceTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.choiceDescription, { color: colors.textMuted }]}>{description}</Text>
      </View>
      <MaterialIcons
        name={selected ? 'check-circle' : 'radio-button-unchecked'}
        size={23}
        color={selected ? colors.primary : colors.textMuted}
      />
    </Pressable>
  );
}

export function TogglePill({
  label,
  selected,
  colors,
  onPress,
}: {
  label: string;
  selected: boolean;
  colors: ChallengeFormPalette;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        {
          backgroundColor: selected ? colors.surfaceMuted : colors.surface,
          borderColor: selected ? colors.primary : colors.border,
        },
        pressed && styles.pressed,
      ]}>
      {selected ? <MaterialIcons name="check" size={15} color={colors.primary} /> : null}
      <Text style={[styles.pillText, { color: selected ? colors.primary : colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.45 },
  header: { borderBottomWidth: 1 },
  headerInner: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 12,
    maxWidth: 760,
    paddingHorizontal: 20,
    paddingVertical: 12,
    width: '100%',
  },
  iconButton: { alignItems: 'center', borderRadius: 12, borderWidth: 1, height: 44, justifyContent: 'center', width: 44 },
  headerCopy: { flex: 1 },
  headerTitle: { fontSize: 19, fontWeight: '800', letterSpacing: -0.3 },
  headerSubtitle: { fontSize: 12, marginTop: 3 },
  headerSpacer: { height: 44, width: 44 },
  progressRow: { flexDirection: 'row', gap: 7 },
  progressLine: { borderRadius: 999, flex: 1, height: 4 },
  field: { gap: 7 },
  label: { fontSize: 13, fontWeight: '700' },
  inputShell: { alignItems: 'center', borderRadius: 13, borderWidth: 1, flexDirection: 'row', minHeight: 52 },
  input: { flex: 1, fontSize: 16, paddingHorizontal: 15, paddingVertical: 13 },
  helper: { fontSize: 11, lineHeight: 16 },
  error: { fontSize: 12, lineHeight: 17 },
  primaryButton: {
    alignItems: 'center',
    borderRadius: 13,
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 18,
  },
  primaryButtonText: { fontSize: 16, fontWeight: '800' },
  choiceCard: { alignItems: 'center', borderRadius: 16, borderWidth: 1.5, flexDirection: 'row', gap: 13, padding: 16 },
  choiceIcon: { alignItems: 'center', borderRadius: 12, height: 44, justifyContent: 'center', width: 44 },
  choiceCopy: { flex: 1 },
  choiceTitle: { fontSize: 16, fontWeight: '800' },
  choiceDescription: { fontSize: 13, lineHeight: 19, marginTop: 4 },
  pill: { alignItems: 'center', borderRadius: 999, borderWidth: 1, flexDirection: 'row', gap: 5, paddingHorizontal: 12, paddingVertical: 9 },
  pillText: { fontSize: 13, fontWeight: '700' },
});
