import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  ChallengeHeader,
  challengePalettes,
  StandingsList,
} from '@/components/challenge/challenge-ui';
import { getMockFurthestWinsChallenge } from '@/data/challenge-details';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function FullStandingsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = challengePalettes[colorScheme === 'dark' ? 'dark' : 'light'];
  const challenge = getMockFurthestWinsChallenge(id);
  const currentUser = challenge.standings.find((standing) => standing.isCurrentUser);
  const currentUserPlace = challenge.standings.findIndex((standing) => standing.isCurrentUser) + 1;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safeArea, { backgroundColor: colors.surface }]}>
      <ChallengeHeader
        challenge={challenge}
        colors={colors}
        onBack={() => router.back()}
        title="Full standings"
        subtitle={challenge.name}
      />
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.contentInner}>
          <View style={[styles.summaryCard, { backgroundColor: colors.currentUserSurface, borderColor: colors.primary }]}>
            <View>
              <Text style={[styles.summaryEyebrow, { color: colors.primary }]}>YOUR POSITION</Text>
              <Text style={[styles.summaryPlacement, { color: colors.text }]}>#{currentUserPlace} of {challenge.memberCount}</Text>
            </View>
            <Text style={[styles.summaryDistance, { color: colors.primary }]}>
              {currentUser?.distance.toFixed(1)} {challenge.distanceUnit}
            </Text>
          </View>

          <View style={styles.headingRow}>
            <Text accessibilityRole="header" style={[styles.heading, { color: colors.text }]}>Distance</Text>
            <Text style={[styles.meta, { color: colors.textMuted }]}>Scaled totals</Text>
          </View>

          <StandingsList standings={challenge.standings} unit={challenge.distanceUnit} colors={colors} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 44 },
  contentInner: {
    alignSelf: 'center',
    gap: 26,
    maxWidth: 760,
    paddingHorizontal: 20,
    paddingTop: 24,
    width: '100%',
  },
  summaryCard: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 18,
  },
  summaryEyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  summaryPlacement: { fontSize: 21, fontWeight: '800', marginTop: 4 },
  summaryDistance: { fontSize: 20, fontWeight: '800' },
  headingRow: { alignItems: 'baseline', flexDirection: 'row', justifyContent: 'space-between' },
  heading: { fontSize: 17, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' },
  meta: { fontSize: 13 },
});
