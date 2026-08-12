import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import { LoginPage, RegisterPage } from './features/auth/components';

// Features - Roulette
import HomeSpinRewards from './features/roulette/components/HomeSpinRewards';
import GroupSpinFoodWheel from './features/groups/components/GroupSpinFoodWheel';
import SpinResult from './features/roulette/components/SpinResult';
import MysteryBoxReveal from './features/roulette/components/MysteryBoxReveal';

// Features - Lockets
import LocketFeed from './features/lockets/components/LocketFeed';
import ShareYourHarvestSuccess from './features/lockets/components/ShareYourHarvestSuccess';

// Features - Profile
import ProfileTasteProfile from './features/profile/components/ProfileTasteProfile';
import StreakDashboard from './features/profile/components/StreakDashboard';

// Features - Checkin
import CheckInVerification from './features/checkin/components/CheckInVerification';
import CheckInCompleteRewards from './features/checkin/components/CheckInCompleteRewards';
import WriteReview from './features/checkin/components/WriteReview';
import ReviewSubmitted from './features/checkin/components/ReviewSubmitted';

// Features - Groups
import GroupVoteVeto from './features/groups/components/GroupVoteVeto';
import GroupVoteResult from './features/groups/components/GroupVoteResult';
import GroupCheckInVerification from './features/groups/components/GroupCheckInVerification';
import GroupCheckInCompleteRewards from './features/groups/components/GroupCheckInCompleteRewards';

// Features - Rewards
import SeasonGarden from './features/rewards/components/SeasonGarden';
import EnhancedSeasonGardenProgress from './features/rewards/components/EnhancedSeasonGardenProgress';

// Features - Restaurants
import FriendsLeaderboardDetail from './features/restaurants/components/FriendsLeaderboardDetail';
import NearbyRestaurantsLeaderboard from './features/restaurants/components/NearbyRestaurantsLeaderboard';
import NearbyRestaurantsMapView from './features/restaurants/components/NearbyRestaurantsMapView';
import KhCCommitment from './features/restaurants/components/KhCCommitment';

// Features - Menu & AI
import MenuCaptureScreen from './features/menu/components/MenuCaptureScreen';
import MenuReviewScreen from './features/menu/components/MenuReviewScreen';
import PreferencesScreen from './features/profile/components/PreferencesScreen';

// Steward - Moderation
import ModerationLayout from './pages/steward/moderation/_layout';
import ModerationQueuePage from './pages/steward/moderation/queue';
import ModerationItemPage from './pages/steward/moderation/item/[id]';
import ModerationStatsPage from './pages/steward/moderation/stats';

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Auth Routes - No layout wrapper */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Main App Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomeSpinRewards />} />
          <Route path="/locket" element={<LocketFeed />} />
          <Route path="/profile" element={<ProfileTasteProfile />} />
          <Route path="/preferences" element={<PreferencesScreen />} />
          <Route path="/spin/result" element={<SpinResult />} />
          <Route path="/spin/menu-capture" element={<MenuCaptureScreen />} />
          <Route path="/spin/menu-review" element={<MenuReviewScreen />} />
          <Route path="/mystery-box" element={<MysteryBoxReveal />} />
          <Route path="/check-in" element={<CheckInVerification />} />
          <Route path="/check-in/rewards" element={<CheckInCompleteRewards />} />
          <Route path="/review" element={<WriteReview />} />
          <Route path="/review/submitted" element={<ReviewSubmitted />} />
          <Route path="/group-spin/spin" element={<GroupSpinFoodWheel />} />
          <Route path="/group-spin/veto" element={<GroupVoteVeto />} />
          <Route path="/group-spin/result" element={<GroupVoteResult />} />
          <Route path="/group-check-in" element={<GroupCheckInVerification />} />
          <Route path="/group-check-in/rewards" element={<GroupCheckInCompleteRewards />} />
          <Route path="/garden" element={<SeasonGarden />} />
          <Route path="/garden/enhanced" element={<EnhancedSeasonGardenProgress />} />
          <Route path="/streak" element={<StreakDashboard />} />
          <Route path="/leaderboard" element={<FriendsLeaderboardDetail />} />
          <Route path="/leaderboard/restaurants" element={<NearbyRestaurantsLeaderboard />} />
          <Route path="/leaderboard/map" element={<NearbyRestaurantsMapView />} />
          <Route path="/commitment" element={<KhCCommitment />} />
          <Route path="/share/harvest" element={<ShareYourHarvestSuccess />} />
        </Route>

        {/* Steward - Moderation (separate layout, no MainLayout wrapper) */}
        <Route path="/steward/moderation" element={<ModerationLayout />}>
          <Route index element={<ModerationQueuePage />} />
          <Route path="queue" element={<ModerationQueuePage />} />
          <Route path="queue/:id" element={<ModerationItemPage />} />
          <Route path="stats" element={<ModerationStatsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
