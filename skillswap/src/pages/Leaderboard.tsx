import { useGameification } from '@/hooks/useGameification';
import { LeaderboardTabs } from '@/components/gamification/LeaderboardTabs';
import { LevelProgressBar } from '@/components/gamification/LevelProgressBar';
import { LevelUpAnimation } from '@/components/gamification/LevelUpAnimation';
import { AchievementUnlockedModal } from '@/components/gamification/AchievementUnlockedModal';

export default function Leaderboard() {
  useGameification();

  return (
    <div className="max-w-6xl space-y-6">
      <div className="animate-fade-up">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <span>🏆</span> Leaderboard
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Compete with peers and climb to the top
        </p>
      </div>

      <LevelProgressBar />

      <LeaderboardTabs />

      <LevelUpAnimation />
      <AchievementUnlockedModal />
    </div>
  );
}
