import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

interface CreateJobFormData {
  position: string;
  company: string;
  plan: 'Basic' | 'Premium';
  salaryRange: string;
  status: 'Draft' | 'Active' | 'Closed';
}

interface CreateJobFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: CreateJobFormData) => void;
}

export function CreateJobForm({ isOpen, onClose, onSubmit }: CreateJobFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    position: "",
    company: "",
    plan: "Basic",
    salaryRange: "",
    status: "Draft",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.position || !formData.company) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Success",
        description: `Job posting for "${formData.position}" has been created.`,
      });
      onSubmit?.({
        position: formData.position,
        company: formData.company,
        plan: formData.plan as 'Basic' | 'Premium',
        salaryRange: formData.salaryRange,
        status: formData.status as 'Draft' | 'Active' | 'Closed',
      });
      setFormData({
        position: "",
        company: "",
        plan: "Basic",
        salaryRange: "",
        status: "Draft",
      });
      onClose();
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md p-4 sm:p-6 max-h-[90vh] overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">Create Job Posting</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">Create a new job posting in the system</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="space-y-2">
            <Label htmlFor="position" className="text-xs sm:text-sm">Position Title *</Label>
            <Input
              id="position"
              name="position"
              placeholder="e.g., Senior Developer"
              value={formData.position}
              onChange={handleChange}
              required
              className="text-sm sm:text-base p-2 sm:p-3"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company" className="text-xs sm:text-sm">HR Company *</Label>
            <Input
              id="company"
              name="company"
              placeholder="e.g., TechCorp Inc."
              value={formData.company}
              onChange={handleChange}
              required
              className="text-sm sm:text-base p-2 sm:p-3"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="plan" className="text-xs sm:text-sm">Plan Type *</Label>
            <Select value={formData.plan} onValueChange={(value) => handleSelectChange("plan", value)}>
              <SelectTrigger id="plan" className="text-sm sm:text-base p-2 sm:p-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Basic">Basic</SelectItem>
                <SelectItem value="Premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="salaryRange" className="text-xs sm:text-sm">Salary Range</Label>
            <Input
              id="salaryRange"
              name="salaryRange"
              placeholder="e.g., 12-18 LPA"
              value={formData.salaryRange}
              onChange={handleChange}
              className="text-sm sm:text-base p-2 sm:p-3"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="text-xs sm:text-sm">Status *</Label>
            <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
              <SelectTrigger id="status" className="text-sm sm:text-base p-2 sm:p-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Draft">Draft (Pending Payment)</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 text-xs sm:text-sm h-9 sm:h-10"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 gap-2 text-xs sm:text-sm h-9 sm:h-10" disabled={isLoading}>
              <Save className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{isLoading ? "Creating..." : "Create Job"}</span>
              <span className="sm:hidden">{isLoading ? "Creating..." : "Create"}</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
