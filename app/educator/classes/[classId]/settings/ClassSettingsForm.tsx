"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, Save, AlertTriangle, Lock } from "lucide-react";
import { updateClass } from "@/actions/class";

interface ClassSettingsFormProps {
  classData: {
    id: string;
    name: string;
    description: string | null;
    term: string | null;
    subjectTag: string | null;
    isOpen: boolean;
    isLocked: boolean;
  };
}

export function ClassSettingsForm({ classData }: ClassSettingsFormProps) {
  const router = useRouter();

  const [name, setName] = useState(classData.name);
  const [description, setDescription] = useState(classData.description || "");
  const [term, setTerm] = useState(classData.term || "");
  const [subjectTag, setSubjectTag] = useState(classData.subjectTag || "");
  const [isOpen, setIsOpen] = useState(classData.isOpen);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Class name is required");
      return;
    }

    setLoading(true);
    try {
      const result = await updateClass({
        classId: classData.id,
        name: name.trim(),
        description: description.trim() || undefined,
        term: term.trim() || undefined,
        subjectTag: subjectTag.trim() || undefined,
        isOpen,
      });

      if (result.success) {
        toast.success("Class settings updated!");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update settings");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleLock = async () => {
    if (
      !confirm(
        "Are you sure you want to lock this class? Students will not be able to access it."
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const result = await updateClass({
        classId: classData.id,
        isLocked: true,
        isOpen: false,
      });

      if (result.success) {
        toast.success("Class locked");
        setIsOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to lock class");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href={`/educator/classes/${classData.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-display font-bold">Class Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your class configuration
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>General Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Class Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Introduction to Computer Science"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this class covers..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="term">Term / Semester</Label>
                <Input
                  id="term"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="e.g. Fall 2026"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subjectTag">Subject Tag</Label>
                <Input
                  id="subjectTag"
                  value={subjectTag}
                  onChange={(e) => setSubjectTag(e.target.value)}
                  placeholder="e.g. Computer Science"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Enrollment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Open Enrollment</p>
                <p className="text-sm text-muted-foreground">
                  Allow new students to join with the enrollment code
                </p>
              </div>
              <Switch checked={isOpen} onCheckedChange={setIsOpen} />
            </div>
            {isOpen ? (
              <div className="flex items-center gap-2 text-sm">
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                >
                  Open
                </Badge>
                <span className="text-muted-foreground">
                  Students can join with the enrollment code
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm">
                <Badge
                  variant="secondary"
                  className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                >
                  Closed
                </Badge>
                <span className="text-muted-foreground">
                  New students cannot join this class
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/5 border border-destructive/20">
              <div>
                <p className="font-medium">Lock Class</p>
                <p className="text-sm text-muted-foreground">
                  Permanently lock this class. Students will lose access to all
                  materials.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleLock}
                disabled={classData.isLocked}
              >
                <Lock className="h-4 w-4 mr-2" />
                {classData.isLocked ? "Already Locked" : "Lock Class"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Link href={`/educator/classes/${classData.id}`}>
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button onClick={handleSave} disabled={loading || !name.trim()}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
