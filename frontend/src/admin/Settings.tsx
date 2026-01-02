import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { platformSettings } from "@/data/mockData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState(platformSettings);

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your platform settings have been updated successfully.",
    });
  };

  return (
    <DashboardLayout title="Settings">
      <div className="max-w-2xl space-y-6">
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-6">Platform Configuration</h2>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="platformName">Platform Name</Label>
              <Input
                id="platformName"
                value={settings.platformName}
                onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="commissionRate">Commission Rate (%)</Label>
              <Input
                id="commissionRate"
                type="number"
                min="0"
                max="100"
                value={settings.commissionRate}
                onChange={(e) => setSettings({ ...settings, commissionRate: Number(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground">
                The percentage fee charged on successful placements.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supportEmail">Support Email</Label>
              <Input
                id="supportEmail"
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}