"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PostType, Visibility } from "@prisma/client";
import { 
  Search, 
  X, 
  Filter, 
  HelpCircle, 
  MessageCircle, 
  Award, 
  Share2, 
  BarChart3,
  Globe,
  Building,
  GraduationCap,
  Sparkles
} from "lucide-react";

const POST_TYPES: { value: PostType | "ALL"; label: string }[] = [
  { value: "ALL", label: "All Types" },
  { value: "QUESTION", label: "Question" },
  { value: "DISCUSSION", label: "Discussion" },
  { value: "SHOWCASE", label: "Showcase" },
  { value: "NOTE_SHARE", label: "Note Share" },
  { value: "POLL", label: "Poll" },
];

const VISIBILITY_OPTIONS: { value: Visibility | "ALL"; label: string }[] = [
  { value: "ALL", label: "All Visibility" },
  { value: "PUBLIC", label: "Public" },
  { value: "UNIVERSITY", label: "University" },
  { value: "CLASS", label: "Class" },
];

const POPULAR_TAGS = [
  "exam-prep",
  "study-tips",
  "project-help",
  "career",
  "tech",
  "research",
  "general",
];

interface ForumFiltersProps {
  visibility: string;
  type: string;
  tags: string[];
  search: string;
  onVisibilityChange: (v: string) => void;
  onTypeChange: (v: string) => void;
  onTagsChange: (tags: string[]) => void;
  onSearchChange: (s: string) => void;
  className?: string;
}

const ICON_MAP_TYPE: Record<string, any> = {
  ALL: Filter,
  QUESTION: HelpCircle,
  DISCUSSION: MessageCircle,
  SHOWCASE: Award,
  NOTE_SHARE: Share2,
  POLL: BarChart3,
};

const ICON_MAP_VIS: Record<string, any> = {
  ALL: Globe,
  PUBLIC: Globe,
  UNIVERSITY: Building,
  CLASS: GraduationCap,
};

export function ForumFilters({
  visibility,
  type,
  tags,
  search,
  onVisibilityChange,
  onTypeChange,
  onTagsChange,
  onSearchChange,
  className,
}: ForumFiltersProps) {
  const [tagInput, setTagInput] = useState("");

  const addTag = (tag: string) => {
    const t = tag.trim().toLowerCase();
    if (t && !tags.includes(t) && tags.length < 5) {
      onTagsChange([...tags, t]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    onTagsChange(tags.filter((t) => t !== tag));
  };

  const hasFilters = visibility !== "ALL" || type !== "ALL" || tags.length > 0 || search;

  return (
    <div className={cn("space-y-10", className)}>
      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 px-1">Search</h3>
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search keywords..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-slate-100/50 dark:bg-slate-800/50 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-primary/20 transition-all rounded-2xl h-11 text-sm shadow-sm"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 px-1 flex items-center gap-2">
          Category
          <Sparkles className="h-3 w-3 text-primary/40" />
        </h3>
        <div className="grid gap-1.5">
          {POST_TYPES.map((o) => {
            const Icon = ICON_MAP_TYPE[o.value];
            const isActive = type === o.value;
            return (
              <button
                key={o.value}
                onClick={() => onTypeChange(o.value)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-300 group",
                  isActive 
                    ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]" 
                    : "text-muted-foreground hover:bg-white dark:hover:bg-slate-800 hover:text-primary"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-white" : "group-hover:text-primary")} />
                {o.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 px-1">Audience</h3>
        <div className="flex flex-wrap gap-2">
          {VISIBILITY_OPTIONS.map((o) => {
             const Icon = ICON_MAP_VIS[o.value];
             const isActive = visibility === o.value;
             return (
              <button
                key={o.value}
                onClick={() => onVisibilityChange(o.value)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                  isActive
                    ? "bg-primary/5 border-primary/20 text-primary shadow-sm"
                    : "bg-transparent border-border/40 text-muted-foreground hover:border-primary/20 hover:text-primary"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {o.label}
              </button>
             )
          })}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 px-1">Trending Tags</h3>
        <div className="space-y-4">
          <Input
            placeholder="Find tag..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag(tagInput);
              }
            }}
            className="h-10 text-sm rounded-xl bg-transparent border-dashed border-2 border-border/40 focus:border-primary/40 focus:ring-0"
          />
          
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag} className="bg-primary/10 text-primary border-none hover:bg-primary/20 rounded-lg px-3 py-1 text-xs font-bold gap-1.5 animate-in zoom-in-95 duration-200">
                {tag}
                <button onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {POPULAR_TAGS.filter((t) => !tags.includes(t)).map((tag) => (
              <button
                key={tag}
                onClick={() => addTag(tag)}
                className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-border/40 bg-white/50 dark:bg-slate-800/50 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {hasFilters && (
        <Button
          variant="outline"
          size="sm"
          className="w-full h-11 rounded-2xl text-xs font-bold border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 border-dashed"
          onClick={() => {
            onVisibilityChange("ALL");
            onTypeChange("ALL");
            onTagsChange([]);
            onSearchChange("");
          }}
        >
          Reset All Filters
        </Button>
      )}
    </div>
  );
}
