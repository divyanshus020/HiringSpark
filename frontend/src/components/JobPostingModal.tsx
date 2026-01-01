import { useState } from "react";
import { JobPosting } from "@/data/mockData";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Send, AlertCircle } from "lucide-react";

interface JobPostingModalProps {
  job: JobPosting | null;
  isOpen: boolean;
  onClose: () => void;
}

export function JobPostingModal({ job, isOpen, onClose }: JobPostingModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  if (!job) return null;

  const handleSendNotification = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Notification sent",
        description: `Notification sent to HR for "${job.position}" position.`,
      });
      onClose();
    }, 1000);
  };

  const handleProcessPayment = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Payment processing",
        description: "Redirecting to payment gateway...",
      });
      onClose();
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{job.position}</DialogTitle>
          <DialogDescription>{job.hrCompany}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Position</Label>
            <p className="text-sm font-medium text-foreground">{job.position}</p>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">HR Company</Label>
            <p className="text-sm font-medium text-foreground">{job.hrCompany}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Plan</Label>
              <Badge variant="outline" className="mt-1">
                {job.plan}
              </Badge>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Badge
                variant="outline"
                className={
                  job.status === "Active"
                    ? "bg-success/10 text-success border-success/20"
                    : job.status === "Draft"
                    ? "bg-warning/10 text-warning border-warning/20"
                    : "bg-muted text-muted-foreground border-muted"
                }
              >
                {job.status}
              </Badge>
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Candidates</Label>
            <p className="text-sm font-medium text-foreground">{job.candidatesCount}</p>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Created Date</Label>
            <p className="text-sm font-medium text-foreground">{job.createdAt}</p>
          </div>

          {/* Pending Status - Show Payment Info */}
          {job.status === "Draft" && (
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
              <div className="flex gap-2">
                <AlertCircle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-warning">Pending Payment</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    This job posting requires payment to be activated. Complete the payment to activate this posting.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Active Status - Show Send Action */}
          {job.status === "Active" && (
            <div className="bg-success/10 border border-success/20 rounded-lg p-3">
              <p className="text-sm font-medium text-success">Active & Running</p>
              <p className="text-xs text-muted-foreground mt-1">
                This posting is active and candidates can apply.
              </p>
            </div>
          )}

          {/* Closed Status - Show Closed Info */}
          {job.status === "Closed" && (
            <div className="bg-muted rounded-lg p-3">
              <p className="text-sm font-medium text-muted-foreground">Closed</p>
              <p className="text-xs text-muted-foreground mt-1">
                This job posting is closed and no longer accepting applications.
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            {job.status === "Draft" && (
              <Button
                onClick={handleProcessPayment}
                disabled={isLoading}
                className="flex-1 gap-2"
              >
                <AlertCircle className="h-4 w-4" />
                {isLoading ? "Processing..." : "Process Payment"}
              </Button>
            )}
            {job.status === "Active" && (
              <Button
                onClick={handleSendNotification}
                disabled={isLoading}
                className="flex-1 gap-2"
              >
                <Send className="h-4 w-4" />
                {isLoading ? "Sending..." : "Send Notification"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
