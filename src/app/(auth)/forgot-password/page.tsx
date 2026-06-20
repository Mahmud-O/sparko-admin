'use client';

import { useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import { ApiError } from '@/lib/api';
import { forgetPasswordApi, resendOtpApi, resetPasswordApi } from '@/lib/apiServices';
import { useCountdown } from '@/hooks/useCountdown';
import { useOtpInput } from '@/hooks/useOtpInput';
import { forgotEmailSchema, forgotPhoneSchema, resetPasswordSchema, yupErrorsToRecord } from '@/lib/validation/schemas';
import OtpInput from '@/components/ui/OtpInput';

type Step = 'identifier' | 'otp' | 'password' | 'success';

// ─── Shared Components ────────────────────────────────────────────────────────

function fieldCls(hasError: boolean) {
  return [
    'w-full px-4 py-3 rounded-xl border border-gray-200 text-[13px] text-right',
    'focus:outline-none focus:border-primary transition-all',
    'text-text-primary placeholder-gray-300 bg-white',
    hasError ? 'border-red-400 focus:border-red-400' : '',
  ].join(' ');
}

const Err = ({ msg }: { msg?: string }) =>
  msg ? <p className="mt-1 text-[12px] text-red-500 text-right">{msg}</p> : null;

function Shell({ children, onBack }: { children: React.ReactNode; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-between py-12" dir="rtl">
      {/* Centered Sparko logo at the top */}
      <div className="w-full max-w-99 px-6 flex justify-center mb-4">
        <Link href="/">
          <Image
            src="/sparko.png"
            alt="Sparko"
            width={130}
            height={44}
            className="object-contain"
            priority
          />
        </Link>
      </div>

      {/* Main centered form content */}
      <div className="w-full max-w-99 px-6 flex-1 flex flex-col justify-center pb-12">
        <div className="flex justify-start mb-8">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <Icon icon="lucide:arrow-right" className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        {children}
      </div>

      {/* Spacer to keep layout balanced */}
      <div className="h-10 invisible" />
    </div>
  );
}

// ─── Error Handler Hook ───────────────────────────────────────────────────────

function useApiErrorHandler() {
  const [apiError, setApiError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handle = useCallback((err: unknown) => {
    if (err instanceof ApiError && err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
      const map: Record<string, string> = {
        identifier: 'identifier',
        newpassword: 'newPassword',
        confirmpassword: 'confirmPwd',
        otp: 'otp',
      };
      const mapped: Record<string, string> = {};
      for (const [k, v] of Object.entries(err.fieldErrors)) {
        mapped[map[k.toLowerCase()] ?? k] = v;
      }
      setFieldErrors(mapped);
    } else {
      setApiError(
        err instanceof ApiError ? err.message : 'حدث خطأ، يرجى المحاولة مرة أخرى',
      );
    }
  }, []);

  const clear = useCallback(() => {
    setApiError(null);
    setFieldErrors({});
  }, []);

  return { apiError, fieldErrors, handle, clear };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function formatApiIdentifier(id: string) {
  const trimmed = id.trim();
  if (/^\d+$/.test(trimmed)) {
    return `+966${trimmed}`;
  }
  return trimmed;
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center" dir="rtl">
        <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <ForgotPasswordPageContent />
    </Suspense>
  );
}

function ForgotPasswordPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role');
  const isAdmin = role === 'admin';

  const [step, setStep] = useState<Step>('identifier');
  const [identifier, setIdentifier] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showCPwd, setShowCPwd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { seconds: countdown, isRunning: isCountdownRunning, start: startCountdown } = useCountdown(60);
  const otp = useOtpInput(6);
  const { apiError, fieldErrors, handle: handleApiError, clear: clearErrors } = useApiErrorHandler();

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    const apiIdentifier = formatApiIdentifier(identifier);
    try {
      forgotPhoneSchema.validateSync({ identifier });
    } catch (err: unknown) {
      if (err instanceof Error && 'inner' in err) {
        const yupErr = err as import('yup').ValidationError;
        const fieldErrs = yupErrorsToRecord(yupErr);
        handleApiError(new ApiError(yupErr.message, 400, [], fieldErrs));
      }
      return;
    }
    setIsLoading(true);
    try {
      await forgetPasswordApi(apiIdentifier, isAdmin ? 'Admin' : 'User');
      startCountdown();
      setStep('otp');
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    if (otp.value.length < 6) {
      handleApiError(new ApiError('يرجى إدخال رمز OTP المكوّن من 6 أرقام', 400, [], { otp: 'يرجى إدخال رمز OTP المكوّن من 6 أرقام' }));
      return;
    }
    setStep('password');
  };

  const handleResend = async () => {
    if (isCountdownRunning) return;
    setIsLoading(true);
    const apiIdentifier = formatApiIdentifier(identifier);
    try {
      await resendOtpApi(apiIdentifier);
      otp.reset();
      startCountdown();
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    try {
      resetPasswordSchema.validateSync(
        { newPassword, confirmPwd },
        { abortEarly: false },
      );
    } catch (err: unknown) {
      if (err instanceof Error && 'inner' in err) {
        const yupErr = err as import('yup').ValidationError;
        const fieldErrs = yupErrorsToRecord(yupErr);
        handleApiError(new ApiError('الرجاء تصحيح الأخطاء', 400, undefined, fieldErrs));
      }
      return;
    }

    setIsLoading(true);
    const apiIdentifier = formatApiIdentifier(identifier);
    try {
      await resetPasswordApi(apiIdentifier, newPassword, otp.value, isAdmin ? 'Admin' : 'User');
      setStep('success');
    } catch (err: any) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'identifier') router.back();
    else setStep(step === 'otp' ? 'identifier' : 'otp');
  };

  // ── Render Steps ──────────────────────────────────────────────────────────

  if (step === 'identifier') return (
    <Shell onBack={handleBack}>
      <h1 className="text-[32px] font-bold text-text-primary text-right mb-2">
        استعادة كلمة المرور
      </h1>
      <p className="text-[14px] text-text-secondary text-right mb-8">
        من فضلك أضف رقم الجوال المسجل لدينا
      </p>

      <form onSubmit={handleSendOtp} noValidate>
        <div className="mb-8">
          <label className="block text-[14px] font-semibold text-text-primary text-right mb-2">
            رقم الجوال
          </label>
          <input
            type="text"
            placeholder="رقم الجوال"
            value={identifier}
            onChange={(e) => { setIdentifier(e.target.value); clearErrors(); }}
            className={fieldCls(!!fieldErrors.identifier)}
            dir="rtl"
          />
          <Err msg={fieldErrors.identifier} />
        </div>

        {apiError && (
          <p className="mb-4 text-[13px] text-red-500 text-right bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {apiError}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 bg-primary text-white font-bold rounded-xl text-[16px] hover:bg-primary-hover transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />
              <span>جاري الإرسال...</span>
            </>
          ) : (
            'إرسال OTP'
          )}
        </button>
      </form>
    </Shell>
  );

  if (step === 'otp') return (
    <Shell onBack={handleBack}>
      <h1 className="text-[26px] font-bold text-text-primary text-right mb-1">
        أضف رسالة التأكيد
      </h1>
      <p className="text-[14px] text-text-secondary text-right mb-7">
        قمنا بإرسال رسالة إلى رقم الجوال <button type="button" onClick={() => setStep('identifier')} className="text-[#005188] hover:underline font-medium">(تعديل)</button>
      </p>
      <form onSubmit={handleVerifyOtp} noValidate>
        <OtpInput
          digits={otp.digits}
          refs={otp.refs}
          onChange={otp.handleChange}
          onKeyDown={otp.handleKeyDown}
          onPaste={otp.handlePaste}
          hasError={Boolean(fieldErrors.otp || apiError)}
          className="flex justify-between w-full mb-12"
          inputClassName={(digit, hasError) => [
            'w-13 h-13 text-center text-[20px] font-medium rounded-2xl border focus:outline-none transition-all',
            digit ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 bg-white text-gray-400 placeholder-gray-300',
            hasError ? 'border-red-400 bg-red-50 text-red-500' : 'focus:border-primary',
          ].join(' ')}
          placeholder="0"
          disabled={isLoading}
        />
        <Err msg={fieldErrors.otp} />

        {apiError && (
          <p className="mb-4 text-[13px] text-red-500 text-center bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {apiError}
          </p>
        )}

        <button
          type="submit"
          className="w-full py-3.5 bg-primary text-white font-bold rounded-xl text-[16px] hover:bg-primary-hover transition-colors disabled:opacity-60"
          disabled={isLoading}
        >
          {isLoading ? 'جاري التحقق...' : 'إستعادة كلمة المرور'}
        </button>
      </form>
    </Shell>
  );

  if (step === 'password') return (
    <Shell onBack={handleBack}>
      <h1 className="text-[24px] font-bold text-text-primary text-right mb-10">
        إنشاء كلمة مرور جديدة
      </h1>

      <form onSubmit={handleResetPassword} noValidate>
        <div className="mb-4">
          <label className="block text-[12px] font-bold text-text-primary text-right mb-2">
            كلمة المرور
          </label>
          <input
            type="password"
            placeholder="كلمة المرور"
            value={newPassword}
            onChange={(e) => { setNewPassword(e.target.value); clearErrors(); }}
            className={fieldCls(!!fieldErrors.newPassword)}
          />
          <Err msg={fieldErrors.newPassword} />
        </div>

        <div className="mb-8">
          <label className="block text-[12px] font-bold text-text-primary text-right mb-2">
            تأكيد كلمة المرور
          </label>
          <input
            type="password"
            placeholder="تأكيد كلمة المرور"
            value={confirmPwd}
            onChange={(e) => { setConfirmPwd(e.target.value); clearErrors(); }}
            className={fieldCls(!!fieldErrors.confirmPwd)}
          />
          <Err msg={fieldErrors.confirmPwd} />
        </div>

        {apiError && (
          <p className="mb-4 text-[13px] text-red-500 text-right bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {apiError}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-primary text-white font-bold rounded-xl text-[15px] hover:bg-primary-hover transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm"
        >
          {isLoading ? (
            <>
              <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />
              <span>جاري الحفظ...</span>
            </>
          ) : (
            'تغيير كلمة المرور'
          )}
        </button>
      </form>
    </Shell>
  );

  // ── Success ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-white flex flex-col" dir="rtl">
      <div className="flex justify-center pt-8 pb-4">
        <Link href="/">
          <Image
            src="/sparko.png"
            alt="Sparko"
            width={130}
            height={44}
            className="object-contain"
            priority
          />
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-16">
        <div className="w-full max-w-125 flex flex-col items-center text-center">
          {/* Branding Image */}
          <div className="mb-8 relative w-full max-w-[320px] aspect-4/3">
            <Image
              src="/Sparko Brand 1.svg"
              alt="Success"
              fill
              className="object-contain"
            />
          </div>

          <h1 className="text-[26px] font-bold text-gray-900 mb-10">
            تم إنشاء كلمة المرور بنجاح
          </h1>

          <button
            onClick={() => router.push(isAdmin ? '/?role=admin' : '/')}
            className="w-full py-3.5 bg-primary text-white font-bold rounded-xl text-[16px] hover:bg-primary-hover transition-colors"
          >
            تسجيل الدخول الآن
          </button>
        </div>
      </div>
    </div>
  );
}
