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
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

interface AddHRFormData {
  name: string;
  email: string;
  company: string;
  phone: string;
}

interface AddHRFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: AddHRFormData) => void;
}

export function AddHRForm({ isOpen, onClose, onSubmit }: AddHRFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.company) {
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
        description: `HR Account for ${formData.name} has been created.`,
      });
      onSubmit?.(formData);
      setFormData({ name: "", email: "", company: "", phone: "" });
      onClose();
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md p-4 sm:p-6 max-h-[90vh] overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">Add HR Account</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">Create a new HR account in the system</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs sm:text-sm">Full Name *</Label>
            <Input
              id="name"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              required
              className="text-sm sm:text-base p-2 sm:p-3"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs sm:text-sm">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="john@company.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="text-sm sm:text-base p-2 sm:p-3"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company" className="text-xs sm:text-sm">Company *</Label>
            <Input
              id="company"
              name="company"
              placeholder="Tech Solutions Inc."
              value={formData.company}
              onChange={handleChange}
              required
              className="text-sm sm:text-base p-2 sm:p-3"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-xs sm:text-sm">Phone</Label>
            <Input
              id="phone"
              name="phone"
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={handleChange}
              className="text-sm sm:text-base p-2 sm:p-3"
            />
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
              <span className="hidden sm:inline">{isLoading ? "Creating..." : "Create Account"}</span>
              <span className="sm:hidden">{isLoading ? "Creating..." : "Create"}</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
