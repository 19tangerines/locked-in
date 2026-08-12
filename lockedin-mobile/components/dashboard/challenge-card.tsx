import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { DashboardChallenge } from '@/data/dashboard';

export type DashboardPalette = {
  background: string;
  surface: string;
  surfaceMuted: string;
  featuredSurface: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryText: string;
  track: string;
};

type ChallengeCardProps = {
  challenge: DashboardChallenge;
  colors: DashboardPalette;
  onPress: (challenge: DashboardChallenge) => void;
};

function pluralizeDays(days: number) {
  return `${days} ${days === 1 ? 'day' : 'days'} left`;
}

function formatPlacement(placement?: number) {
  if (!placement) {
    return 'Unranked';
  }

  const lastTwoDigits = placement % 100;
  const suffix =
    lastTwoDigits >= 11 && lastTwoDigits <= 13
      ? 'th'
      : placement % 10 === 1
        ? 'st'
        : placement % 10 === 2
          ? 'nd'
          : placement % 10 === 3
            ? 'rd'
            : 'th';

  return `${placement}${suffix}`;
}

function getSportSummary(sports: string[]) {
  if (sports.length === 1) {
    return sports[0];
  }

  return `${sports.length} sports`;
}

function getModeLabel(mode: DashboardChallenge['mode']) {
  return mode === 'furthest_wins' ? 'Furthest wins' : 'Group goal';
}

export function FeaturedChallengeCard({ challenge, colors, onPress }: ChallengeCardProps) {
  const placementProgress =
    challenge.placement && challenge.totalPlaces
      ? Math.max(12, 100 - ((challenge.placement - 1) / challenge.totalPlaces) * 100)
      : 0;

  return (
    <Pressable
      accessibilityHint="Opens this challenge"
      accessibilityRole="button"
      onPress={() => onPress(challenge)}
      style={({ pressed }) => [
        styles.featuredCard,
        { backgroundColor: colors.featuredSurface, borderColor: colors.primary },
        pressed && styles.pressed,
      ]}>
      <View style={styles.featuredTopRow}>
        <View>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>ENDING SOON</Text>
          <View style={styles.placementRow}>
            <Text style={[styles.featuredPlacement, { color: colors.primary }]}>#{challenge.placement}</Text>
            <Text style={[styles.placeCount, { color: colors.textMuted }]}>of {challenge.totalPlaces}</Text>
          </View>
        </View>

        <View style={[styles.daysPill, { borderColor: colors.primary }]}>
          <MaterialIcons name="schedule" size={16} color={colors.primary} />
          <Text style={[styles.daysText, { color: colors.primary }]}>
            {pluralizeDays(challenge.daysRemaining ?? 0)}
          </Text>
        </View>
      </View>

      <View style={[styles.featuredDivider, { backgroundColor: colors.primary }]} />

      <Text style={[styles.featuredName, { color: colors.text }]}>{challenge.name}</Text>
      <Text style={[styles.metadata, { color: colors.textMuted }]}>
        {getModeLabel(challenge.mode)} · {getSportSummary(challenge.sports)} · {challenge.memberCount} members
      </Text>

      <View style={styles.progressCopyRow}>
        <Text style={[styles.progressValue, { color: colors.text }]}>Your progress</Text>
        <Text style={[styles.progressValue, { color: colors.text }]}>
          {challenge.distance} {challenge.distanceUnit}
        </Text>
      </View>
      <View style={[styles.progressTrack, { backgroundColor: colors.track }]}>
        <View
          style={[
            styles.progressFill,
            { backgroundColor: colors.primary, width: `${placementProgress}%` },
          ]}
        />
      </View>

      <View style={styles.featuredFooter}>
        <Text style={[styles.positionCopy, { color: colors.textMuted }]}>
          {challenge.distanceFromNext !== undefined
            ? `${challenge.distanceFromNext} ${challenge.distanceUnit} behind 3rd place`
            : `Currently ${formatPlacement(challenge.placement)}`}
        </Text>
        <View style={[styles.openButton, { backgroundColor: colors.primary }]}>
          <Text style={[styles.openButtonText, { color: colors.primaryText }]}>Open</Text>
          <MaterialIcons name="arrow-forward" size={19} color={colors.primaryText} />
        </View>
      </View>
    </Pressable>
  );
}

export function ChallengeCard({ challenge, colors, onPress }: ChallengeCardProps) {
  const isCompleted = challenge.status === 'finalized';
  const isGroupGoal = challenge.mode === 'group_goal';

  return (
    <Pressable
      accessibilityHint="Opens this challenge"
      accessibilityRole="button"
      onPress={() => onPress(challenge)}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        pressed && styles.pressed,
      ]}>
      <View style={styles.cardTopRow}>
        <View style={styles.cardTitleBlock}>
          <Text numberOfLines={2} style={[styles.cardName, { color: colors.text }]}>
            {challenge.name}
          </Text>
          <Text style={[styles.metadata, { color: colors.textMuted }]}>
            {getSportSummary(challenge.sports)} · {challenge.memberCount} members
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color={colors.textMuted} />
      </View>

      <View style={styles.cardFooter}>
        <View style={[styles.statPill, { backgroundColor: colors.surfaceMuted }]}>
          <Text style={[styles.statText, { color: colors.primary }]}>
            {isGroupGoal
              ? `${challenge.goalProgress}% complete`
              : `${formatPlacement(challenge.placement)} of ${challenge.totalPlaces}`}
          </Text>
        </View>
        <View style={styles.timeRow}>
          <MaterialIcons
            name={isCompleted ? 'check-circle-outline' : 'schedule'}
            size={16}
            color={colors.textMuted}
          />
          <Text style={[styles.timeText, { color: colors.textMuted }]}>
            {isCompleted ? `Ended ${challenge.endedOn}` : pluralizeDays(challenge.daysRemaining ?? 0)}
          </Text>
        </View>
      </View>

      {isGroupGoal ? (
        <View style={styles.goalProgress}>
          <View style={[styles.progressTrack, { backgroundColor: colors.track }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: colors.primary,
                  width: `${Math.min(100, Math.max(0, challenge.goalProgress ?? 0))}%`,
                },
              ]}
            />
          </View>
          <Text style={[styles.goalCopy, { color: colors.textMuted }]}>
            {challenge.goalProgress}% of {challenge.goalDistance} {challenge.distanceUnit}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.78,
  },
  featuredCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 20,
  },
  featuredTopRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  placementRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  featuredPlacement: {
    fontSize: 44,
    fontWeight: '800',
    letterSpacing: -1.5,
  },
  placeCount: {
    fontSize: 15,
    fontWeight: '600',
  },
  daysPill: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  daysText: {
    fontSize: 13,
    fontWeight: '700',
  },
  featuredDivider: {
    height: 2,
    marginBottom: 18,
    marginTop: 14,
    opacity: 0.8,
  },
  featuredName: {
    fontSize: 23,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  metadata: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 5,
    textTransform: 'capitalize',
  },
  progressCopyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  progressValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressTrack: {
    borderRadius: 999,
    height: 7,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: 999,
    height: '100%',
  },
  featuredFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginTop: 18,
  },
  positionCopy: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  openButton: {
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  openButtonText: {
    fontSize: 15,
    fontWeight: '800',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
  },
  cardTopRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
  },
  cardTitleBlock: {
    flex: 1,
  },
  cardName: {
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: -0.25,
  },
  cardFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
    marginTop: 16,
  },
  statPill: {
    borderRadius: 8,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  statText: {
    fontSize: 13,
    fontWeight: '700',
  },
  timeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  goalProgress: {
    marginTop: 15,
  },
  goalCopy: {
    fontSize: 12,
    marginTop: 7,
    textAlign: 'right',
  },
});
