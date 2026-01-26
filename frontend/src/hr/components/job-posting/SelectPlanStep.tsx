import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { useJobPosting } from '../../context/JobPostingContext';
import { ArrowLeft, ArrowRight, Check, Crown, Zap, Star } from 'lucide-react';
import { cn } from '../../lib/utils';

const SelectPlanStep = () => {
  const { state, setPlanType, setCurrentStep } = useJobPosting();

  const plans = [
    {
      id: 'basic',
      name: 'Basic Plan',
      description: 'AI assistant powers your hiring',
      icon: Zap,
      gradient: 'from-blue-500 to-cyan-500',
      features: [
        'Multiple job boards pay only for what u choose',
        'Free AI powered ATS',
        'Free email engagement',
        'Special network of college and training centres',
        'Whatsapp engagement',
        'AI calling agent',
        'AI video interviews',
      ],
      highlight: false,
    },
    {
      id: 'premium',
      name: 'AI EQUIPPED EXPERT HRs',
      description: 'You just post the job—everything else will be handled by our AI-equipped expert HR team.',
      icon: Crown,
      gradient: 'from-purple-500 to-pink-500',
      features: [
        'All features of basic',
        'Special network of placement agencies',
        'HB perfect match',
        'From sourcing from special network to engaging, to initial rounds of interview, to their background verification all will be done by HB.',
      ],
      highlight: true,
    },
  ];

  const handleSelectPlan = (planType: 'basic' | 'premium') => {
    setPlanType(planType);
    setCurrentStep(3);
  };

  return (
    <div className="mx-auto max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-900 bg-clip-text text-transparent mb-3">
          Select Your Plan
        </h2>
        <p className="text-gray-600 text-lg">
          Choose how you want to post your job across platforms
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={cn(
              "relative cursor-pointer transition-all duration-300 hover:shadow-2xl overflow-hidden group",
              plan.highlight
                ? "bg-gradient-to-br from-purple-50/50 to-pink-50/50 shadow-xl border-2 border-purple-200"
                : "bg-white shadow-lg border border-gray-100",
              state.planType === plan.id && "shadow-2xl"
            )}
            onClick={() => handleSelectPlan(plan.id as 'basic' | 'premium')}
          >
            {plan.highlight && (
              <div className="absolute top-5 right-5 z-10">
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                  <Star className="h-4 w-4 fill-current" />
                  Recommended
                </span>
              </div>
            )}

            <CardHeader className="text-center pt-12 pb-6 relative">
              <div
                className={cn(
                  "mx-auto flex h-24 w-24 items-center justify-center rounded-3xl mb-6 shadow-lg transition-transform group-hover:scale-110",
                  `bg-gradient-to-br ${plan.gradient}`
                )}
              >
                <plan.icon className="h-12 w-12 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900 mb-3">{plan.name}</CardTitle>
              <div className="flex flex-col items-center mb-3">
                {plan.id !== 'premium' && (
                  <span className={cn(
                    "text-4xl font-black bg-gradient-to-r bg-clip-text text-transparent",
                    "from-blue-600 to-cyan-600"
                  )}>
                    Varies
                  </span>
                )}
                {plan.id === 'premium' && (
                  <span className="text-2xl font-bold text-purple-600">
                    All-Inclusive
                  </span>
                )}
              </div>
              <CardDescription className="text-base text-gray-600 px-6">{plan.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 relative pb-8 px-8">
              <ul className="space-y-4">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br ${plan.gradient} shrink-0 shadow-sm`}>
                      <Check className="h-4 w-4 text-white font-bold stroke-[3]" />
                    </div>
                    <span className="text-base text-gray-700 leading-relaxed flex-1">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={cn(
                  "w-full h-14 text-base font-semibold shadow-md hover:shadow-lg transition-all rounded-xl",
                  plan.highlight
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                )}
              >
                Select {plan.name}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-start mt-10">
        <Button variant="ghost" onClick={() => setCurrentStep(1)} className="gap-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
          <ArrowLeft className="h-5 w-5" />
          Back to Job Details
        </Button>
      </div>
    </div>
  );
};

export default SelectPlanStep;
