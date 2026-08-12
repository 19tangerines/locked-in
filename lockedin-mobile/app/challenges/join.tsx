import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  FormHeader,
  PrimaryButton,
  challengeFormPalettes,
} from '@/components/challenge-form/challenge-form-ui';
import { useColorScheme } from '@/hooks/use-color-scheme';

const VALID_CODE_CHARACTERS = /^[0-9A-HJKMNP-TV-Z]*$/;

export default function JoinChallengeScreen() {
  const colorScheme = useColorScheme();
  const colors = challengeFormPalettes[colorScheme === 'dark' ? 'dark' : 'light'];
  const [code, setCode] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string>();
  const codeInputRef = useRef<TextInput>(null);

  const codeCharacters = useMemo(
    () => Array.from({ length: 6 }, (_, index) => code[index] ?? ''),
    [code],
  );

  const updateCode = (value: string) => {
    const normalized = value.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 6);
    setCode(normalized);
    setSubmitted(false);

    if (!VALID_CODE_CHARACTERS.test(normalized)) {
      setError('Codes do not use I, L, O, or U. Check the code and try again.');
    } else {
      setError(undefined);
    }
  };

  const findChallenge = () => {
    if (code.length !== 6) {
      setError('Enter all six characters.');
      return;
    }

    if (!VALID_CODE_CHARACTERS.test(code)) {
      setError('Codes do not use I, L, O, or U. Check the code and try again.');
      return;
    }

    setError(undefined);
    setSubmitted(true);
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safeArea, { backgroundColor: colors.surface }]}>
      <FormHeader title="Join a challenge" subtitle="Enter an invite code" colors={colors} onBack={() => router.back()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.background }]}
          keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <View style={styles.intro}>
              <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>Enter your join code</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>Ask the challenge admin for the six-character code.</Text>
            </View>

            <Pressable
              accessibilityLabel="Six-character join code"
              accessibilityRole="button"
              onPress={() => codeInputRef.current?.focus()}
              style={styles.codeArea}>
              <TextInput
                autoCapitalize="characters"
                autoComplete="off"
                autoCorrect={false}
                autoFocus
                caretHidden
                keyboardType={Platform.OS === 'ios' ? 'ascii-capable' : 'visible-password'}
                maxLength={6}
                onChangeText={updateCode}
                onSubmitEditing={findChallenge}
                ref={codeInputRef}
                returnKeyType="go"
                style={styles.hiddenInput}
                value={code}
              />
              <View style={styles.codeBoxes} pointerEvents="none">
                {codeCharacters.map((character, index) => (
                  <View
                    key={index}
                    style={[
                      styles.codeBox,
                      {
                        backgroundColor: colors.surface,
                        borderColor: error
                          ? colors.danger
                          : index === code.length
                            ? colors.primary
                            : colors.border,
                      },
                    ]}>
                    <Text style={[styles.codeCharacter, { color: colors.text }]}>{character}</Text>
                  </View>
                ))}
              </View>
            </Pressable>
            {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}

            {!submitted ? (
              <PrimaryButton label="Find challenge" colors={colors} onPress={findChallenge} />
            ) : (
              <View style={[styles.previewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.previewTopRow}>
                  <View style={[styles.previewIcon, { backgroundColor: colors.surfaceMuted }]}>
                    <MaterialIcons name="flag" size={24} color={colors.primary} />
                  </View>
                  <View style={styles.previewCopy}>
                    <Text style={[styles.previewLabel, { color: colors.primary }]}>CHALLENGE FOUND</Text>
                    <Text style={[styles.previewTitle, { color: colors.text }]}>May Marathon Club</Text>
                    <Text style={[styles.previewMeta, { color: colors.textMuted }]}>Furthest Wins · 24 members · 3 days left</Text>
                  </View>
                </View>
                <View style={[styles.previewDivider, { backgroundColor: colors.border }]} />
                <Text style={[styles.previewNotice, { color: colors.textMuted }]}>You’ll join as a participant and can begin logging activities right away.</Text>
                <PrimaryButton
                  label="Join May Marathon Club"
                  colors={colors}
                  icon="group-add"
                  onPress={() => router.replace({ pathname: '/challenges/[id]', params: { id: 'may-marathon-club' } })}
                />
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setSubmitted(false);
                    setCode('');
                  }}
                  style={({ pressed }) => [styles.tryAnother, pressed && styles.pressed]}>
                  <Text style={[styles.tryAnotherText, { color: colors.primary }]}>Use a different code</Text>
                </Pressable>
              </View>
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
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
  content: { alignSelf: 'center', gap: 24, maxWidth: 560, paddingHorizontal: 20, paddingTop: 38, width: '100%' },
  intro: { gap: 8 },
  title: { fontSize: 30, fontWeight: '800', letterSpacing: -0.8 },
  subtitle: { fontSize: 15, lineHeight: 22 },
  codeArea: { justifyContent: 'center', minHeight: 72 },
  hiddenInput: { height: 1, opacity: 0, position: 'absolute', width: 1 },
  codeBoxes: { flexDirection: 'row', gap: 7, justifyContent: 'center' },
  codeBox: { alignItems: 'center', borderRadius: 12, borderWidth: 1.5, flex: 1, height: 60, justifyContent: 'center', maxWidth: 64 },
  codeCharacter: { fontSize: 24, fontWeight: '800' },
  error: { fontSize: 12, lineHeight: 17, marginTop: -17, textAlign: 'center' },
  previewCard: { borderRadius: 18, borderWidth: 1, gap: 17, padding: 18 },
  previewTopRow: { alignItems: 'center', flexDirection: 'row', gap: 13 },
  previewIcon: { alignItems: 'center', borderRadius: 13, height: 50, justifyContent: 'center', width: 50 },
  previewCopy: { flex: 1 },
  previewLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.1 },
  previewTitle: { fontSize: 19, fontWeight: '800', marginTop: 3 },
  previewMeta: { fontSize: 12, marginTop: 4 },
  previewDivider: { height: 1 },
  previewNotice: { fontSize: 13, lineHeight: 19 },
  tryAnother: { alignSelf: 'center', padding: 4 },
  tryAnotherText: { fontSize: 13, fontWeight: '700' },
  pressed: { opacity: 0.7 },
});
