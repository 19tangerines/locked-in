import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormField, FormHeader, PrimaryButton, TogglePill, challengeFormPalettes } from '@/components/challenge-form/challenge-form-ui';
import { getMockFurthestWinsChallenge, type ActivitySportConfig } from '@/data/challenge-details';
import { useColorScheme } from '@/hooks/use-color-scheme';

type DistanceUnit = 'km' | 'mi';
type FormErrors = Partial<Record<'date' | 'measurement' | 'proof', string>>;

const KM_PER_MILE = 1.609344;
const SPORT_ICONS: Record<ActivitySportConfig['id'], React.ComponentProps<typeof MaterialIcons>['name']> = {
  running: 'directions-run',
  paddling: 'rowing',
  swimming: 'pool',
  weightlifting: 'fitness-center',
};

function normalizeDecimal(value: string) {
  const sanitized = value.replace(/[^0-9.]/g, '');
  const [whole, ...decimals] = sanitized.split('.');
  return decimals.length ? `${whole}.${decimals.join('')}` : whole;
}

function formatScore(value: number) {
  return value.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 1 });
}

export default function EditActivityScreen() {
  const { id, activityId } = useLocalSearchParams<{ id: string; activityId: string }>();
  const colorScheme = useColorScheme();
  const colors = challengeFormPalettes[colorScheme === 'dark' ? 'dark' : 'light'];
  const challenge = getMockFurthestWinsChallenge(id);
  const activity = challenge.activities.find((item) => item.id === activityId);
  const initialSport = challenge.allowedSports.find((item) => item.label === activity?.sport) ?? challenge.allowedSports[0];
  const [sportId, setSportId] = useState<ActivitySportConfig['id']>(initialSport.id);
  const [measurement, setMeasurement] = useState(activity?.rawMeasurement.split(' ')[0] ?? '');
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>(activity?.rawMeasurement.endsWith(' mi') ? 'mi' : 'km');
  const [activityDate, setActivityDate] = useState(activity?.activityDate ?? '2026-05-18');
  const [proofImage, setProofImage] = useState<string | 'mock' | undefined>(activity?.hasProofPhoto ? 'mock' : undefined);
  const [errors, setErrors] = useState<FormErrors>({});

  const sport = challenge.allowedSports.find((item) => item.id === sportId) ?? challenge.allowedSports[0];
  const numericMeasurement = Number(measurement);
  const scaledDistance = useMemo(() => {
    if (!Number.isFinite(numericMeasurement) || numericMeasurement <= 0) return undefined;
    const scaledMiles = sport.inputType === 'duration'
      ? numericMeasurement / sport.scalingValue
      : (distanceUnit === 'mi' ? numericMeasurement : numericMeasurement / KM_PER_MILE) * sport.scalingValue;
    return challenge.distanceUnit === 'km' ? scaledMiles * KM_PER_MILE : scaledMiles;
  }, [challenge.distanceUnit, distanceUnit, numericMeasurement, sport]);

  if (!activity || !activity.isCurrentUser) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.unavailable}>
          <MaterialIcons name="lock" size={34} color={colors.textMuted} />
          <Text style={[styles.unavailableTitle, { color: colors.text }]}>This entry can’t be edited</Text>
          <Text style={[styles.unavailableText, { color: colors.textMuted }]}>You can only open and change your own activities.</Text>
          <PrimaryButton colors={colors} icon="arrow-back" label="Back to challenge" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const chooseProofPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.85 });
    if (!result.canceled) {
      setProofImage(result.assets[0].uri);
      setErrors((current) => ({ ...current, proof: undefined }));
    }
  };

  const validate = () => {
    const nextErrors: FormErrors = {};
    if (!/^\d{4}-\d{2}-\d{2}$/.test(activityDate)) nextErrors.date = 'Use YYYY-MM-DD.';
    if (!Number.isFinite(numericMeasurement) || numericMeasurement <= 0) nextErrors.measurement = 'Enter a measurement greater than zero.';
    if (challenge.proofPhotoRequired && !proofImage) nextErrors.proof = 'This challenge requires a proof photo.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const save = () => {
    if (!validate() || scaledDistance === undefined) return;
    Alert.alert('Activity updated', `Your adjusted score is now ${formatScore(scaledDistance)} ${challenge.distanceUnit}.`, [
      { text: 'Done', onPress: () => router.back() },
    ]);
  };

  const confirmDelete = () => {
    Alert.alert('Delete this activity?', 'This removes the entry and its private proof photo, then recalculates the standings.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete activity', style: 'destructive', onPress: () => router.replace({ pathname: '/challenges/[id]', params: { id: challenge.id } }) },
    ]);
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safeArea, { backgroundColor: colors.surface }]}>
      <FormHeader title="Edit activity" subtitle={challenge.name} colors={colors} onBack={() => router.back()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.background }]} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <View style={[styles.privateNote, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
              <MaterialIcons name="lock-outline" size={20} color={colors.primary} />
              <Text style={[styles.privateText, { color: colors.textMuted }]}>Your proof photo is private and only appears here while you edit this entry.</Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>Sport</Text>
              <View accessibilityRole="radiogroup" style={styles.sportGrid}>
                {challenge.allowedSports.map((item) => {
                  const selected = item.id === sportId;
                  return (
                    <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected }} key={item.id} onPress={() => { setSportId(item.id); setMeasurement(''); }} style={({ pressed }) => [styles.sportButton, { backgroundColor: selected ? colors.surfaceMuted : colors.surface, borderColor: selected ? colors.primary : colors.border }, pressed && styles.pressed]}>
                      <MaterialIcons name={SPORT_ICONS[item.id]} size={19} color={selected ? colors.primary : colors.textMuted} />
                      <Text style={[styles.sportText, { color: selected ? colors.primary : colors.text }]}>{item.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <FormField colors={colors} error={errors.date} helper="Must fall within this challenge’s activity period." label="Activity date" maxLength={10} onChangeText={(value) => { setActivityDate(value); if (errors.date) setErrors((current) => ({ ...current, date: undefined })); }} placeholder="YYYY-MM-DD" value={activityDate} />

            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>{sport.inputType === 'duration' ? 'Duration' : 'Distance'}</Text>
              <View style={[styles.measurementShell, { backgroundColor: colors.surface, borderColor: errors.measurement ? colors.danger : colors.border }]}>
                <TextInput accessibilityLabel={sport.inputType === 'duration' ? 'Duration' : 'Distance'} keyboardType="decimal-pad" onChangeText={(value) => { setMeasurement(normalizeDecimal(value)); if (errors.measurement) setErrors((current) => ({ ...current, measurement: undefined })); }} selectionColor={colors.primary} style={[styles.measurementInput, { color: colors.text }]} value={measurement} />
                {sport.inputType === 'duration' ? <Text style={[styles.fixedUnit, { color: colors.text }]}>min</Text> : <View style={styles.units}><TogglePill label="km" selected={distanceUnit === 'km'} colors={colors} onPress={() => setDistanceUnit('km')} /><TogglePill label="mi" selected={distanceUnit === 'mi'} colors={colors} onPress={() => setDistanceUnit('mi')} /></View>}
              </View>
              {errors.measurement ? <Text style={[styles.error, { color: colors.danger }]}>{errors.measurement}</Text> : null}
            </View>

            <View style={[styles.scoreCard, { backgroundColor: colors.surfaceMuted, borderColor: colors.primary }]}>
              <Text style={[styles.scoreLabel, { color: colors.primary }]}>ADJUSTED CHALLENGE SCORE</Text>
              <Text style={[styles.score, { color: scaledDistance ? colors.primary : colors.textMuted }]}>{scaledDistance ? `${formatScore(scaledDistance)} ${challenge.distanceUnit}` : 'Enter a measurement'}</Text>
              <Text style={[styles.scoreHelp, { color: colors.textMuted }]}>The challenge’s current scaling rule is applied automatically.</Text>
            </View>

            <View style={styles.section}>
              <View style={styles.proofHeading}><Text style={[styles.label, { color: colors.text }]}>Proof photo</Text><Text style={[styles.optional, { color: colors.textMuted }]}>{challenge.proofPhotoRequired ? 'Required' : 'Optional'}</Text></View>
              {proofImage === 'mock' ? (
                <View style={[styles.mockProof, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={[styles.mockPhotoVisual, { backgroundColor: colors.surfaceMuted }]}><MaterialIcons name="landscape" size={45} color={colors.primary} /><MaterialIcons name="directions-run" size={27} color={colors.textMuted} /></View>
                  <View style={styles.mockProofCopy}><Text style={[styles.photoTitle, { color: colors.text }]}>Current proof photo</Text><Text style={[styles.photoHelp, { color: colors.textMuted }]}>Attached to this entry only</Text></View>
                </View>
              ) : proofImage ? <Image contentFit="cover" source={{ uri: proofImage }} style={styles.proofImage} /> : (
                <Pressable accessibilityRole="button" onPress={chooseProofPhoto} style={({ pressed }) => [styles.photoPicker, { backgroundColor: colors.surface, borderColor: errors.proof ? colors.danger : colors.border }, pressed && styles.pressed]}><MaterialIcons name="add-photo-alternate" size={26} color={colors.primary} /><Text style={[styles.photoTitle, { color: colors.text }]}>Choose a photo</Text></Pressable>
              )}
              {proofImage ? <View style={styles.photoActions}><Pressable onPress={chooseProofPhoto}><Text style={[styles.actionText, { color: colors.primary }]}>Replace</Text></Pressable><Pressable onPress={() => setProofImage(undefined)}><Text style={[styles.actionText, { color: colors.danger }]}>Remove</Text></Pressable></View> : null}
              {errors.proof ? <Text style={[styles.error, { color: colors.danger }]}>{errors.proof}</Text> : null}
            </View>

            <PrimaryButton colors={colors} icon="save" label="Save changes" onPress={save} />
            <Pressable accessibilityRole="button" onPress={confirmDelete} style={({ pressed }) => [styles.deleteButton, { borderColor: colors.danger }, pressed && styles.pressed]}><MaterialIcons name="delete-outline" size={20} color={colors.danger} /><Text style={[styles.deleteText, { color: colors.danger }]}>Delete activity</Text></Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 }, keyboardView: { flex: 1 }, scrollContent: { flexGrow: 1, paddingBottom: 48 },
  content: { alignSelf: 'center', gap: 24, maxWidth: 620, paddingHorizontal: 20, paddingTop: 28, width: '100%' },
  privateNote: { alignItems: 'flex-start', borderRadius: 14, borderWidth: 1, flexDirection: 'row', gap: 10, padding: 14 }, privateText: { flex: 1, fontSize: 12, lineHeight: 18 },
  section: { gap: 10 }, label: { fontSize: 13, fontWeight: '700' }, sportGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, sportButton: { alignItems: 'center', borderRadius: 11, borderWidth: 1, flexDirection: 'row', gap: 6, paddingHorizontal: 11, paddingVertical: 10 }, sportText: { fontSize: 12, fontWeight: '700' },
  measurementShell: { alignItems: 'center', borderRadius: 15, borderWidth: 1, flexDirection: 'row', minHeight: 68, paddingRight: 10 }, measurementInput: { flex: 1, fontSize: 29, fontWeight: '700', paddingHorizontal: 16, paddingVertical: 13 }, fixedUnit: { fontSize: 14, fontWeight: '800', paddingHorizontal: 14 }, units: { flexDirection: 'row', gap: 5 }, error: { fontSize: 12, lineHeight: 17 },
  scoreCard: { borderRadius: 16, borderWidth: 1, padding: 16 }, scoreLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.1 }, score: { fontSize: 28, fontWeight: '800', marginTop: 8 }, scoreHelp: { fontSize: 12, marginTop: 4 },
  proofHeading: { flexDirection: 'row', justifyContent: 'space-between' }, optional: { fontSize: 12, fontWeight: '600' }, mockProof: { alignItems: 'center', borderRadius: 15, borderWidth: 1, flexDirection: 'row', gap: 13, overflow: 'hidden', padding: 10 }, mockPhotoVisual: { alignItems: 'center', borderRadius: 10, flexDirection: 'row', height: 82, justifyContent: 'center', width: 116 }, mockProofCopy: { flex: 1 }, photoTitle: { fontSize: 14, fontWeight: '800' }, photoHelp: { fontSize: 11, marginTop: 4 }, proofImage: { borderRadius: 15, height: 210, width: '100%' }, photoPicker: { alignItems: 'center', borderRadius: 15, borderStyle: 'dashed', borderWidth: 1.5, flexDirection: 'row', gap: 10, minHeight: 84, padding: 14 }, photoActions: { flexDirection: 'row', gap: 20, justifyContent: 'flex-end' }, actionText: { fontSize: 12, fontWeight: '800' },
  deleteButton: { alignItems: 'center', borderRadius: 13, borderWidth: 1, flexDirection: 'row', gap: 7, justifyContent: 'center', minHeight: 50 }, deleteText: { fontSize: 15, fontWeight: '800' }, pressed: { opacity: 0.7 },
  unavailable: { alignSelf: 'center', flex: 1, gap: 12, justifyContent: 'center', maxWidth: 420, padding: 24, width: '100%' }, unavailableTitle: { fontSize: 24, fontWeight: '800' }, unavailableText: { fontSize: 14, lineHeight: 21, marginBottom: 8 },
});
