import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthField } from '@/components/auth/auth-field';
import { FormHeader, PrimaryButton, challengeFormPalettes } from '@/components/challenge-form/challenge-form-ui';
import { useColorScheme } from '@/hooks/use-color-scheme';

type PasswordErrors = Partial<Record<'current' | 'next' | 'confirm', string>>;

export default function ChangePasswordScreen() {
  const colorScheme = useColorScheme();
  const colors = challengeFormPalettes[colorScheme === 'dark' ? 'dark' : 'light'];
  const [currentPassword, setCurrentPassword] = useState('');
  const [nextPassword, setNextPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentHidden, setCurrentHidden] = useState(true);
  const [nextHidden, setNextHidden] = useState(true);
  const [confirmHidden, setConfirmHidden] = useState(true);
  const [errors, setErrors] = useState<PasswordErrors>({});

  const savePassword = () => {
    const nextErrors: PasswordErrors = {};
    if (!currentPassword) nextErrors.current = 'Enter your current password.';
    if (nextPassword.length < 8) nextErrors.next = 'Use at least 8 characters.';
    if (nextPassword && nextPassword === currentPassword) nextErrors.next = 'Choose a password you haven’t just used.';
    if (!confirmPassword) nextErrors.confirm = 'Confirm your new password.';
    else if (confirmPassword !== nextPassword) nextErrors.confirm = 'The passwords do not match.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    Alert.alert('Password updated', 'Your new password is ready to use.', [
      { text: 'Done', onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safeArea, { backgroundColor: colors.surface }]}>
      <FormHeader title="Change password" subtitle="Account security" colors={colors} onBack={() => router.back()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.background }]} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <View style={[styles.securityNote, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
              <MaterialIcons name="verified-user" size={24} color={colors.primary} />
              <View style={styles.securityCopy}>
                <Text style={[styles.securityTitle, { color: colors.text }]}>Keep your account secure</Text>
                <Text style={[styles.securityText, { color: colors.textMuted }]}>Use at least 8 characters and avoid reusing your current password.</Text>
              </View>
            </View>
            <View style={styles.fields}>
              <AuthField colors={colors} error={errors.current} label="Current password" onChangeText={(value) => { setCurrentPassword(value); if (errors.current) setErrors((current) => ({ ...current, current: undefined })); }} placeholder="Enter current password" secureTextEntry={currentHidden} secureToggle={{ hidden: currentHidden, onToggle: () => setCurrentHidden((hidden) => !hidden) }} value={currentPassword} />
              <AuthField autoComplete="new-password" colors={colors} error={errors.next} label="New password" onChangeText={(value) => { setNextPassword(value); if (errors.next) setErrors((current) => ({ ...current, next: undefined })); }} placeholder="At least 8 characters" secureTextEntry={nextHidden} secureToggle={{ hidden: nextHidden, onToggle: () => setNextHidden((hidden) => !hidden) }} value={nextPassword} />
              <AuthField autoComplete="new-password" colors={colors} error={errors.confirm} label="Confirm new password" onChangeText={(value) => { setConfirmPassword(value); if (errors.confirm) setErrors((current) => ({ ...current, confirm: undefined })); }} onSubmitEditing={savePassword} placeholder="Enter it again" returnKeyType="done" secureTextEntry={confirmHidden} secureToggle={{ hidden: confirmHidden, onToggle: () => setConfirmHidden((hidden) => !hidden) }} value={confirmPassword} />
            </View>
            <PrimaryButton colors={colors} icon="lock" label="Update password" onPress={savePassword} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 48 },
  content: { alignSelf: 'center', gap: 24, maxWidth: 560, paddingHorizontal: 20, paddingTop: 28, width: '100%' },
  securityNote: { alignItems: 'flex-start', borderRadius: 15, borderWidth: 1, flexDirection: 'row', gap: 12, padding: 16 },
  securityCopy: { flex: 1 },
  securityTitle: { fontSize: 15, fontWeight: '800' },
  securityText: { fontSize: 12, lineHeight: 18, marginTop: 4 },
  fields: { gap: 17 },
});
