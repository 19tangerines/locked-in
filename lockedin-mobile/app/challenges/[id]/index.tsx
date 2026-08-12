import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActivityFeed } from '@/components/challenge/activity-feed';
import {
  ChallengeHeader,
  challengePalettes,
  Podium,
  SectionHeading,
  StandingsList,
} from '@/components/challenge/challenge-ui';
import { getMockFurthestWinsChallenge } from '@/data/challenge-details';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function FurthestWinsChallengeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = challengePalettes[colorScheme === 'dark' ? 'dark' : 'light'];
  const challenge = getMockFurthestWinsChallenge(id);
  const previewStandings = challenge.standings.slice(0, 5);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safeArea, { backgroundColor: colors.surface }]}>
      <ChallengeHeader
        challenge={challenge}
        colors={colors}
        onBack={() => router.back()}
        trailing={
          <Pressable
            accessibilityLabel="Open challenge settings"
            accessibilityRole="button"
            hitSlop={8}
            onPress={() =>
              router.push({ pathname: '/challenges/[id]/settings', params: { id: challenge.id } })
            }
            style={({ pressed }) => [
              styles.headerSettingsButton,
              { borderColor: colors.border },
              pressed && styles.pressed,
            ]}>
            <MaterialIcons name="settings" size={22} color={colors.text} />
          </Pressable>
        }
      />

      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.contentInner}>
            <View style={styles.chips}>
              <View style={[styles.primaryChip, { borderColor: colors.primary }]}>
                <MaterialIcons name="schedule" size={16} color={colors.primary} />
                <Text style={[styles.primaryChipText, { color: colors.primary }]}>
                  {challenge.daysRemaining} days left
                </Text>
              </View>
              <View style={[styles.chip, { backgroundColor: colors.surfaceMuted }]}>
                <MaterialIcons name="group" size={16} color={colors.textMuted} />
                <Text style={[styles.chipText, { color: colors.text }]}>{challenge.memberCount} members</Text>
              </View>
            </View>

            <View style={styles.section}>
              <SectionHeading title="Podium" colors={colors} />
              <Podium standings={challenge.standings} unit={challenge.distanceUnit} colors={colors} />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.divider }]} />

            <View style={styles.section}>
              <SectionHeading
                title="Overall progress"
                meta={`${challenge.memberCount} athletes`}
                colors={colors}
              />
              <StandingsList
                standings={previewStandings}
                unit={challenge.distanceUnit}
                colors={colors}
                showCurrentUserDivider
              />
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  router.push({ pathname: '/challenges/[id]/standings', params: { id: challenge.id } })
                }
                style={({ pressed }) => [
                  styles.fullStandingsButton,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  pressed && styles.pressed,
                ]}>
                <Text style={[styles.fullStandingsText, { color: colors.text }]}>View full standings</Text>
                <MaterialIcons name="arrow-forward" size={20} color={colors.text} />
              </Pressable>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.divider }]} />

            <View style={styles.section}>
              <SectionHeading title="Activity" meta={`${challenge.activities.length} recent`} colors={colors} />
              <ActivityFeed
                activities={challenge.activities}
                unit={challenge.distanceUnit}
                colors={colors}
                onActivityPress={(activity) =>
                  router.push({
                    pathname: '/challenges/[id]/activity/[activityId]',
                    params: { id: challenge.id, activityId: activity.id },
                  })
                }
              />
            </View>
          </View>
        </ScrollView>

        <Pressable
          accessibilityLabel="Add activity"
          accessibilityRole="button"
          onPress={() =>
            router.push({ pathname: '/challenges/[id]/activity/new', params: { id: challenge.id } })
          }
          style={({ pressed }) => [
            styles.floatingButton,
            { backgroundColor: colors.primary },
            pressed && styles.pressed,
          ]}>
          <MaterialIcons name="add" size={27} color={colors.primaryText} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  screen: { flex: 1 },
  pressed: { opacity: 0.72 },
  scrollContent: { paddingBottom: 112 },
  contentInner: {
    alignSelf: 'center',
    gap: 28,
    maxWidth: 760,
    paddingHorizontal: 20,
    paddingTop: 24,
    width: '100%',
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  primaryChip: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  primaryChipText: { fontSize: 13, fontWeight: '700' },
  chip: {
    alignItems: 'center',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  chipText: { fontSize: 13, fontWeight: '600' },
  section: { gap: 18 },
  divider: { height: 1 },
  fullStandingsButton: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 7,
    minHeight: 48,
    paddingHorizontal: 16,
  },
  fullStandingsText: { fontSize: 15, fontWeight: '800' },
  floatingButton: {
    alignItems: 'center',
    borderRadius: 28,
    bottom: 24,
    elevation: 5,
    height: 56,
    justifyContent: 'center',
    position: 'absolute',
    right: 22,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    width: 56,
  },
  headerSettingsButton: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
});
