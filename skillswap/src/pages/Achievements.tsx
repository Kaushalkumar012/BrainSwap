import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { useAchievements } from '@/hooks/useAchievements';
import { useGameification } from '@/hooks/useGameification';
import { AchievementCard } from '@/components/gamification/AchievementCard';
import { LevelUpAnimation } from '@/components/gamification/LevelUpAnimation';
import { AchievementUnlockedModal } from '@/components/gamification/AchievementUnlockedModal';
import { Progress } from '@/components/ui/progress';

export default function Achievements() {
  useGameification();
  const { grouped, stats } = useAchievements();

  const tabs = [
    { id: 'all', label: 'All', count: stats.total },
    { id: 'progression', label: 'Progression', count: grouped.Progression.length },
    { id: 'challenge', label: 'Challenge', count: grouped.Challenge.length },
    { id: 'time-based', label: 'Time-based', count: grouped['Time-based'].length },
    { id: 'relationship', label: 'Relationship', count: grouped.Relationship.length },
    { id: 'collaboration', label: 'Collaboration', count: grouped.Collaboration.length },
    { id: 'performance', label: 'Performance', count: grouped.Performance.length },
  ];

  return (
    <div className="max-w-4xl space-y-6">
      <div className="animate-fade-up">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <span>🎯</span> Achievements
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Complete goals and unlock achievements to earn XP and progress
        </p>
      </div>

      {/* Completion Stats */}
      <motion.div
        className="rounded-lg border border-primary/20 bg-primary/5 p-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Overall Completion</p>
            <span className="text-2xl font-black text-primary">
              {stats.completed}/{stats.total}
            </span>
          </div>
          <Progress value={stats.percent} className="h-3" />
          <p className="text-xs text-muted-foreground">
            {stats.percent}% Complete • {stats.total - stats.completed} achievements remaining
          </p>
        </div>
      </motion.div>

      {/* Achievements by Type */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 mb-6">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="text-xs">
              <span className="hidden sm:inline text-xs">{tab.label}</span>
              <span className="sm:hidden text-[10px]">{tab.count}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid gap-4"
          >
            {Object.values(grouped)
              .flat()
              .map((achievement, idx) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
          </motion.div>
        </TabsContent>

        {Object.entries(grouped).map(([type, achievements]) => (
          <TabsContent key={type} value={type.toLowerCase()} className="space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="grid gap-4"
            >
              {achievements.length > 0 ? (
                achievements.map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-sm">No achievements in this category yet</p>
                </div>
              )}
            </motion.div>
          </TabsContent>
        ))}
      </Tabs>

      <LevelUpAnimation />
      <AchievementUnlockedModal />
    </div>
  );
}
