"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PostCard } from "@/components/forum/PostCard";
import { ForumFilters } from "@/components/forum/ForumFilters";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { getPosts } from "@/actions/post";
import { Button } from "@/components/ui/button";

const TABS = [
  { value: "hot", label: "Hot" },
  { value: "new", label: "New" },
  { value: "top", label: "Top" },
  { value: "unanswered", label: "Unanswered" },
];

interface PostItem {
  id: string;
  type: any;
  title: string;
  body: string;
  visibility: any;
  tags: string[];
  viewCount: number;
  createdAt: Date | string;
  author: {
    id: string;
    name: string;
    username?: string;
    image?: string | null;
    rank: string;
  };
  _count: { comments: number; votes: number };
  voteScore?: number;
  userVote?: 1 | -1 | null;
}

interface ForumFeedProps {
  initialPosts: PostItem[];
  initialTab: string;
  initialVisibility: string;
  initialType: string;
  initialTags: string[];
  initialSearch: string;
}

export function ForumFeed({
  initialPosts,
  initialTab,
  initialVisibility,
  initialType,
  initialTags,
  initialSearch,
}: ForumFeedProps) {
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);
  const [tab, setTab] = useState(initialTab);
  const [visibility, setVisibility] = useState(initialVisibility);
  const [type, setType] = useState(initialType);
  const [tags, setTags] = useState(initialTags);
  const [search, setSearch] = useState(initialSearch);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(true);

  const buildQuery = useCallback(() => {
    const params = new URLSearchParams();
    params.set("tab", tab);
    if (visibility !== "ALL") params.set("visibility", visibility);
    if (type !== "ALL") params.set("type", type);
    if (tags.length > 0) params.set("tags", tags.join(","));
    if (search) params.set("search", search);
    return params.toString();
  }, [tab, visibility, type, tags, search]);

  const updateURL = useCallback(
    (newTab?: string) => {
      const t = newTab ?? tab;
      const params = new URLSearchParams();
      params.set("tab", t);
      if (visibility !== "ALL") params.set("visibility", visibility);
      if (type !== "ALL") params.set("type", type);
      if (tags.length > 0) params.set("tags", tags.join(","));
      if (search) params.set("search", search);
      router.replace(`/forum?${params.toString()}`, { scroll: false });
    },
    [tab, visibility, type, tags, search, router]
  );

  const handleTabChange = async (newTab: string) => {
    setTab(newTab);
    setLoading(true);
    const result = await getPosts({
      tab: newTab,
      visibility,
      type,
      tags,
      search,
      limit: 20,
    });
    if (result.success) {
      setPosts((result as any).data.items);
      setCursor((result as any).data.nextCursor);
      setHasMore((result as any).data.hasMore);
    }
    setLoading(false);
    const params = new URLSearchParams();
    params.set("tab", newTab);
    if (visibility !== "ALL") params.set("visibility", visibility);
    if (type !== "ALL") params.set("type", type);
    if (tags.length > 0) params.set("tags", tags.join(","));
    if (search) params.set("search", search);
    router.replace(`/forum?${params.toString()}`, { scroll: false });
  };

  const handleFilterChange = async () => {
    setLoading(true);
    const result = await getPosts({
      tab,
      visibility,
      type,
      tags,
      search,
      limit: 20,
    });
    if (result.success) {
      setPosts((result as any).data.items);
      setCursor((result as any).data.nextCursor);
      setHasMore((result as any).data.hasMore);
    }
    setLoading(false);
    updateURL();
  };

  const loadMore = async () => {
    if (!cursor) return;
    setLoading(true);
    const result = await getPosts({
      tab,
      visibility,
      type,
      tags,
      search,
      cursor,
      limit: 20,
    });
    if (result.success) {
      setPosts((prev) => [...prev, ...(result as any).data.items]);
      setCursor((result as any).data.nextCursor);
      setHasMore((result as any).data.hasMore);
    }
    setLoading(false);
  };

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0 space-y-4">
        <Tabs
          value={tab}
          onValueChange={handleTabChange}
        >
          <TabsList>
            {TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {loading && posts.length === 0 ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : posts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">
            No posts found. Try adjusting your filters or be the first to post!
          </p>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {hasMore && posts.length > 0 && (
          <div className="flex justify-center pt-4">
            <Button variant="outline" size="sm" onClick={loadMore} disabled={loading}>
              {loading ? "Loading..." : "Load more"}
            </Button>
          </div>
        )}
      </div>

      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-20">
          <ForumFilters
            visibility={visibility}
            type={type}
            tags={tags}
            search={search}
            onVisibilityChange={(v) => {
              setVisibility(v);
              setTimeout(handleFilterChange, 0);
            }}
            onTypeChange={(v) => {
              setType(v);
              setTimeout(handleFilterChange, 0);
            }}
            onTagsChange={(t) => {
              setTags(t);
              setTimeout(handleFilterChange, 0);
            }}
            onSearchChange={(s) => {
              setSearch(s);
              setTimeout(handleFilterChange, 0);
            }}
          />
        </div>
      </aside>
    </div>
  );
}
