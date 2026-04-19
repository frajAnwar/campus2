"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoleRequestSection } from "@/components/settings/RoleRequestSection";
import { toast } from "sonner";
import { updateProfile, updateSettings, deleteAccount } from "@/actions/user";

interface SettingsClientProps {
  initialUser: {
    name: string | null;
    username: string;
    bio: string | null;
    tagline: string | null;
    accentColor: string;
    language: string;
    theme: string;
    safeMode: boolean;
    profileVisibility: string;
    allowDMs: string;
    showOnlineStatus: boolean;
    indexedBySearch: boolean;
    githubUsername: string | null;
    linkedinUrl: string | null;
    websiteUrl: string | null;
    twitterUrl: string | null;
    isOpenToCollab: boolean;
    openToCollabNote: string | null;
    fieldOfStudy: string | null;
    academicYear: number | null;
    graduationYear: number | null;
    currentRole: string | null;
    currentCompany: string | null;
  };
}

export function SettingsClient({ initialUser }: SettingsClientProps) {
  const router = useRouter();
  const { setTheme: setNextTheme, theme: nextTheme } = useTheme();
  const [name, setName] = useState(initialUser.name || "");
  const [username, setUsername] = useState(initialUser.username || "");
  const [bio, setBio] = useState(initialUser.bio || "");
  const [tagline, setTagline] = useState(initialUser.tagline || "");
  const [accentColor, setAccentColor] = useState(initialUser.accentColor || "#6366f1");
  const [language, setLanguage] = useState(initialUser.language || "en");
  const [theme, setTheme] = useState(initialUser.theme || "dark");

  // Sync initial theme from user settings
  useEffect(() => {
    if (initialUser.theme) {
      setNextTheme(initialUser.theme);
    }
  }, [initialUser.theme, setNextTheme]);
  const [safeMode, setSafeMode] = useState(initialUser.safeMode || false);
  const [profileVisibility, setProfileVisibility] = useState(initialUser.profileVisibility || "PUBLIC");
  const [allowDMs, setAllowDMs] = useState(initialUser.allowDMs || "EVERYONE");
  const [showOnlineStatus, setShowOnlineStatus] = useState<boolean>(initialUser.showOnlineStatus || true);
  const [indexedBySearch, setIndexedBySearch] = useState<boolean>(initialUser.indexedBySearch || true);
  const [githubUsername, setGithubUsername] = useState(initialUser.githubUsername || "");
  const [linkedinUrl, setLinkedinUrl] = useState(initialUser.linkedinUrl || "");
  const [websiteUrl, setWebsiteUrl] = useState(initialUser.websiteUrl || "");
  const [twitterUrl, setTwitterUrl] = useState(initialUser.twitterUrl || "");
  const [isOpenToCollab, setIsOpenToCollab] = useState(initialUser.isOpenToCollab || false);
  const [openToCollabNote, setOpenToCollabNote] = useState(initialUser.openToCollabNote || "");
  const [fieldOfStudy, setFieldOfStudy] = useState(initialUser.fieldOfStudy || "");
  const [academicYear, setAcademicYear] = useState(initialUser.academicYear?.toString() || "");
  const [graduationYear, setGraduationYear] = useState(initialUser.graduationYear?.toString() || "");
  const [currentRole, setCurrentRole] = useState(initialUser.currentRole || "");
  const [currentCompany, setCurrentCompany] = useState(initialUser.currentCompany || "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Update theme immediately for UI feedback
      setNextTheme(theme);
      
      // Update profile data
      const profileResult = await updateProfile({
        name,
        bio,
        tagline,
        accentColor,
        githubUsername: githubUsername || undefined,
        linkedinUrl: linkedinUrl || undefined,
        websiteUrl: websiteUrl || undefined,
        twitterUrl: twitterUrl || undefined,
        isOpenToCollab,
        openToCollabNote: openToCollabNote || undefined,
        fieldOfStudy: fieldOfStudy || undefined,
        academicYear: academicYear ? parseInt(academicYear) : undefined,
        graduationYear: graduationYear ? parseInt(graduationYear) : undefined,
        currentRole: currentRole || undefined,
        currentCompany: currentCompany || undefined,
      });

      // Update app settings
      const settingsResult = await updateSettings({
        language,
        theme: theme as any,
        safeMode,
        profileVisibility: profileVisibility as any,
        allowDMs: allowDMs as any,
        showOnlineStatus,
        indexedBySearch,
      });

      if (profileResult.success && settingsResult.success) {
        toast.success("Settings updated successfully!");
        router.refresh();
      } else {
        toast.error(profileResult.error || settingsResult.error || "Failed to update settings");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      const result = await deleteAccount();
      if (result.success) {
        toast.success("Account deleted successfully");
        router.push("/");
      } else {
        toast.error(result.error || "Failed to delete account");
      }
    }
  };

  const colors = [
    "#6366f1",
    "#8b5cf6",
    "#ec4899",
    "#ef4444",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#06b6d4",
    "#3b82f6",
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-display font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your profile, preferences, and account security.</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>
            <TabsContent value="profile" className="space-y-6">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                  <div className="lg:col-span-2 space-y-6">
                  <Card className="border-none shadow-sm ring-1 ring-border/50 overflow-hidden rounded-[2rem]">
                    <CardHeader className="bg-slate-50 dark:bg-slate-900/50">
                      <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Display Name</Label>
                          <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="rounded-xl h-11"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="username" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Username</Label>
                          <Input
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            disabled
                            className="rounded-xl h-11 opacity-70"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tagline" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Tagline</Label>
                        <Input
                          id="tagline"
                          value={tagline}
                          onChange={(e) => setTagline(e.target.value)}
                          placeholder="A short tagline about yourself"
                          className="rounded-xl h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Bio</Label>
                        <Textarea
                          id="bio"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Tell us about yourself..."
                          rows={4}
                          className="rounded-xl"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="fieldOfStudy" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Field of Study</Label>
                          <Input
                            id="fieldOfStudy"
                            value={fieldOfStudy}
                            onChange={(e) => setFieldOfStudy(e.target.value)}
                            placeholder="Computer Science"
                            className="rounded-xl h-11"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="academicYear" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Academic Year</Label>
                          <Input
                            id="academicYear"
                            value={academicYear}
                            onChange={(e) => setAcademicYear(e.target.value)}
                            placeholder="3"
                            type="number"
                            className="rounded-xl h-11"
                          />
                        </div>
                      </div>

                      <div className="space-y-3 pt-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Accent Color</Label>
                        <div className="flex flex-wrap gap-3">
                          {colors.map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setAccentColor(color)}
                              className={`h-9 w-9 rounded-full border-4 transition-all hover:scale-110 ${
                                accentColor === color
                                  ? "border-primary/40 scale-110 shadow-lg"
                                  : "border-transparent"
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-sm ring-1 ring-border/50 overflow-hidden rounded-[2rem]">
                    <CardHeader className="bg-slate-50 dark:bg-slate-900/50">
                      <CardTitle>Social Links</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="githubUsername" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">GitHub Username</Label>
                          <Input
                            id="githubUsername"
                            value={githubUsername}
                            onChange={(e) => setGithubUsername(e.target.value)}
                            placeholder="username"
                            className="rounded-xl h-11"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="linkedinUrl" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">LinkedIn URL</Label>
                          <Input
                            id="linkedinUrl"
                            value={linkedinUrl}
                            onChange={(e) => setLinkedinUrl(e.target.value)}
                            placeholder="https://linkedin.com/in/username"
                            className="rounded-xl h-11"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="websiteUrl" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Website</Label>
                          <Input
                            id="websiteUrl"
                            value={websiteUrl}
                            onChange={(e) => setWebsiteUrl(e.target.value)}
                            placeholder="https://yourwebsite.com"
                            className="rounded-xl h-11"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="twitterUrl" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Twitter/X</Label>
                          <Input
                            id="twitterUrl"
                            value={twitterUrl}
                            onChange={(e) => setTwitterUrl(e.target.value)}
                            placeholder="https://x.com/username"
                            className="rounded-xl h-11"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={saving} className="rounded-xl px-8 h-11 font-bold">
                      {saving ? "Saving..." : "Save Profile Changes"}
                    </Button>
                  </div>
                </div>
              </div>
              </form>
              
              <div className="space-y-8">
                <RoleRequestSection />
              </div>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-6">
              <form onSubmit={handleSubmit}>
                <Card className="border-none shadow-sm ring-1 ring-border/50 overflow-hidden rounded-[2rem]">
                <CardHeader className="bg-slate-50 dark:bg-slate-900/50">
                  <CardTitle>Interface Preferences</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Language</Label>
                      <Select value={language} onValueChange={(value) => setLanguage(value ?? '')}>
                        <SelectTrigger className="rounded-xl h-11">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="ar">Arabic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Interface Mode</Label>
                      <div className="flex p-1 bg-muted rounded-xl h-11">
                        {["dark", "light", "system"].map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setTheme(t)}
                            className={`flex-1 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all ${
                              theme === t
                                ? "bg-white dark:bg-slate-800 text-primary shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm">Safe Mode</Label>
                        <p className="text-xs text-muted-foreground">Hide sensitive content and mature discussions</p>
                      </div>
                      <Switch checked={safeMode} onCheckedChange={setSafeMode} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button type="submit" disabled={saving} className="rounded-xl px-8 h-11 font-bold">
                  {saving ? "Saving..." : "Save Preferences"}
                </Button>
              </div>
              </form>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-6">
              <form onSubmit={handleSubmit}>
                <Card className="border-none shadow-sm ring-1 ring-border/50 overflow-hidden rounded-[2rem]">
                <CardHeader className="bg-slate-50 dark:bg-slate-900/50">
                  <CardTitle>Privacy Settings</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Profile Visibility</Label>
                    <Select value={profileVisibility} onValueChange={(value) => setProfileVisibility(value ?? '')}>
                      <SelectTrigger className="rounded-xl h-11">
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PUBLIC">Public - Anyone can view</SelectItem>
                        <SelectItem value="UNIVERSITY">University Only</SelectItem>
                        <SelectItem value="FOLLOWERS">Followers Only</SelectItem>
                        <SelectItem value="PRIVATE">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Direct Messages</Label>
                    <Select value={allowDMs} onValueChange={(value) => setAllowDMs(value ?? '')}>
                      <SelectTrigger className="rounded-xl h-11">
                        <SelectValue placeholder="Who can message you" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EVERYONE">Everyone</SelectItem>
                        <SelectItem value="FOLLOWERS">Followers Only</SelectItem>
                        <SelectItem value="NONE">No One</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm">Show Online Status</Label>
                        <p className="text-xs text-muted-foreground">Let others see when you're active</p>
                      </div>
                      <Switch checked={showOnlineStatus} onCheckedChange={setShowOnlineStatus} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm">Include in Search Results</Label>
                        <p className="text-xs text-muted-foreground">Allow your profile to appear in search</p>
                      </div>
                      <Switch checked={indexedBySearch} onCheckedChange={setIndexedBySearch} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm">Open to Collaboration</Label>
                        <p className="text-xs text-muted-foreground">Show that you're looking for project collaborators</p>
                      </div>
                      <Switch checked={isOpenToCollab} onCheckedChange={setIsOpenToCollab} />
                    </div>

                    {isOpenToCollab && (
                      <div className="space-y-2 pt-2">
                        <Label htmlFor="openToCollabNote" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Collaboration Note</Label>
                        <Input
                          id="openToCollabNote"
                          value={openToCollabNote}
                          onChange={(e) => setOpenToCollabNote(e.target.value)}
                          placeholder="What kind of projects are you interested in?"
                          className="rounded-xl h-11"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button type="submit" disabled={saving} className="rounded-xl px-8 h-11 font-bold">
                  {saving ? "Saving..." : "Save Privacy Settings"}
                </Button>
              </div>
              </form>
            </TabsContent>

            <TabsContent value="account" className="space-y-6">
              <Card className="border-none shadow-sm ring-1 ring-border/50 overflow-hidden rounded-[2rem] bg-red-50/30 dark:bg-red-900/10">
                <CardHeader>
                  <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <p className="text-xs text-muted-foreground">Once you delete your account, there is no going back. Please be certain.</p>
                  <Button 
                    variant="destructive" 
                    className="w-full rounded-xl h-11 font-bold"
                    onClick={handleDeleteAccount}
                    type="button"
                  >
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
