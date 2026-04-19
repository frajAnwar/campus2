"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/shared/Avatar";
import { GraduationCap, Copy, UserMinus, Users } from "lucide-react";
import { removeClassMember } from "@/actions/class";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export interface ClassMemberWithUser {
  userId: string;
  classId: string;
  role: string;
  joinedAt: Date | string;
  user: {
    id: string;
    name: string;
    username: string;
    image: string | null;
    email: string;
  };
}

interface PeopleTabProps {
  educator: { id: string; name: string; image: string | null };
  members: ClassMemberWithUser[];
  classId: string;
  enrollmentCode: string;
}

export function PeopleTab({
  educator,
  members,
  classId,
  enrollmentCode,
}: PeopleTabProps) {
  const [removing, setRemoving] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(enrollmentCode);
    setCopied(true);
    toast.success("Enrollment code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRemove = async (userId: string, name: string) => {
    if (!confirm(`Remove ${name} from this class?`)) return;
    setRemoving(userId);
    try {
      const result = await removeClassMember(classId, userId);
      if (result.success) {
        toast.success(`${name} removed from class`);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to remove");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Educator
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
            <Avatar src={educator.image} name={educator.name} size="lg" />
            <div>
              <p className="font-semibold">{educator.name}</p>
              <p className="text-sm text-muted-foreground">Class Educator</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Students ({members.length})
            </CardTitle>
            <Button variant="outline" size="sm" onClick={handleCopyCode}>
              <Copy className="h-4 w-4 mr-2" />
              {copied ? "Copied!" : "Copy Enrollment Code"}
            </Button>
          </div>
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <span>Enrollment Code:</span>
            <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs">
              {enrollmentCode}
            </code>
          </div>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p>No students enrolled yet</p>
              <p className="text-sm mt-1">
                Share the enrollment code with your students
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {members.map((member) => (
                <div
                  key={member.userId}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={member.user.image}
                      name={member.user.name}
                      size="md"
                    />
                    <div>
                      <p className="font-medium text-sm">{member.user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        @{member.user.username}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    disabled={removing === member.userId}
                    onClick={() =>
                      handleRemove(member.userId, member.user.name)
                    }
                  >
                    <UserMinus className="h-4 w-4 mr-1" />
                    {removing === member.userId ? "Removing..." : "Remove"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
