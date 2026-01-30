import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Trophy,
  Target,
  Users,
  Calendar,
  Gift,
  Sparkles,
  Zap,
  Clock,
  DollarSign,
  TrendingUp,
  Star,
  Crown,
  AlertCircle,
  ChevronDown,
  X,
} from "lucide-react";
import { useContests, useTeamPerformance } from "./hooks.jsx";
import { DashboardSkeleton } from "@/components/ui/PageSkeleton";
import { useAuth } from "@/contexts/AuthContext";

const steps = [
  { id: 1, title: "Contest Type", subtitle: "Choose your competition style" },
  { id: 2, title: "Metrics & Goals", subtitle: "Define success criteria" },
  { id: 3, title: "Participants", subtitle: "Select your team" },
  { id: 4, title: "Duration", subtitle: "Set the timeline" },
  { id: 5, title: "Rewards", subtitle: "Configure prize pool" },
  { id: 6, title: "Review & Launch", subtitle: "Final confirmation" },
];

const contestTypes = [
  { id: "sprint", name: "Speed Sprint", icon: Zap, description: "Short, intense competition (1-3 days)", color: "from-primary to-pink-500" },
  { id: "marathon", name: "Marathon", icon: TrendingUp, description: "Extended challenge (1-4 weeks)", color: "from-secondary to-cyan-500" },
  { id: "knockout", name: "Knockout", icon: Target, description: "Elimination-style rounds", color: "from-warning to-orange-500" },
  { id: "team", name: "Team Battle", icon: Users, description: "Group vs group competition", color: "from-success to-emerald-500" },
];

const metrics = [
  { id: "revenue", name: "Revenue", unit: "$", icon: DollarSign },
  { id: "calls", name: "Calls Handled", unit: "calls", icon: Zap },
  { id: "qa", name: "QA Score", unit: "%", icon: Star },
  { id: "nps", name: "NPS Score", unit: "pts", icon: TrendingUp },
  { id: "aht", name: "AHT", unit: "sec", icon: Clock },
];

const rewardTiers = [
  { position: "1st", icon: Crown, color: "from-accent to-warning", prize: "" },
  { position: "2nd", icon: Trophy, color: "from-gray-300 to-gray-500", prize: "" },
  { position: "3rd", icon: Star, color: "from-amber-600 to-amber-800", prize: "" },
];

const ContestWizard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { actions: contestActions } = useContests(user?.id);
  const { data: teamData, loading } = useTeamPerformance(user?.id);
  
  // Show loading while auth is loading or if user is not authenticated
  if (authLoading || !user) {
    return <DashboardSkeleton />;
  }
  
  const [currentStep, setCurrentStep] = useState(1);
  const [teamMembers, setTeamMembers] = useState([]);
  const [formData, setFormData] = useState({
    contestType: "",
    contestName: "",
    selectedMetrics: [],
    targetValue: "",
    participants: [],
    startDate: "",
    endDate: "",
    duration: "3",
    rewards: [
      { position: 1, type: "points", value: "5000" },
      { position: 2, type: "points", value: "3000" },
      { position: 3, type: "points", value: "1500" },
    ],
    totalBudget: "500",
  });

  // Initialize team members from API
  useEffect(() => {
    if (teamData?.agents) {
      const members = teamData.agents.map((agent, idx) => ({
        id: idx + 1,
        name: agent.name,
        role: agent.role,
        avatar: agent.avatar,
        selected: true,
      }));
      setTeamMembers(members);
      setFormData(prev => ({
        ...prev,
        participants: members.filter(m => m.selected).map(m => m.id)
      }));
    }
  }, [teamData]);

  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleLaunch = async () => {
    await contestActions.create(formData);
    navigate("/manager/contests");
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  const selectedParticipants = teamMembers.filter(m => formData.participants.includes(m.id));

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Contest Name</label>
              <input
                type="text"
                value={formData.contestName}
                onChange={(e) => updateFormData("contestName", e.target.value)}
                placeholder="e.g., Q4 Revenue Blitz"
                className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-4">Select Contest Type</label>
              <div className="grid sm:grid-cols-2 gap-4">
                {contestTypes.map((type) => (
                  <motion.button
                    key={type.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => updateFormData("contestType", type.id)}
                    className={`p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden ${
                      formData.contestType === type.id
                        ? "border-primary bg-primary/10"
                        : "border-border/50 bg-muted/20 hover:border-primary/50"
                    }`}
                  >
                    {formData.contestType === type.id && (
                      <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center mb-3`}>
                      <type.icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-foreground mb-1">{type.name}</h4>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-4">Select Metrics to Track</label>
              <div className="grid sm:grid-cols-3 gap-3">
                {metrics.map((metric) => (
                  <motion.button
                    key={metric.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const current = formData.selectedMetrics;
                      if (current.includes(metric.id)) {
                        updateFormData("selectedMetrics", current.filter(m => m !== metric.id));
                      } else {
                        updateFormData("selectedMetrics", [...current, metric.id]);
                      }
                    }}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      formData.selectedMetrics.includes(metric.id)
                        ? "border-primary bg-primary/10"
                        : "border-border/50 bg-muted/20 hover:border-primary/50"
                    }`}
                  >
                    <metric.icon className={`w-5 h-5 mx-auto mb-2 ${formData.selectedMetrics.includes(metric.id) ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`text-sm font-medium ${formData.selectedMetrics.includes(metric.id) ? "text-primary" : "text-foreground"}`}>
                      {metric.name}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            {formData.selectedMetrics.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <label className="block text-sm font-medium text-foreground">Set Target Goal</label>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    value={formData.targetValue}
                    onChange={(e) => updateFormData("targetValue", e.target.value)}
                    placeholder="Enter target value"
                    className="flex-1 px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <div className="px-4 py-3 rounded-xl bg-primary/20 text-primary font-medium">
                    {metrics.find(m => m.id === formData.selectedMetrics[0])?.unit || "units"}
                  </div>
                </div>
              </motion.div>
            )}

            {/* AI Suggestion */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">AI Recommendation</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Based on your team's historical performance, a target of <span className="text-foreground font-medium">$45,000</span> for Revenue would be ambitious yet achievable (15% above current average).
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">Select Participants</label>
              <button
                onClick={() => {
                  const allIds = teamMembers.map(m => m.id);
                  updateFormData("participants", formData.participants.length === allIds.length ? [] : allIds);
                }}
                className="text-sm text-primary hover:underline"
              >
                {formData.participants.length === teamMembers.length ? "Deselect All" : "Select All"}
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
              {teamMembers.map((member) => (
                <motion.button
                  key={member.id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => {
                    const current = formData.participants;
                    if (current.includes(member.id)) {
                      updateFormData("participants", current.filter(id => id !== member.id));
                    } else {
                      updateFormData("participants", [...current, member.id]);
                    }
                  }}
                  className={`p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
                    formData.participants.includes(member.id)
                      ? "border-primary bg-primary/10"
                      : "border-border/50 bg-muted/20 hover:border-primary/50"
                  }`}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center text-white font-bold">
                      {member.avatar}
                    </div>
                    {formData.participants.includes(member.id) && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
              <p className="text-sm text-muted-foreground">
                <span className="text-foreground font-medium">{formData.participants.length}</span> of {teamMembers.length} agents selected
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Start Date & Time</label>
                <input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => updateFormData("startDate", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">End Date & Time</label>
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => updateFormData("endDate", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-base"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-4">Quick Duration Presets</label>
              <div className="flex flex-wrap gap-3">
                {["1", "3", "5", "7", "14", "30"].map((days) => (
                  <button
                    key={days}
                    onClick={() => updateFormData("duration", days)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      formData.duration === days
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {days} {parseInt(days) === 1 ? "day" : "days"}
                  </button>
                ))}
              </div>
            </div>

            {/* Timeline Preview */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-secondary/20 to-cyan-500/10 border border-secondary/30">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-secondary" />
                <span className="font-medium text-foreground">Timeline Preview</span>
              </div>
              <div className="relative">
                <div className="h-2 bg-muted/50 rounded-full">
                  <div className="h-full w-1/3 bg-gradient-to-r from-secondary to-cyan-500 rounded-full" />
                </div>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>Start</span>
                  <span className="text-secondary font-medium">{formData.duration} days</span>
                  <span>End</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Total Reward Budget</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="number"
                  value={formData.totalBudget}
                  onChange={(e) => updateFormData("totalBudget", e.target.value)}
                  placeholder="500"
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-4">Configure Prize Tiers</label>
              <div className="space-y-4">
                {rewardTiers.map((tier, idx) => (
                  <div key={tier.position} className="flex items-center gap-4 p-4 rounded-xl bg-muted/20 border border-border/50">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${tier.color} flex items-center justify-center`}>
                      <tier.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{tier.position} Place</p>
                      <p className="text-xs text-muted-foreground">Winner reward</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={formData.rewards[idx]?.value || ""}
                        onChange={(e) => {
                          const newRewards = [...formData.rewards];
                          newRewards[idx] = { ...newRewards[idx], value: e.target.value };
                          updateFormData("rewards", newRewards);
                        }}
                        placeholder="Points or prize"
                        className="w-32 px-3 py-2 rounded-lg bg-muted/30 border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                      <span className="text-sm text-muted-foreground">pts</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-r from-accent/20 to-warning/20 border border-accent/30">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="w-4 h-4 text-accent" />
                <span className="text-sm font-semibold text-accent">Reward Pool Summary</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Total allocation: <span className="text-foreground font-medium">${formData.totalBudget}</span> • 
                Distributed to top {selectedParticipants.length > 3 ? 3 : selectedParticipants.length} performers
              </p>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30">
              <h3 className="text-lg font-bold text-foreground mb-6">Contest Summary</h3>
              
              {/* Qualifiers Summary */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  Qualifiers Summary
                </h4>
                <div className="space-y-2">
                  {formData.selectedMetrics.length > 0 ? (
                    <div className="p-3 rounded-lg bg-muted/20 border border-border/50">
                      <p className="text-sm text-muted-foreground mb-1">Metrics:</p>
                      <p className="text-foreground font-medium">{formData.selectedMetrics.join(", ")}</p>
                      <p className="text-sm text-muted-foreground mt-2">Target: {formData.targetValue} {metrics.find(m => m.id === formData.selectedMetrics[0])?.unit || "units"}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No qualifiers selected</p>
                  )}
                </div>
              </div>

              {/* Rewards Summary */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Gift className="w-4 h-4 text-accent" />
                  Rewards Summary
                </h4>
                <div className="space-y-2">
                  {formData.rewards && formData.rewards.length > 0 ? (
                    formData.rewards.map((reward, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-muted/20 border border-border/50 flex justify-between items-center">
                        <div>
                          <p className="text-sm text-muted-foreground">Position {idx + 1}</p>
                          <p className="text-foreground font-medium">{reward.value || "Not set"} {reward.type === "points" ? "points" : ""}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No rewards configured</p>
                  )}
                </div>
              </div>

              {/* Other Details */}
              <div className="grid sm:grid-cols-2 gap-4 pt-6 border-t border-border/50">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Name</p>
                  <p className="font-medium text-foreground">{formData.contestName || "Untitled Contest"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Type</p>
                  <p className="font-medium text-foreground capitalize">{formData.contestType || "Not selected"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Duration</p>
                  <p className="font-medium text-foreground">{formData.duration} days</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Participants</p>
                  <p className="font-medium text-foreground">{formData.participants.length} agents</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Budget</p>
                  <p className="font-medium text-foreground">${formData.totalBudget}</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-success/10 border border-success/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                  <Check className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="font-medium text-success">Ready to Launch!</p>
                  <p className="text-sm text-muted-foreground">Your contest configuration is complete</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/manager/contests")}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>
              Create Contest
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between overflow-x-auto pb-2">
        {steps.map((step, idx) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                currentStep > step.id
                  ? "bg-success text-success-foreground"
                  : currentStep === step.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}>
                {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
              </div>
              <span className={`text-xs mt-2 hidden sm:block ${
                currentStep === step.id ? "text-foreground font-medium" : "text-muted-foreground"
              }`}>
                {step.title}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`w-12 lg:w-24 h-1 mx-2 rounded-full transition-all ${
                currentStep > step.id ? "bg-success" : "bg-muted"
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="p-6 lg:p-8 rounded-2xl bg-card/50 backdrop-blur border border-border/50"
      >
        {renderStepContent()}
      </motion.div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            currentStep === 1
              ? "text-muted-foreground cursor-not-allowed"
              : "text-foreground hover:bg-muted"
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </button>

        {currentStep < steps.length ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={nextStep}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-primary-foreground"
            style={{
              background: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(330 100% 50%) 100%)",
            }}
          >
            Next Step
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLaunch}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-success-foreground"
            style={{
              background: "linear-gradient(135deg, hsl(var(--success)) 0%, hsl(150 100% 40%) 100%)",
            }}
          >
            <Sparkles className="w-4 h-4" />
            Launch Contest
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default ContestWizard;