import { useState } from "react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { toast } from "react-toastify";

export default function Settings() {
  const [platformSettings, setPlatformSettings] = useState({
    platformName: "HireSpark Hub",
    commissionRate: 20,
    supportEmail: "support@hirespark.com"
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // API call would go here
    console.log("Saving settings:", platformSettings);
    toast.success("Settings saved successfully");
  };

  return (
    <DashboardLayout title="Settings">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="pb-4 border-b border-gray-100">
            <CardTitle className="text-xl font-bold text-gray-800">Admin Panel Settings</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="platformName" className="text-sm font-medium text-gray-700">
                  Platform Name
                </Label>
                <Input
                  id="platformName"
                  value={platformSettings.platformName}
                  onChange={(e) => setPlatformSettings({ ...platformSettings, platformName: e.target.value })}
                  className="max-w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="commission" className="text-sm font-medium text-gray-700">
                  Commission Rate (%)
                </Label>
                <Input
                  id="commission"
                  type="number"
                  value={platformSettings.commissionRate}
                  onChange={(e) => setPlatformSettings({ ...platformSettings, commissionRate: Number(e.target.value) })}
                  className="max-w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supportEmail" className="text-sm font-medium text-gray-700">
                  Support Email
                </Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={platformSettings.supportEmail}
                  onChange={(e) => setPlatformSettings({ ...platformSettings, supportEmail: e.target.value })}
                  className="max-w-full"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6"
                >
                  Save Settings
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}