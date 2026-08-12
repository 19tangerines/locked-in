import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { FurthestWinsChallenge, Standing } from '@/data/challenge-details';

export type ChallengePalette = {
  background: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  divider: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryText: string;
  track: string;
  bar: string;
  currentUserSurface: string;
};

export const challengePalettes: Record<'light' | 'dark', ChallengePalette> = {
  light: {
    background: '#F7F7F9',
    surface: '#FFFFFF',
    surfaceMuted: '#F1F3F6',
    border: '#E1E4E9',
    divider: '#A9ADB4',
    text: '#1D1D22',
    textMuted: '#737780',
    primary: '#155EEF',
    primaryText: '#FFFFFF',
    track: '#E3E6EB',
    bar: '#747982',
    currentUserSurface: '#EAF0FF',
  },
  dark: {
    background: '#101114',
    surface: '#191B20',
    surfaceMuted: '#24272D',
    border: '#2C2F36',
    divider: '#555A64',
    text: '#F7F7F8',
    textMuted: '#A4A8B1',
    primary: '#6C9BFF',
    primaryText: '#0C1830',
    track: '#343A45',
    bar: '#858B96',
    currentUserSurface: '#18233A',
  },
};

type ChallengeHeaderProps = {
  challenge: FurthestWinsChallenge;
  colors: ChallengePalette;
  title?: string;
  subtitle?: string;
  onBack: () => void;
  trailing?: ReactNode;
};

export function ChallengeHeader({
  challenge,
  colors,
  title = challenge.name,
  subtitle = `${challenge.sportLabel} · ${challenge.modeLabel}`,
  onBack,
  trailing,
}: ChallengeHeaderProps) {
  return (
    <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      <View style={styles.headerInner}>
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          hitSlop={8}
          onPress={onBack}
          style={({ pressed }) => [
            styles.iconButton,
            { borderColor: colors.border },
            pressed && styles.pressed,
          ]}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text numberOfLines={1} style={[styles.headerTitle, { color: colors.text }]}>
            {title}
          </Text>
          <Text numberOfLines={1} style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            {subtitle}
          </Text>
        </View>
        {trailing ?? <View style={styles.headerSpacer} />}
      </View>
    </View>
  );
}

export function Podium({ standings, unit, colors }: { standings: Standing[]; unit: string; colors: ChallengePalette }) {
  const topThree = standings.slice(0, 3);
  const podiumOrder = [topThree[1], topThree[0], topThree[2]];
  const placements = [2, 1, 3];

  return (
    <View style={styles.podiumRow}>
      {podiumOrder.map((standing, index) => {
        if (!standing) return null;
        const placement = placements[index];
        const isFirst = placement === 1;
        return (
          <View key={standing.userId} style={[styles.podiumColumn, isFirst && styles.firstPodiumColumn]}>
            <Text style={styles.crown}>{isFirst ? '♛' : ' '}</Text>
            <View
              style={[
                styles.podiumAvatar,
                {
                  backgroundColor: isFirst ? colors.primary : colors.surfaceMuted,
                  borderColor: isFirst ? colors.primary : colors.border,
                },
              ]}>
              <Text style={[styles.podiumInitials, { color: isFirst ? colors.primaryText : colors.text }]}>
                {standing.initials}
              </Text>
            </View>
            <Text numberOfLines={1} style={[styles.podiumName, { color: colors.text }]}>
              {standing.displayName}
            </Text>
            <View
              style={[
                styles.podiumBlock,
                {
                  backgroundColor: isFirst ? colors.primary : colors.surfaceMuted,
                  height: isFirst ? 100 : placement === 2 ? 72 : 60,
                },
              ]}>
              <Text style={[styles.podiumPlacement, { color: isFirst ? colors.primaryText : colors.text }]}>
                {placement}
              </Text>
            </View>
            <Text style={[styles.podiumDistance, { color: colors.text }]}>
              {standing.distance.toFixed(1)} {unit}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export function StandingsList({
  standings,
  unit,
  colors,
  showCurrentUserDivider = false,
}: {
  standings: Standing[];
  unit: string;
  colors: ChallengePalette;
  showCurrentUserDivider?: boolean;
}) {
  const leaderDistance = standings[0]?.distance ?? 1;

  return (
    <View style={styles.standingsList}>
      {standings.map((standing, index) => (
        <View key={standing.userId}>
          {showCurrentUserDivider && standing.isCurrentUser && index > 0 ? (
            <View style={styles.youDividerRow}>
              <Text style={[styles.ellipsis, { color: colors.textMuted }]}>•••</Text>
              <View style={[styles.dashedLine, { borderColor: colors.divider }]} />
            </View>
          ) : null}
          <View style={styles.standingRow}>
            <Text style={[styles.rank, { color: colors.textMuted }]}>{index + 1}</Text>
            <Text
              numberOfLines={1}
              style={[
                styles.standingName,
                { color: standing.isCurrentUser ? colors.primary : colors.text },
              ]}>
              {standing.displayName}
            </Text>
            <View style={[styles.barTrack, { backgroundColor: colors.track }]}>
              <View
                style={[
                  styles.barFill,
                  {
                    backgroundColor: standing.isCurrentUser || index === 0 ? colors.primary : colors.bar,
                    width: `${Math.max(8, (standing.distance / leaderDistance) * 100)}%`,
                  },
                ]}
              />
            </View>
            <Text style={[styles.distance, { color: colors.text }]}>
              {standing.distance.toFixed(1)} {unit}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

export function SectionHeading({
  title,
  meta,
  colors,
}: {
  title: string;
  meta?: string;
  colors: ChallengePalette;
}) {
  return (
    <View style={styles.sectionHeadingRow}>
      <Text accessibilityRole="header" style={[styles.sectionHeading, { color: colors.text }]}>
        {title}
      </Text>
      {meta ? <Text style={[styles.sectionMeta, { color: colors.textMuted }]}>{meta}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.7 },
  header: { borderBottomWidth: 1 },
  headerInner: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 12,
    maxWidth: 760,
    paddingHorizontal: 20,
    paddingVertical: 12,
    width: '100%',
  },
  iconButton: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  headerCopy: { flex: 1 },
  headerTitle: { fontSize: 19, fontWeight: '800', letterSpacing: -0.3 },
  headerSubtitle: { fontSize: 12, marginTop: 3, textTransform: 'capitalize' },
  headerSpacer: { height: 44, width: 44 },
  podiumRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 22,
  },
  podiumColumn: { alignItems: 'center', flex: 1, maxWidth: 180 },
  firstPodiumColumn: { zIndex: 1 },
  crown: { color: '#E7AD17', fontSize: 25, height: 34 },
  podiumAvatar: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  podiumInitials: { fontSize: 23, fontWeight: '800' },
  podiumName: { fontSize: 15, fontWeight: '800', marginBottom: 10, marginTop: 8, maxWidth: '90%' },
  podiumBlock: { alignItems: 'center', justifyContent: 'center', width: '100%' },
  podiumPlacement: { fontSize: 30, fontWeight: '800' },
  podiumDistance: { fontSize: 13, fontWeight: '800', marginTop: 9 },
  standingsList: { gap: 14 },
  standingRow: { alignItems: 'center', flexDirection: 'row', minHeight: 30 },
  rank: { fontSize: 14, fontWeight: '800', width: 29 },
  standingName: { fontSize: 14, fontWeight: '800', width: 72 },
  barTrack: { borderRadius: 3, flex: 1, height: 23, overflow: 'hidden' },
  barFill: { height: '100%' },
  distance: { fontSize: 13, marginLeft: 10, textAlign: 'right', width: 67 },
  youDividerRow: { alignItems: 'center', flexDirection: 'row', marginBottom: 15 },
  ellipsis: { fontSize: 12, letterSpacing: 2, width: 101 },
  dashedLine: { borderTopWidth: 1, borderStyle: 'dashed', flex: 1 },
  sectionHeadingRow: { alignItems: 'baseline', flexDirection: 'row', justifyContent: 'space-between' },
  sectionHeading: { fontSize: 16, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' },
  sectionMeta: { fontSize: 13 },
});
