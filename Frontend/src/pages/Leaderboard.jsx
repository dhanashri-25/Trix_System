import React, { useState, useEffect } from "react";
import { useWeb3 } from "../context/Web3Context";
import axios from "axios";

const Leaderboard = () => {
  const { account } = useWeb3();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("all"); // 'all', 'week', 'month'

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const [leaderboardResponse, userStatsResponse] = await Promise.all([
          axios.get(
            `http://localhost:5000/api/leaderboard?period=${timeFilter}`
          ),
          account
            ? axios.get(`http://localhost:5000/api/players/${account}/stats`)
            : Promise.resolve({ data: null }),
        ]);

        setLeaderboardData(leaderboardResponse.data);
        setUserStats(userStatsResponse.data);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [account, timeFilter]);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return "🏆";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return "#" + rank;
    }
  };

  const getWinRateColor = (winRate) => {
    if (winRate >= 80) return "text-emerald-600";
    if (winRate >= 60) return "text-yellow-600";
    if (winRate >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const truncateAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const PlayerRow = ({ player, rank, isCurrentUser = false }) => (
    <div
      className={`bg-white rounded-xl shadow-sm border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
        isCurrentUser
          ? "border-indigo-300 bg-gradient-to-r from-indigo-50 to-blue-50 ring-2 ring-indigo-200"
          : "border-gray-200 hover:border-indigo-200"
      }`}
    >
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-lg">
              {rank <= 3 ? getRankIcon(rank) : rank}
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <span className="text-gray-900 font-semibold text-lg">
                  Rank #{rank}
                </span>
                <span className="text-sm font-mono bg-gray-100 px-3 py-1 rounded-full text-gray-700">
                  {truncateAddress(player.address)}
                </span>
                {isCurrentUser && (
                  <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                    You
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-2 flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
                Joined {new Date(player.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-8 text-center">
            <div className="bg-emerald-50 rounded-lg p-4">
              <p className="text-2xl font-bold text-emerald-600">
                {player.totalWins}
              </p>
              <p className="text-xs text-emerald-700 font-medium">Wins</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-2xl font-bold text-red-600">
                {player.totalLosses}
              </p>
              <p className="text-xs text-red-700 font-medium">Losses</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p
                className={`text-2xl font-bold ${getWinRateColor(
                  player.winRate
                )}`}
              >
                {player.winRate.toFixed(1)}%
              </p>
              <p className="text-xs text-blue-700 font-medium">Win Rate</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-4">
              <p className="text-2xl font-bold text-amber-600">
                {player.totalEarnings.toFixed(2)}
              </p>
              <p className="text-xs text-amber-700 font-medium">GT Earned</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <div
      className={`bg-gradient-to-br ${color} rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}
    >
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/90 text-sm font-medium mb-1">{title}</p>
            <p className="text-white text-3xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-white/80 text-xs mt-2">{subtitle}</p>
            )}
          </div>
          <div className="text-white/80 text-4xl">{icon}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="text-6xl mr-4">🏆</div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Leaderboard
            </h1>
          </div>
          <p className="text-xl text-gray-600 font-medium">
            See who's dominating the Tic Tac Toe arena!
          </p>
        </div>

        {/* Time Filter */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 flex">
            {[
              { key: "all", label: "All Time" },
              { key: "month", label: "This Month" },
              { key: "week", label: "This Week" },
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setTimeFilter(filter.key)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  timeFilter === filter.key
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                    : "text-gray-600 hover:text-indigo-600 hover:bg-gray-50"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* User Stats */}
        {account && userStats && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Your Performance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Your Rank"
                value={`#${userStats.rank || "Unranked"}`}
                icon="🎯"
                color="from-indigo-500 to-purple-600"
              />
              <StatCard
                title="Total Wins"
                value={userStats.totalWins}
                icon="🏆"
                color="from-emerald-500 to-teal-600"
                subtitle={`${userStats.winStreak} win streak`}
              />
              <StatCard
                title="Win Rate"
                value={`${userStats.winRate.toFixed(1)}%`}
                icon="📊"
                color="from-blue-500 to-cyan-600"
                subtitle={`${userStats.totalMatches} total matches`}
              />
              <StatCard
                title="GT Earned"
                value={userStats.totalEarnings.toFixed(2)}
                icon="💰"
                color="from-amber-500 to-orange-600"
                subtitle="Total lifetime earnings"
              />
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Top Players{" "}
            {timeFilter !== "all" &&
              `(${timeFilter === "week" ? "This Week" : "This Month"})`}
          </h2>

          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-6"></div>
              <p className="text-gray-600 text-lg">Loading leaderboard...</p>
            </div>
          ) : leaderboardData.length > 0 ? (
            <div className="space-y-4">
              {leaderboardData?.map((player, index) => (
                <PlayerRow
                  key={player.address}
                  player={player}
                  rank={index + 1}
                  isCurrentUser={
                    account &&
                    player.address.toLowerCase() === account.toLowerCase()
                  }
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="text-8xl mb-6">🏆</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                No Data Yet
              </h3>
              <p className="text-gray-600 mb-8 text-lg">
                Be the first to play and claim the top spot!
              </p>
              <a
                href="/play"
                className="inline-flex items-center bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 
                         text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
                Start Playing
              </a>
            </div>
          )}
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12 flex items-center justify-center">
            <span className="mr-3">🏅</span>
            Achievements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: "👑",
                title: "Champion",
                desc: "Win 100 matches",
                color: "from-amber-400 to-orange-500",
              },
              {
                icon: "🔥",
                title: "Hot Streak",
                desc: "Win 10 matches in a row",
                color: "from-red-400 to-pink-500",
              },
              {
                icon: "💎",
                title: "High Roller",
                desc: "Win a match with 50+ GT stake",
                color: "from-cyan-400 to-blue-500",
              },
              {
                icon: "⚡",
                title: "Speed Demon",
                desc: "Win in under 2 minutes",
                color: "from-yellow-400 to-orange-500",
              },
              {
                icon: "🎯",
                title: "Perfect Aim",
                desc: "Maintain 90%+ win rate",
                color: "from-green-400 to-emerald-500",
              },
              {
                icon: "💰",
                title: "Millionaire",
                desc: "Earn 1000+ GT tokens",
                color: "from-purple-400 to-indigo-500",
              },
            ].map((achievement, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br ${achievement.color} p-6 rounded-xl text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}
              >
                <div className="text-5xl mb-3">{achievement.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {achievement.title}
                </h3>
                <p className="text-white/90 text-sm">{achievement.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Matches */}
        {account && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Your Recent Matches
            </h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="text-center">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-gray-600 text-lg">
                  Match history coming soon...
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
