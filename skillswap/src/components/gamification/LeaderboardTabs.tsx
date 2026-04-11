import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { LeaderboardEntry } from './LeaderboardEntry';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useGamificationStore } from '@/store/gamificationStore';
import type { LeaderboardEntry as Entry } from '@/store/gamificationStore';

/**
 * Leaderboard tabs component with 4 different leaderboard views
 */
export function LeaderboardTabs() {
  const { activeLeaderboard, activeLeaderboardTab, setActiveLeaderboardTab, userLeaderboardPosition } = useLeaderboard();
  const { userStats } = useGamificationStore();

  const tabs = [
    { id: 'overall', label: '🏆 Overall', emoji: '👑' },
    { id: 'weekly', label: '🔥 Weekly', emoji: '⚡' },
    { id: 'highest-rated', label: '⭐ Best Rated', emoji: '✨' },
    { id: 'rising-stars', label: '🚀 Rising', emoji: '🌟' },
  ] as const;

  return (
    <Tabs
      value={activeLeaderboardTab}
      onValueChange={(value) =>
        setActiveLeaderboardTab(value as 'overall' | 'weekly' | 'highest-rated' | 'rising-stars')
      }
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-6">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id} className="text-xs sm:text-sm">
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.emoji}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="space-y-4">
          {/* Current user's position */}
          {userLeaderboardPosition && activeLeaderboardTab === 'overall' && (
            <motion.div className="mb-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-xs text-muted-foreground mb-3">YOUR POSITION</p>
              <LeaderboardEntry
                entry={userLeaderboardPosition}
                isCurrentUser={true}
                index={0}
              />
            </motion.div>
          )}

          {/* Leaderboard entries */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {activeLeaderboard.length > 0 ? (
              activeLeaderboard.map((entry, index) => (
                <LeaderboardEntry
                  key={`${entry.userId}-${entry.rank}`}
                  entry={entry}
                  isCurrentUser={entry.userId === userStats?.id || false}
                  index={index}
                />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No leaderboard data available</p>
              </div>
            )}
          </motion.div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
