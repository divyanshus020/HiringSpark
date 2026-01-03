import React, { createContext, useContext, useState, ReactNode } from 'react';
import { JobPostingState, PlatformSelection, ScheduleDetails, JobDetails, PRICING } from '../types/job';

const defaultPlatforms: PlatformSelection = {
  linkedin: { selected: false, days: 1 },
  naukri: { selected: false, plan: null },
  timesJob: false,
  iimJobs: false,
  unstop: false,
  collegeNetwork: false,
  trainingCentreNetwork: false,
  apna: false,
};

const defaultSchedule: ScheduleDetails = {
  contactName: '',
  phoneNumber: '',
  companyEmail: '',
  preferredDate: null,
  preferredTimeSlot: '',
  additionalNotes: '',
};

const defaultJobDetails: JobDetails = {
  title: '',
  company: '',
  location: '',
  jobType: 'full-time',
  minExperience: 0,
  maxExperience: 2,
  openings: 1,
  minSalary: '',
  maxSalary: '',
  description: '',
  requirements: '',
  skills: [],
};

interface JobPostingContextType {
  state: JobPostingState;
  setCurrentStep: (step: number) => void;
  setJobDetails: (details: JobDetails) => void;
  setPlanType: (type: 'basic' | 'premium') => void;
  setPlatforms: (platforms: PlatformSelection) => void;
  setSchedule: (schedule: ScheduleDetails) => void;
  setJobId: (id: string) => void;
  loadJobData: (job: any) => void;
  calculateTotal: () => { subtotal: number; gst: number; total: number };
  resetState: () => void;
}

const JobPostingContext = createContext<JobPostingContextType | undefined>(undefined);

export const useJobPosting = () => {
  const context = useContext(JobPostingContext);
  if (!context) {
    throw new Error('useJobPosting must be used within a JobPostingProvider');
  }
  return context;
};

export const JobPostingProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<JobPostingState>({
    currentStep: 1,
    jobId: null,
    jobDetails: defaultJobDetails,
    planType: 'basic',
    platforms: defaultPlatforms,
    schedule: defaultSchedule,
    orderSummary: {
      platforms: defaultPlatforms,
      planType: 'basic',
      subtotal: 0,
      gst: 0,
      total: 0,
    },
  });

  const setCurrentStep = (step: number) => {
    setState(prev => ({ ...prev, currentStep: step }));
  };

  const setJobDetails = (details: JobDetails) => {
    setState(prev => ({ ...prev, jobDetails: details }));
  };

  const setPlanType = (type: 'basic' | 'premium') => {
    if (type === 'premium') {
      // Pre-select all platforms for premium
      const premiumPlatforms: PlatformSelection = {
        linkedin: { selected: true, days: 30 },
        naukri: { selected: true, plan: 'classified' },
        timesJob: true,
        iimJobs: true,
        unstop: true,
        collegeNetwork: true,
        trainingCentreNetwork: true,
        apna: true,
      };
      setState(prev => ({ ...prev, planType: type, platforms: premiumPlatforms }));
    } else {
      setState(prev => ({ ...prev, planType: type, platforms: defaultPlatforms }));
    }
  };

  const setPlatforms = (platforms: PlatformSelection) => {
    setState(prev => ({ ...prev, platforms }));
  };

  const setSchedule = (schedule: ScheduleDetails) => {
    setState(prev => ({ ...prev, schedule }));
  };

  const setJobId = (id: string) => {
    setState(prev => ({ ...prev, jobId: id }));
  };

  const loadJobData = (job: any) => {
    setState(prev => ({
      ...prev,
      jobId: job._id,
      currentStep: job.currentStep || 1,
      planType: job.plan || 'basic',
      jobDetails: {
        title: job.jobTitle || '',
        company: job.companyName || '',
        location: job.location || '',
        jobType: job.jobType || 'full-time',
        minExperience: job.minExp || 0,
        maxExperience: job.maxExp || 2,
        openings: job.openings || 1,
        minSalary: job.minSalary?.toString() || '',
        maxSalary: job.maxSalary?.toString() || '',
        description: job.description || '',
        requirements: job.requirements || '',
        skills: job.skills || [],
      },
      schedule: {
        contactName: job.contactPerson || '',
        phoneNumber: job.phoneNumber || '',
        companyEmail: job.companyEmail || '',
        preferredDate: job.preferredDate ? new Date(job.preferredDate) : null,
        preferredTimeSlot: job.preferredTimeSlot || '',
        additionalNotes: job.note || '',
      }
    }));
  };

  const calculateTotal = () => {
    const { platforms, planType } = state;
    let subtotal = 0;

    if (planType === 'premium') {
      subtotal = PRICING.premiumPlan;
    } else {
      // LinkedIn
      if (platforms.linkedin.selected) {
        subtotal += PRICING.linkedin.perDay * platforms.linkedin.days;
      }

      // Naukri
      if (platforms.naukri.selected && platforms.naukri.plan) {
        subtotal += PRICING.naukri[platforms.naukri.plan];
      }

      // Job Boards
      if (platforms.timesJob) subtotal += PRICING.timesJob;
      if (platforms.iimJobs) subtotal += PRICING.iimJobs;
      if (platforms.unstop) subtotal += PRICING.unstop;

      // Networks
      if (platforms.collegeNetwork) subtotal += PRICING.collegeNetwork;
      if (platforms.trainingCentreNetwork) subtotal += PRICING.trainingCentreNetwork;
      if (platforms.apna) subtotal += PRICING.apna;
    }

    // GST applies to premium plan
    const gst = planType === 'premium' ? subtotal * PRICING.gstRate : 0;
    const total = subtotal + gst;

    return { subtotal, gst, total };
  };

  const resetState = () => {
    setState({
      currentStep: 1,
      jobId: null,
      jobDetails: defaultJobDetails,
      planType: 'basic',
      platforms: defaultPlatforms,
      schedule: defaultSchedule,
      orderSummary: {
        platforms: defaultPlatforms,
        planType: 'basic',
        subtotal: 0,
        gst: 0,
        total: 0,
      },
    });
  };

  return (
    <JobPostingContext.Provider
      value={{
        state,
        setCurrentStep,
        setJobDetails,
        setPlanType,
        setPlatforms,
        setSchedule,
        setJobId,
        loadJobData,
        calculateTotal,
        resetState,
      }}
    >
      {children}
    </JobPostingContext.Provider>
  );
};
