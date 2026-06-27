'use client';

import React, { useState } from 'react';
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { OTPInput } from '@/components/auth/OTPInput';

interface OTPVerificationModalProps {
  isOpen: boolean;
  email: string;
  onClose: () => void;
  onBack: () => void;
  onSuccess: (otp: string) => void;
}

export const OTPVerificationModal: React.FC<OTPVerificationModalProps> = ({
  isOpen,
  email,
  onClose,
  onBack,
  onSuccess,
}) => {
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setIsVerifying(true);
    try {
      // Simulation delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // await authApi.verifyResetOtp(email, otp);
      
      toast.success('Code verified successfully!');
      onSuccess(otp);
    } catch (error) {
      toast.error('Invalid verification code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      // Simulation delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // e.g. await authApi.forgotPassword(email);
      
      toast.success('Verification code resent! 📧');
    } catch (error) {
      toast.error('Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  const handleClose = () => {
    setOtp('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="md"
      footer={
        <button
          onClick={onBack}
          className="flex items-center justify-center gap-1.5 w-full text-sm font-semibold text-gray-600 hover:text-purple-600 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to forgot password
        </button>
      }
    >
      <div className="flex flex-col items-center text-center mb-6 pt-2">
        <div className="w-14 h-14 bg-gradient-to-r from-[#9d4ae3] to-[#8236be] rounded-full flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30">
          <Mail className="w-7 h-7 text-white stroke-[2.5]" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          Check your email
        </h2>
        <p className="text-sm text-gray-600">
          We've sent a 6-digit verification code to
          <br />
          <span className="font-semibold text-gray-900">{email || 'your email'}</span>
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex justify-center">
          <OTPInput
            length={6}
            value={otp}
            onChange={setOtp}
            disabled={isVerifying}
          />
        </div>

        <Button
          onClick={handleVerify}
          variant="primary"
          size="lg"
          className="w-full"
          loading={isVerifying}
          disabled={otp.length !== 6 || isVerifying}
        >
          Verify Code
        </Button>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Didn't receive the code?{' '}
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="font-semibold text-purple-600 hover:text-purple-500 transition-colors inline-flex items-center gap-1"
            >
              {isResending ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Resending...
                </>
              ) : (
                'Click to resend'
              )}
            </button>
          </p>
        </div>
      </div>
    </Modal>
  );
};
