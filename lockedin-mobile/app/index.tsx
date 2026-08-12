import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthField, type AuthPalette } from '@/components/auth/auth-field';
import { useColorScheme } from '@/hooks/use-color-scheme';

type AuthMode = 'login' | 'signup';
type SignupStep = 'credentials' | 'profile';

type FieldErrors = Partial<Record<'email' | 'password' | 'confirmPassword' | 'displayName', string>>;

const palettes: Record<'light' | 'dark', AuthPalette> = {
  light: {
    background: '#F7F7F9',
    surface: '#FFFFFF',
    surfaceMuted: '#EEF3FF',
    border: '#D8DCE3',
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

export default function AuthLandingScreen() {
  const colorScheme = useColorScheme();
  const colors = palettes[colorScheme === 'dark' ? 'dark' : 'light'];
  const [mode, setMode] = useState<AuthMode>('login');
  const [signupStep, setSignupStep] = useState<SignupStep>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [profileImageUri, setProfileImageUri] = useState<string>();
  const [passwordHidden, setPasswordHidden] = useState(true);
  const [confirmPasswordHidden, setConfirmPasswordHidden] = useState(true);
  const [errors, setErrors] = useState<FieldErrors>({});

  const isProfileStep = mode === 'signup' && signupStep === 'profile';

  const selectMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setSignupStep('credentials');
    setErrors({});
  };

  const validateCredentials = () => {
    const nextErrors: FieldErrors = {};
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      nextErrors.email = 'Enter your email address.';
    } else if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (!password) {
      nextErrors.password = 'Enter your password.';
    } else if (mode === 'signup' && password.length < 8) {
      nextErrors.password = 'Use at least 8 characters.';
    }

    if (mode === 'signup') {
      if (!confirmPassword) {
        nextErrors.confirmPassword = 'Confirm your password.';
      } else if (confirmPassword !== password) {
        nextErrors.confirmPassword = 'The passwords do not match.';
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submitCredentials = () => {
    if (!validateCredentials()) return;

    if (mode === 'signup') {
      setSignupStep('profile');
      setErrors({});
      return;
    }

    router.replace('/dashboard');
  };

  const continueWithGoogle = () => {
    if (mode === 'signup') {
      setSignupStep('profile');
      setErrors({});
      return;
    }

    router.replace('/dashboard');
  };

  const completeProfile = () => {
    if (!displayName.trim()) {
      setErrors({ displayName: 'Choose a display name.' });
      return;
    }

    router.replace('/dashboard');
  };

  const chooseProfilePhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImageUri(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={8}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Brand colors={colors} />

            {isProfileStep ? (
              <ProfileStep
                colors={colors}
                displayName={displayName}
                displayNameError={errors.displayName}
                imageUri={profileImageUri}
                onBack={() => {
                  setSignupStep('credentials');
                  setErrors({});
                }}
                onChoosePhoto={chooseProfilePhoto}
                onComplete={completeProfile}
                onDisplayNameChange={(value) => {
                  setDisplayName(value);
                  if (errors.displayName) setErrors({ ...errors, displayName: undefined });
                }}
                onRemovePhoto={() => setProfileImageUri(undefined)}
              />
            ) : (
              <CredentialsStep
                colors={colors}
                confirmPassword={confirmPassword}
                confirmPasswordHidden={confirmPasswordHidden}
                email={email}
                errors={errors}
                mode={mode}
                onConfirmPasswordChange={setConfirmPassword}
                onContinueWithGoogle={continueWithGoogle}
                onEmailChange={setEmail}
                onForgotPassword={() => router.push('/forgot-password')}
                onModeChange={selectMode}
                onPasswordChange={setPassword}
                onSubmit={submitCredentials}
                onToggleConfirmPassword={() => setConfirmPasswordHidden((hidden) => !hidden)}
                onTogglePassword={() => setPasswordHidden((hidden) => !hidden)}
                password={password}
                passwordHidden={passwordHidden}
              />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Brand({ colors }: { colors: AuthPalette }) {
  return (
    <View style={styles.brandBlock}>
      <Text style={[styles.wordmark, { color: colors.text }]}>
        locked<Text style={{ color: colors.primary }}>.in</Text>
      </Text>
      <Text style={[styles.tagline, { color: colors.textMuted }]}>Keep each other moving.</Text>
    </View>
  );
}

type CredentialsStepProps = {
  colors: AuthPalette;
  mode: AuthMode;
  email: string;
  password: string;
  confirmPassword: string;
  passwordHidden: boolean;
  confirmPasswordHidden: boolean;
  errors: FieldErrors;
  onModeChange: (mode: AuthMode) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onToggleConfirmPassword: () => void;
  onSubmit: () => void;
  onForgotPassword: () => void;
  onContinueWithGoogle: () => void;
};

function CredentialsStep({
  colors,
  mode,
  email,
  password,
  confirmPassword,
  passwordHidden,
  confirmPasswordHidden,
  errors,
  onModeChange,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onTogglePassword,
  onToggleConfirmPassword,
  onSubmit,
  onForgotPassword,
  onContinueWithGoogle,
}: CredentialsStepProps) {
  return (
    <View style={styles.formArea}>
      <View style={[styles.modeToggle, { backgroundColor: colors.surfaceMuted }]}>
        <ModeButton active={mode === 'login'} colors={colors} label="Log in" onPress={() => onModeChange('login')} />
        <ModeButton active={mode === 'signup'} colors={colors} label="Sign up" onPress={() => onModeChange('signup')} />
      </View>

      <View style={styles.introBlock}>
        <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          {mode === 'login'
            ? 'Log in to check your challenges and keep moving.'
            : 'Start with your login details. Your profile comes next.'}
        </Text>
      </View>

      <View style={styles.fields}>
        <AuthField
          autoCapitalize="none"
          autoComplete="email"
          colors={colors}
          error={errors.email}
          keyboardType="email-address"
          label="Email"
          onChangeText={onEmailChange}
          placeholder="you@email.com"
          returnKeyType="next"
          value={email}
        />
        <AuthField
          autoCapitalize="none"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          colors={colors}
          error={errors.password}
          label="Password"
          onChangeText={onPasswordChange}
          onSubmitEditing={mode === 'login' ? onSubmit : undefined}
          placeholder={mode === 'signup' ? 'At least 8 characters' : 'Enter your password'}
          secureTextEntry={passwordHidden}
          secureToggle={{ hidden: passwordHidden, onToggle: onTogglePassword }}
          value={password}
        />
        {mode === 'signup' ? (
          <AuthField
            autoCapitalize="none"
            autoComplete="new-password"
            colors={colors}
            error={errors.confirmPassword}
            label="Confirm password"
            onChangeText={onConfirmPasswordChange}
            onSubmitEditing={onSubmit}
            placeholder="Enter it again"
            returnKeyType="done"
            secureTextEntry={confirmPasswordHidden}
            secureToggle={{ hidden: confirmPasswordHidden, onToggle: onToggleConfirmPassword }}
            value={confirmPassword}
          />
        ) : null}
      </View>

      {mode === 'login' ? (
        <Pressable accessibilityRole="button" onPress={onForgotPassword} style={({ pressed }) => pressed && styles.pressed}>
          <Text style={[styles.textLink, { color: colors.primary }]}>Forgot your password?</Text>
        </Pressable>
      ) : null}

      <PrimaryButton
        colors={colors}
        label={mode === 'login' ? 'Log in' : 'Continue'}
        onPress={onSubmit}
      />

      <View style={styles.orRow}>
        <View style={[styles.orLine, { backgroundColor: colors.border }]} />
        <Text style={[styles.orText, { color: colors.textMuted }]}>or</Text>
        <View style={[styles.orLine, { backgroundColor: colors.border }]} />
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={onContinueWithGoogle}
        style={({ pressed }) => [
          styles.googleButton,
          { backgroundColor: colors.surface, borderColor: colors.border },
          pressed && styles.pressed,
        ]}>
        <View style={[styles.googleMark, { borderColor: colors.border }]}>
          <Text style={[styles.googleLetter, { color: colors.text }]}>G</Text>
        </View>
        <Text style={[styles.googleText, { color: colors.text }]}>Continue with Google</Text>
      </Pressable>
    </View>
  );
}

function ProfileStep({
  colors,
  displayName,
  displayNameError,
  imageUri,
  onBack,
  onChoosePhoto,
  onComplete,
  onDisplayNameChange,
  onRemovePhoto,
}: {
  colors: AuthPalette;
  displayName: string;
  displayNameError?: string;
  imageUri?: string;
  onBack: () => void;
  onChoosePhoto: () => void;
  onComplete: () => void;
  onDisplayNameChange: (value: string) => void;
  onRemovePhoto: () => void;
}) {
  return (
    <View style={styles.formArea}>
      <View style={styles.stepRow}>
        <View style={[styles.stepLine, { backgroundColor: colors.primary }]} />
        <View style={[styles.stepLine, { backgroundColor: colors.primary }]} />
      </View>

      <View style={styles.introBlock}>
        <Text style={[styles.stepLabel, { color: colors.primary }]}>STEP 2 OF 2</Text>
        <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>Set up your profile</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Choose how teammates will recognize you. You can change this later.</Text>
      </View>

      <View style={styles.photoSection}>
        <Pressable
          accessibilityLabel={imageUri ? 'Change profile photo' : 'Add profile photo'}
          accessibilityRole="button"
          onPress={onChoosePhoto}
          style={({ pressed }) => [
            styles.photoButton,
            { backgroundColor: colors.surfaceMuted, borderColor: colors.border },
            pressed && styles.pressed,
          ]}>
          {imageUri ? (
            <Image contentFit="cover" source={{ uri: imageUri }} style={styles.profileImage} />
          ) : (
            <MaterialIcons name="add-a-photo" size={29} color={colors.primary} />
          )}
          <View style={[styles.photoBadge, { backgroundColor: colors.primary }]}>
            <MaterialIcons name={imageUri ? 'edit' : 'add'} size={15} color={colors.primaryText} />
          </View>
        </Pressable>
        <Text style={[styles.photoTitle, { color: colors.text }]}>Profile photo</Text>
        <Text style={[styles.photoOptional, { color: colors.textMuted }]}>Optional</Text>
        {imageUri ? (
          <Pressable accessibilityRole="button" onPress={onRemovePhoto} style={({ pressed }) => pressed && styles.pressed}>
            <Text style={[styles.removePhoto, { color: colors.primary }]}>Remove photo</Text>
          </Pressable>
        ) : null}
      </View>

      <AuthField
        autoCapitalize="words"
        autoComplete="name"
        colors={colors}
        error={displayNameError}
        label="Display name"
        maxLength={30}
        onChangeText={onDisplayNameChange}
        onSubmitEditing={onComplete}
        placeholder="What should we call you?"
        returnKeyType="done"
        value={displayName}
      />
      <Text style={[styles.characterCount, { color: colors.textMuted }]}>{displayName.length}/30</Text>

      <PrimaryButton colors={colors} label="Enter locked.in" onPress={onComplete} />
      <Pressable accessibilityRole="button" onPress={onBack} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
        <MaterialIcons name="arrow-back" size={18} color={colors.textMuted} />
        <Text style={[styles.backText, { color: colors.textMuted }]}>Back to account details</Text>
      </Pressable>
    </View>
  );
}

function ModeButton({
  active,
  colors,
  label,
  onPress,
}: {
  active: boolean;
  colors: AuthPalette;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.modeButton,
        active && { backgroundColor: colors.primary },
        pressed && styles.pressed,
      ]}>
      <Text style={[styles.modeButtonText, { color: active ? colors.primaryText : colors.text }]}>{label}</Text>
    </Pressable>
  );
}

function PrimaryButton({ colors, label, onPress }: { colors: AuthPalette; label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.primary }, pressed && styles.pressed]}>
      <Text style={[styles.primaryButtonText, { color: colors.primaryText }]}>{label}</Text>
      <MaterialIcons name="arrow-forward" size={20} color={colors.primaryText} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 36 },
  content: { alignSelf: 'center', maxWidth: 480, width: '100%' },
  brandBlock: { marginBottom: 34 },
  wordmark: { fontSize: 39, fontWeight: '800', letterSpacing: -1.6 },
  tagline: { fontSize: 15, marginTop: 5 },
  formArea: { gap: 22 },
  modeToggle: { borderRadius: 13, flexDirection: 'row', padding: 3 },
  modeButton: { alignItems: 'center', borderRadius: 10, flex: 1, paddingHorizontal: 14, paddingVertical: 11 },
  modeButtonText: { fontSize: 15, fontWeight: '800' },
  pressed: { opacity: 0.7 },
  introBlock: { gap: 7 },
  title: { fontSize: 30, fontWeight: '800', letterSpacing: -0.8, lineHeight: 36 },
  subtitle: { fontSize: 14, lineHeight: 21, maxWidth: 410 },
  fields: { gap: 16 },
  textLink: { fontSize: 13, fontWeight: '700', marginTop: -7 },
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
  orRow: { alignItems: 'center', flexDirection: 'row', gap: 13 },
  orLine: { flex: 1, height: 1 },
  orText: { fontSize: 13 },
  googleButton: {
    alignItems: 'center',
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 18,
  },
  googleMark: {
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    height: 25,
    justifyContent: 'center',
    left: 16,
    position: 'absolute',
    width: 25,
  },
  googleLetter: { fontSize: 13, fontWeight: '800' },
  googleText: { fontSize: 15, fontWeight: '700' },
  stepRow: { flexDirection: 'row', gap: 7 },
  stepLine: { borderRadius: 999, flex: 1, height: 4 },
  stepLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  photoSection: { alignItems: 'center' },
  photoButton: {
    alignItems: 'center',
    borderRadius: 54,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    height: 108,
    justifyContent: 'center',
    width: 108,
  },
  profileImage: { borderRadius: 53, height: '100%', width: '100%' },
  photoBadge: {
    alignItems: 'center',
    borderRadius: 15,
    bottom: 2,
    height: 29,
    justifyContent: 'center',
    position: 'absolute',
    right: 2,
    width: 29,
  },
  photoTitle: { fontSize: 15, fontWeight: '800', marginTop: 12 },
  photoOptional: { fontSize: 12, marginTop: 2 },
  removePhoto: { fontSize: 12, fontWeight: '700', marginTop: 7 },
  characterCount: { fontSize: 11, marginTop: -17, textAlign: 'right' },
  backButton: { alignItems: 'center', alignSelf: 'center', flexDirection: 'row', gap: 6, padding: 5 },
  backText: { fontSize: 13, fontWeight: '700' },
});
