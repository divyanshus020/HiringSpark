import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { useJobPosting } from '../../context/JobPostingContext';
import { CheckCircle2, Download, ArrowRight, Calendar, Phone, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { PRICING } from '../../types/job';

const SuccessStep = () => {
  const { state, calculateTotal, resetState } = useJobPosting();
  const navigate = useNavigate();
  const { total } = calculateTotal();

  const getSelectedPlatforms = () => {
    const platforms: string[] = [];
    if (state.platforms.linkedin.selected) platforms.push('LinkedIn');
    if (state.platforms.naukri.selected) platforms.push('Naukri');
    if (state.platforms.timesJob) platforms.push('Times Job');
    if (state.platforms.iimJobs) platforms.push('IIM Jobs');
    if (state.platforms.unstop) platforms.push('Unstop');
    if (state.platforms.collegeNetwork) platforms.push('College Network');
    if (state.platforms.trainingCentreNetwork) platforms.push('Training Centre Network');
    if (state.platforms.apna) platforms.push('Apna');
    return platforms;
  };

  const generateReceipt = () => {
    const platforms = state.platforms;
    let receiptContent = `
=====================================
           HiringBazaar RECEIPT
=====================================

Receipt Date: ${format(new Date(), 'PPP')}

JOB DETAILS
-----------
Job Title: ${state.jobDetails.title}
Company: ${state.jobDetails.company}
Location: ${state.jobDetails.location}

PLAN TYPE: ${state.planType === 'premium' ? 'Premium Plan' : 'Basic Plan'}

SELECTED PLATFORMS
------------------
`;

    if (platforms.linkedin.selected) {
      const cost = PRICING.linkedin.perDay * platforms.linkedin.days;
      receiptContent += `LinkedIn (${platforms.linkedin.days} days): ₹${cost}\n`;
    }
    if (platforms.naukri.selected && platforms.naukri.plan) {
      const cost = PRICING.naukri[platforms.naukri.plan];
      receiptContent += `Naukri (${platforms.naukri.plan}): ₹${cost}\n`;
    }
    if (platforms.timesJob) {
      receiptContent += `Times Job: ₹${PRICING.timesJob}\n`;
    }
    if (platforms.iimJobs) {
      receiptContent += `IIM Jobs: Free\n`;
    }
    if (platforms.unstop) {
      receiptContent += `Unstop: Free\n`;
    }
    if (platforms.collegeNetwork) {
      receiptContent += `College Network: ₹${PRICING.collegeNetwork}\n`;
    }
    if (platforms.trainingCentreNetwork) {
      receiptContent += `Training Centre Network: ₹${PRICING.trainingCentreNetwork}\n`;
    }
    if (platforms.apna) {
      receiptContent += `Apna: ₹${PRICING.apna}\n`;
    }

    const { subtotal, gst, total } = calculateTotal();

    receiptContent += `
------------------
Subtotal: ₹${subtotal}
${state.planType === 'premium' ? `GST (18%): ₹${Math.round(gst)}\n` : ''}
TOTAL PAID: ₹${Math.round(total)}

SCHEDULED VERIFICATION CALL
---------------------------
Date: ${state.schedule.preferredDate ? format(state.schedule.preferredDate, 'PPP') : 'N/A'}
Time: ${state.schedule.preferredTimeSlot}

CONTACT DETAILS
---------------
Name: ${state.schedule.contactName}
Email: ${state.schedule.companyEmail}
Phone: ${state.schedule.phoneNumber}

=====================================
     Thank you for choosing HiringBazaar!
=====================================
`;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HiringBazaar_Receipt_${format(new Date(), 'yyyy-MM-dd')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleGoToDashboard = () => {
    resetState();
    navigate('/hr/dashboard');
  };

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      {/* Success Icon */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="h-10 w-10 text-success" />
          </div>
          <div className="absolute -inset-2 rounded-full bg-success/5 animate-pulse" />
        </div>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground">Job Post Created Successfully!</h2>
        <p className="text-muted-foreground mt-2">
          Your job post has been submitted. Our team will contact you shortly.
        </p>
      </div>

      <Card className="shadow-card">
        <CardContent className="p-6 space-y-6">
          {/* Job Details */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg text-foreground">{state.jobDetails.title}</h3>
              <p className="text-sm text-muted-foreground">
                {state.jobDetails.company} • {state.jobDetails.location}
              </p>
            </div>
            <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
              {state.planType === 'premium' ? 'Premium Plan' : 'Basic Plan'}
            </span>
          </div>

          {/* Selected Platforms */}
          <div>
            <p className="text-sm font-medium text-foreground mb-2">Selected Platforms</p>
            <div className="flex flex-wrap gap-2">
              {getSelectedPlatforms().map((platform) => (
                <span
                  key={platform}
                  className="inline-flex items-center gap-1 text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {platform}
                </span>
              ))}
            </div>
          </div>

          {/* Scheduled Call */}
          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <p className="text-sm font-medium text-foreground">Scheduled Verification Call</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {state.schedule.preferredDate
                    ? format(state.schedule.preferredDate, 'EEEE, d MMMM yyyy')
                    : 'N/A'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                <span>{state.schedule.preferredTimeSlot}</span>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Contact Details</p>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Name: {state.schedule.contactName}</p>
              <p className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" />
                {state.schedule.companyEmail}
              </p>
              <p className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" />
                {state.schedule.phoneNumber}
              </p>
            </div>
          </div>

          {/* Total Paid */}
          <div className="flex items-center justify-between border-t border-border pt-4">
            <span className="font-medium text-foreground">Total Paid</span>
            <span className="text-xl font-bold text-primary">₹{Math.round(total)}</span>
          </div>
        </CardContent>
      </Card>

      {/* What Happens Next */}
      <Card className="mt-6 shadow-card">
        <CardContent className="p-6">
          <h4 className="font-semibold text-foreground mb-4">What Happens Next?</h4>
          <div className="space-y-4">
            {[
              'Our team will call you at the scheduled time for email verification',
              "We'll post your job on all selected platforms within 24-48 hours",
              'Our AI-assisted team will start shortlisting resumes for you',
            ].map((step, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold shrink-0">
                  {idx + 1}
                </div>
                <p className="text-sm text-muted-foreground">{step}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <Button variant="outline" onClick={generateReceipt} className="flex-1">
          <Download className="mr-2 h-4 w-4" />
          Download Receipt
        </Button>
        <Button onClick={handleGoToDashboard} className="flex-1">
          Go to Dashboard
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Thank You Message */}
      <div className="mt-8 text-center">
        <p className="text-muted-foreground">
          Thank you for choosing <span className="font-semibold text-primary">HiringBazaar</span>!
          We're excited to help you find the perfect candidates.
        </p>
      </div>
    </div>
  );
};

export default SuccessStep;
