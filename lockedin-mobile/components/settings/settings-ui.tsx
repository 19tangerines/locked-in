import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ChallengeFormPalette } from '@/components/challenge-form/challenge-form-ui';

export function SettingsSection({
  title,
  description,
  children,
  colors,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  colors: ChallengeFormPalette;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeading}>
        <Text accessibilityRole="header" style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
        {description ? <Text style={[styles.sectionDescription, { color: colors.textMuted }]}>{description}</Text> : null}
      </View>
      <View style={[styles.sectionBody, { backgroundColor: colors.surface, borderColor: colors.border }]}>{children}</View>
    </View>
  );
}

export function SettingsRow({
  icon,
  iconContent,
  title,
  description,
  value,
  colors,
  trailing,
  onPress,
  destructive = false,
  last = false,
}: {
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  iconContent?: ReactNode;
  title: string;
  description?: string;
  value?: string;
  colors: ChallengeFormPalette;
  trailing?: ReactNode;
  onPress?: () => void;
  destructive?: boolean;
  last?: boolean;
}) {
  const content = (
    <View
      style={[
        styles.row,
        !last && { borderBottomColor: colors.border, borderBottomWidth: 1 },
      ]}>
      <View style={[styles.rowIcon, { backgroundColor: destructive ? `${colors.danger}18` : colors.surfaceMuted }]}>
        {iconContent ?? (
          <MaterialIcons name={icon} size={20} color={destructive ? colors.danger : colors.primary} />
        )}
      </View>
      <View style={styles.rowCopy}>
        <Text style={[styles.rowTitle, { color: destructive ? colors.danger : colors.text }]}>{title}</Text>
        {description ? <Text style={[styles.rowDescription, { color: colors.textMuted }]}>{description}</Text> : null}
      </View>
      {value ? <Text style={[styles.rowValue, { color: colors.textMuted }]}>{value}</Text> : null}
      {trailing}
      {onPress && !trailing ? <MaterialIcons name="chevron-right" size={22} color={colors.textMuted} /> : null}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      {content}
    </Pressable>
  );
}

export function SegmentedSetting<T extends string>({
  value,
  options,
  colors,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  colors: ChallengeFormPalette;
  onChange: (value: T) => void;
}) {
  return (
    <View style={[styles.segmented, { backgroundColor: colors.surfaceMuted }]}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            key={option.value}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.segment,
              selected && { backgroundColor: colors.primary },
              pressed && styles.pressed,
            ]}>
            <Text style={[styles.segmentText, { color: selected ? colors.primaryText : colors.text }]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 10 },
  sectionHeading: { gap: 4, paddingHorizontal: 2 },
  sectionTitle: { fontSize: 15, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },
  sectionDescription: { fontSize: 12, lineHeight: 17 },
  sectionBody: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  row: { alignItems: 'center', flexDirection: 'row', gap: 12, minHeight: 70, paddingHorizontal: 14, paddingVertical: 12 },
  rowIcon: { alignItems: 'center', borderRadius: 11, height: 40, justifyContent: 'center', width: 40 },
  rowCopy: { flex: 1 },
  rowTitle: { fontSize: 14, fontWeight: '800' },
  rowDescription: { fontSize: 11, lineHeight: 16, marginTop: 3 },
  rowValue: { fontSize: 12, maxWidth: 120, textAlign: 'right' },
  pressed: { opacity: 0.65 },
  segmented: { borderRadius: 10, flexDirection: 'row', padding: 3 },
  segment: { alignItems: 'center', borderRadius: 8, minWidth: 52, paddingHorizontal: 10, paddingVertical: 8 },
  segmentText: { fontSize: 12, fontWeight: '700' },
});
