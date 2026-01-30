
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Calendar,
  TrendingUp,
  Users,
  Lock,
  Zap,
  Target,
  Gift,
  Clock,
  ArrowRight,
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

const ContestPage = () => {
  const [activeContests, setActiveContests] = useState([
    {
      id: 1,
      name: "Q4 Revenue Sprint",
      description: "Drive maximum revenue growth in Q4",
      startDate: "2026-02-01",
      endDate: "2026-02-15",
      status: "live",
      theme: {
        primary: "#8B5CF6",
        secondary: "#A855F7",
        accent: "#EC4899",
      },
      metrics: [
        { name: "Revenue Generated", target: "> $10K", weightage: 50 },
        { name: "Customer Count", target: "> 50", weightage: 30 },
        { name: "Customer Satisfaction", target: "> 95%", weightage: 20 },
      ],
      rewards: [
        {
          position: "1st",
          title: "Premium Gift Card",
          description: "₹10,000 Shopping Voucher",
          points: 5000,
          icon: "🏆",
        },
        {
          position: "2nd",
          title: "Exclusive Headphones",
          description: "Noise Cancelling Tech",
          points: 3000,
          icon: "🥈",
        },
        {
          position: "3rd",
          title: "Gift Hamper",
          description: "Gourmet Treats Pack",
          points: 1000,
          icon: "🥉",
        },
      ],
      participants: 145,
      liveActivity: {
        revenueAchieved: 8200,
        revenueTarget: 10000,
        nrpcIncrease: 12, // percent
        newConvBefore: 8,
        newConvAfter: 14,
      },
      leaderboard: [
        {
          rank: 1,
          name: "Sarah Chen",
          avatar: "S",
          points: 4850,
          metrics: [85, 90, 88],
        },
        {
          rank: 2,
          name: "Mike Johnson",
          avatar: "M",
          points: 4620,
          metrics: [80, 85, 92],
        },
        {
          rank: 3,
          name: "Emma Davis",
          avatar: "E",
          points: 4350,
          metrics: [75, 88, 85],
        },
      ],
    },
    {
      id: 2,
      name: "Customer Satisfaction Blitz",
      description: "Achieve excellence in customer service",
      startDate: "2026-02-15",
      endDate: "2026-03-01",
      status: "upcoming",
      theme: {
        primary: "#3B82F6",
        secondary: "#0EA5E9",
        accent: "#06B6D4",
      },
      metrics: [
        { name: "CSAT Score", target: "> 4.8/5.0", weightage: 40 },
        { name: "Resolution Time", target: "< 30 min", weightage: 35 },
        { name: "First Contact Fix", target: "> 90%", weightage: 25 },
      ],
      rewards: [
        {
          position: "1st",
          title: "Apple AirPods Pro",
          description: "Wireless Audio Experience",
          points: 6000,
          icon: "🎧",
        },
        {
          position: "2nd",
          title: "Premium Watch",
          description: "Smart Watch Tech",
          points: 4000,
          icon: "⌚",
        },
        {
          position: "Top 10",
          title: "Recognition Badge",
          description: "Exclusive Digital Badge",
          points: 500,
          icon: "⭐",
        },
      ],
      participants: 0,
      leaderboard: [],
    },
  ]);

  const [selectedContest, setSelectedContest] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState({});

  // Calculate time remaining for each contest
  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = {};
      activeContests.forEach((contest) => {
        const now = new Date();
        const end = new Date(contest.endDate);
        const diff = end - now;

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        remaining[contest.id] = `${days}d ${hours}h ${minutes}m`;
      });
      setTimeRemaining(remaining);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [activeContests]);

  const isContestAccessible = (contest) => {
    const now = new Date();
    const start = new Date(contest.startDate);
    const end = new Date(contest.endDate);
    return now >= start && now <= end;
  };

  const canRegister = (contest) => {
    const now = new Date();
    const start = new Date(contest.startDate);
    return now < start; // Can register before contest starts
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Contests & Competitions
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Compete with your team, showcase your excellence, and win exclusive
            rewards. Choose your contest and start climbing the leaderboard!
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-4 flex-wrap">
          {["all", "live", "upcoming", "completed"].map((filter) => (
            <button
              key={filter}
              className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                filter === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/30 text-foreground hover:bg-muted/50"
              }`}
            >
              {filter === "all" ? "All Contests" : filter}
              {filter === "live" && (
                <span className="ml-2 w-2 h-2 rounded-full bg-success inline-block animate-pulse" />
              )}
            </button>
          ))}
        </div>

        {/* Contest Cards */}
        <div className="grid gap-8">
          {activeContests.map((contest, index) => {
            const isAccessible = isContestAccessible(contest);
            const canReg = canRegister(contest);

            return (
              <motion.div
                key={contest.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => {
                  if (isAccessible) setSelectedContest(contest);
                }}
                className={cn(
                  "group cursor-pointer transition-all",
                  !isAccessible && "opacity-75 cursor-not-allowed"
                )}
              >
                <GlassCard
                  className="overflow-hidden"
                  hover={isAccessible}
                  neonBorder={contest.status === "live"}
                >
                  {/* Header with gradient */}
                  <div
                    className="p-6 text-white relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${contest.theme.primary} 0%, ${contest.theme.accent} 100%)`,
                    }}
                  >
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2),transparent)]" />
                    </div>

                    {/* Live Activity */}
                    {contest.status === 'live' && (
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                          <Clock className="w-5 h-5 text-primary" />
                          Live Activity
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="p-4 rounded-lg bg-muted/20">
                            <p className="text-xs text-muted-foreground">Revenue Achieved</p>
                            <p className="font-bold text-foreground mt-1">${contest.liveActivity.revenueAchieved.toLocaleString()} / ${contest.liveActivity.revenueTarget.toLocaleString()}</p>
                          </div>
                          <div className="p-4 rounded-lg bg-muted/20">
                            <p className="text-xs text-muted-foreground">NRPC Increase</p>
                            <p className="font-bold text-foreground mt-1">+{contest.liveActivity.nrpcIncrease}% vs baseline</p>
                          </div>
                          <div className="p-4 rounded-lg bg-muted/20">
                            <p className="text-xs text-muted-foreground">New Conv % Change</p>
                            <p className="font-bold text-foreground mt-1">{contest.liveActivity.newConvBefore}% → {contest.liveActivity.newConvAfter}%</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="relative flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={cn(
                              "px-2 py-1 rounded-full text-xs font-bold",
                              contest.status === "live"
                                ? "bg-success/30 text-success"
                                : "bg-warning/30 text-warning"
                            )}
                          >
                            {contest.status === "live" ? "🔴 LIVE NOW" : "📅 UPCOMING"}
                          </span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold">
                          {contest.name}
                        </h2>
                        <p className="text-sm opacity-90 mt-1">
                          {contest.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs opacity-75">Time Remaining</p>
                        <p className="text-xl font-bold">
                          {timeRemaining[contest.id] || "Loading..."}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-white/20">
                      <div>
                        <p className="text-xs opacity-75">Participants</p>
                        <p className="font-bold text-lg">
                          {contest.participants || "TBD"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs opacity-75">Duration</p>
                        <p className="font-bold text-lg">
                          {Math.ceil(
                            (new Date(contest.endDate) -
                              new Date(contest.startDate)) /
                              (1000 * 60 * 60 * 24)
                          )}{" "}
                          Days
                        </p>
                      </div>
                      <div>
                        <p className="text-xs opacity-75">Metrics</p>
                        <p className="font-bold text-lg">{contest.metrics.length}</p>
                      </div>
                      <div>
                        <p className="text-xs opacity-75">Prize Tiers</p>
                        <p className="font-bold text-lg">
                          {contest.rewards.length}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8 space-y-8">
                    {/* Access Status */}
                    {!isAccessible && (
                      <div className="p-4 rounded-lg bg-warning/10 border border-warning/30 flex items-start gap-3">
                        <Lock className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-foreground">
                            Contest Not Yet Available
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {canReg
                              ? `This contest starts on ${contest.startDate}. You can register now!`
                              : `This contest has ended. Check upcoming contests above.`}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Metrics */}
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Performance Metrics
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {contest.metrics.map((metric, idx) => (
                          <GlassCard key={idx} className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-medium text-foreground">
                                  {metric.name}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Target: {metric.target}
                                </p>
                              </div>
                              <div
                                className="px-2 py-1 rounded-full text-xs font-bold text-white"
                                style={{
                                  backgroundColor: contest.theme.secondary,
                                }}
                              >
                                {metric.weightage}%
                              </div>
                            </div>
                            <div className="w-full h-1.5 bg-muted/30 rounded-full overflow-hidden">
                              <div
                                className="h-full transition-all duration-500"
                                style={{
                                  width: `${metric.weightage}%`,
                                  backgroundColor: contest.theme.primary,
                                }}
                              />
                            </div>
                          </GlassCard>
                        ))}
                      </div>
                    </div>

                    {/* Rewards */}
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                        <Gift className="w-5 h-5 text-primary" />
                        🏆 Prize Pool
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {contest.rewards.map((reward, idx) => (
                          <motion.div
                            key={idx}
                            whileHover={{ scale: 1.02 }}
                            className="p-4 rounded-lg border-2 transition-all text-center"
                            style={{
                              borderColor:
                                idx === 0
                                  ? "#FFD700"
                                  : idx === 1
                                    ? "#C0C0C0"
                                    : "#CD7F32",
                              backgroundColor: `${contest.theme.primary}10`,
                            }}
                          >
                            <p className="text-3xl mb-2">{reward.icon}</p>
                            <p className="font-bold text-foreground">
                              {reward.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {reward.description}
                            </p>
                            <p
                              className="text-sm font-bold mt-3"
                              style={{ color: contest.theme.primary }}
                            >
                              {reward.points} Points
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Live Leaderboard */}
                    {isAccessible && contest.leaderboard.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                          <Target className="w-5 h-5 text-primary" />
                          Current Leaderboard
                        </h3>
                        <div className="space-y-2">
                          {contest.leaderboard.map((player) => (
                            <div
                              key={player.rank}
                              className="p-3 rounded-lg bg-muted/20 border border-border/30 flex items-center justify-between hover:border-primary/50 transition-colors"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">
                                  {player.rank}
                                </div>
                                <div>
                                  <p className="font-medium text-foreground">
                                    {player.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Metrics:{" "}
                                    {player.metrics.map((m) => `${m}%`).join(", ")}
                                  </p>
                                </div>
                              </div>
                              <div className="font-bold text-primary text-lg">
                                {player.points}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* CTA Buttons */}
                    <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-border/50">
                      {isAccessible ? (
                        <>
                          <button className="flex-1 px-6 py-3 rounded-lg font-bold text-white transition-all flex items-center justify-center gap-2"
                            style={{
                              background: `linear-gradient(135deg, ${contest.theme.primary} 0%, ${contest.theme.accent} 100%)`,
                            }}
                          >
                            <Zap className="w-5 h-5" />
                            View My Performance
                          </button>
                          <button className="px-6 py-3 rounded-lg bg-muted/30 border border-border/50 text-foreground font-medium hover:bg-muted/50 transition-colors flex items-center gap-2">
                            <Trophy className="w-5 h-5" />
                            View Full Leaderboard
                          </button>
                        </>
                      ) : canReg ? (
                        <button className="flex-1 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                          <Users className="w-5 h-5" />
                          Register for Contest
                        </button>
                      ) : (
                        <button disabled className="flex-1 px-6 py-3 rounded-lg bg-muted/30 text-muted-foreground font-medium cursor-not-allowed flex items-center justify-center gap-2">
                          <Lock className="w-5 h-5" />
                          Contest Ended
                        </button>
                      )}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>

        {/* Past Contests History */}
        <section className="pt-10">
          <h2 className="text-2xl font-bold text-foreground mb-4">Past Contests History</h2>
          <div className="grid gap-4">
            {[
              { id: 'p1', contest: 'January Revenue Drive', winners: [
                { name: 'Sayed Mahaboob Basha', reward: 'Headset' },
                { name: 'Sanjay Kumar Sahu', reward: 'Sipper' },
                { name: 'Mohammed Naseer', reward: 'Cheers (5000)' }
              ]},
              { id: 'p2', contest: 'Holiday Sprint', winners: [
                { name: 'Mounika Gadeela', reward: 'T-Shirt' },
                { name: 'Sahaja Katrimala', reward: 'Coffee Mug' }
              ]}
            ].map((pc) => (
              <div key={pc.id} className="p-4 rounded-lg bg-muted/20 border border-border/30">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-foreground">{pc.contest}</p>
                    <p className="text-xs text-muted-foreground">Summary of rewards distributed</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {pc.winners.map((w, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/10">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center text-white font-bold">{w.name.split(' ').map(n=>n[0]).join('')}</div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{w.name}</p>
                        <p className="text-xs text-muted-foreground">Won: {w.reward}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
        {/* No Contests Message */}
        {activeContests.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-bold text-foreground mb-2">
              No Active Contests
            </h2>
            <p className="text-muted-foreground">
              Check back soon for exciting new competitions!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ContestPage;
