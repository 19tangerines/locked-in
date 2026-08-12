export type Standing = {
  userId: string;
  displayName: string;
  initials: string;
  distance: number;
  isCurrentUser?: boolean;
};

export type ChallengeActivity = {
  id: string;
  userId: string;
  displayName: string;
  initials: string;
  sport: 'Running' | 'Paddling' | 'Swimming' | 'Weightlifting';
  rawMeasurement: string;
  scaledDistance: number;
  occurredOn: string;
  activityDate?: string;
  relativeTime: string;
  isCurrentUser?: boolean;
  hasProofPhoto?: boolean;
};

export type ActivitySportConfig = {
  id: 'running' | 'paddling' | 'swimming' | 'weightlifting';
  label: ChallengeActivity['sport'];
  inputType: 'distance' | 'duration';
  scalingValue: number;
};

export type FurthestWinsChallenge = {
  id: string;
  name: string;
  modeLabel: string;
  sportLabel: string;
  daysRemaining: number;
  memberCount: number;
  startDate: string;
  endDate: string;
  timezone: string;
  currentUserRole: 'participant' | 'admin';
  admins: string[];
  distanceUnit: 'km' | 'mi';
  allowedSports: ActivitySportConfig[];
  proofPhotoRequired: boolean;
  standings: Standing[];
  activities: ChallengeActivity[];
};

const standings: Standing[] = [
  { userId: 'jordan', displayName: 'Jordan', initials: 'J', distance: 61.4 },
  { userId: 'maya', displayName: 'Maya', initials: 'M', distance: 58.2 },
  { userId: 'kai', displayName: 'Kai', initials: 'K', distance: 55.7 },
  { userId: 'current-user', displayName: 'You', initials: 'S', distance: 54.9, isCurrentUser: true },
  { userId: 'devon', displayName: 'Devon', initials: 'D', distance: 43.8 },
  { userId: 'amir', displayName: 'Amir', initials: 'A', distance: 41.2 },
  { userId: 'priya', displayName: 'Priya', initials: 'P', distance: 39.9 },
  { userId: 'tom', displayName: 'Tom', initials: 'T', distance: 38.1 },
  { userId: 'lena', displayName: 'Lena', initials: 'L', distance: 35.6 },
  { userId: 'omar', displayName: 'Omar', initials: 'O', distance: 33 },
  { userId: 'nina', displayName: 'Nina', initials: 'N', distance: 31.4 },
  { userId: 'ravi', displayName: 'Ravi', initials: 'R', distance: 29.8 },
  { userId: 'sofia', displayName: 'Sofia', initials: 'S', distance: 28.2 },
  { userId: 'ben', displayName: 'Ben', initials: 'B', distance: 26.9 },
  { userId: 'ada', displayName: 'Ada', initials: 'A', distance: 25.1 },
  { userId: 'leo', displayName: 'Leo', initials: 'L', distance: 23.7 },
  { userId: 'mira', displayName: 'Mira', initials: 'M', distance: 22 },
  { userId: 'zane', displayName: 'Zane', initials: 'Z', distance: 20.4 },
  { userId: 'cole', displayName: 'Cole', initials: 'C', distance: 18.8 },
  { userId: 'ivy', displayName: 'Ivy', initials: 'I', distance: 17.1 },
  { userId: 'finn', displayName: 'Finn', initials: 'F', distance: 15.3 },
  { userId: 'gia', displayName: 'Gia', initials: 'G', distance: 13 },
  { userId: 'theo', displayName: 'Theo', initials: 'T', distance: 10.4 },
  { userId: 'alex', displayName: 'Alex', initials: 'A', distance: 8.7 },
];

const activities: ChallengeActivity[] = [
  {
    id: 'activity-1',
    userId: 'jordan',
    displayName: 'Jordan',
    initials: 'J',
    sport: 'Running',
    rawMeasurement: '8.4 km',
    scaledDistance: 8.4,
    occurredOn: 'May 18',
    relativeTime: '2h ago',
  },
  {
    id: 'activity-2',
    userId: 'current-user',
    displayName: 'You',
    initials: 'S',
    sport: 'Running',
    rawMeasurement: '6.1 km',
    scaledDistance: 6.1,
    occurredOn: 'May 18',
    activityDate: '2026-05-18',
    relativeTime: '5h ago',
    isCurrentUser: true,
    hasProofPhoto: true,
  },
  {
    id: 'activity-3',
    userId: 'maya',
    displayName: 'Maya',
    initials: 'M',
    sport: 'Running',
    rawMeasurement: '5.2 km',
    scaledDistance: 5.2,
    occurredOn: 'May 17',
    relativeTime: 'Yesterday',
  },
  {
    id: 'activity-4',
    userId: 'devon',
    displayName: 'Devon',
    initials: 'D',
    sport: 'Paddling',
    rawMeasurement: '4.0 km',
    scaledDistance: 4,
    occurredOn: 'May 17',
    relativeTime: 'Yesterday',
  },
  {
    id: 'activity-5',
    userId: 'current-user',
    displayName: 'You',
    initials: 'S',
    sport: 'Paddling',
    rawMeasurement: '3.8 km',
    scaledDistance: 3.8,
    occurredOn: 'May 16',
    activityDate: '2026-05-16',
    relativeTime: '2d ago',
    isCurrentUser: true,
  },
  {
    id: 'activity-6',
    userId: 'kai',
    displayName: 'Kai',
    initials: 'K',
    sport: 'Swimming',
    rawMeasurement: '1.1 km',
    scaledDistance: 3.3,
    occurredOn: 'May 16',
    relativeTime: '2d ago',
  },
  {
    id: 'activity-7',
    userId: 'current-user',
    displayName: 'You',
    initials: 'S',
    sport: 'Weightlifting',
    rawMeasurement: '45 min',
    scaledDistance: 2.4,
    occurredOn: 'May 14',
    activityDate: '2026-05-14',
    relativeTime: '4d ago',
    isCurrentUser: true,
  },
];

export const mockFurthestWinsChallenge: FurthestWinsChallenge = {
  id: 'may-marathon-club',
  name: 'May Marathon Club',
  modeLabel: 'Furthest distance wins',
  sportLabel: 'Running + 3 sports',
  daysRemaining: 3,
  memberCount: standings.length,
  startDate: 'May 1, 2026',
  endDate: 'May 21, 2026',
  timezone: 'America/Los_Angeles',
  currentUserRole: 'participant',
  admins: ['Jordan Lee', 'Maya Chen'],
  distanceUnit: 'km',
  allowedSports: [
    { id: 'running', label: 'Running', inputType: 'distance', scalingValue: 1 },
    { id: 'paddling', label: 'Paddling', inputType: 'distance', scalingValue: 1 },
    { id: 'swimming', label: 'Swimming', inputType: 'distance', scalingValue: 3 },
    { id: 'weightlifting', label: 'Weightlifting', inputType: 'duration', scalingValue: 30 },
  ],
  proofPhotoRequired: false,
  standings,
  activities,
};

export function getMockFurthestWinsChallenge(id?: string) {
  if (!id || id === mockFurthestWinsChallenge.id) {
    return mockFurthestWinsChallenge;
  }

  return { ...mockFurthestWinsChallenge, id };
}
