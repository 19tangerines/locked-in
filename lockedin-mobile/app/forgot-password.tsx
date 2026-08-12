import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthField } from '@/components/auth/auth-field';
import { FormHeader, PrimaryButton, challengeFormPalettes } from '@/components/challenge-form/challenge-form-ui';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ForgotPasswordScreen() {
  const colorScheme = useColorScheme();
  const colors = challengeFormPalettes[colorScheme === 'dark' ? 'dark' : 'light'];
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string>();
  const [sent, setSent] = useState(false);

  const sendResetLink = () => {
    const normalizedEmail = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setEmailError('Enter a valid email address.');
      return;
    }

    setEmail(normalizedEmail);
    setEmailError(undefined);
    setSent(true);
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safeArea, { backgroundColor: colors.surface }]}>
      <FormHeader title="Reset password" subtitle="Account recovery" colors={colors} onBack={() => router.back()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.background }]}
          keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <View style={[styles.icon, { backgroundColor: colors.surfaceMuted }]}>
              <MaterialIcons name={sent ? 'mark-email-read' : 'lock-reset'} size={32} color={colors.primary} />
            </View>

            {sent ? (
              <>
                <View style={styles.intro}>
                  <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>Check your email</Text>
                  <Text style={[styles.subtitle, { color: colors.textMuted }]}>If an account exists for {email}, we sent it a secure password-reset link.</Text>
                </View>
                <View style={[styles.notice, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <MaterialIcons name="info-outline" size={20} color={colors.primary} />
                  <Text style={[styles.noticeText, { color: colors.textMuted }]}>The link will expire for security. You can request another one if it doesn’t arrive.</Text>
                </View>
                <PrimaryButton colors={colors} icon="refresh" label="Resend link" onPress={sendResetLink} />
                <Pressable accessibilityRole="button" onPress={() => router.back()} style={({ pressed }) => [styles.secondaryButton, { borderColor: colors.border }, pressed && styles.pressed]}>
                  <Text style={[styles.secondaryText, { color: colors.text }]}>Back to log in</Text>
                </Pressable>
              </>
            ) : (
              <>
                <View style={styles.intro}>
                  <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>Forgot your password?</Text>
                  <Text style={[styles.subtitle, { color: colors.textMuted }]}>Enter the email you use for locked.in and we’ll send you a reset link.</Text>
                </View>
                <AuthField
                  autoCapitalize="none"
                  autoComplete="email"
                  autoFocus
                  colors={colors}
                  error={emailError}
                  keyboardType="email-address"
                  label="Email"
                  onChangeText={(value) => {
                    setEmail(value);
                    if (emailError) setEmailError(undefined);
                  }}
                  onSubmitEditing={sendResetLink}
                  placeholder="you@email.com"
                  returnKeyType="send"
                  value={email}
                />
                <PrimaryButton colors={colors} icon="send" label="Send reset link" onPress={sendResetLink} />
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  content: { alignSelf: 'center', gap: 22, maxWidth: 480, width: '100%' },
  icon: { alignItems: 'center', borderRadius: 26, height: 58, justifyContent: 'center', width: 58 },
  intro: { gap: 7 },
  title: { fontSize: 30, fontWeight: '800', letterSpacing: -0.8 },
  subtitle: { fontSize: 14, lineHeight: 21 },
  notice: { alignItems: 'flex-start', borderRadius: 14, borderWidth: 1, flexDirection: 'row', gap: 10, padding: 14 },
  noticeText: { flex: 1, fontSize: 12, lineHeight: 18 },
  secondaryButton: { alignItems: 'center', borderRadius: 13, borderWidth: 1, minHeight: 50, justifyContent: 'center' },
  secondaryText: { fontSize: 15, fontWeight: '800' },
  pressed: { opacity: 0.7 },
});
