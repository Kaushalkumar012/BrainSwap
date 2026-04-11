import { useState } from "react"
import {
  MessageSquare,
  UserPlus,
  TrendingUp,
  Sparkles,
  Search,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { UserAvatar } from "@/components/shared/UserAvatar"
import { SkillBadge } from "@/components/shared/SkillBadge"
import { StarRating } from "@/components/shared/StarRating"
import { useAppStore } from "@/store/appStore"
import { matchService } from "@/services/matchService"
import { toast } from "sonner"
import type { Match } from "@/types"

function MatchCard({ match }: { match: Match }) {
  const navigate = useNavigate()
  const { updateMatchStatus } = useAppStore()

  const handleConnect = async () => {
    try {
      await matchService.updateMatchStatus(match.id, "active")
    } catch {
      // fall through
    }
    updateMatchStatus(match.id, "active")
    toast.success(`Connected with ${match.matchedUser.name}!`)
  }

  const scoreColor =
    match.compatibilityScore >= 90
      ? "text-green-600"
      : match.compatibilityScore >= 75
        ? "text-primary"
        : "text-amber-600"

  return (
    <Card className="group border border-border/60 shadow-xs transition-all hover:shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <UserAvatar
            name={match.matchedUser.name}
            avatar={match.matchedUser.avatar}
            size="lg"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold">
                  {match.matchedUser.name}
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {match.matchedUser.location}
                </p>
                <StarRating
                  value={Math.round(match.matchedUser.rating)}
                  readonly
                  size="sm"
                />
              </div>
              <div className="shrink-0 text-right">
                <span className={`text-lg font-bold ${scoreColor}`}>
                  {match.compatibilityScore}%
                </span>
                <p className="text-xs text-muted-foreground">match</p>
              </div>
            </div>

            {match.matchedUser.bio && (
              <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                {match.matchedUser.bio}
              </p>
            )}

            <div className="mt-3">
              <Progress value={match.compatibilityScore} className="h-1.5" />
            </div>

            <div className="mt-3 space-y-1.5">
              {match.matchedSkills.want.length === 0 &&
              match.matchedSkills.offer.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">
                  Add skills to your profile to see skill overlap.
                </p>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="shrink-0 text-xs text-muted-foreground">
                      teaches:
                    </span>
                    {match.matchedSkills.want.map((s) => (
                      <SkillBadge key={s} skill={s} type="offer" size="sm" />
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="shrink-0 text-xs text-muted-foreground">
                      wants to learn:
                    </span>
                    {match.matchedSkills.offer.map((s) => (
                      <SkillBadge key={s} skill={s} type="want" size="sm" />
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              {match.status !== "active" ? (
                <Button
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleConnect}
                >
                  <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                  Connect
                </Button>
              ) : (
                <Badge
                  variant="secondary"
                  className="border border-green-200 bg-green-50 px-2 py-1 text-xs text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
                >
                  Connected
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => navigate("/messages")}
              >
                <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                Message
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function Matches() {
  const { matches, skills } = useAppStore()
  const [search, setSearch] = useState("")
  const hasSkills = skills.length > 0

  const activeMatches = matches.filter((m) => m.status === "active")
  const pendingMatches = matches.filter((m) => m.status === "pending")
  const suggestedMatches = pendingMatches.filter(
    (m) =>
      m.matchedSkills.offer.length === 0 && m.matchedSkills.want.length === 0
  )
  const realPendingMatches = pendingMatches.filter(
    (m) => m.matchedSkills.offer.length > 0 || m.matchedSkills.want.length > 0
  )

  const filter = (list: Match[]) => {
    if (!search.trim()) return list
    const q = search.toLowerCase()
    return list.filter(
      (m) =>
        m.matchedUser.name.toLowerCase().includes(q) ||
        m.matchedUser.location?.toLowerCase().includes(q) ||
        m.matchedSkills.offer.some((s) => s.toLowerCase().includes(q)) ||
        m.matchedSkills.want.some((s) => s.toLowerCase().includes(q))
    )
  }

  const filteredActive = filter(activeMatches)
  const filteredPending = filter(realPendingMatches)
  const filteredSuggested = filter(suggestedMatches)

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <TrendingUp className="h-6 w-6 text-primary" />
          Smart Matches
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Users intelligently matched based on your skill exchange profile.
        </p>
      </div>

      {!hasSkills && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
          Add skills on your{" "}
          <a href="/profile" className="font-medium underline">
            Profile
          </a>{" "}
          to unlock skill-based matching.
        </div>
      )}

      <div className="relative">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
        <Input
          placeholder="Search by name, location, or skill..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 pl-9 text-sm"
        />
      </div>

      <Tabs
        defaultValue={
          activeMatches.length > 0
            ? "active"
            : suggestedMatches.length > 0
              ? "suggested"
              : "pending"
        }
      >
        <TabsList className="h-8">
          <TabsTrigger value="active" className="text-xs">
            Active{" "}
            <Badge variant="secondary" className="ml-1.5 h-4 px-1.5 text-xs">
              {filteredActive.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="pending" className="text-xs">
            Pending{" "}
            <Badge variant="secondary" className="ml-1.5 h-4 px-1.5 text-xs">
              {filteredPending.length}
            </Badge>
          </TabsTrigger>
          {suggestedMatches.length > 0 && (
            <TabsTrigger value="suggested" className="text-xs">
              <Sparkles className="mr-1 h-3 w-3" />
              Suggested{" "}
              <Badge variant="secondary" className="ml-1.5 h-4 px-1.5 text-xs">
                {filteredSuggested.length}
              </Badge>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="active" className="mt-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filteredActive.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
            {filteredActive.length === 0 && (
              <p className="col-span-2 py-8 text-center text-sm text-muted-foreground">
                {search
                  ? "No matches found for your search."
                  : "No active matches yet. Send a request to connect with someone."}
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="mt-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filteredPending.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
            {filteredPending.length === 0 && (
              <p className="col-span-2 py-8 text-center text-sm text-muted-foreground">
                {search
                  ? "No matches found for your search."
                  : "No skill-based matches yet. Add skills to your profile to get matched."}
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="suggested" className="mt-4">
          <p className="mb-4 text-xs text-muted-foreground">
            These users are on BRAIN SWAP. Add skills to your profile to see how
            well you match — or send a request now!
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filteredSuggested.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
            {filteredSuggested.length === 0 && search && (
              <p className="col-span-2 py-8 text-center text-sm text-muted-foreground">
                No matches found for your search.
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
