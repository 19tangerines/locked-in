import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  ChallengeCard,
  type DashboardPalette,
  FeaturedChallengeCard,
} from '@/components/dashboard/challenge-card';
import { mockDashboardData, type DashboardChallenge } from '@/data/dashboard';
import { useColorScheme } from '@/hooks/use-color-scheme';

const lightPalette: DashboardPalette = {
  background: '#F7F7F9',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF3FF',
  featuredSurface: '#EAF0FF',
  border: '#E5E7EB',
  text: '#1D1D22',
  textMuted: '#6B7280',
  primary: '#155EEF',
  primaryText: '#FFFFFF',
  track: '#D6DCE8',
};

const darkPalette: DashboardPalette = {
  background: '#101114',
  surface: '#191B20',
  surfaceMuted: '#232B3D',
  featuredSurface: '#18233A',
  border: '#2C2F36',
  text: '#F7F7F8',
  textMuted: '#A4A8B1',
  primary: '#6C9BFF',
  primaryText: '#0C1830',
  track: '#343A45',
};

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? darkPalette : lightPalette;
  const featuredChallenge = mockDashboardData.challenges.find(
    (challenge) => challenge.id === mockDashboardData.featuredChallengeId,
  );
  const activeChallenges = mockDashboardData.challenges.filter(
    (challenge) => challenge.status === 'active' && challenge.id !== featuredChallenge?.id,
  );
  const finalizedChallenges = mockDashboardData.challenges.filter(
    (challenge) => challenge.status === 'finalized',
  );

  const showPlaceholder = (title: string, message: string) => {
    Alert.alert(title, message);
  };

  const openChallenge = (challenge: DashboardChallenge) => {
    if (challenge.mode !== 'furthest_wins') {
      showPlaceholder(challenge.name, 'The Group Goal challenge view will be added in a later pass.');
      return;
    }

    router.push({ pathname: '/challenges/[id]', params: { id: challenge.id } });
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safeArea, { backgroundColor: colors.surface }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerInner}>
          <Text accessibilityRole="header" style={[styles.wordmark, { color: colors.text }]}>
            locked<Text style={{ color: colors.primary }}>.in</Text>
          </Text>
          <Pressable
            accessibilityLabel="Open settings"
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => router.push('/settings')}
            style={({ pressed }) => [
              styles.avatar,
              { backgroundColor: colors.surfaceMuted, borderColor: colors.border },
              pressed && styles.pressed,
            ]}>
            <Text style={[styles.avatarText, { color: colors.text }]}>{mockDashboardData.user.initials}</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.contentInner}>
          <View style={styles.greetingBlock}>
            <Text style={[styles.greeting, { color: colors.text }]}>Let&apos;s get it, {mockDashboardData.user.displayName}</Text>
            <Text style={[styles.greetingCopy, { color: colors.textMuted }]}>Here&apos;s how your challenges are looking today.</Text>
          </View>

          {featuredChallenge ? (
            <FeaturedChallengeCard challenge={featuredChallenge} colors={colors} onPress={openChallenge} />
          ) : null}

          <DashboardSection title="Your challenges" count={activeChallenges.length} colors={colors}>
            {activeChallenges.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} colors={colors} onPress={openChallenge} />
            ))}

            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/challenges/new')}
              style={({ pressed }) => [
                styles.addAction,
                { backgroundColor: colors.surface, borderColor: colors.textMuted },
                pressed && styles.pressed,
              ]}>
              <View style={[styles.addIcon, { backgroundColor: colors.surfaceMuted }]}>
                <MaterialIcons name="add" size={23} color={colors.primary} />
              </View>
              <View style={styles.addCopy}>
                <Text style={[styles.addTitle, { color: colors.primary }]}>Add a Challenge</Text>
                <Text style={[styles.addSubtitle, { color: colors.textMuted }]}>Join or create a Challenge</Text>
              </View>
              <MaterialIcons name="arrow-forward" size={20} color={colors.primary} />
            </Pressable>
          </DashboardSection>

          <DashboardSection title="Finished challenges" count={finalizedChallenges.length} colors={colors}>
            {finalizedChallenges.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} colors={colors} onPress={openChallenge} />
            ))}
          </DashboardSection>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function DashboardSection({
  title,
  count,
  colors,
  children,
}: {
  title: string;
  count: number;
  colors: DashboardPalette;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeadingRow}>
        <Text style={[styles.sectionHeading, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.sectionCount, { color: colors.textMuted }]}>{count}</Text>
      </View>
      <View style={styles.sectionCards}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
  },
  headerInner: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    maxWidth: 760,
    paddingHorizontal: 20,
    paddingVertical: 13,
    width: '100%',
  },
  wordmark: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.9,
  },
  avatar: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.72,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 44,
  },
  contentInner: {
    alignSelf: 'center',
    gap: 28,
    maxWidth: 760,
    paddingHorizontal: 20,
    paddingTop: 30,
    width: '100%',
  },
  greetingBlock: {
    gap: 7,
  },
  greeting: {
    fontSize: 31,
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 38,
  },
  greetingCopy: {
    fontSize: 15,
    lineHeight: 21,
  },
  section: {
    gap: 13,
  },
  sectionHeadingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 9,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.25,
    textTransform: 'uppercase',
  },
  sectionCount: {
    fontSize: 13,
    fontWeight: '700',
  },
  sectionCards: {
    gap: 12,
  },
  addAction: {
    alignItems: 'center',
    borderRadius: 16,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  addIcon: {
    alignItems: 'center',
    borderRadius: 11,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  addCopy: {
    flex: 1,
  },
  addTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  addSubtitle: {
    fontSize: 13,
    marginTop: 3,
  },
});
