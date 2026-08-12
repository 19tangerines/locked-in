import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  FormHeader,
  challengeFormPalettes,
  type ChallengeFormPalette,
} from '@/components/challenge-form/challenge-form-ui';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AddChallengeScreen() {
  const colorScheme = useColorScheme();
  const colors = challengeFormPalettes[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safeArea, { backgroundColor: colors.surface }]}>
      <FormHeader title="Add a challenge" subtitle="Choose how you want to get started" colors={colors} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
          <View style={styles.intro}>
            <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>Get moving together</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>Start a new challenge as an admin or enter a code from a friend.</Text>
          </View>

          <ActionCard
            colors={colors}
            description="Choose a mode, set the rules, and invite your group."
            icon="add-circle-outline"
            label="Create a challenge"
            onPress={() => router.push('/challenges/create')}
          />
          <ActionCard
            colors={colors}
            description="Use the six-character code shared by a challenge admin."
            icon="group-add"
            label="Join a challenge"
            onPress={() => router.push('/challenges/join')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ActionCard({
  label,
  description,
  icon,
  colors,
  onPress,
}: {
  label: string;
  description: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  colors: ChallengeFormPalette;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        pressed && styles.pressed,
      ]}>
      <View style={[styles.icon, { backgroundColor: colors.surfaceMuted }]}>
        <MaterialIcons name={icon} size={27} color={colors.primary} />
      </View>
      <View style={styles.cardCopy}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.cardDescription, { color: colors.textMuted }]}>{description}</Text>
      </View>
      <MaterialIcons name="arrow-forward" size={22} color={colors.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
  content: { alignSelf: 'center', gap: 15, maxWidth: 650, paddingHorizontal: 20, paddingTop: 38, width: '100%' },
  intro: { gap: 8, marginBottom: 12 },
  title: { fontSize: 31, fontWeight: '800', letterSpacing: -0.9 },
  subtitle: { fontSize: 15, lineHeight: 22 },
  card: { alignItems: 'center', borderRadius: 18, borderWidth: 1, flexDirection: 'row', gap: 14, minHeight: 118, padding: 18 },
  icon: { alignItems: 'center', borderRadius: 14, height: 54, justifyContent: 'center', width: 54 },
  cardCopy: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: '800' },
  cardDescription: { fontSize: 13, lineHeight: 19, marginTop: 5 },
  pressed: { opacity: 0.7 },
});
