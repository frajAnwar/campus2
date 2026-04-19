import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default async function EducatorSettingsPage() {
  const session = await auth();
  if (!session?.user) return null;

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure your educator preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="submission-alerts">Submission Alerts</Label>
                <p className="text-sm text-muted-foreground">Get notified when students submit work</p>
              </div>
              <Switch id="submission-alerts" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="discussion-alerts">Discussion Alerts</Label>
                <p className="text-sm text-muted-foreground">Get notified when students post in class</p>
              </div>
              <Switch id="discussion-alerts" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="grading-reminders">Grading Reminders</Label>
                <p className="text-sm text-muted-foreground">Receive reminders for pending grading</p>
              </div>
              <Switch id="grading-reminders" defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Default Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="default-late">Default Late Submission Policy</Label>
              <Select defaultValue="allow">
                <SelectTrigger>
                  <SelectValue placeholder="Select policy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="allow">Allow late submissions</SelectItem>
                  <SelectItem value="penalty">Late penalty (10% per day)</SelectItem>
                  <SelectItem value="reject">Reject late submissions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="default-points">Default Maximum Points</Label>
              <Input id="default-points" type="number" defaultValue="100" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="ai-review">AI Grading Assistance</Label>
                <p className="text-sm text-muted-foreground">Use AI to help grade submissions</p>
              </div>
              <Switch id="ai-review" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Grading Scale</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">Configure your default grading scale for all classes</p>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>A (90-100)</Label>
              <Input type="number" defaultValue="90" />
            </div>
            <div className="space-y-2">
              <Label>B (80-89)</Label>
              <Input type="number" defaultValue="80" />
            </div>
            <div className="space-y-2">
              <Label>C (70-79)</Label>
              <Input type="number" defaultValue="70" />
            </div>
            <div className="space-y-2">
              <Label>D (60-69)</Label>
              <Input type="number" defaultValue="60" />
            </div>
            <div className="space-y-2">
              <Label>F (0-59)</Label>
              <Input type="number" defaultValue="0" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>Save Settings</Button>
      </div>
    </div>
  );
}
