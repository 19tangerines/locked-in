import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  ChoiceCard,
  FormField,
  FormHeader,
  PrimaryButton,
  StepProgress,
  TogglePill,
  challengeFormPalettes,
  type ChallengeFormPalette,
} from '@/components/challenge-form/challenge-form-ui';
import { useColorScheme } from '@/hooks/use-color-scheme';

type CreateStep = 'mode' | 'rules' | 'invite';
type ChallengeMode = 'furthest_wins' | 'group_goal';
type SportId = 'running' | 'paddling' | 'swimming' | 'weightlifting';

type SportSetting = {
  id: SportId;
  label: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  selected: boolean;
  scale: string;
};

type RuleErrors = Partial<Record<'name' | 'startDate' | 'endDate' | 'sports' | 'goal', string>>;

const JOIN_CODE = 'K7F2Q9';

const INITIAL_SPORTS: SportSetting[] = [
  { id: 'running', label: 'Running', icon: 'directions-run', selected: true, scale: '1' },
  { id: 'paddling', label: 'Paddling', icon: 'rowing', selected: true, scale: '1' },
  { id: 'swimming', label: 'Swimming', icon: 'pool', selected: false, scale: '3' },
  { id: 'weightlifting', label: 'Weightlifting', icon: 'fitness-center', selected: false, scale: '30' },
];

export default function CreateChallengeScreen() {
  const colorScheme = useColorScheme();
  const colors = challengeFormPalettes[colorScheme === 'dark' ? 'dark' : 'light'];
  const [step, setStep] = useState<CreateStep>('mode');
  const [mode, setMode] = useState<ChallengeMode>('furthest_wins');
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [goalDistance, setGoalDistance] = useState('');
  const [milestones, setMilestones] = useState('');
  const [proofRequired, setProofRequired] = useState(false);
  const [sports, setSports] = useState<SportSetting[]>(INITIAL_SPORTS);
  const [errors, setErrors] = useState<RuleErrors>({});

  const stepNumber = step === 'mode' ? 1 : step === 'rules' ? 2 : 3;
  const timezone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return 'Device timezone';
    }
  }, []);

  const selectedSports = sports.filter((sport) => sport.selected);

  const toggleSport = (id: SportId) => {
    setSports((current) =>
      current.map((sport) => (sport.id === id ? { ...sport, selected: !sport.selected } : sport)),
    );
    if (errors.sports) setErrors((current) => ({ ...current, sports: undefined }));
  };

  const updateScale = (id: SportId, value: string) => {
    const normalized = value.replace(/[^0-9.]/g, '');
    setSports((current) =>
      current.map((sport) => (sport.id === id ? { ...sport, scale: normalized } : sport)),
    );
  };

  const validateRules = () => {
    const nextErrors: RuleErrors = {};
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    if (!name.trim()) nextErrors.name = 'Give your challenge a name.';
    if (!datePattern.test(startDate)) nextErrors.startDate = 'Use YYYY-MM-DD.';
    if (!datePattern.test(endDate)) nextErrors.endDate = 'Use YYYY-MM-DD.';
    if (datePattern.test(startDate) && datePattern.test(endDate) && endDate < startDate) {
      nextErrors.endDate = 'End date must be on or after the start date.';
    }
    if (selectedSports.length === 0) nextErrors.sports = 'Select at least one sport.';
    if (mode === 'group_goal' && (!goalDistance || Number(goalDistance) <= 0)) {
      nextErrors.goal = 'Enter a group goal greater than zero.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const createChallenge = () => {
    if (!validateRules()) return;
    setStep('invite');
  };

  const goBack = () => {
    if (step === 'invite') {
      setStep('rules');
    } else if (step === 'rules') {
      setStep('mode');
    } else {
      router.back();
    }
  };

  const shareInvite = async () => {
    await Share.share({
      message: `Join ${name.trim()} on locked.in with code ${JOIN_CODE}`,
      title: `Join ${name.trim()} on locked.in`,
    });
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safeArea, { backgroundColor: colors.surface }]}>
      <FormHeader
        title="Create a challenge"
        subtitle={step === 'invite' ? 'Ready to invite your group' : `Step ${stepNumber} of 3`}
        colors={colors}
        onBack={goBack}
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.background }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <StepProgress current={stepNumber} total={3} colors={colors} />

            {step === 'mode' ? (
              <ModeStep colors={colors} mode={mode} onModeChange={setMode} onContinue={() => setStep('rules')} />
            ) : null}

            {step === 'rules' ? (
              <RulesStep
                colors={colors}
                endDate={endDate}
                errors={errors}
                goalDistance={goalDistance}
                milestones={milestones}
                mode={mode}
                name={name}
                onCreate={createChallenge}
                onEndDateChange={setEndDate}
                onGoalDistanceChange={setGoalDistance}
                onMilestonesChange={setMilestones}
                onNameChange={setName}
                onProofRequiredChange={setProofRequired}
                onScaleChange={updateScale}
                onStartDateChange={setStartDate}
                onToggleSport={toggleSport}
                proofRequired={proofRequired}
                sports={sports}
                startDate={startDate}
                timezone={timezone}
              />
            ) : null}

            {step === 'invite' ? (
              <InviteStep
                colors={colors}
                mode={mode}
                name={name}
                onDashboard={() => router.replace('/dashboard')}
                onShare={shareInvite}
                selectedSports={selectedSports}
              />
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ModeStep({
  colors,
  mode,
  onModeChange,
  onContinue,
}: {
  colors: ChallengeFormPalette;
  mode: ChallengeMode;
  onModeChange: (mode: ChallengeMode) => void;
  onContinue: () => void;
}) {
  return (
    <View style={styles.stepContent}>
      <View style={styles.intro}>
        <Text style={[styles.stepLabel, { color: colors.primary }]}>CHALLENGE MODE</Text>
        <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>How should progress work?</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>The mode can’t be changed after the challenge starts.</Text>
      </View>
      <View accessibilityRole="radiogroup" style={styles.choices}>
        <ChoiceCard
          title="Furthest Wins"
          description="Participants compete to log the greatest scaled distance."
          icon="flag"
          selected={mode === 'furthest_wins'}
          colors={colors}
          onPress={() => onModeChange('furthest_wins')}
        />
        <ChoiceCard
          title="Group Goal"
          description="Everyone contributes toward shared milestones and one final target."
          icon="track-changes"
          selected={mode === 'group_goal'}
          colors={colors}
          onPress={() => onModeChange('group_goal')}
        />
      </View>
      <PrimaryButton label="Set the rules" colors={colors} onPress={onContinue} />
    </View>
  );
}

type RulesStepProps = {
  colors: ChallengeFormPalette;
  mode: ChallengeMode;
  name: string;
  startDate: string;
  endDate: string;
  timezone: string;
  goalDistance: string;
  milestones: string;
  proofRequired: boolean;
  sports: SportSetting[];
  errors: RuleErrors;
  onNameChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onGoalDistanceChange: (value: string) => void;
  onMilestonesChange: (value: string) => void;
  onProofRequiredChange: (value: boolean) => void;
  onToggleSport: (id: SportId) => void;
  onScaleChange: (id: SportId, value: string) => void;
  onCreate: () => void;
};

function RulesStep(props: RulesStepProps) {
  const {
    colors,
    mode,
    name,
    startDate,
    endDate,
    timezone,
    goalDistance,
    milestones,
    proofRequired,
    sports,
    errors,
  } = props;

  return (
    <View style={styles.stepContent}>
      <View style={styles.intro}>
        <Text style={[styles.stepLabel, { color: colors.primary }]}>{mode === 'furthest_wins' ? 'FURTHEST WINS' : 'GROUP GOAL'}</Text>
        <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>Set the rules</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>You’ll be an admin and can adjust most of these settings later.</Text>
      </View>

      <View style={styles.formSection}>
        <FormField
          colors={colors}
          error={errors.name}
          label="Challenge name"
          maxLength={50}
          onChangeText={props.onNameChange}
          placeholder="e.g. May Marathon Club"
          value={name}
        />
        <View style={styles.dateRow}>
          <View style={styles.dateField}>
            <FormField
              autoCapitalize="none"
              colors={colors}
              error={errors.startDate}
              label="Start date"
              maxLength={10}
              onChangeText={props.onStartDateChange}
              placeholder="YYYY-MM-DD"
              value={startDate}
            />
          </View>
          <View style={styles.dateField}>
            <FormField
              autoCapitalize="none"
              colors={colors}
              error={errors.endDate}
              label="End date"
              maxLength={10}
              onChangeText={props.onEndDateChange}
              placeholder="YYYY-MM-DD"
              value={endDate}
            />
          </View>
        </View>
        <View style={[styles.infoRow, { backgroundColor: colors.surfaceMuted }]}>
          <MaterialIcons name="schedule" size={18} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.textMuted }]}>Deadline: 11:59 p.m. · {timezone}</Text>
        </View>
      </View>

      {mode === 'group_goal' ? (
        <View style={styles.formSection}>
          <SectionTitle title="Group targets" colors={colors} />
          <FormField
            colors={colors}
            error={errors.goal}
            keyboardType="decimal-pad"
            label="Final goal"
            onChangeText={(value) => props.onGoalDistanceChange(value.replace(/[^0-9.]/g, ''))}
            placeholder="500"
            trailing={<Text style={[styles.inputUnit, { color: colors.textMuted }]}>km</Text>}
            value={goalDistance}
          />
          <FormField
            colors={colors}
            helper="Optional. Separate targets with commas, such as 100, 250, 400."
            keyboardType="numbers-and-punctuation"
            label="Milestones"
            onChangeText={props.onMilestonesChange}
            placeholder="100, 250, 400"
            value={milestones}
          />
        </View>
      ) : null}

      <View style={styles.formSection}>
        <SectionTitle title="Allowed sports" colors={colors} />
        <Text style={[styles.sectionHelp, { color: colors.textMuted }]}>Choose at least one activity members can submit.</Text>
        <View style={styles.pills}>
          {sports.map((sport) => (
            <TogglePill
              key={sport.id}
              label={sport.label}
              selected={sport.selected}
              colors={colors}
              onPress={() => props.onToggleSport(sport.id)}
            />
          ))}
        </View>
        {errors.sports ? <Text style={[styles.error, { color: colors.danger }]}>{errors.sports}</Text> : null}
      </View>

      <View style={styles.formSection}>
        <SectionTitle title="Sport scaling" colors={colors} />
        <Text style={[styles.sectionHelp, { color: colors.textMuted }]}>Defaults make different sports comparable. Adjust them for your group.</Text>
        <View style={[styles.scalingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {sports.filter((sport) => sport.selected).map((sport, index, selected) => (
            <View
              key={sport.id}
              style={[
                styles.scaleRow,
                index < selected.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 },
              ]}>
              <View style={[styles.scaleIcon, { backgroundColor: colors.surfaceMuted }]}>
                <MaterialIcons name={sport.icon} size={19} color={colors.primary} />
              </View>
              <View style={styles.scaleCopy}>
                <Text style={[styles.scaleSport, { color: colors.text }]}>{sport.label}</Text>
                <Text style={[styles.scaleDescription, { color: colors.textMuted }]}>
                  {sport.id === 'weightlifting' ? 'minutes = 1 scaled km' : '1 km = scaled km below'}
                </Text>
              </View>
              <TextInput
                accessibilityLabel={`${sport.label} scaling value`}
                keyboardType="decimal-pad"
                onChangeText={(value) => props.onScaleChange(sport.id, value)}
                selectionColor={colors.primary}
                style={[styles.scaleInput, { backgroundColor: colors.surfaceMuted, color: colors.text }]}
                value={sport.scale}
              />
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.settingRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.settingCopy}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>Require proof photos</Text>
          <Text style={[styles.settingDescription, { color: colors.textMuted }]}>Members attach proof when submitting. Photos aren’t shown in the public activity feed.</Text>
        </View>
        <Switch
          accessibilityLabel="Require proof photos"
          onValueChange={props.onProofRequiredChange}
          thumbColor={proofRequired ? colors.primaryText : undefined}
          trackColor={{ false: colors.border, true: colors.primary }}
          value={proofRequired}
        />
      </View>

      <PrimaryButton label="Create challenge" colors={colors} icon="check" onPress={props.onCreate} />
    </View>
  );
}

function InviteStep({
  colors,
  name,
  mode,
  selectedSports,
  onShare,
  onDashboard,
}: {
  colors: ChallengeFormPalette;
  name: string;
  mode: ChallengeMode;
  selectedSports: SportSetting[];
  onShare: () => void;
  onDashboard: () => void;
}) {
  return (
    <View style={styles.stepContent}>
      <View style={[styles.successIcon, { backgroundColor: colors.surfaceMuted }]}>
        <MaterialIcons name="check" size={34} color={colors.primary} />
      </View>
      <View style={[styles.intro, styles.centeredIntro]}>
        <Text style={[styles.stepLabel, { color: colors.primary }]}>CHALLENGE CREATED</Text>
        <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>Invite your group</Text>
        <Text style={[styles.subtitle, styles.centeredText, { color: colors.textMuted }]}>Share this permanent code. Members can enter it from their dashboard.</Text>
      </View>

      <View style={[styles.codeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.codeLabel, { color: colors.textMuted }]}>JOIN CODE</Text>
        <Text selectable style={[styles.code, { color: colors.text }]}>{JOIN_CODE}</Text>
      </View>

      <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.summaryName, { color: colors.text }]}>{name.trim()}</Text>
        <Text style={[styles.summaryMeta, { color: colors.textMuted }]}>
          {mode === 'furthest_wins' ? 'Furthest Wins' : 'Group Goal'} · {selectedSports.map((sport) => sport.label).join(', ')}
        </Text>
      </View>

      <PrimaryButton label="Share invite code" colors={colors} icon="share" onPress={onShare} />
      <Pressable
        accessibilityRole="button"
        onPress={onDashboard}
        style={({ pressed }) => [styles.dashboardButton, { borderColor: colors.border }, pressed && styles.pressed]}>
        <Text style={[styles.dashboardButtonText, { color: colors.text }]}>Go to dashboard</Text>
        <MaterialIcons name="arrow-forward" size={19} color={colors.text} />
      </Pressable>
    </View>
  );
}

function SectionTitle({ title, colors }: { title: string; colors: ChallengeFormPalette }) {
  return <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 48 },
  content: { alignSelf: 'center', gap: 28, maxWidth: 650, paddingHorizontal: 20, paddingTop: 28, width: '100%' },
  stepContent: { gap: 24 },
  intro: { gap: 7 },
  stepLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  title: { fontSize: 30, fontWeight: '800', letterSpacing: -0.8, lineHeight: 36 },
  subtitle: { fontSize: 14, lineHeight: 21 },
  choices: { gap: 12 },
  formSection: { gap: 13 },
  dateRow: { flexDirection: 'row', gap: 12 },
  dateField: { flex: 1 },
  infoRow: { alignItems: 'center', borderRadius: 12, flexDirection: 'row', gap: 8, padding: 12 },
  infoText: { flex: 1, fontSize: 12, lineHeight: 17 },
  sectionTitle: { fontSize: 16, fontWeight: '800' },
  sectionHelp: { fontSize: 12, lineHeight: 17, marginTop: -7 },
  inputUnit: { fontSize: 13, fontWeight: '700', paddingRight: 15 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  error: { fontSize: 12 },
  scalingCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  scaleRow: { alignItems: 'center', flexDirection: 'row', gap: 10, minHeight: 72, padding: 12 },
  scaleIcon: { alignItems: 'center', borderRadius: 10, height: 38, justifyContent: 'center', width: 38 },
  scaleCopy: { flex: 1 },
  scaleSport: { fontSize: 14, fontWeight: '800' },
  scaleDescription: { fontSize: 11, marginTop: 3 },
  scaleInput: { borderRadius: 9, fontSize: 15, fontWeight: '700', minWidth: 60, paddingHorizontal: 10, paddingVertical: 9, textAlign: 'center' },
  settingRow: { alignItems: 'center', borderRadius: 16, borderWidth: 1, flexDirection: 'row', gap: 15, padding: 16 },
  settingCopy: { flex: 1 },
  settingTitle: { fontSize: 15, fontWeight: '800' },
  settingDescription: { fontSize: 12, lineHeight: 17, marginTop: 4 },
  successIcon: { alignItems: 'center', alignSelf: 'center', borderRadius: 35, height: 70, justifyContent: 'center', width: 70 },
  centeredIntro: { alignItems: 'center' },
  centeredText: { textAlign: 'center' },
  codeCard: { alignItems: 'center', borderRadius: 18, borderWidth: 1.5, paddingHorizontal: 20, paddingVertical: 26 },
  codeLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1.3 },
  code: { fontSize: 38, fontWeight: '800', letterSpacing: 8, marginLeft: 8, marginTop: 8 },
  summaryCard: { borderRadius: 14, borderWidth: 1, padding: 15 },
  summaryName: { fontSize: 16, fontWeight: '800' },
  summaryMeta: { fontSize: 12, lineHeight: 18, marginTop: 4 },
  dashboardButton: { alignItems: 'center', borderRadius: 13, borderWidth: 1, flexDirection: 'row', gap: 7, justifyContent: 'center', minHeight: 52 },
  dashboardButtonText: { fontSize: 15, fontWeight: '800' },
  pressed: { opacity: 0.7 },
});
