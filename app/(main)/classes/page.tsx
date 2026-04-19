import { auth } from "@/lib/auth";
import { getUserClasses } from "@/actions/class";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/utils";
import {
  BookOpen,
  Users,
  Plus,
  LogIn,
  GraduationCap,
  Calendar,
  Tag,
} from "lucide-react";
import Link from "next/link";

export default async function ClassesPage() {
  const session = await auth();
  if (!session?.user) return null;

  const isEducator = ["EDUCATOR", "TEACHING_ASSISTANT", "PLATFORM_ADMIN"].includes(
    session.user.role ?? ""
  );

  const classes = await getUserClasses();

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Classes</h1>
          <p className="text-muted-foreground mt-1">
            You're enrolled in {classes.length} class{classes.length !== 1 ? "es" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/classes/join">
            <Button variant="outline" className="h-10 px-4">
              <LogIn className="mr-2 h-4 w-4" />
              Join Class
            </Button>
          </Link>
          {isEducator && (
            <Link href="/classes/join">
              <Button className="h-10 px-4">
                <Plus className="mr-2 h-4 w-4" />
                Create Class
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Empty State */}
      {classes.length === 0 ? (
        <Card className="border-dashed border-2 border-border/50 bg-transparent">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookOpen className="h-16 w-16 text-muted-foreground/40 mb-4" />
            <h3 className="text-xl font-semibold">No classes yet</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm text-center">
              Join a class using an enrollment code or create your own to get started
            </p>
            <div className="flex gap-3 mt-6">
              <Link href="/classes/join">
                <Button>
                  <LogIn className="mr-2 h-4 w-4" />
                  Join Class
                </Button>
              </Link>
              {isEducator && (
                <Link href="/classes/join">
                  <Button variant="secondary">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Class
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Classes Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((c) => (
            <Link key={c.id} href={`/classes/${c.id}`}>
              <Card className="h-full border-border/40 hover:border-border hover:shadow-sm transition-all group">
                <CardHeader className="pb-4">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2">
                      {c.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <GraduationCap className="h-4 w-4" />
                      <span className="truncate">
                        {"educator" in c ? (c as any).educator.name : "You"}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {"university" in c && c.university && (
                    <p className="text-sm text-muted-foreground truncate">
                      {c.university.name}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    {c.term && (
                      <Badge variant="secondary" className="text-xs">
                        {c.term}
                      </Badge>
                    )}
                    {c.subjectTag && (
                      <Badge variant="outline" className="text-xs">
                        {c.subjectTag}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-6 pt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="h-4 w-4" />
                      <span>{c._count.assignments} assignments</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4" />
                      <span>{c._count.members} members</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
