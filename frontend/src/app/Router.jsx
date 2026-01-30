import { Routes, Route, Navigate } from "react-router-dom";

// Public Pages
import Landing from "../pages/public/Landing";
import Login from "../pages/public/Login";
import ArenaLoading from "../pages/public/ArenaLoading";

// Agent Pages
import AgentHome from "../pages/agent/AgentHome";
import PlayZone from "../pages/agent/PlayZone";
import Performance from "../pages/agent/Performance";
import Leaderboard from "../pages/agent/Leaderboard";
import RewardsAndAchievements from "../pages/agent/RewardsAndAchievements";

// Manager Pages
import ManagerOverview from "../pages/manager/ManagerOverview";
import TeamPerformance from "../pages/manager/TeamPerformance";
import ContestManagement from "../pages/manager/ContestManagement";
import ContestWizard from "../pages/manager/ContestWizard";
import ManagerContestBuilder from "../pages/manager/ManagerContestBuilder";
import RewardsAudit from "../pages/manager/RewardsAudit";
import Reports from "../pages/manager/Reports";
import MyTeam from "../pages/manager/MyTeam";
import ManagerLeaderboard from "../pages/manager/ManagerLeaderboard";
import Settings from "../pages/manager/Settings";

// Leadership Pages
import LeadershipOverview from "../pages/leadership/LeadershipOverview";
import LeadershipLeaderboards from "../pages/leadership/LeadershipLeaderboards";
import LeadershipReports from "../pages/leadership/LeadershipReports";
import LeadershipROI from "../pages/leadership/LeadershipROI";

// Admin Pages
import AdminOverview from "../pages/admin/AdminOverview";
import MetricConfiguration from "../pages/admin/MetricConfiguration";
import PointsRulesEngine from "../pages/admin/PointsRulesEngine";
import RewardsCatalog from "../pages/admin/RewardsCatalog";
import AuditLogs from "../pages/admin/AuditLogs";
import ContestBuilder from "../pages/admin/ContestBuilder";
import DataUpload from "../pages/admin/DataUpload";

// Public Pages - Additional
import ContestPage from "../pages/public/ContestPage";

// Layouts
import PublicLayout from "../layouts/PublicLayout";
import AgentLayout from "../layouts/AgentLayout";
import ManagerLayout from "../layouts/ManagerLayout";
import LeadershipLayout from "../layouts/LeadershipLayout";
import AdminLayout from "../layouts/AdminLayout";

const Router = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/arena-loading" element={<ArenaLoading />} />
        <Route path="/loading" element={<ArenaLoading />} />
        <Route path="/contests" element={<ContestPage />} />
      </Route>

      {/* Agent Routes */}
      <Route path="/agent" element={<AgentLayout />}>
        <Route index element={<AgentHome />} />
        <Route path="play" element={<PlayZone />} />
        <Route path="performance" element={<Performance />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="rewards" element={<RewardsAndAchievements />} />
      </Route>

      {/* Manager Routes */}
      <Route path="/manager" element={<ManagerLayout />}>
        <Route index element={<ManagerOverview />} />
        <Route path="performance" element={<ManagerLeaderboard />} />
        <Route path="contests" element={<ContestManagement />} />
        <Route path="rewards" element={<RewardsAudit />} />
        <Route path="reports" element={<Reports />} />
        <Route path="contests/new" element={<ManagerContestBuilder />} />
        <Route path="contests/wizard" element={<ContestWizard />} />
        <Route path="team" element={<MyTeam />} />
        <Route path="leaderboard" element={<ManagerLeaderboard />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Leadership Routes */}
      <Route path="/leadership" element={<LeadershipLayout />}>
        <Route index element={<LeadershipOverview />} />
        <Route path="leaderboards" element={<LeadershipLeaderboards />} />
        <Route path="reports" element={<LeadershipReports />} />
        <Route path="roi" element={<LeadershipROI />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminOverview />} />
        <Route path="metrics" element={<MetricConfiguration />} />
        <Route path="points" element={<PointsRulesEngine />} />
        <Route path="rewards" element={<RewardsCatalog />} />
        <Route path="audit" element={<AuditLogs />} />
        <Route path="contests" element={<ContestBuilder />} />
        <Route path="upload" element={<DataUpload />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default Router;
