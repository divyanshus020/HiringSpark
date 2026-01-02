import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-lg">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-primary mb-2">
          <span className="text-primary-foreground font-bold text-2xl">HS</span>
        </div>
        
        <h1 className="text-4xl font-bold text-foreground">
          HireSpark Admin
        </h1>
        
        <p className="text-lg text-muted-foreground">
          Manage HR accounts, candidates, and job postings all in one place.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button size="lg" onClick={() => navigate('/auth')} className="gap-2">
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/dashboard')}>
            View Demo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;