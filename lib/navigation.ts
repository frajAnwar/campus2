import {
  LayoutDashboard,
  Newspaper,
  MessageSquare,
  FolderCode,
  BookOpen,
  Users,
  Trophy,
  Briefcase,
  Calendar,
  BarChart3,
  Mail,
  Shield,
  Settings,
  Bell,
  Search,
  GraduationCap,
  Building2,
  Award,
  UserPlus,
} from "lucide-react";
import type { Role } from "@prisma/client";
import type { NavItem, NavGroup } from "@/types";

/**
 * Role hierarchy system - higher roles inherit permissions from lower roles
 * Ordered from least privileged to most privileged
 */
export const ROLE_HIERARCHY: Role[] = [
  "STUDENT",
  "TEACHING_ASSISTANT",
  "ALUMNI",
  "EDUCATOR",
  "CLUB_OFFICER",
  "CLUB_MANAGER",
  "MODERATOR",
  "UNIVERSITY_ADMIN",
  "PLATFORM_ADMIN",
];

/**
 * Get all roles that have at least the minimum required permission level
 */
export function getRolesWithMinimumPermission(minimumRole: Role): Role[] {
  const index = ROLE_HIERARCHY.indexOf(minimumRole);
  return ROLE_HIERARCHY.slice(index);
}

/**
 * Check if a user role has permission to access an item that requires a minimum role
 */
export function hasMinimumRole(userRole: Role | undefined | null, minimumRole: Role): boolean {
  if (!userRole) return false;
  return ROLE_HIERARCHY.indexOf(userRole) >= ROLE_HIERARCHY.indexOf(minimumRole);
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Main",
    items: [
      { href: "/dashboard", icon: "LayoutDashboard", label: "Dashboard", roles: "ALL" },
      { href: "/search", icon: "Search", label: "Search", roles: "ALL" },
    ],
  },
  {
    label: "Classroom",
    items: [
      { href: "/classes", icon: "BookOpen", label: "My Classes", roles: "ALL" },
      { href: "/assignments", icon: "Calendar", label: "Assignments", roles: "ALL" },
      { href: "/grades", icon: "Award", label: "Grades", roles: "ALL" },
    ],
  },
  {
    label: "Projects",
    items: [
      { href: "/projects", icon: "FolderCode", label: "My Projects", roles: "ALL" },
      { href: "/projects/explore", icon: "Search", label: "Explore", roles: "ALL" },
      { href: "/opportunities", icon: "Briefcase", label: "Opportunities", roles: "ALL" },
    ],
  },
  {
    label: "Community",
    items: [
      { href: "/feed", icon: "Newspaper", label: "Feed", roles: "ALL" },
      { href: "/forum", icon: "MessageSquare", label: "Forum", roles: "ALL" },
      { href: "/clubs", icon: "Users", label: "Clubs", roles: "ALL" },
      { href: "/leaderboard", icon: "BarChart3", label: "Leaderboard", roles: "ALL" },
      { href: "/alumni", icon: "GraduationCap", label: "Alumni Network", roles: getRolesWithMinimumPermission("ALUMNI") },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/messages", icon: "Mail", label: "Messages", roles: "ALL" },
      { href: "/notifications", icon: "Bell", label: "Notifications", roles: "ALL" },
      { href: "/settings", icon: "Settings", label: "Settings", roles: "ALL" },
    ],
  },
];

export const ADMIN_NAV: NavItem = {
  href: "/admin",
  icon: "Shield",
  label: "Admin Panel",
  roles: getRolesWithMinimumPermission("MODERATOR"),
};

export const EDUCATOR_QUICK_ACTIONS: NavItem[] = [
  { href: "/educator", icon: "GraduationCap", label: "Educator Dashboard", roles: getRolesWithMinimumPermission("EDUCATOR") },
  { href: "/classes/new", icon: "BookOpen", label: "Create Class", roles: getRolesWithMinimumPermission("EDUCATOR") },
  { href: "/competitions/new", icon: "Trophy", label: "Create Competition", roles: getRolesWithMinimumPermission("EDUCATOR") },
];

export const CLUB_MANAGER_QUICK_ACTIONS: NavItem[] = [
  { href: "/clubs/new", icon: "Users", label: "Create Club", roles: getRolesWithMinimumPermission("CLUB_MANAGER") },
];

export const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Newspaper,
  MessageSquare,
  FolderCode,
  BookOpen,
  Users,
  Trophy,
  Briefcase,
  Calendar,
  BarChart3,
  Mail,
  Shield,
  Settings,
  Bell,
  Search,
  GraduationCap,
  Building2,
  Award,
  UserPlus,
};

export function canSeeNav(item: NavItem, role?: Role | null): boolean {
  if (item.roles === "ALL") return true;
  if (!role) return false;
  
  // Handle both array of roles and single minimum role
  if (Array.isArray(item.roles)) {
    return item.roles.includes(role);
  }
  
  // If roles is a single role string, treat it as minimum required role
  return hasMinimumRole(role, item.roles as Role);
}
