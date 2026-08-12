import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  FormHeader,
  challengeFormPalettes,
} from '@/components/challenge-form/challenge-form-ui';
import { SettingsRow, SettingsSection } from '@/components/settings/settings-ui';
import { getMockFurthestWinsChallenge, type ActivitySportConfig } from '@/data/challenge-details';
import { useColorScheme } from '@/hooks/use-color-scheme';

const sportIcons: Record<
  ActivitySportConfig['id'],
  React.ComponentProps<typeof MaterialIcons>['name']
> = {
  running: 'directions-run',
  paddling: 'kayaking',
  swimming: 'pool',
  weightlifting: 'fitness-center',
};

export default function ChallengeSettingsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = challengeFormPalettes[colorScheme === 'dark' ? 'dark' : 'light'];
  const challenge = getMockFurthestWinsChallenge(id);
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [competitiveEnabled, setCompetitiveEnabled] = useState(true);

  const confirmLeaveChallenge = () => {
    Alert.alert(
      'Leave this challenge?',
      'Your activities and private proof photos for this active challenge will be deleted. The standings will be recalculated for everyone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave challenge',
          style: 'destructive',
          onPress: () => router.replace('/dashboard'),
        },
      ],
    );
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: colors.surface }]}>
      <FormHeader
        title="Challenge settings"
        subtitle={challenge.name}
        colors={colors}
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { backgroundColor: colors.background },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View
            style={[
              styles.participantNote,
              { backgroundColor: colors.surfaceMuted, borderColor: colors.border },
            ]}>
            <MaterialIcons name="visibility" size={20} color={colors.primary} />
            <View style={styles.participantNoteCopy}>
              <Text style={[styles.participantNoteTitle, { color: colors.text }]}>Participant view</Text>
              <Text style={[styles.participantNoteText, { color: colors.textMuted }]}>Challenge details and rules are managed by the admins.</Text>
            </View>
          </View>

          <SettingsSection title="Challenge details" colors={colors}>
            <SettingsRow
              colors={colors}
              icon="emoji-events"
              title="Mode"
              value={challenge.modeLabel}
            />
            <SettingsRow
              colors={colors}
              icon="date-range"
              title="Dates"
              value={`${challenge.startDate} – ${challenge.endDate}`}
            />
            <SettingsRow
              colors={colors}
              icon="schedule"
              title="Deadline timezone"
              value={challenge.timezone}
            />
            <SettingsRow
              colors={colors}
              icon="group"
              last
              title="Members"
              value={`${challenge.memberCount}`}
            />
          </SettingsSection>

          <SettingsSection
            title="Scoring rules"
            description="Every activity is adjusted with the same challenge-wide scaling rules."
            colors={colors}>
            {challenge.allowedSports.map((sport, index) => (
              <SettingsRow
                colors={colors}
                description={scalingDescription(sport, challenge.distanceUnit)}
                icon={sportIcons[sport.id]}
                key={sport.id}
                last={index === challenge.allowedSports.length - 1 && !challenge.proofPhotoRequired}
                title={sport.label}
              />
            ))}
            <SettingsRow
              colors={colors}
              description="Proof photos stay private and are only visible while you edit your own entry."
              icon="photo-camera"
              last
              title="Proof photo"
              value={challenge.proofPhotoRequired ? 'Required' : 'Optional'}
            />
          </SettingsSection>

          <SettingsSection
            title="Challenge admins"
            description="Admins manage challenge details, rules, and membership."
            colors={colors}>
            <View style={styles.adminList}>
              {challenge.admins.map((admin, index) => (
                <View
                  key={admin}
                  style={[
                    styles.adminRow,
                    index < challenge.admins.length - 1 && {
                      borderBottomColor: colors.border,
                      borderBottomWidth: 1,
                    },
                  ]}>
                  <View style={[styles.adminAvatar, { backgroundColor: colors.surfaceMuted }]}>
                    <Text style={[styles.adminInitials, { color: colors.primary }]}>{initials(admin)}</Text>
                  </View>
                  <Text style={[styles.adminName, { color: colors.text }]}>{admin}</Text>
                  <Text style={[styles.adminRole, { color: colors.textMuted }]}>Admin</Text>
                </View>
              ))}
            </View>
          </SettingsSection>

          <SettingsSection
            title="Notifications"
            description="These preferences only apply to this challenge."
            colors={colors}>
            <SettingsRow
              colors={colors}
              description="Deadline and inactivity reminders."
              icon="notifications-active"
              title="Challenge reminders"
              trailing={
                <Switch
                  onValueChange={setRemindersEnabled}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  value={remindersEnabled}
                />
              }
            />
            <SettingsRow
              colors={colors}
              description="Placement changes, passes, and podium alerts."
              icon="leaderboard"
              last
              title="Competitive updates"
              trailing={
                <Switch
                  onValueChange={setCompetitiveEnabled}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  value={competitiveEnabled}
                />
              }
            />
          </SettingsSection>

          <SettingsSection title="Membership" colors={colors}>
            <Pressable
              accessibilityRole="button"
              onPress={confirmLeaveChallenge}
              style={({ pressed }) => [styles.leaveButton, pressed && styles.pressed]}>
              <View style={[styles.leaveIcon, { backgroundColor: `${colors.danger}18` }]}>
                <MaterialIcons name="exit-to-app" size={21} color={colors.danger} />
              </View>
              <View style={styles.leaveCopy}>
                <Text style={[styles.leaveTitle, { color: colors.danger }]}>Leave challenge</Text>
                <Text style={[styles.leaveDescription, { color: colors.textMuted }]}>Remove your membership and active challenge data.</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color={colors.danger} />
            </Pressable>
          </SettingsSection>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function scalingDescription(sport: ActivitySportConfig, unit: 'km' | 'mi') {
  if (sport.inputType === 'duration') {
    return `${sport.scalingValue} min counts as 1 adjusted ${unit}`;
  }

  if (sport.scalingValue === 1) {
    return `1 ${unit} counts as 1 adjusted ${unit}`;
  }

  return `1 ${unit} counts as ${sport.scalingValue} adjusted ${unit}`;
}

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 50 },
  content: {
    alignSelf: 'center',
    gap: 26,
    maxWidth: 680,
    paddingHorizontal: 20,
    paddingTop: 26,
    width: '100%',
  },
  participantNote: {
    alignItems: 'flex-start',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 11,
    padding: 14,
  },
  participantNoteCopy: { flex: 1 },
  participantNoteTitle: { fontSize: 14, fontWeight: '800' },
  participantNoteText: { fontSize: 12, lineHeight: 17, marginTop: 2 },
  adminList: { paddingHorizontal: 14 },
  adminRow: { alignItems: 'center', flexDirection: 'row', gap: 12, minHeight: 66 },
  adminAvatar: { alignItems: 'center', borderRadius: 18, height: 36, justifyContent: 'center', width: 36 },
  adminInitials: { fontSize: 12, fontWeight: '800' },
  adminName: { flex: 1, fontSize: 14, fontWeight: '700' },
  adminRole: { fontSize: 12, fontWeight: '600' },
  leaveButton: { alignItems: 'center', flexDirection: 'row', gap: 12, minHeight: 78, padding: 14 },
  leaveIcon: { alignItems: 'center', borderRadius: 11, height: 40, justifyContent: 'center', width: 40 },
  leaveCopy: { flex: 1 },
  leaveTitle: { fontSize: 14, fontWeight: '800' },
  leaveDescription: { fontSize: 11, lineHeight: 16, marginTop: 3 },
  pressed: { opacity: 0.65 },
});
