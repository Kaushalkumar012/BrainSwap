import { NavLink, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  Users2,
  MessageSquare,
  CalendarClock,
  Star,
  User,
  LogOut,
  Handshake,
  Trophy,
  Target,
  Zap,
  Github,
  HelpCircle,
  Share2,
  Moon,
  Sun,
} from "lucide-react"
import { SkillSwapLogo } from "@/components/shared/SkillSwapLogo"
import { BrandWordmark } from "@/components/shared/BrandWordmark"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { UserAvatar } from "@/components/shared/UserAvatar"
import { useAuthStore } from "@/store/authStore"
import { useAppStore } from "@/store/appStore"
import { useEffect, useState } from "react"

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/matches", label: "Matches", icon: Users2 },
  { to: "/collabs", label: "Collab Board", icon: Handshake },
  { to: "/messages", label: "Messages", icon: MessageSquare },
  { to: "/sessions", label: "Sessions", icon: CalendarClock },
  { to: "/ratings", label: "Ratings", icon: Star },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/achievements", label: "Achievements", icon: Target },
  { to: "/badges", label: "Badges", icon: Zap },
]

export function AppSidebar() {
  const { user, logout } = useAuthStore()
  const { conversations } = useAppStore()
  const navigate = useNavigate()

  const unreadCount = conversations.reduce((acc, c) => acc + c.unreadCount, 0)
  const { sessions } = useAppStore()
  const pendingSessions = sessions.filter((s) => s.status === "pending").length

  // Theme
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"))
  const toggleTheme = () => {
    const next = !isDark
    document.documentElement.classList.toggle("dark", next)
    localStorage.setItem("theme", next ? "dark" : "light")
    setIsDark(next)
  }
  useEffect(() => {
    const saved = localStorage.getItem("theme")
    if (saved) { const d = saved === "dark"; document.documentElement.classList.toggle("dark", d); setIsDark(d) }
  }, [])

  // Invite
  const handleInvite = () => {
    const url = window.location.origin
    if (navigator.share) {
      navigator.share({ title: "BRAIN SWAP", text: "Join me on BRAIN SWAP — exchange skills for free!", url })
    } else {
      navigator.clipboard.writeText(url)
      alert("Link copied to clipboard!")
    }
  }

  // Help modal
  const [showHelp, setShowHelp] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <>
    <Sidebar collapsible="icon" variant="sidebar">
      {/* Brand Header */}
      <SidebarHeader className="px-3 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<NavLink to="/dashboard" />}
              className="flex items-center gap-2.5"
            >
              <SkillSwapLogo size={34} />
              <BrandWordmark compact tone="adaptive" className="scale-[0.88]" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs tracking-widest text-sidebar-foreground/40 uppercase">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(({ to, label, icon: Icon }) => (
                <SidebarMenuItem key={to}>
                  <SidebarMenuButton
                    tooltip={label}
                    render={
                      <NavLink
                        to={to}
                        className={({ isActive }) =>
                          isActive
                            ? "font-medium"
                            : "text-sidebar-foreground/70"
                        }
                      />
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{label}</span>
                  </SidebarMenuButton>
                  {label === "Messages" && unreadCount > 0 && (
                    <SidebarMenuBadge className="bg-primary text-xs text-primary-foreground">
                      {unreadCount}
                    </SidebarMenuBadge>
                  )}
                  {label === "Sessions" && pendingSessions > 0 && (
                    <SidebarMenuBadge className="bg-amber-500 text-xs text-white">
                      {pendingSessions}
                    </SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs tracking-widest text-sidebar-foreground/40 uppercase">
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Profile"
                  render={
                    <NavLink
                      to="/profile"
                      className={({ isActive }) =>
                        isActive ? "font-medium" : "text-sidebar-foreground/70"
                      }
                    />
                  }
                >
                  <User className="h-4 w-4 shrink-0" />
                  <span>Profile</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Theme toggle */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={isDark ? "Light Mode" : "Dark Mode"}
                  onClick={toggleTheme}
                  className="text-sidebar-foreground/70 hover:text-sidebar-foreground"
                >
                  {isDark
                    ? <Sun className="h-4 w-4 shrink-0" />
                    : <Moon className="h-4 w-4 shrink-0" />
                  }
                  <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Invite / Share */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Invite a Friend"
                  onClick={handleInvite}
                  className="text-sidebar-foreground/70 hover:text-sidebar-foreground"
                >
                  <Share2 className="h-4 w-4 shrink-0" />
                  <span>Invite a Friend</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* GitHub */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="View on GitHub"
                  onClick={() => window.open("https://github.com/Kaushalkumar012/BrainSwap", "_blank")}
                  className="text-sidebar-foreground/70 hover:text-sidebar-foreground"
                >
                  <Github className="h-4 w-4 shrink-0" />
                  <span>GitHub Repo</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Help */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Help & Shortcuts"
                  onClick={() => setShowHelp(true)}
                  className="text-sidebar-foreground/70 hover:text-sidebar-foreground"
                >
                  <HelpCircle className="h-4 w-4 shrink-0" />
                  <span>Help & Shortcuts</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      {/* User Footer */}
      <SidebarFooter className="px-3 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="gap-3 text-sidebar-foreground/80 hover:text-sidebar-foreground"
            >
              <UserAvatar
                name={user?.name ?? "User"}
                avatar={user?.avatar}
                size="sm"
              />
              <div className="flex min-w-0 flex-col leading-tight">
                <span className="truncate text-sm font-medium">
                  {user?.name}
                </span>
                <span className="truncate text-xs text-sidebar-foreground/40">
                  {user?.email}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Logout"
              onClick={handleLogout}
              className="gap-2.5 text-sidebar-foreground/60 hover:text-destructive"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>

      {/* Help & Shortcuts modal */}
      {showHelp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowHelp(false)}>
          <div className="w-[340px] rounded-2xl border border-border bg-card p-5 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-sm">Help & Keyboard Shortcuts</p>
              <button onClick={() => setShowHelp(false)} className="text-muted-foreground hover:text-foreground"><HelpCircle className="w-4 h-4" /></button>
            </div>
            <div className="space-y-0 text-xs text-muted-foreground">
              {([
                ["Go to Dashboard", "G then D"],
                ["Go to Messages", "G then M"],
                ["Go to Sessions", "G then S"],
                ["Go to Matches", "G then A"],
                ["Send message", "Enter"],
                ["New line in message", "Shift + Enter"],
                ["Open Chatbot", "Click bot button"],
              ] as [string, string][]).map(([action, shortcut]) => (
                <div key={action} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                  <span>{action}</span>
                  <kbd className="px-2 py-0.5 rounded bg-muted text-[10px] font-mono text-foreground">{shortcut}</kbd>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[11px] text-muted-foreground/60 text-center">BRAIN SWAP v1.0 • Built with ❤️ by RunTimeError</p>
          </div>
        </div>
      )}
    </>
  )
}
