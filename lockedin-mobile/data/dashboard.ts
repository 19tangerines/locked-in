export type ChallengeMode = 'furthest_wins' | 'group_goal';

export type ChallengeStatus = 'active' | 'finalized';

export type DashboardChallenge = {
  id: string;
  name: string;
  mode: ChallengeMode;
  sports: string[];
  memberCount: number;
  status: ChallengeStatus;
  daysRemaining?: number;
  endedOn?: string;
  placement?: number;
  totalPlaces?: number;
  distance?: number;
  distanceUnit?: 'km' | 'mi';
  distanceFromNext?: number;
  goalProgress?: number;
  goalDistance?: number;
};

export type DashboardData = {
  user: {
    displayName: string;
    initials: string;
  };
  featuredChallengeId: string;
  challenges: DashboardChallenge[];
};

// This is the only source of dashboard content for now. When Supabase is wired up,
// this object can be replaced by the result of a dashboard query without changing
// the presentation components.
export const mockDashboardData: DashboardData = {
  user: {
    displayName: 'Sam',
    initials: 'S',
  },
  featuredChallengeId: 'may-marathon-club',
  challenges: [
    {
      id: 'may-marathon-club',
      name: 'May Marathon Club',
      mode: 'furthest_wins',
      sports: ['Running'],
      memberCount: 24,
      status: 'active',
      daysRemaining: 3,
      placement: 4,
      totalPlaces: 24,
      distance: 54.9,
      distanceUnit: 'km',
      distanceFromNext: 0.8,
    },
    {
      id: 'row-hard-june',
      name: 'Row Hard June',
      mode: 'furthest_wins',
      sports: ['Paddling'],
      memberCount: 8,
      status: 'active',
      daysRemaining: 12,
      placement: 4,
      totalPlaces: 8,
      distance: 31.6,
      distanceUnit: 'km',
    },
    {
      id: 'summer-distance-goal',
      name: 'Summer Distance Goal',
      mode: 'group_goal',
      sports: ['Running', 'Swimming', 'Paddling'],
      memberCount: 16,
      status: 'active',
      daysRemaining: 20,
      goalProgress: 68,
      goalDistance: 500,
      distanceUnit: 'km',
    },
    {
      id: 'feb-rowathon',
      name: 'February Rowathon',
      mode: 'furthest_wins',
      sports: ['Paddling'],
      memberCount: 18,
      status: 'finalized',
      endedOn: 'Feb 28',
      placement: 1,
      totalPlaces: 18,
      distance: 74.2,
      distanceUnit: 'km',
    },
    {
      id: 'march-miles',
      name: 'March Miles',
      mode: 'furthest_wins',
      sports: ['Running'],
      memberCount: 24,
      status: 'finalized',
      endedOn: 'Mar 31',
      placement: 4,
      totalPlaces: 24,
      distance: 82.7,
      distanceUnit: 'km',
    },
  ],
};
