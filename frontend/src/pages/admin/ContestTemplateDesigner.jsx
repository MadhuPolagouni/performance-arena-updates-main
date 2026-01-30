/**
 * Contest Template Designer - Enhanced
 * Visual template builder with theme customization, metrics, rewards, and logo/icon uploads
 */
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Palette,
  Settings,
  Plus,
  Trash2,
  Copy,
  Check,
  AlertCircle,
  Upload,
  Image,
  Trophy,
  Target,
  Gift,
  Calendar,
  Users,
  Zap,
  Star,
  Flame,
  Rocket,
  Crown,
  Medal,
  Eye,
  CheckCircle,
  PartyPopper,
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
import { adminApi, managerApi } from "@/api";
import { useAuth } from "@/contexts/AuthContext";
import { Portal } from "@/components/ui/Portal";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";

const THEME_PRESETS = [
  {
    id: "purple-blitz",
    name: "Purple Blitz",
    primary: "#8B5CF6",
    secondary: "#A855F7",
    accent: "#EC4899",
    backgroundColor: "#1a1a2e",
  },
  {
    id: "ocean-wave",
    name: "Ocean Wave",
    primary: "#3B82F6",
    secondary: "#0EA5E9",
    accent: "#06B6D4",
    backgroundColor: "#0f172a",
  },
  {
    id: "fire-storm",
    name: "Fire Storm",
    primary: "#EF4444",
    secondary: "#F97316",
    accent: "#FBBF24",
    backgroundColor: "#1a1a1a",
  },
  {
    id: "neon-nights",
    name: "Neon Nights",
    primary: "#EC4899",
    secondary: "#8B5CF6",
    accent: "#00D9FF",
    backgroundColor: "#0a0e27",
  },
  {
    id: "emerald-forest",
    name: "Emerald Forest",
    primary: "#10B981",
    secondary: "#059669",
    accent: "#34D399",
    backgroundColor: "#0f1f1a",
  },
  {
    id: "golden-glory",
    name: "Golden Glory",
    primary: "#F59E0B",
    secondary: "#D97706",
    accent: "#FCD34D",
    backgroundColor: "#1f1a0f",
  },
];

const ICON_OPTIONS = [
  { id: "trophy", name: "Trophy", icon: Trophy },
  { id: "star", name: "Star", icon: Star },
  { id: "zap", name: "Lightning", icon: Zap },
  { id: "flame", name: "Flame", icon: Flame },
  { id: "target", name: "Target", icon: Target },
  { id: "rocket", name: "Rocket", icon: Rocket },
  { id: "crown", name: "Crown", icon: Crown },
  { id: "medal", name: "Medal", icon: Medal },
];

const METRIC_SUGGESTIONS = [
  { name: "Customer Satisfaction (CSAT)", target: ">= 95%", weightage: 25 },
  { name: "Average Handle Time (AHT)", target: "<= 180s", weightage: 20 },
  { name: "First Call Resolution (FCR)", target: ">= 85%", weightage: 20 },
  { name: "Quality Assurance Score", target: ">= 90%", weightage: 15 },
  { name: "Sales Conversion Rate", target: ">= 15%", weightage: 10 },
  { name: "Customer Retention", target: ">= 92%", weightage: 10 },
];

const REWARD_POSITION_OPTIONS = [
  "1st Place",
  "2nd Place",
  "3rd Place",
  "Top 5",
  "Top 10",
  "Top 20%",
  "Participation",
];

const ContestTemplateDesigner = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  onDataChange,
  creatorRole = 'admin',
  inline = false, // When true, renders without modal wrapper
}) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [savedContest, setSavedContest] = useState(null);
  const totalSteps = 5;
  const logoInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    startDate: initialData?.startDate || "",
    endDate: initialData?.endDate || "",
    targetAudience: initialData?.targetAudience || "all",
    bannerText: initialData?.bannerText || "",
    contestIcon: initialData?.contestIcon || "trophy",
    logoUrl: initialData?.logoUrl || "",
    theme: initialData?.theme || {
      primary: "#8B5CF6",
      secondary: "#A855F7",
      accent: "#EC4899",
      backgroundColor: "#1a1a2e",
    },
    metrics: initialData?.metrics || [],
    qualifiers: initialData?.qualifiers || [],
    slabs: initialData?.slabs || [],
    rewards: initialData?.rewards || [],
  });

  const updateFormData = (key, value) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    onDataChange?.(updated);
  };

  const updateTheme = (key, value) => {
    const updated = {
      ...formData,
      theme: { ...formData.theme, [key]: value },
    };
    setFormData(updated);
    onDataChange?.(updated);
  };

  const selectThemePreset = (preset) => {
    const updated = {
      ...formData,
      theme: {
        primary: preset.primary,
        secondary: preset.secondary,
        accent: preset.accent,
        backgroundColor: preset.backgroundColor,
      },
    };
    setFormData(updated);
    onDataChange?.(updated);
  };

  // Metrics management
  // Qualifiers & Slabs management (replaces metric weightage flow)
  const addQualifier = () => {
    const newQ = { id: Date.now(), name: '', operator: '>=', target: '' };
    updateFormData('qualifiers', [...formData.qualifiers, newQ]);
  };

  const updateQualifier = (id, field, value) => {
    const updated = formData.qualifiers.map(q => q.id === id ? { ...q, [field]: value } : q);
    updateFormData('qualifiers', updated);
  };

  const deleteQualifier = (id) => {
    const updated = formData.qualifiers.filter(q => q.id !== id);
    updateFormData('qualifiers', updated);
  };

  const addSlab = () => {
    const newS = { id: Date.now(), metric: '', lower: '', upper: '', rewardTitle: '' };
    updateFormData('slabs', [...formData.slabs, newS]);
  };

  const updateSlab = (id, field, value) => {
    const updated = formData.slabs.map(s => s.id === id ? { ...s, [field]: value } : s);
    updateFormData('slabs', updated);
  };

  const deleteSlab = (id) => {
    const updated = formData.slabs.filter(s => s.id !== id);
    updateFormData('slabs', updated);
  };

  // Rewards management
  const addReward = () => {
    const newReward = {
      id: Date.now(),
      position: "",
      title: "",
      description: "",
      points: 0,
    };
    const updated = [...formData.rewards, newReward];
    updateFormData("rewards", updated);
  };

  const updateReward = (id, field, value) => {
    const updated = formData.rewards.map((r) =>
      r.id === id ? { ...r, [field]: value } : r
    );
    updateFormData("rewards", updated);
  };

  const deleteReward = (id) => {
    const updated = formData.rewards.filter((r) => r.id !== id);
    updateFormData("rewards", updated);
  };

  // Logo upload handler
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateFormData("logoUrl", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Deprecated metrics weightage (using qualifiers/slabs now)
  const totalWeightage = 0;

  const handleSave = async (publish = false) => {
    try {
      setIsSubmitting(true);
      
      const contestPayload = {
        ...formData,
        status: publish ? 'published' : 'draft',
        creatorId: user?.id || (creatorRole === 'manager' ? 'manager-1' : 'admin-1'),
        creatorName: user?.name || user?.email?.split('@')[0] || (creatorRole === 'manager' ? 'Manager' : 'Admin'),
      };
      
      // Use the appropriate API based on creator role
      const api = creatorRole === 'manager' ? managerApi : adminApi;
      const result = await api.createContest(contestPayload);
      
      if (result.success) {
        setSavedContest(result.contest);
        setShowSuccessModal(true);
        onSave?.(result.contest);
      }
    } catch (error) {
      console.error('Error saving contest:', error);
      alert('Failed to save contest. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setSavedContest(null);
    setStep(1);
    setFormData({
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      targetAudience: "all",
      bannerText: "",
      contestIcon: "trophy",
      logoUrl: "",
      theme: {
        primary: "#8B5CF6",
        secondary: "#A855F7",
        accent: "#EC4899",
        backgroundColor: "#1a1a2e",
      },
      metrics: [],
      rewards: [],
    });
    onClose();
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.name && formData.startDate && formData.endDate;
      case 2:
        return true; // Theme is optional with defaults
      case 3:
        return (formData.qualifiers || []).length >= 2;
      case 4:
        return formData.rewards.length > 0;
      case 5:
        return true;
      default:
        return true;
    }
  };

  // IMPORTANT: render modal via Portal so it can't be clipped by layout transforms/overflow
  useLockBodyScroll(Boolean(isOpen) && !inline);

  if (!isOpen && !inline) return null;

  const content = (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className={cn(
        "w-full overflow-hidden rounded-2xl glass-card border border-border/50 flex flex-col",
        inline ? "max-h-none" : "max-w-5xl max-h-[90vh]"
      )}
    >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50 bg-card/50">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Contest Template Designer</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Step {step} of {totalSteps} •{" "}
              {step === 1 && "Basic Information"}
              {step === 2 && "Theme & Branding"}
              {step === 3 && "Performance Metrics"}
              {step === 4 && "Reward Tiers"}
              {step === 5 && "Preview & Publish"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-muted/20">
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  "h-2 flex-1 rounded-full transition-all duration-300",
                  idx + 1 <= step ? "bg-primary" : "bg-muted/30"
                )}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Basic Info</span>
            <span>Theme</span>
            <span>Metrics</span>
            <span>Rewards</span>
            <span>Preview</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Contest Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => updateFormData("name", e.target.value)}
                        placeholder="e.g., Q1 Performance Championship"
                        className="w-full px-4 py-3 rounded-lg bg-muted/30 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => updateFormData("description", e.target.value)}
                        placeholder="Describe the contest objectives and how winners will be determined..."
                        rows={4}
                        className="w-full px-4 py-3 rounded-lg bg-muted/30 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          <Calendar className="w-4 h-4 inline mr-2" />
                          Start Date *
                        </label>
                        <input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => updateFormData("startDate", e.target.value)}
                          className="w-full px-4 py-3 rounded-lg bg-muted/30 border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          <Calendar className="w-4 h-4 inline mr-2" />
                          End Date *
                        </label>
                        <input
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => updateFormData("endDate", e.target.value)}
                          className="w-full px-4 py-3 rounded-lg bg-muted/30 border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        <Users className="w-4 h-4 inline mr-2" />
                        Target Audience
                      </label>
                      <select
                        value={formData.targetAudience}
                        onChange={(e) => updateFormData("targetAudience", e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-muted/30 border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        <option value="all">All Users</option>
                        <option value="agents">Agents Only</option>
                        <option value="managers">Managers Only</option>
                        <option value="sales">Sales Department</option>
                        <option value="support">Support Department</option>
                        <option value="custom">Custom Selection</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Banner Tagline
                      </label>
                      <input
                        type="text"
                        value={formData.bannerText}
                        onChange={(e) => updateFormData("bannerText", e.target.value)}
                        placeholder="e.g., Rise Above. Compete. Win Big!"
                        className="w-full px-4 py-3 rounded-lg bg-muted/30 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Theme & Branding */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Theme Presets */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Select Theme Preset
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {THEME_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => selectThemePreset(preset)}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all text-center group",
                          formData.theme.primary === preset.primary
                            ? "border-primary bg-primary/10 scale-105"
                            : "border-border/50 hover:border-primary/50"
                        )}
                      >
                        <div className="flex items-center justify-center gap-1 mb-2">
                          <div
                            className="w-6 h-6 rounded-full"
                            style={{ backgroundColor: preset.primary }}
                          />
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: preset.secondary }}
                          />
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: preset.accent }}
                          />
                        </div>
                        <p className="text-xs font-medium text-foreground">{preset.name}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Colors */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-4">Custom Colors</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {["primary", "secondary", "accent", "backgroundColor"].map((colorKey) => (
                      <div key={colorKey}>
                        <label className="block text-xs font-medium text-muted-foreground mb-2 capitalize">
                          {colorKey.replace(/([A-Z])/g, " $1").trim()}
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={formData.theme[colorKey]}
                            onChange={(e) => updateTheme(colorKey, e.target.value)}
                            className="w-12 h-10 rounded cursor-pointer border-0"
                          />
                          <input
                            type="text"
                            value={formData.theme[colorKey]}
                            onChange={(e) => updateTheme(colorKey, e.target.value)}
                            className="flex-1 px-3 py-2 rounded-lg bg-muted/30 border border-border/50 text-sm text-foreground font-mono"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contest Icon */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-4">Contest Icon</h3>
                  <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                    {ICON_OPTIONS.map((option) => {
                      const IconComponent = option.icon;
                      return (
                        <button
                          key={option.id}
                          onClick={() => updateFormData("contestIcon", option.id)}
                          className={cn(
                            "p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                            formData.contestIcon === option.id
                              ? "border-primary bg-primary/10"
                              : "border-border/50 hover:border-primary/50"
                          )}
                        >
                          <IconComponent
                            className="w-6 h-6"
                            style={{ color: formData.theme.primary }}
                          />
                          <span className="text-xs text-muted-foreground">{option.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Logo Upload */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-4">Custom Logo (Optional)</h3>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => logoInputRef.current?.click()}
                      className="px-4 py-3 rounded-lg border-2 border-dashed border-border/50 hover:border-primary/50 transition-colors flex items-center gap-2"
                    >
                      <Upload className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Upload Logo</span>
                    </button>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    {formData.logoUrl && (
                      <div className="relative">
                        <img
                          src={formData.logoUrl}
                          alt="Contest logo"
                          className="w-16 h-16 rounded-lg object-cover border border-border/50"
                        />
                        <button
                          onClick={() => updateFormData("logoUrl", "")}
                          className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-destructive-foreground"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Performance Metrics (Qualifiers & Slabs) */}
            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="p-4 rounded-xl bg-muted/20 border border-border/50">
                  <h3 className="text-sm font-semibold text-foreground">Qualifiers</h3>
                  <p className="text-xs text-muted-foreground mt-1">Add qualifier conditions that determine who qualifies for the contest (minimum 2 qualifiers required).</p>
                  <div className="mt-3 flex gap-2">
                    <button onClick={addQualifier} className="px-3 py-1.5 rounded-lg bg-primary/20 text-primary text-xs font-medium">Add Qualifier</button>
                  </div>
                </div>

                <div className="space-y-3">
                  {formData.qualifiers.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-border/50 rounded-xl">
                      <p className="text-sm text-muted-foreground">No qualifiers added yet. Add at least two qualifiers to proceed.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {formData.qualifiers.map((q) => (
                        <GlassCard key={q.id} className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                            <div className="md:col-span-3">
                              <label className="block text-xs text-muted-foreground mb-1">Qualifier Name</label>
                              <input value={q.name} onChange={(e) => updateQualifier(q.id, 'name', e.target.value)} className="w-full px-3 py-2 rounded-lg bg-muted/30 border border-border/50 text-sm" placeholder="e.g., Revenue Generated" />
                            </div>
                            <div>
                              <label className="block text-xs text-muted-foreground mb-1">Operator</label>
                              <select value={q.operator} onChange={(e) => updateQualifier(q.id, 'operator', e.target.value)} className="w-full px-3 py-2 rounded-lg bg-muted/30 border border-border/50 text-sm">
                                <option value=">=">&gt;=</option>
                                <option value=">">&gt;</option>
                                <option value="<=">&lt;=</option>
                                <option value="<">&lt;</option>
                                <option value="=">=</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs text-muted-foreground mb-1">Target</label>
                              <input value={q.target} onChange={(e) => updateQualifier(q.id, 'target', e.target.value)} placeholder="e.g., 10000 or >=95%" className="w-full px-3 py-2 rounded-lg bg-muted/30 border border-border/50 text-sm" />
                            </div>
                            <div className="md:col-span-1">
                              <button onClick={() => deleteQualifier(q.id)} className="w-full px-3 py-2 rounded-lg bg-destructive/20 text-destructive text-sm">Delete</button>
                            </div>
                          </div>
                        </GlassCard>
                      ))}
                    </div>
                  )}
                </div>

                {/* Slabs - shown once qualifiers >= 2 */}
                {formData.qualifiers.length >= 2 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-foreground">Slabs (optional)</h3>
                      <button onClick={addSlab} className="px-3 py-1.5 rounded-lg bg-primary/20 text-primary text-xs font-medium">Add Slab</button>
                    </div>

                    {formData.slabs.length === 0 ? (
                      <div className="text-center py-6 border-2 border-dashed border-border/50 rounded-xl">
                        <p className="text-sm text-muted-foreground">No slabs defined. Add slabs to reward ranges driven by contest metrics.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {formData.slabs.map(s => (
                          <GlassCard key={s.id} className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                              <div className="md:col-span-2">
                                <label className="block text-xs text-muted-foreground mb-1">Metric</label>
                                <select value={s.metric} onChange={(e) => updateSlab(s.id, 'metric', e.target.value)} className="w-full px-3 py-2 rounded-lg bg-muted/30 border border-border/50 text-sm">
                                  <option value="">Select metric (qualifier)</option>
                                  {formData.qualifiers.map(q => <option key={q.id} value={q.name}>{q.name}</option>)}
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs text-muted-foreground mb-1">Lower</label>
                                <input value={s.lower} onChange={(e) => updateSlab(s.id, 'lower', e.target.value)} className="w-full px-3 py-2 rounded-lg bg-muted/30 border border-border/50 text-sm" />
                              </div>
                              <div>
                                <label className="block text-xs text-muted-foreground mb-1">Upper</label>
                                <input value={s.upper} onChange={(e) => updateSlab(s.id, 'upper', e.target.value)} className="w-full px-3 py-2 rounded-lg bg-muted/30 border border-border/50 text-sm" />
                              </div>
                              <div>
                                <label className="block text-xs text-muted-foreground mb-1">Reward Title</label>
                                <input value={s.rewardTitle} onChange={(e) => updateSlab(s.id, 'rewardTitle', e.target.value)} className="w-full px-3 py-2 rounded-lg bg-muted/30 border border-border/50 text-sm" placeholder="e.g., Sipper" />
                              </div>
                              <div>
                                <button onClick={() => deleteSlab(s.id)} className="w-full px-3 py-2 rounded-lg bg-destructive/20 text-destructive text-sm">Delete</button>
                              </div>
                            </div>
                          </GlassCard>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 4: Reward Tiers */}
            {step === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Reward Tiers</h3>
                    <p className="text-xs text-muted-foreground mt-1">Define rewards for different positions</p>
                  </div>
                  <button
                    onClick={addReward}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/20 text-primary text-xs font-medium hover:bg-primary/30 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Reward Tier
                  </button>
                </div>

                {formData.rewards.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-border/50 rounded-xl">
                    <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-sm text-muted-foreground">No reward tiers added yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Add rewards to motivate participants</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {formData.rewards.map((reward, idx) => (
                      <GlassCard key={reward.id} className="p-4 relative">
                        <button
                          onClick={() => deleteReward(reward.id)}
                          className="absolute top-3 right-3 p-1.5 rounded-lg bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">
                              Position *
                            </label>
                            <select
                              value={reward.position}
                              onChange={(e) => updateReward(reward.id, "position", e.target.value)}
                              className="w-full px-3 py-2 rounded-lg bg-muted/30 border border-border/50 text-sm text-foreground"
                            >
                              <option value="">Select position...</option>
                              {REWARD_POSITION_OPTIONS.map((pos) => (
                                <option key={pos} value={pos}>{pos}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">
                              Reward Title *
                            </label>
                            <input
                              type="text"
                              value={reward.title}
                              onChange={(e) => updateReward(reward.id, "title", e.target.value)}
                              placeholder="e.g., Champion's Prize"
                              className="w-full px-3 py-2 rounded-lg bg-muted/30 border border-border/50 text-sm text-foreground"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">
                              Description
                            </label>
                            <textarea
                              value={reward.description}
                              onChange={(e) => updateReward(reward.id, "description", e.target.value)}
                              placeholder="Describe the reward..."
                              rows={2}
                              className="w-full px-3 py-2 rounded-lg bg-muted/30 border border-border/50 text-sm text-foreground resize-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">
                              Points Value
                            </label>
                            <input
                              type="number"
                              value={reward.points}
                              onChange={(e) => updateReward(reward.id, "points", parseInt(e.target.value) || 0)}
                              min="0"
                              className="w-full px-3 py-2 rounded-lg bg-muted/30 border border-border/50 text-sm text-foreground"
                            />
                          </div>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 5: Preview & Publish */}
            {step === 5 && (
              <motion.div
                key="step-5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-foreground">Contest Preview</h3>
                  <p className="text-sm text-muted-foreground">Review how your contest will appear</p>
                </div>

                {/* Live Banner Preview */}
                <div className="rounded-xl overflow-hidden border-2 border-dashed" style={{ borderColor: formData.theme.primary }}>
                  <div
                    className="p-8 text-white"
                    style={{
                      background: `linear-gradient(135deg, ${formData.theme.primary}ee 0%, ${formData.theme.accent}ee 100%)`,
                    }}
                  >
                    <div className="max-w-2xl">
                      <div className="flex items-center gap-3 mb-4">
                        {formData.logoUrl ? (
                          <img src={formData.logoUrl} alt="Logo" className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          (() => {
                            const IconComp = ICON_OPTIONS.find(i => i.id === formData.contestIcon)?.icon || Trophy;
                            return <IconComp className="w-10 h-10" style={{ color: formData.theme.secondary }} />;
                          })()
                        )}
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20">
                          NEW CONTEST
                        </span>
                      </div>

                      <h1 className="text-3xl md:text-4xl font-bold mb-2">
                        {formData.name || "Contest Name"}
                      </h1>
                      <p className="text-sm md:text-base opacity-90 mb-2 max-w-lg">
                        {formData.description || "Contest description goes here..."}
                      </p>
                      {formData.bannerText && (
                        <p className="text-lg font-semibold italic mb-6">"{formData.bannerText}"</p>
                      )}

                      <div className="flex flex-wrap items-center gap-6 mb-6">
                        <div>
                          <p className="text-xs opacity-75 mb-1">Duration</p>
                          <p className="font-bold text-lg">
                            {formData.startDate && formData.endDate
                              ? `${Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24))} Days`
                              : "-- Days"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs opacity-75 mb-1">Qualifiers</p>
                          <p className="font-bold text-lg">{(formData.qualifiers || []).length}</p>
                        </div>
                        <div>
                          <p className="text-xs opacity-75 mb-1">Slabs</p>
                          <p className="font-bold text-lg">{(formData.slabs || []).length}</p>
                        </div>
                        <div>
                          <p className="text-xs opacity-75 mb-1">Reward Tiers</p>
                          <p className="font-bold text-lg">{formData.rewards.length}</p>
                        </div>
                      </div>

                      <button
                        className="px-6 py-2.5 rounded-lg font-semibold"
                        style={{ backgroundColor: formData.theme.secondary, color: "white" }}
                      >
                        REGISTER & JOIN
                      </button>
                    </div>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid md:grid-cols-2 gap-4">
                  <GlassCard className="p-4">
                      <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4 text-primary" />
                        Qualifiers Summary
                      </h4>
                      <div className="space-y-2">
                        {(formData.qualifiers || []).slice(0,4).map((q, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{q.name || "Unnamed"}</span>
                            <span className="text-foreground font-medium">{q.operator} {q.target}</span>
                          </div>
                        ))}
                        {(formData.qualifiers || []).length > 4 && (
                          <p className="text-xs text-muted-foreground">+{(formData.qualifiers || []).length - 4} more...</p>
                        )}
                      </div>
                  </GlassCard>

                  <GlassCard className="p-4">
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Gift className="w-4 h-4 text-accent" />
                      Rewards Summary
                    </h4>
                    <div className="space-y-2">
                      {formData.rewards.slice(0, 4).map((r, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{r.position || "Position"}</span>
                          <span className="text-foreground font-medium">{r.points} pts</span>
                        </div>
                      ))}
                      {formData.rewards.length > 4 && (
                        <p className="text-xs text-muted-foreground">+{formData.rewards.length - 4} more...</p>
                      )}
                    </div>
                  </GlassCard>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between p-6 border-t border-border/50 bg-card/50">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1 || isSubmitting}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              step === 1 || isSubmitting
                ? "text-muted-foreground cursor-not-allowed"
                : "text-foreground hover:bg-muted"
            )}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex items-center gap-3">
            {step < totalSteps ? (
              <button
                onClick={() => setStep(Math.min(totalSteps, step + 1))}
                disabled={!canProceed()}
                className={cn(
                  "flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-colors",
                  canProceed()
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleSave(false)}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Saving..." : "Save as Draft"}
                </button>
                <button
                  onClick={() => handleSave(true)}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg bg-success text-success-foreground text-sm font-medium hover:bg-success/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Zap className="w-4 h-4" />
                  {isSubmitting ? "Publishing..." : "Publish Contest"}
                </button>
              </>
            )}
          </div>
        </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10050] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-full max-w-md rounded-2xl glass-card border border-success/50 p-8 text-center relative overflow-hidden"
            >
              {/* Confetti Animation Background */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {Array.from({ length: 30 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: -20, x: Math.random() * 400, opacity: 1 }}
                    animate={{ y: 500, rotate: Math.random() * 360 }}
                    transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5 }}
                    className="absolute w-3 h-3 rounded-sm"
                    style={{
                      backgroundColor: ["#8B5CF6", "#EC4899", "#10B981", "#F59E0B", "#3B82F6"][Math.floor(Math.random() * 5)],
                      left: `${Math.random() * 100}%`,
                    }}
                  />
                ))}
              </div>

              {/* Success Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2, bounce: 0.5 }}
                className="relative z-10 w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-success/30 to-success/10 flex items-center justify-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="w-14 h-14 rounded-full bg-success flex items-center justify-center shadow-lg shadow-success/30"
                >
                  <CheckCircle className="w-8 h-8 text-success-foreground" />
                </motion.div>
              </motion.div>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="relative z-10"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <PartyPopper className="w-6 h-6 text-warning" />
                  <h3 className="text-2xl font-bold text-foreground">
                    Contest {savedContest?.status === 'published' ? 'Published' : 'Saved'}!
                  </h3>
                  <PartyPopper className="w-6 h-6 text-warning transform scale-x-[-1]" />
                </div>
                
                <p className="text-muted-foreground mb-6">
                  {savedContest?.status === 'published' 
                    ? 'Your contest is now live and will appear as a banner for agents!'
                    : 'Your contest has been saved as a draft. You can publish it later.'}
                </p>

                {/* Contest Summary */}
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50 mb-6 text-left">
                  <h4 className="font-semibold text-foreground mb-2">{savedContest?.name}</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Status: </span>
                      <span className={cn(
                        "font-medium",
                        savedContest?.status === 'published' ? "text-success" : "text-warning"
                      )}>
                        {savedContest?.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Created by: </span>
                      <span className="font-medium text-foreground">{savedContest?.createdByRole}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Metrics: </span>
                      <span className="font-medium text-foreground">{savedContest?.metrics?.length || 0}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Rewards: </span>
                      <span className="font-medium text-foreground">{savedContest?.rewards?.length || 0}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCloseSuccessModal}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
                >
                  Done
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  // For inline mode, render content directly
  if (inline) {
    return content;
  }

  // For modal mode, wrap in backdrop
  return (
    <Portal>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        {content}
      </div>
    </Portal>
  );
};

export default ContestTemplateDesigner;
