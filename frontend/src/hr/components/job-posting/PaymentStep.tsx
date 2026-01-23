import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { useJobPosting } from '../../context/JobPostingContext';
import { ArrowLeft, Phone, QrCode, CheckCircle2 } from 'lucide-react';

const PaymentStep = () => {
  const { setCurrentStep, calculateTotal } = useJobPosting();
  const [isProcessing, setIsProcessing] = useState(false);

  const { total } = calculateTotal();

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setCurrentStep(6);
    }, 2000);
  };

  return (
    <div className="mx-auto max-w-lg animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground">Complete Payment</h2>
        <p className="text-muted-foreground mt-2">
          Scan the QR code below to complete your payment
        </p>
      </div>

      <Card className="shadow-card">
        <CardHeader className="text-center">
          <CardTitle className="text-lg">Pay ₹{Math.round(total)}</CardTitle>
          <CardDescription>
            Scan with any UPI app to pay
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Fake QR Code */}
          <div className="flex justify-center">
            <div className="relative p-4 bg-card rounded-2xl border border-border shadow-sm">
              <div className="w-56 h-56 bg-foreground/5 rounded-lg flex items-center justify-center relative overflow-hidden">
                {/* QR Code Pattern */}
                <div className="grid grid-cols-8 gap-1 p-4">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-4 h-4 rounded-sm ${Math.random() > 0.5 ? 'bg-foreground' : 'bg-transparent'
                        }`}
                    />
                  ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-card p-2 rounded-lg shadow-sm">
                    <QrCode className="h-8 w-8 text-primary" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-foreground">UPI ID: HiringBazaar@upi</p>
            <p className="text-xs text-muted-foreground">
              Or pay to: HiringBazaar Pvt Ltd
            </p>
          </div>

          <div className="border-t border-dashed border-border pt-4">
            <Button
              onClick={handlePayment}
              className="w-full"
              size="lg"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span className="ml-2">Processing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  I've completed the payment
                </>
              )}
            </Button>
          </div>

          <div className="rounded-lg bg-secondary/50 p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>If you didn't make the payment, you can contact our team</span>
            </div>
            <p className="mt-2 font-medium text-primary">+91 98765 43210</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-start mt-6">
        <Button variant="ghost" onClick={() => setCurrentStep(4)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Schedule
        </Button>
      </div>
    </div>
  );
};

export default PaymentStep;
