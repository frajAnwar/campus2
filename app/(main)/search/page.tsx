"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search as SearchIcon, 
  Users, 
  BookOpen, 
  MessageSquare, 
  FolderCode, 
  Trophy,
  Loader2,
  ArrowRight,
  Flame
} from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import Link from "next/link";
import { Avatar } from "@/components/shared/Avatar";
import { cn, timeAgo } from "@/lib/utils";

export default function GlobalSearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [trending, setTrending] = useState<any>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    // Load recent searches
    const saved = localStorage.getItem("recent_searches");
    if (saved) setRecentSearches(JSON.parse(saved));

    // Fetch trending
    const fetchTrending = async () => {
      const res = await fetch("/api/trending");
      const data = await res.json();
      setTrending(data);
    };
    fetchTrending();
  }, []);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults(null);
      return;
    }

    const search = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`);
        const data = await res.json();
        setResults(data);
        
        // Save to recent
        setRecentSearches(prev => {
          const next = [debouncedQuery, ...prev.filter(q => q !== debouncedQuery)].slice(0, 5);
          localStorage.setItem("recent_searches", JSON.stringify(next));
          return next;
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    search();
  }, [debouncedQuery]);

  return (
    <div className="max-w-6xl mx-auto space-y-16 pb-20 animate-in fade-in duration-700">
      <div className="text-center space-y-6 pt-12">
        <h1 className="text-6xl font-display font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-slate-950 via-slate-600 to-slate-400 dark:from-white dark:via-slate-300 dark:to-slate-600">
          Search your Campus.
        </h1>
        <p className="text-muted-foreground text-xl max-w-2xl mx-auto font-medium">
          Discover classes, student organizations, and academic discussions in one unified workspace.
        </p>
        
        <div className="relative max-w-3xl mx-auto mt-12 group">
          <div className="absolute -inset-1.5 bg-gradient-to-r from-primary/30 to-purple-600/30 rounded-[3rem] blur-xl opacity-0 group-focus-within:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative">
            <SearchIcon className="absolute left-8 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input
              placeholder="Search by name, subject, or interest..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-20 h-24 text-2xl rounded-[2.5rem] border-border/40 bg-white dark:bg-slate-900 shadow-3xl focus:ring-primary/20 transition-all font-display font-bold"
            />
            {loading && (
              <div className="absolute right-8 top-1/2 -translate-y-1/2">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
              </div>
            )}
          </div>
        </div>
      </div>

      {!results && !loading && (
        <div className="space-y-20">
          {/* Recent Searches */}
          {recentSearches.length > 0 && query.length === 0 && (
            <div className="space-y-4 px-4 animate-in slide-in-from-bottom-4 duration-500">
               <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Recent Searches</h3>
               <div className="flex flex-wrap gap-2">
                  {recentSearches.map((q) => (
                    <button 
                      key={q} 
                      onClick={() => setQuery(q)}
                      className="px-6 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-border/50 text-sm font-bold hover:border-primary/40 hover:text-primary transition-all shadow-sm"
                    >
                      {q}
                    </button>
                  ))}
               </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-12">
               {trending?.trendingPosts?.length > 0 && (
                 <div className="space-y-6">
                    <h2 className="text-2xl font-display font-bold px-4 flex items-center gap-3">
                       <div className="h-8 w-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600">
                          <Flame className="h-4 w-4" />
                       </div>
                       Trending Discussions
                    </h2>
                    <div className="grid gap-4">
                       {trending.trendingPosts.map((post: any) => (
                         <Link key={post.id} href={`/forum/${post.id}`}>
                            <Card className="p-6 hover:shadow-xl transition-all rounded-[2rem] border-border/40 bg-white dark:bg-slate-900/50 group">
                               <div className="flex items-center justify-between gap-4">
                                  <div className="min-w-0 flex-1 space-y-2">
                                     <h4 className="font-bold text-lg group-hover:text-primary transition-colors truncate">{post.title}</h4>
                                     <div className="flex items-center gap-3">
                                        <Avatar src={post.author.image} name={post.author.name} size="xs" />
                                        <p className="text-xs text-muted-foreground font-medium">{post.author.name} &bull; {timeAgo(post.createdAt)}</p>
                                     </div>
                                  </div>
                                  <div className="flex flex-col items-end gap-2 shrink-0">
                                     <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-widest">{post.type}</Badge>
                                     <span className="text-[10px] font-bold text-muted-foreground">{post._count.comments} replies</span>
                                  </div>
                               </div>
                            </Card>
                         </Link>
                       ))}
                    </div>
                 </div>
               )}

               {trending?.activeClubs?.length > 0 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-display font-bold px-4 flex items-center gap-3">
                       <div className="h-8 w-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                          <Users className="h-4 w-4" />
                       </div>
                       Active Communities
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {trending.activeClubs.map((club: any) => (
                         <Link key={club.id} href={`/clubs/${club.id}`}>
                            <Card className="p-5 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all rounded-[2rem] border-border/40 group">
                               <div className="flex items-center gap-4">
                                  <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary font-bold text-xl">
                                    {club.name.charAt(0)}
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="font-bold text-sm truncate group-hover:text-primary transition-colors">{club.name}</h4>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{club._count.members} Members</p>
                                  </div>
                               </div>
                            </Card>
                         </Link>
                       ))}
                    </div>
                  </div>
               )}
            </div>

            <div className="space-y-8">
               <div className="p-8 rounded-[3rem] bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/10 space-y-6">
                  <h3 className="font-display font-bold text-xl">Search Tips</h3>
                  <div className="space-y-4">
                     <Tip icon={BookOpen} label="By Subject" text="Type 'Computer Science' to find all related courses." />
                     <Tip icon={FolderCode} label="By Tech" text="Search 'Next.js' to find developer projects." />
                     <Tip icon={Trophy} label="By Role" text="Find 'Educators' to connect with faculty." />
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {results && (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
           {/* ... existing results mapping (users, classes, posts) ... */}
           {/* [Keep the results mapping from previous implementation but ensure it matches the new 6xl max-width] */}
           {results.users?.length > 0 && (
            <Section title="People" icon={Users}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {results.users.map((user: any) => (
                  <Link key={user.id} href={`/profile/${user.username}`}>
                    <Card className="hover:bg-slate-50 dark:hover:bg-slate-900 transition-all rounded-[2rem] border-border/40 overflow-hidden group">
                      <CardContent className="p-5 flex items-center gap-4">
                        <Avatar src={user.image} name={user.name} size="md" />
                        <div className="min-w-0">
                          <p className="font-bold text-sm group-hover:text-primary transition-colors truncate">{user.name}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">@{user.username}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </Section>
          )}

          {results.classes?.length > 0 && (
            <Section title="Classes" icon={BookOpen}>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {results.classes.map((c: any) => (
                   <Link key={c.id} href={`/classes/${c.id}`}>
                      <Card className="p-6 hover:shadow-xl transition-all rounded-[2.2rem] border-border/40 bg-white dark:bg-slate-900 group">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h4 className="font-bold text-lg group-hover:text-primary transition-colors">{c.name}</h4>
                            <p className="text-xs text-muted-foreground">{c.university?.name || "University"}</p>
                          </div>
                          <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                             <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </Card>
                   </Link>
                 ))}
               </div>
            </Section>
          )}

          {results.posts?.length > 0 && (
            <Section title="Discussions" icon={MessageSquare}>
               <div className="grid gap-4">
                 {results.posts.map((post: any) => (
                   <Link key={post.id} href={`/forum/${post.id}`}>
                      <Card className="p-6 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all rounded-[2.2rem] border-border/40 group">
                        <div className="flex items-center justify-between gap-4">
                          <div className="space-y-1 min-w-0">
                            <h4 className="font-bold text-lg truncate group-hover:text-primary transition-colors">{post.title}</h4>
                            <p className="text-xs text-muted-foreground flex items-center gap-2">
                               {post.author.name} &bull; {post._count.comments} replies &bull; {timeAgo(post.createdAt)}
                            </p>
                          </div>
                          <Badge variant="outline" className="shrink-0 text-[10px] font-black uppercase tracking-widest h-7 px-3">{post.type}</Badge>
                        </div>
                      </Card>
                   </Link>
                 ))}
               </div>
            </Section>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ title, icon: Icon, children }: any) {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 px-4">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <h2 className="text-3xl font-display font-bold tracking-tight">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Tip({ icon: Icon, label, text }: any) {
   return (
      <div className="flex gap-4">
         <div className="h-10 w-10 shrink-0 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-primary shadow-sm">
            <Icon className="h-5 w-5" />
         </div>
         <div className="space-y-0.5">
            <p className="text-xs font-black uppercase tracking-widest">{label}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
         </div>
      </div>
   );
}
