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

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
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
  )
}
