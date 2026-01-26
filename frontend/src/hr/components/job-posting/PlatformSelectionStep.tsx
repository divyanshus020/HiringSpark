import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useJobPosting } from '../../context/JobPostingContext';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  GraduationCap,
  Building2,
  Users,
  Sparkles,
  Crown
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { PRICING } from '../../types/job';
import NaukriPlanDialog from './NaukriPlanDialog';

const PlatformSelectionStep = () => {
  const { state, setPlatforms, setCurrentStep, calculateTotal } = useJobPosting();
  const [platforms, setLocalPlatforms] = useState(state.platforms);
  const [naukriDialogOpen, setNaukriDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { subtotal, gst, total } = calculateTotal();

  const updatePlatforms = (newPlatforms: typeof platforms) => {
    setLocalPlatforms(newPlatforms);
    setPlatforms(newPlatforms);
  };

  const handleLinkedInChange = (checked: boolean) => {
    updatePlatforms({
      ...platforms,
      linkedin: { ...platforms.linkedin, selected: checked },
    });
  };

  const handleLinkedInDaysChange = (days: string) => {
    updatePlatforms({
      ...platforms,
      linkedin: { ...platforms.linkedin, days: parseInt(days) },
    });
  };

  const handleNaukriClick = () => {
    setNaukriDialogOpen(true);
  };

  const handleNaukriPlanSelect = (plan: 'standard' | 'classified') => {
    updatePlatforms({
      ...platforms,
      naukri: { selected: true, plan },
    });
  };

  const handleContinue = () => {
    setIsLoading(true);
    setTimeout(() => {
      setCurrentStep(4);
      setIsLoading(false);
    }, 400);
  };

  const linkedInCost = platforms.linkedin.selected
    ? PRICING.linkedin.perDay * platforms.linkedin.days
    : 0;

  const naukriCost = platforms.naukri.selected && platforms.naukri.plan
    ? PRICING.naukri[platforms.naukri.plan]
    : 0;

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center z-50">
          <style>
            {`
              .loader {
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100px;
                height: 100px;
                perspective: 780px;
              }
              .text {
                font-size: 20px;
                font-weight: 700;
                color: #6366f1;
                z-index: 10;
              }
              .load-inner {
                position: absolute;
                width: 100%;
                height: 100%;
                box-sizing: border-box;
                border-radius: 50%;
              }
              .load-inner.load-one {
                left: 0%;
                top: 0%;
                border-bottom: 3px solid #5c5edc;
                animation: rotate1 1.5s ease-in-out infinite;
              }
              .load-inner.load-two {
                right: 0%;
                top: 0%;
                border-right: 3px solid #9147ff;
                animation: rotate2 1.5s 0.15s ease-in-out infinite;
              }
              .load-inner.load-three {
                right: 0%;
                bottom: 0%;
                border-top: 3px solid #3b82f6;
                animation: rotate3 1.5s 0.3s ease-in-out infinite;
              }
              @keyframes rotate1 {
                0% {
                  transform: rotateX(45deg) rotateY(-45deg) rotateZ(0deg);
                }
                100% {
                  transform: rotateX(45deg) rotateY(-45deg) rotateZ(360deg);
                }
              }
              @keyframes rotate2 {
                0% {
                  transform: rotateX(45deg) rotateY(45deg) rotateZ(0deg);
                }
                100% {
                  transform: rotateX(45deg) rotateY(45deg) rotateZ(360deg);
                }
              }
              @keyframes rotate3 {
                0% {
                  transform: rotateX(-60deg) rotateY(0deg) rotateZ(0deg);
                }
                100% {
                  transform: rotateX(-60deg) rotateY(0deg) rotateZ(360deg);
                }
              }
            `}
          </style>
          <div className="loader">
            <div className="load-inner load-one"></div>
            <div className="load-inner load-two"></div>
            <div className="load-inner load-three"></div>
            <span className="text">Loading...</span>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-900 bg-clip-text text-transparent mb-3">
            Select Platforms
          </h2>
          <p className="text-gray-600 text-lg">
            Choose where you want your job posted. Our team will handle the posting.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Platform Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Boards Section */}
            <Card className="border-0 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full blur-3xl opacity-30 -mr-32 -mt-32"></div>

              <CardHeader className="pb-4 relative">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                    <Briefcase className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900">Job Boards</CardTitle>
                    <CardDescription className="text-gray-600">
                      Major job platforms with millions of active job seekers
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 relative">
                {/* LinkedIn */}
                <div
                  className={cn(
                    "flex items-center justify-between p-5 rounded-xl border-2 transition-all duration-300 hover:shadow-md cursor-pointer",
                    platforms.linkedin.selected
                      ? "border-[#0077B5] bg-blue-50"
                      : "border-gray-200 bg-white hover:border-blue-300"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={platforms.linkedin.selected}
                      onCheckedChange={handleLinkedInChange}
                      className="data-[state=checked]:bg-[#0077B5] data-[state=checked]:border-[#0077B5]"
                    />
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0077B5] shadow-md">
                      <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-base">LinkedIn</p>
                      <p className="text-sm text-gray-600">
                        Reach 900M+ professionals worldwide
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {platforms.linkedin.selected && (
                      <Select
                        value={platforms.linkedin.days.toString()}
                        onValueChange={handleLinkedInDaysChange}
                      >
                        <SelectTrigger className="w-28 h-11 border-gray-300 shadow-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {[1, 3, 7, 15, 30].map((days) => (
                            <SelectItem key={days} value={days.toString()}>
                              {days} day{days > 1 ? 's' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {state.planType !== 'premium' && (
                      <span className="text-[#0077B5] font-bold text-base">
                        ₹{PRICING.linkedin.perDay}/day
                      </span>
                    )}
                  </div>
                </div>

                {/* Naukri */}
                <div
                  className={cn(
                    "flex items-center justify-between p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md",
                    platforms.naukri.selected
                      ? "border-[#4A90E2] bg-blue-50"
                      : "border-gray-200 bg-white hover:border-blue-300"
                  )}
                  onClick={handleNaukriClick}
                >
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={platforms.naukri.selected}
                      onCheckedChange={() => handleNaukriClick()}
                      className="data-[state=checked]:bg-[#4A90E2] data-[state=checked]:border-[#4A90E2]"
                    />
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white border-2 border-gray-200 shadow-md">
                      <span className="text-[#4A90E2] font-bold text-xl">N</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-base">Naukri</p>
                      <p className="text-sm text-gray-600">
                        India's #1 job portal with 80M+ jobseekers
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    {platforms.naukri.plan && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full font-semibold">
                        {platforms.naukri.plan === 'standard' ? 'Standard' : 'Classified'}
                      </span>
                    )}
                    {state.planType !== 'premium' && (
                      <span className="text-[#4A90E2] font-bold text-base">
                        ₹{platforms.naukri.plan ? PRICING.naukri[platforms.naukri.plan] : '400+'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Times Job */}
                <div
                  className={cn(
                    "flex items-center justify-between p-5 rounded-xl border-2 transition-all duration-300 hover:shadow-md cursor-pointer",
                    platforms.timesJob
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 bg-white hover:border-purple-300"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={platforms.timesJob}
                      onCheckedChange={(checked) =>
                        updatePlatforms({ ...platforms, timesJob: checked as boolean })
                      }
                      className="data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                    />
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-md">
                      <Briefcase className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-base">TimesJobs</p>
                      <p className="text-sm text-gray-600">
                        Leading job portal by Times Group
                      </p>
                    </div>
                  </div>
                  {state.planType !== 'premium' && (
                    <span className="text-purple-600 font-bold text-base">
                      ₹{PRICING.timesJob}
                    </span>
                  )}
                </div>

                {/* IIM Jobs */}
                <div
                  className={cn(
                    "flex items-center justify-between p-5 rounded-xl border-2 transition-all duration-300 hover:shadow-md cursor-pointer",
                    platforms.iimJobs
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 bg-white hover:border-emerald-300"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={platforms.iimJobs}
                      onCheckedChange={(checked) =>
                        updatePlatforms({ ...platforms, iimJobs: checked as boolean })
                      }
                      className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                    />
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md">
                      <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-base">IIM Jobs</p>
                      <p className="text-sm text-gray-600">
                        Premium talent from top B-schools
                      </p>
                    </div>
                  </div>
                  <span className="text-emerald-600 font-bold text-base flex items-center gap-1">
                    <Sparkles className="h-4 w-4" />
                    Free
                  </span>
                </div>

                {/* Unstop */}
                <div
                  className={cn(
                    "flex items-center justify-between p-5 rounded-xl border-2 transition-all duration-300 hover:shadow-md cursor-pointer",
                    platforms.unstop
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 bg-white hover:border-orange-300"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={platforms.unstop}
                      onCheckedChange={(checked) =>
                        updatePlatforms({ ...platforms, unstop: checked as boolean })
                      }
                      className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                    />
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shadow-md">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-base">Unstop</p>
                      <p className="text-sm text-gray-600">
                        Connect with college students & freshers
                      </p>
                    </div>
                  </div>
                  <span className="text-emerald-600 font-bold text-base flex items-center gap-1">
                    <Sparkles className="h-4 w-4" />
                    Free
                  </span>
                </div>

                {/* Apna */}
                <div
                  className={cn(
                    "flex items-center justify-between p-5 rounded-xl border-2 transition-all duration-300 hover:shadow-md cursor-pointer",
                    platforms.apna
                      ? "border-teal-500 bg-teal-50"
                      : "border-gray-200 bg-white hover:border-teal-300"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={platforms.apna}
                      onCheckedChange={(checked) =>
                        updatePlatforms({ ...platforms, apna: checked as boolean })
                      }
                      className="data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500"
                    />
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-md">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-base">Apna</p>
                      <p className="text-sm text-gray-600">
                        India's largest blue-collar hiring platform
                      </p>
                    </div>
                  </div>
                  {state.planType !== 'premium' && (
                    <span className="text-teal-600 font-bold text-base">
                      ₹{PRICING.apna}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Networks Section */}
            <Card className="border-0 shadow-xl overflow-hidden relative">
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-100 to-pink-100 rounded-full blur-3xl opacity-30 -ml-32 -mb-32"></div>

              <CardHeader className="pb-4 relative">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl font-bold text-gray-900">Our Networks</CardTitle>
                    <span className="text-xs bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-3 py-1 rounded-full font-semibold border border-purple-200">
                      Exclusive
                    </span>
                  </div>
                </div>
                <CardDescription className="text-gray-600 ml-14">
                  Access our curated talent pools and partner networks
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 relative">
                {/* College Network */}
                <div
                  className={cn(
                    "flex items-center justify-between p-5 rounded-xl border-2 transition-all duration-300 hover:shadow-md cursor-pointer",
                    platforms.collegeNetwork
                      ? "border-amber-500 bg-amber-50"
                      : "border-gray-200 bg-white hover:border-amber-300"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={platforms.collegeNetwork}
                      onCheckedChange={(checked) =>
                        updatePlatforms({ ...platforms, collegeNetwork: checked as boolean })
                      }
                      className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                    />
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-md">
                      <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-base">College Network</p>
                      <p className="text-sm text-gray-600">
                        Access to 500+ colleges & fresh talent pool
                      </p>
                    </div>
                  </div>
                  {state.planType !== 'premium' && (
                    <span className="text-amber-600 font-bold text-base">
                      ₹{PRICING.collegeNetwork}
                    </span>
                  )}
                </div>

                {/* Training Centre Network */}
                <div
                  className={cn(
                    "flex items-center justify-between p-5 rounded-xl border-2 transition-all duration-300 hover:shadow-md cursor-pointer",
                    platforms.trainingCentreNetwork
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200 bg-white hover:border-indigo-300"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={platforms.trainingCentreNetwork}
                      onCheckedChange={(checked) =>
                        updatePlatforms({ ...platforms, trainingCentreNetwork: checked as boolean })
                      }
                      className="data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                    />
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-md">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-base">Training Centre Network</p>
                      <p className="text-sm text-gray-600">
                        Skilled candidates from certified training programs
                      </p>
                    </div>
                  </div>
                  {state.planType !== 'premium' && (
                    <span className="text-indigo-600 font-bold text-base">
                      ₹{PRICING.trainingCentreNetwork}
                    </span>
                  )}
                </div>


              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 border-0 shadow-xl">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full blur-2xl opacity-40 -mr-20 -mt-20"></div>

              <CardHeader className="relative">
                <CardTitle className="text-xl font-bold text-gray-900">Order Summary</CardTitle>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-gray-600 text-sm">{state.planType === 'premium' ? 'Premium' : 'Basic'} Plan</span>
                  {state.planType !== 'premium' && (
                    <span className="text-xs bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 px-3 py-1 rounded-full font-semibold border border-indigo-200">
                      Custom
                    </span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4 relative">
                {/* Selected platforms breakdown */}
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  {platforms.linkedin.selected && (
                    <div className="flex justify-between text-sm p-2 rounded-lg bg-blue-50">
                      <span className="text-gray-700">
                        LinkedIn ({platforms.linkedin.days} day{platforms.linkedin.days > 1 ? 's' : ''})
                      </span>
                      <span className="font-semibold text-gray-900">₹{linkedInCost}</span>
                    </div>
                  )}
                  {platforms.naukri.selected && platforms.naukri.plan && (
                    <div className="flex justify-between text-sm p-2 rounded-lg bg-blue-50">
                      <span className="text-gray-700">
                        Naukri ({platforms.naukri.plan})
                      </span>
                      <span className="font-semibold text-gray-900">₹{naukriCost}</span>
                    </div>
                  )}
                  {platforms.timesJob && (
                    <div className="flex justify-between text-sm p-2 rounded-lg bg-purple-50">
                      <span className="text-gray-700">TimesJobs</span>
                      <span className="font-semibold text-gray-900">₹{PRICING.timesJob}</span>
                    </div>
                  )}
                  {platforms.apna && (
                    <div className="flex justify-between text-sm p-2 rounded-lg bg-teal-50">
                      <span className="text-gray-700">Apna</span>
                      <span className="font-semibold text-gray-900">₹{PRICING.apna}</span>
                    </div>
                  )}
                  {platforms.iimJobs && (
                    <div className="flex justify-between text-sm p-2 rounded-lg bg-emerald-50">
                      <span className="text-gray-700">IIM Jobs</span>
                      <span className="font-semibold text-emerald-600">Free</span>
                    </div>
                  )}
                  {platforms.unstop && (
                    <div className="flex justify-between text-sm p-2 rounded-lg bg-orange-50">
                      <span className="text-gray-700">Unstop</span>
                      <span className="font-semibold text-emerald-600">Free</span>
                    </div>
                  )}
                  {platforms.collegeNetwork && (
                    <div className="flex justify-between text-sm p-2 rounded-lg bg-amber-50">
                      <span className="text-gray-700">College Network</span>
                      <span className="font-semibold text-gray-900">₹{PRICING.collegeNetwork}</span>
                    </div>
                  )}
                  {platforms.trainingCentreNetwork && (
                    <div className="flex justify-between text-sm p-2 rounded-lg bg-indigo-50">
                      <span className="text-gray-700">Training Centre</span>
                      <span className="font-semibold text-gray-900">₹{PRICING.trainingCentreNetwork}</span>
                    </div>
                  )}

                </div>

                {state.planType !== 'premium' && (
                  <>
                    <div className="border-t border-dashed border-gray-300 pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-semibold text-gray-900">₹{subtotal}</span>
                      </div>
                    </div>

                    <div className="border-t-2 border-gray-200 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-900 text-lg">Total</span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                          ₹{Math.round(total)}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {state.planType === 'premium' && (
                  <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl mt-4">
                    <p className="text-purple-800 text-sm font-medium flex items-center gap-2">
                      <Crown className="h-4 w-4" />
                      Premium Plan Active: All platforms included.
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleContinue}
                  className="w-full h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all text-base font-semibold"
                  size="lg"
                >
                  Continue to Schedule Call
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-start mt-10">
          <Button
            variant="ghost"
            onClick={() => setCurrentStep(2)}
            className="gap-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Plans
          </Button>
        </div>

        <NaukriPlanDialog
          open={naukriDialogOpen}
          onOpenChange={setNaukriDialogOpen}
          selectedPlan={platforms.naukri.plan}
          onSelectPlan={handleNaukriPlanSelect}
        />
      </div>
    </>
  );
};

export default PlatformSelectionStep;
