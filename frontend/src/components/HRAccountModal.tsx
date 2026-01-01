import { useState } from "react";
import { HRAccount } from "@/data/mockData";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Mail, MapPin } from "lucide-react";

interface HRAccountModalProps {
  account: HRAccount | null;
  isOpen: boolean;
  onClose: () => void;
  isAddMode?: boolean;
}

export function HRAccountModal({
  account,
  isOpen,
  onClose,
  isAddMode = false,
}: HRAccountModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  if (!account && !isAddMode) return null;

  const handleApprove = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Account approved",
        description: `${account?.name} has been approved.`,
      });
      onClose();
    }, 1000);
  };

  const handleSendEmail = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Email sent",
        description: `Email sent to ${account?.email}`,
      });
      onClose();
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isAddMode ? "Add HR Account" : account?.name}</DialogTitle>
          <DialogDescription>
            {isAddMode ? "Create a new HR account" : account?.company}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!isAddMode && account && (
            <>
              <div>
                <Label className="text-xs text-muted-foreground">Name</Label>
                <p className="text-sm font-medium text-foreground">{account.name}</p>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground flex items-center gap-2">
                  <Mail className="h-3 w-3" />
                  Email
                </Label>
                <p className="text-sm font-medium text-foreground">{account.email}</p>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-3 w-3" />
                  Company
                </Label>
                <p className="text-sm font-medium text-foreground">{account.company}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Jobs Posted</Label>
                  <p className="text-sm font-medium text-foreground">{account.jobsPosted}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Badge
                    variant="outline"
                    className={
                      account.status === "Active"
                        ? "bg-success/10 text-success border-success/20"
                        : account.status === "Pending"
                        ? "bg-warning/10 text-warning border-warning/20"
                        : "bg-muted text-muted-foreground border-muted"
                    }
                  >
                    {account.status}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Created Date</Label>
                <p className="text-sm font-medium text-foreground">{account.createdAt}</p>
              </div>

              {account.status === "Pending" && (
                <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                  <p className="text-sm font-medium text-warning">Pending Approval</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    This account is waiting for approval. Review the details and approve if everything is in order.
                  </p>
                </div>
              )}

              {account.status === "Active" && (
                <div className="bg-success/10 border border-success/20 rounded-lg p-3">
                  <p className="text-sm font-medium text-success">Active Account</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    This account is active and can post jobs.
                  </p>
                </div>
              )}

              {account.status === "Inactive" && (
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm font-medium text-muted-foreground">Inactive</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    This account is currently inactive.
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Close
                </Button>
                {account.status === "Pending" && (
                  <Button
                    onClick={handleApprove}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? "Approving..." : "Approve"}
                  </Button>
                )}
                <Button
                  variant="secondary"
                  onClick={handleSendEmail}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? "Sending..." : "Send Email"}
                </Button>
              </div>
            </>
          )}

          {isAddMode && (
            <>
              <p className="text-sm text-muted-foreground">
                This feature is under development. Add HR account form coming soon.
              </p>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Close
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
