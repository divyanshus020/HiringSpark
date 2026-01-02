import { useEffect, useState } from "react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { getAllPlatforms } from "../api/admin/admin.api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { toast } from "react-toastify";
import {
  Save,
  Globe,
  Lock,
  ShieldCheck,
  Bell,
  Database,
  Building2,
  DollarSign
} from "lucide-react";
import { motion } from "framer-motion";

export default function Settings() {
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [platformSettings, setPlatformSettings] = useState({
    platformName: "HireSpark",
    supportEmail: "support@hirespark.com",
    commissionRate: 15,
    allowNewRegistrations: true
  });

  const fetchPlatforms = async () => {
    setIsLoading(true);
    try {
      const res = await getAllPlatforms();
      setPlatforms(res.data.platforms || res.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlatforms();
  }, []);

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("General settings updated successfully");
  };

  return (
    <DashboardLayout title="Settings">
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-muted p-1">
          <TabsTrigger value="general" className="gap-2">
            <Globe className="h-4 w-4" /> General
          </TabsTrigger>
          <TabsTrigger value="platforms" className="gap-2">
            <Building2 className="h-4 w-4" /> Platforms
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <ShieldCheck className="h-4 w-4" /> Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" /> Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Global Platform Configuration</CardTitle>
                <CardDescription>
                  Update your platform's main identity and global business rules.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveGeneral} className="space-y-6 max-w-2xl">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="platformName">Platform Name</Label>
                      <Input
                        id="platformName"
                        value={platformSettings.platformName}
                        onChange={(e) => setPlatformSettings({ ...platformSettings, platformName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supportEmail">Primary Admin Email</Label>
                      <Input
                        id="supportEmail"
                        type="email"
                        value={platformSettings.supportEmail}
                        onChange={(e) => setPlatformSettings({ ...platformSettings, supportEmail: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="commission">Base Commission Rate (%)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="commission"
                        type="number"
                        className="pl-10"
                        value={platformSettings.commissionRate}
                        onChange={(e) => setPlatformSettings({ ...platformSettings, commissionRate: parseInt(e.target.value) })}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      This rate is used as the default for all HR job postings.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-border">
                    <Button type="submit" className="gap-2">
                      <Save className="h-4 w-4" /> Save General Configuration
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="platforms">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Candidate Sources & Platforms</CardTitle>
                <CardDescription>
                  Manage active platforms and update their current pricing.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="py-20 text-center text-muted-foreground italic">
                      Loading available platforms...
                    </div>
                  ) : platforms.length === 0 ? (
                    <div className="py-20 text-center text-muted-foreground italic">
                      No platforms found in source database.
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {platforms.map((platform) => (
                        <div
                          key={platform._id}
                          className="p-4 rounded-lg border border-border bg-card flex flex-col gap-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-foreground">{platform.name}</span>
                            <Badge variant={platform.isActive ? "default" : "secondary"}>
                              {platform.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">Price ({platform.unit || 'FIXED'})</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                defaultValue={platform.currentPrice}
                                className="h-8"
                              />
                              <Button size="sm" variant="outline" className="h-8">Update</Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security & Access Control</CardTitle>
              <CardDescription>
                Manage admin keys and session policies.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="space-y-0.5">
                  <p className="font-medium text-foreground">API Access Key</p>
                  <p className="text-sm text-muted-foreground">Main key used for external platform integrations.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Input type="password" value="**************" className="w-48 h-9" readOnly />
                  <Button variant="outline" size="sm">Reveal</Button>
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="space-y-0.5">
                  <p className="font-medium text-foreground">Admin Login Policy</p>
                  <p className="text-sm text-muted-foreground">Current login is fixed to environment variables.</p>
                </div>
                <Badge variant="outline">Locked to ENV</Badge>
              </div>

              <div className="flex items-center gap-4">
                <Button disabled className="gap-2">
                  <Lock className="h-4 w-4" /> Change Password
                </Button>
                <Button variant="outline" className="gap-2">
                  <Database className="h-4 w-4" /> Platform Backup
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}