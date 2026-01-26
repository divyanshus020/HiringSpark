export interface JobDetails {
  title: string;
  company: string;
  location: string;
  jobType: string;
  minExperience: number;
  maxExperience: number;
  openings: number;
  minSalary: string;
  maxSalary: string;
  description: string;
  requirements: string;
  skills: string[];
}

export interface PlatformSelection {
  linkedin: {
    selected: boolean;
    days: number;
  };
  naukri: {
    selected: boolean;
    plan: 'standard' | 'classified' | null;
  };
  timesJob: boolean;
  iimJobs: boolean;
  unstop: boolean;
  collegeNetwork: boolean;
  trainingCentreNetwork: boolean;
  apna: boolean;
}

export interface ScheduleDetails {
  contactName: string;
  phoneNumber: string;
  companyEmail: string;
  preferredDate: Date | null;
  preferredTimeSlot: string;
  additionalNotes: string;
}

export interface OrderSummary {
  platforms: PlatformSelection;
  planType: 'basic' | 'premium';
  subtotal: number;
  gst: number;
  total: number;
}

export interface JobPostingState {
  currentStep: number;
  jobId: string | null;
  jobDetails: JobDetails;
  planType: 'basic' | 'premium';
  platforms: PlatformSelection;
  schedule: ScheduleDetails;
  orderSummary: OrderSummary;
}

// Pricing constants
export const PRICING = {
  linkedin: { perDay: 200 },
  naukri: {
    standard: 400,
    classified: 850,
  },
  timesJob: 500, // per month
  iimJobs: 0, // free
  unstop: 0, // free
  collegeNetwork: 0, // free
  trainingCentreNetwork: 0, // free
  apna: 500, // per month
  premiumPlan: 1500, // Fixed price for premium
  totalSavings: 950, // Display savings
  gstRate: 0.18, // 18% GST
};
