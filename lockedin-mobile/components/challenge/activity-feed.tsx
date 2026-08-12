import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ChallengePalette } from '@/components/challenge/challenge-ui';
import type { ChallengeActivity } from '@/data/challenge-details';

type ActivityFilter = 'all' | 'mine';

export function ActivityFeed({
  activities,
  unit,
  colors,
  onActivityPress,
}: {
  activities: ChallengeActivity[];
  unit: string;
  colors: ChallengePalette;
  onActivityPress: (activity: ChallengeActivity) => void;
}) {
  const [filter, setFilter] = useState<ActivityFilter>('all');
  const visibleActivities = useMemo(
    () => (filter === 'mine' ? activities.filter((activity) => activity.isCurrentUser) : activities),
    [activities, filter],
  );

  return (
    <View style={styles.container}>
      <View
        accessibilityLabel="Activity filter"
        accessibilityRole="tablist"
        style={[styles.toggle, { backgroundColor: colors.surfaceMuted }]}>
        <FilterButton
          active={filter === 'all'}
          colors={colors}
          label="All activity"
          onPress={() => setFilter('all')}
        />
        <FilterButton
          active={filter === 'mine'}
          colors={colors}
          label="Your entries"
          onPress={() => setFilter('mine')}
        />
      </View>

      <View style={[styles.list, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {visibleActivities.map((activity, index) => (
          <Pressable
            accessibilityHint={activity.isCurrentUser ? 'Opens your activity details' : undefined}
            accessibilityRole={activity.isCurrentUser ? 'button' : undefined}
            disabled={!activity.isCurrentUser}
            key={activity.id}
            onPress={() => onActivityPress(activity)}
            style={({ pressed }) => [
              styles.activityRow,
              activity.isCurrentUser && { backgroundColor: colors.currentUserSurface },
              index < visibleActivities.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 },
              pressed && styles.pressed,
            ]}>
            <View style={[styles.avatar, { backgroundColor: colors.surfaceMuted }]}>
              <Text style={[styles.avatarText, { color: colors.text }]}>{activity.initials}</Text>
            </View>
            <View style={styles.activityCopy}>
              <View style={styles.nameRow}>
                <Text style={[styles.name, { color: activity.isCurrentUser ? colors.primary : colors.text }]}>
                  {activity.displayName}
                </Text>
                {activity.isCurrentUser ? (
                  <MaterialIcons name="edit" size={14} color={colors.primary} />
                ) : null}
              </View>
              <Text style={[styles.metadata, { color: colors.textMuted }]}>
                {activity.sport} · {activity.relativeTime}
              </Text>
              <Text style={[styles.rawMeasurement, { color: colors.textMuted }]}>
                Logged {activity.rawMeasurement} on {activity.occurredOn}
              </Text>
            </View>
            <View style={styles.scoreBlock}>
              <Text style={[styles.score, { color: colors.text }]}>
                {activity.scaledDistance.toFixed(1)} {unit}
              </Text>
              <Text style={[styles.scaledLabel, { color: colors.textMuted }]}>scaled</Text>
            </View>
          </Pressable>
        ))}
      </View>

      {visibleActivities.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No activities yet</Text>
          <Text style={[styles.emptyCopy, { color: colors.textMuted }]}>Your logged workouts will appear here.</Text>
        </View>
      ) : null}
    </View>
  );
}

function FilterButton({
  label,
  active,
  colors,
  onPress,
}: {
  label: string;
  active: boolean;
  colors: ChallengePalette;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.filterButton,
        active && { backgroundColor: colors.primary },
        pressed && styles.pressed,
      ]}>
      <Text style={[styles.filterText, { color: active ? colors.primaryText : colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14 },
  pressed: { opacity: 0.7 },
  toggle: { borderRadius: 12, flexDirection: 'row', padding: 3 },
  filterButton: { alignItems: 'center', borderRadius: 9, flex: 1, paddingHorizontal: 12, paddingVertical: 10 },
  filterText: { fontSize: 14, fontWeight: '700' },
  list: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  activityRow: { alignItems: 'center', flexDirection: 'row', gap: 12, minHeight: 92, padding: 14 },
  avatar: { alignItems: 'center', borderRadius: 12, height: 46, justifyContent: 'center', width: 46 },
  avatarText: { fontSize: 17, fontWeight: '800' },
  activityCopy: { flex: 1 },
  nameRow: { alignItems: 'center', flexDirection: 'row', gap: 5 },
  name: { fontSize: 16, fontWeight: '800' },
  metadata: { fontSize: 13, marginTop: 3 },
  rawMeasurement: { fontSize: 11, marginTop: 5 },
  scoreBlock: { alignItems: 'flex-end' },
  score: { fontSize: 17, fontWeight: '800' },
  scaledLabel: { fontSize: 10, marginTop: 2, textTransform: 'uppercase' },
  emptyState: { alignItems: 'center', borderRadius: 16, borderWidth: 1, padding: 28 },
  emptyTitle: { fontSize: 16, fontWeight: '800' },
  emptyCopy: { fontSize: 13, marginTop: 5 },
});
