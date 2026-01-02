import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Check, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { PRICING } from '../../types/job';

interface NaukriPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPlan: 'standard' | 'classified' | null;
  onSelectPlan: (plan: 'standard' | 'classified') => void;
}

const NaukriPlanDialog = ({ open, onOpenChange, selectedPlan, onSelectPlan }: NaukriPlanDialogProps) => {
  const plans = [
    {
      id: 'standard',
      name: 'Standard',
      price: PRICING.naukri.standard,
      features: [
        { text: 'Upto 250 character job description', included: true },
        { text: '1 job location', included: true },
        { text: '200 applies', included: true },
        { text: 'Applies expiry 30 days', included: true },
        { text: 'Jobseeker contact details visible', included: true },
        { text: 'Boost on Job Search Page', included: false },
        { text: 'Job Branding', included: false },
      ],
      validity: '15 days',
    },
    {
      id: 'classified',
      name: 'Classified',
      price: PRICING.naukri.classified,
      features: [
        { text: 'Upto 250 character job description', included: true },
        { text: '3 job locations', included: true },
        { text: 'Unlimited applies', included: true },
        { text: 'Applies expiry 90 days', included: true },
        { text: 'Jobseeker contact details visible', included: true },
        { text: 'Boost on Job Search Page', included: true },
        { text: 'Job Branding', included: true },
      ],
      validity: '30 days',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">Choose Naukri Plan</DialogTitle>
          <DialogDescription className="text-center">
            Select the plan that best fits your hiring needs
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "rounded-xl border-2 p-6 cursor-pointer transition-all duration-200",
                selectedPlan === plan.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
              onClick={() => onSelectPlan(plan.id as 'standard' | 'classified')}
            >
              <h3 className="text-xl font-bold text-primary">{plan.name}</h3>
              <div className="mt-2">
                <span className="text-3xl font-bold text-foreground">₹{plan.price}</span>
                <span className="text-sm text-muted-foreground ml-1">*GST as applicable</span>
              </div>

              <div className="border-t border-dashed border-border my-4" />

              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Key Features
                </p>
              </div>

              <ul className="mt-3 space-y-2">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    {feature.included ? (
                      <Check className="h-4 w-4 text-success mt-0.5 shrink-0" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    )}
                    <span
                      className={cn(
                        "text-sm",
                        feature.included ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 text-center text-sm font-medium text-muted-foreground">
                Job validity {plan.validity}
              </div>

              <div className="mt-3 text-center">
                <span className="inline-flex items-center gap-1 text-xs text-primary">
                  <span className="font-semibold">🎁 Flat 10% OFF</span> on 5 Job Postings or more
                </span>
              </div>

              <Button
                className="w-full mt-4"
                variant={selectedPlan === plan.id ? "default" : "outline"}
                onClick={() => {
                  onSelectPlan(plan.id as 'standard' | 'classified');
                  onOpenChange(false);
                }}
              >
                Buy now
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NaukriPlanDialog;
