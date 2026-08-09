// Application routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
  },
  LOCKET: '/locket',
  PROFILE: '/profile',
  PREFERENCES: '/preferences',
  SPIN: '/spin',
  SPIN_RESULT: '/spin/result',
  SPIN_MENU_CAPTURE: '/spin/menu-capture',
  SPIN_MENU_REVIEW: '/spin/menu-review',
  MYSTERY_BOX: '/mystery-box',
  CHECK_IN: '/check-in',
  CHECK_IN_REWARDS: '/check-in/rewards',
  REVIEW: '/review',
  REVIEW_SUBMITTED: '/review/submitted',
  GROUP_SPIN: {
    WHO_SPINS: '/group-spin/who-spins',
    VETO: '/group-spin/veto',
    RESULT: '/group-spin/result',
  },
  GROUP_CHECK_IN: {
    VERIFICATION: '/group-check-in',
    REWARDS: '/group-check-in/rewards',
  },
  GARDEN: '/garden',
  GARDEN_ENHANCED: '/garden/enhanced',
  STREAK: '/streak',
  LEADERBOARD: '/leaderboard',
  LEADERBOARD_RESTAURANTS: '/leaderboard/restaurants',
  LEADERBOARD_MAP: '/leaderboard/map',
  COMMITMENT: '/commitment',
  SHARE_HARVEST: '/share/harvest',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
