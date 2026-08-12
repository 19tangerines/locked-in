import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  FormField,
  FormHeader,
  PrimaryButton,
  TogglePill,
  challengeFormPalettes,
  type ChallengeFormPalette,
} from '@/components/challenge-form/challenge-form-ui';
import {
  getMockFurthestWinsChallenge,
  type ActivitySportConfig,
} from '@/data/challenge-details';
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

function getLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function normalizeDecimal(value: string) {
  const sanitized = value.replace(/[^0-9.]/g, '');
  const [whole, ...decimals] = sanitized.split('.');
  return decimals.length ? `${whole}.${decimals.join('')}` : whole;
}

function formatScore(value: number) {
  return value.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 1 });
}

export default function AddActivityScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = challengeFormPalettes[colorScheme === 'dark' ? 'dark' : 'light'];
  const challenge = getMockFurthestWinsChallenge(id);
  const [sportId, setSportId] = useState<ActivitySportConfig['id']>(challenge.allowedSports[0].id);
  const [measurement, setMeasurement] = useState('');
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>(challenge.distanceUnit);
  const [activityDate, setActivityDate] = useState(getLocalDate());
  const [proofImageUri, setProofImageUri] = useState<string>();
  const [errors, setErrors] = useState<FormErrors>({});

  const sport = challenge.allowedSports.find((item) => item.id === sportId) ?? challenge.allowedSports[0];
  const numericMeasurement = Number(measurement);

  const scaledDistance = useMemo(() => {
    if (!Number.isFinite(numericMeasurement) || numericMeasurement <= 0) return undefined;

    let scaledMiles: number;
    if (sport.inputType === 'duration') {
      scaledMiles = numericMeasurement / sport.scalingValue;
    } else {
      const rawMiles = distanceUnit === 'mi' ? numericMeasurement : numericMeasurement / KM_PER_MILE;
      scaledMiles = rawMiles * sport.scalingValue;
    }

    return challenge.distanceUnit === 'km' ? scaledMiles * KM_PER_MILE : scaledMiles;
  }, [challenge.distanceUnit, distanceUnit, numericMeasurement, sport]);

  const chooseProofPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    });

    if (!result.canceled) {
      setProofImageUri(result.assets[0].uri);
      setErrors((current) => ({ ...current, proof: undefined }));
    }
  };

  const validate = () => {
    const nextErrors: FormErrors = {};
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    if (!datePattern.test(activityDate)) nextErrors.date = 'Use YYYY-MM-DD.';
    if (!Number.isFinite(numericMeasurement) || numericMeasurement <= 0) {
      nextErrors.measurement = 'Enter a measurement greater than zero.';
    }
    if (challenge.proofPhotoRequired && !proofImageUri) {
      nextErrors.proof = 'This challenge requires a proof photo.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = () => {
    if (!validate() || scaledDistance === undefined) return;

    Alert.alert(
      'Activity added',
      `${sport.label} added ${formatScore(scaledDistance)} ${challenge.distanceUnit} to your challenge total.`,
      [{ text: 'View challenge', onPress: () => router.back() }],
    );
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safeArea, { backgroundColor: colors.surface }]}>
      <FormHeader title="Add activity" subtitle={challenge.name} colors={colors} onBack={() => router.back()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.background }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.intro}>
              <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>Log your workout</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>Enter what you actually completed. We’ll apply this challenge’s scaling automatically.</Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>Sport</Text>
              <View accessibilityRole="radiogroup" style={styles.sportGrid}>
                {challenge.allowedSports.map((item) => (
                  <SportButton
                    key={item.id}
                    colors={colors}
                    icon={SPORT_ICONS[item.id]}
                    label={item.label}
                    selected={item.id === sport.id}
                    onPress={() => {
                      setSportId(item.id);
                      setMeasurement('');
                      setErrors((current) => ({ ...current, measurement: undefined }));
                    }}
                  />
                ))}
              </View>
            </View>

            <FormField
              autoCapitalize="none"
              colors={colors}
              error={errors.date}
              helper="The activity date must fall within the challenge period."
              label="Activity date"
              maxLength={10}
              onChangeText={(value) => {
                setActivityDate(value);
                if (errors.date) setErrors((current) => ({ ...current, date: undefined }));
              }}
              placeholder="YYYY-MM-DD"
              value={activityDate}
            />

            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>
                {sport.inputType === 'duration' ? 'Duration' : 'Distance'}
              </Text>
              <View
                style={[
                  styles.measurementShell,
                  {
                    backgroundColor: colors.surface,
                    borderColor: errors.measurement ? colors.danger : colors.border,
                  },
                ]}>
                <TextInput
                  accessibilityLabel={sport.inputType === 'duration' ? 'Duration' : 'Distance'}
                  autoFocus
                  keyboardType="decimal-pad"
                  onChangeText={(value) => {
                    setMeasurement(normalizeDecimal(value));
                    if (errors.measurement) setErrors((current) => ({ ...current, measurement: undefined }));
                  }}
                  placeholder="0.0"
                  placeholderTextColor={colors.textMuted}
                  selectionColor={colors.primary}
                  style={[styles.measurementInput, { color: colors.text }]}
                  value={measurement}
                />
                {sport.inputType === 'duration' ? (
                  <View style={[styles.fixedUnit, { backgroundColor: colors.surfaceMuted }]}>
                    <Text style={[styles.fixedUnitText, { color: colors.text }]}>min</Text>
                  </View>
                ) : (
                  <View style={styles.unitToggle}>
                    <TogglePill label="km" selected={distanceUnit === 'km'} colors={colors} onPress={() => setDistanceUnit('km')} />
                    <TogglePill label="mi" selected={distanceUnit === 'mi'} colors={colors} onPress={() => setDistanceUnit('mi')} />
                  </View>
                )}
              </View>
              {errors.measurement ? <Text style={[styles.error, { color: colors.danger }]}>{errors.measurement}</Text> : null}
            </View>

            <ScorePreview
              colors={colors}
              displayUnit={challenge.distanceUnit}
              distanceUnit={distanceUnit}
              measurement={numericMeasurement}
              scaledDistance={scaledDistance}
              sport={sport}
            />

            <View style={styles.section}>
              <View style={styles.proofHeading}>
                <Text style={[styles.label, { color: colors.text }]}>Proof photo</Text>
                <Text style={[styles.optional, { color: colors.textMuted }]}>
                  {challenge.proofPhotoRequired ? 'Required' : 'Optional'}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={chooseProofPhoto}
                style={({ pressed }) => [
                  styles.photoPicker,
                  { backgroundColor: colors.surface, borderColor: errors.proof ? colors.danger : colors.border },
                  pressed && styles.pressed,
                ]}>
                {proofImageUri ? (
                  <Image contentFit="cover" source={{ uri: proofImageUri }} style={styles.proofImage} />
                ) : (
                  <>
                    <View style={[styles.photoIcon, { backgroundColor: colors.surfaceMuted }]}>
                      <MaterialIcons name="add-photo-alternate" size={26} color={colors.primary} />
                    </View>
                    <View style={styles.photoCopy}>
                      <Text style={[styles.photoTitle, { color: colors.text }]}>Choose a photo</Text>
                      <Text style={[styles.photoDescription, { color: colors.textMuted }]}>Visible only while you’re editing this entry.</Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={22} color={colors.textMuted} />
                  </>
                )}
              </Pressable>
              {proofImageUri ? (
                <View style={styles.photoActions}>
                  <Pressable accessibilityRole="button" onPress={chooseProofPhoto} style={({ pressed }) => pressed && styles.pressed}>
                    <Text style={[styles.photoActionText, { color: colors.primary }]}>Change photo</Text>
                  </Pressable>
                  <Pressable accessibilityRole="button" onPress={() => setProofImageUri(undefined)} style={({ pressed }) => pressed && styles.pressed}>
                    <Text style={[styles.photoActionText, { color: colors.danger }]}>Remove</Text>
                  </Pressable>
                </View>
              ) : null}
              {errors.proof ? <Text style={[styles.error, { color: colors.danger }]}>{errors.proof}</Text> : null}
            </View>

            <PrimaryButton label="Add activity" colors={colors} icon="check" onPress={submit} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function SportButton({
  colors,
  icon,
  label,
  selected,
  onPress,
}: {
  colors: ChallengeFormPalette;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.sportButton,
        {
          backgroundColor: selected ? colors.surfaceMuted : colors.surface,
          borderColor: selected ? colors.primary : colors.border,
        },
        pressed && styles.pressed,
      ]}>
      <MaterialIcons name={icon} size={20} color={selected ? colors.primary : colors.textMuted} />
      <Text style={[styles.sportButtonText, { color: selected ? colors.primary : colors.text }]}>{label}</Text>
      {selected ? <MaterialIcons name="check-circle" size={17} color={colors.primary} /> : null}
    </Pressable>
  );
}

function ScorePreview({
  colors,
  sport,
  measurement,
  distanceUnit,
  displayUnit,
  scaledDistance,
}: {
  colors: ChallengeFormPalette;
  sport: ActivitySportConfig;
  measurement: number;
  distanceUnit: DistanceUnit;
  displayUnit: DistanceUnit;
  scaledDistance?: number;
}) {
  const rawUnit = sport.inputType === 'duration' ? 'min' : distanceUnit;
  const rule =
    sport.inputType === 'duration'
      ? `${sport.scalingValue} min = ${formatScore(
          displayUnit === 'km' ? KM_PER_MILE : 1,
        )} scaled ${displayUnit}`
      : `1 ${distanceUnit} = ${formatScore(
          sport.scalingValue * (distanceUnit === displayUnit ? 1 : displayUnit === 'km' ? KM_PER_MILE : 1 / KM_PER_MILE),
        )} scaled ${displayUnit}`;

  return (
    <View style={[styles.preview, { backgroundColor: colors.surfaceMuted, borderColor: colors.primary }]}>
      <View style={styles.previewHeading}>
        <View style={[styles.previewIcon, { backgroundColor: colors.primary }]}>
          <MaterialIcons name="auto-graph" size={20} color={colors.primaryText} />
        </View>
        <View style={styles.previewHeadingCopy}>
          <Text style={[styles.previewEyebrow, { color: colors.primary }]}>ADJUSTED CHALLENGE SCORE</Text>
          <Text style={[styles.previewRule, { color: colors.textMuted }]}>{rule}</Text>
        </View>
      </View>
      <View style={[styles.previewDivider, { backgroundColor: colors.border }]} />
      {scaledDistance !== undefined ? (
        <View style={styles.previewResultRow}>
          <Text style={[styles.previewCalculation, { color: colors.textMuted }]}>
            {formatScore(measurement)} {rawUnit} {sport.label.toLowerCase()}
          </Text>
          <MaterialIcons name="arrow-forward" size={20} color={colors.primary} />
          <Text style={[styles.previewScore, { color: colors.primary }]}>
            {formatScore(scaledDistance)} {displayUnit}
          </Text>
        </View>
      ) : (
        <Text style={[styles.previewEmpty, { color: colors.textMuted }]}>Enter your measurement to preview the scaled score.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 48 },
  content: { alignSelf: 'center', gap: 24, maxWidth: 620, paddingHorizontal: 20, paddingTop: 28, width: '100%' },
  intro: { gap: 7 },
  title: { fontSize: 30, fontWeight: '800', letterSpacing: -0.8 },
  subtitle: { fontSize: 14, lineHeight: 21 },
  section: { gap: 10 },
  label: { fontSize: 13, fontWeight: '700' },
  sportGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sportButton: { alignItems: 'center', borderRadius: 12, borderWidth: 1, flexDirection: 'row', gap: 7, paddingHorizontal: 12, paddingVertical: 11 },
  sportButtonText: { fontSize: 13, fontWeight: '700' },
  measurementShell: { alignItems: 'center', borderRadius: 15, borderWidth: 1, flexDirection: 'row', minHeight: 68, paddingRight: 10 },
  measurementInput: { flex: 1, fontSize: 29, fontWeight: '700', paddingHorizontal: 16, paddingVertical: 13 },
  fixedUnit: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  fixedUnitText: { fontSize: 14, fontWeight: '800' },
  unitToggle: { flexDirection: 'row', gap: 5 },
  error: { fontSize: 12, lineHeight: 17 },
  preview: { borderRadius: 16, borderWidth: 1, gap: 14, padding: 16 },
  previewHeading: { alignItems: 'center', flexDirection: 'row', gap: 11 },
  previewIcon: { alignItems: 'center', borderRadius: 11, height: 42, justifyContent: 'center', width: 42 },
  previewHeadingCopy: { flex: 1 },
  previewEyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1.1 },
  previewRule: { fontSize: 12, marginTop: 4 },
  previewDivider: { height: 1 },
  previewResultRow: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' },
  previewCalculation: { fontSize: 13, fontWeight: '600' },
  previewScore: { fontSize: 24, fontWeight: '800' },
  previewEmpty: { fontSize: 13, lineHeight: 19 },
  proofHeading: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  optional: { fontSize: 12, fontWeight: '600' },
  photoPicker: { alignItems: 'center', borderRadius: 15, borderStyle: 'dashed', borderWidth: 1.5, flexDirection: 'row', gap: 12, minHeight: 84, overflow: 'hidden', padding: 14 },
  photoIcon: { alignItems: 'center', borderRadius: 12, height: 48, justifyContent: 'center', width: 48 },
  photoCopy: { flex: 1 },
  photoTitle: { fontSize: 15, fontWeight: '800' },
  photoDescription: { fontSize: 11, lineHeight: 16, marginTop: 4 },
  proofImage: { height: 180, width: '100%' },
  photoActions: { flexDirection: 'row', gap: 20, justifyContent: 'flex-end' },
  photoActionText: { fontSize: 12, fontWeight: '700' },
  pressed: { opacity: 0.7 },
});
