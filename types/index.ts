import type {
  Post,
  Comment,
  User,
  Project,
  Club,
  Event,
  Rank,
  Role,
  Visibility,
  PostType,
} from "@prisma/client";

export type { Post, Comment, User, Project, Club, Event, Rank, Role, Visibility, PostType };

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export type PaginatedResult<T> = {
  items: T[];
  nextCursor?: string;
  hasMore: boolean;
};

export type NavItem = {
  href: string;
  icon: string;
  label: string;
  roles: "ALL" | Role[];
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export type UserPreview = Pick<
  User,
  "id" | "name" | "username" | "image" | "rank" | "role"
>;

export type PostWithAuthor = Post & {
  author: UserPreview;
  _count: { comments: number; votes: number };
  voteScore: number;
  userVote?: 1 | -1 | null;
};

export type CommentWithAuthor = Comment & {
  author: UserPreview;
  replies: CommentWithAuthor[];
  _count: { votes: number };
  voteScore: number;
  userVote?: 1 | -1 | null;
};

export type ProjectWithOwner = Project & {
  owner: UserPreview;
  _count: { stars: number; comments: number };
  isStarred?: boolean;
};

export type ClubWithMeta = Club & {
  _count: { members: number; events: number };
  isMember?: boolean;
  memberRole?: string;
};

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 50;
