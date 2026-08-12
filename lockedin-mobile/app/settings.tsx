import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  FormField,
  FormHeader,
  PrimaryButton,
  challengeFormPalettes,
} from '@/components/challenge-form/challenge-form-ui';
import { SegmentedSetting, SettingsRow, SettingsSection } from '@/components/settings/settings-ui';
import { useColorScheme } from '@/hooks/use-color-scheme';

type UnitPreference = 'km' | 'mi';
type ThemePreference = 'system' | 'light' | 'dark';

export default function AccountSettingsScreen() {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<ThemePreference>('system');
  const effectiveTheme = theme === 'system' ? systemColorScheme : theme;
  const colors = challengeFormPalettes[effectiveTheme === 'dark' ? 'dark' : 'light'];
  const [displayName, setDisplayName] = useState('Sam');
  const [email, setEmail] = useState('sam@example.com');
  const [profileImageUri, setProfileImageUri] = useState<string>();
  const [unit, setUnit] = useState<UnitPreference>('km');
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [competitiveEnabled, setCompetitiveEnabled] = useState(true);

  const chooseProfilePhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled) setProfileImageUri(result.assets[0].uri);
  };

  const saveProfile = () => {
    if (!displayName.trim()) {
      Alert.alert('Display name required', 'Choose a display name before saving.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      Alert.alert('Check your email', 'Enter a valid email address before saving.');
      return;
    }
    Alert.alert('Profile saved', 'Your account details have been updated in this prototype.');
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      'Delete your account?',
      'This permanently removes your profile, proof photos, active challenge memberships, and active challenge activities. Completed results remain anonymous.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete account', style: 'destructive', onPress: () => router.replace('/') },
      ],
    );
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safeArea, { backgroundColor: colors.surface }]}>
      <FormHeader title="Account settings" subtitle="Profile and preferences" colors={colors} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <SettingsSection title="Profile" description="Visible to people who share a challenge with you." colors={colors}>
            <View style={styles.profileContent}>
              <View style={styles.avatarArea}>
                <Pressable
                  accessibilityLabel="Change profile photo"
                  accessibilityRole="button"
                  onPress={chooseProfilePhoto}
                  style={({ pressed }) => [
                    styles.avatar,
                    { backgroundColor: colors.surfaceMuted, borderColor: colors.border },
                    pressed && styles.pressed,
                  ]}>
                  {profileImageUri ? (
                    <Image contentFit="cover" source={{ uri: profileImageUri }} style={styles.avatarImage} />
                  ) : (
                    <Text style={[styles.avatarInitials, { color: colors.text }]}>S</Text>
                  )}
                  <View style={[styles.avatarBadge, { backgroundColor: colors.primary }]}>
                    <MaterialIcons name="edit" size={14} color={colors.primaryText} />
                  </View>
                </Pressable>
                <View>
                  <Text style={[styles.photoTitle, { color: colors.text }]}>Profile photo</Text>
                  <Pressable accessibilityRole="button" onPress={chooseProfilePhoto} style={({ pressed }) => pressed && styles.pressed}>
                    <Text style={[styles.photoAction, { color: colors.primary }]}>Choose a new photo</Text>
                  </Pressable>
                </View>
              </View>
              <FormField colors={colors} label="Display name" maxLength={30} onChangeText={setDisplayName} value={displayName} />
              <FormField autoCapitalize="none" colors={colors} keyboardType="email-address" label="Email" onChangeText={setEmail} value={email} />
              <PrimaryButton colors={colors} icon="save" label="Save profile" onPress={saveProfile} />
            </View>
          </SettingsSection>

          <SettingsSection title="Preferences" colors={colors}>
            <SettingsRow
              colors={colors}
              icon="straighten"
              iconContent={
                unit === 'mi' ? (
                  <Text accessibilityLabel="Eagle" style={styles.eagleIcon}>🦅</Text>
                ) : undefined
              }
              title="Distance units"
              description="Used throughout standings and activity scores."
              trailing={
                <SegmentedSetting
                  colors={colors}
                  onChange={setUnit}
                  options={[{ value: 'km', label: 'km' }, { value: 'mi', label: 'mi' }]}
                  value={unit}
                />
              }
            />
            <SettingsRow
              colors={colors}
              icon={theme === 'system' ? 'brightness-auto' : theme === 'dark' ? 'dark-mode' : 'light-mode'}
              title="Theme"
              description="Choose the app appearance."
              last
              trailing={
                <SegmentedSetting
                  colors={colors}
                  onChange={setTheme}
                  options={[
                    { value: 'system', label: 'System' },
                    { value: 'light', label: 'Light' },
                    { value: 'dark', label: 'Dark' },
                  ]}
                  value={theme}
                />
              }
            />
          </SettingsSection>

          <SettingsSection title="Notifications" description="Administrative activity changes always produce an in-app notice." colors={colors}>
            <SettingsRow
              colors={colors}
              icon="notifications-active"
              title="Challenge reminders"
              description="Deadline and inactivity reminders."
              trailing={<Switch onValueChange={setRemindersEnabled} trackColor={{ false: colors.border, true: colors.primary }} value={remindersEnabled} />}
            />
            <SettingsRow
              colors={colors}
              icon="emoji-events"
              title="Competitive updates"
              description="Placement changes, passes, and podium alerts."
              last
              trailing={<Switch onValueChange={setCompetitiveEnabled} trackColor={{ false: colors.border, true: colors.primary }} value={competitiveEnabled} />}
            />
          </SettingsSection>

          <SettingsSection title="Security" colors={colors}>
            <SettingsRow colors={colors} icon="lock-reset" title="Change password" description="Update the password used for email login." onPress={() => router.push('/change-password')} />
            <SettingsRow colors={colors} icon="logout" title="Sign out" onPress={() => router.replace('/')} />
            <SettingsRow colors={colors} destructive icon="delete-forever" last title="Delete account" description="Permanently remove your account and active challenge data." onPress={confirmDeleteAccount} />
          </SettingsSection>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 50 },
  content: { alignSelf: 'center', gap: 26, maxWidth: 680, paddingHorizontal: 20, paddingTop: 26, width: '100%' },
  profileContent: { gap: 16, padding: 16 },
  avatarArea: { alignItems: 'center', flexDirection: 'row', gap: 14 },
  avatar: { alignItems: 'center', borderRadius: 35, borderWidth: 1, height: 70, justifyContent: 'center', width: 70 },
  avatarImage: { borderRadius: 34, height: '100%', width: '100%' },
  avatarInitials: { fontSize: 24, fontWeight: '800' },
  avatarBadge: { alignItems: 'center', borderRadius: 13, bottom: 0, height: 26, justifyContent: 'center', position: 'absolute', right: 0, width: 26 },
  photoTitle: { fontSize: 15, fontWeight: '800' },
  photoAction: { fontSize: 12, fontWeight: '700', marginTop: 5 },
  eagleIcon: { fontSize: 21 },
  pressed: { opacity: 0.65 },
});
