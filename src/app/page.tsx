'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { ApiError } from '@/lib/api';
import { loginAdminApi, verifyAdminOtpApi, persistTokens } from '@/lib/apiServices';
import { useOtpInput } from '@/hooks/useOtpInput';
import { useCountdown } from '@/hooks/useCountdown';
import Checkbox from '@/components/ui/Checkbox';

type Step = 'credentials' | 'otp';

// ─── Shared helpers ───────────────────────────────────────────────────────────

function inputCls(hasError: boolean) {
  return [
    'w-full px-4 py-3.5 rounded-xl border text-[14px]',
    'focus:outline-none focus:ring-1 transition-all',
    'text-gray-800 placeholder-gray-400 text-right',
    'disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed',
    hasError
      ? 'border-red-500 focus:border-red-500 focus:ring-red-100 bg-white'
      : 'border-gray-200 focus:border-primary focus:ring-primary/20 bg-white',
  ].join(' ');
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminLoginPage() {
  const router = useRouter();

  // Step state
  const [step, setStep] = useState<Step>('credentials');

  // Credentials state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // OTP state
  const otp = useOtpInput(6);
  const { seconds: countdown, isRunning: isCountdownRunning, start: startCountdown } = useCountdown(59);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);

  // ── Validation ─────────────────────────────────────────────────────────────

  const validate = (): boolean => {
    if (!email.trim() || !password) {
      setError('تعذر التحقق من بيانات الدخول ، يرجى مراجعتها والمحاولة مرة اخرى .');
      return false;
    }
    setError(null);
    return true;
  };

  // ── Step 1: Login ──────────────────────────────────────────────────────────

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;

    setIsLoading(true);
    try {
      await loginAdminApi(email.trim(), password, rememberMe);
      startCountdown();
      setStep('otp');
    } catch (err) {
      if (err instanceof ApiError && err.message) {
        setError(err.message);
      } else {
        setError('تعذر التحقق من بيانات الدخول ، يرجى مراجعتها والمحاولة مرة اخرى .');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 2: Verify OTP ─────────────────────────────────────────────────────

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);
    if (otp.value.length < 6) {
      setOtpError('رمز التحقق غير صحيح يرجى التأكد مرة اخرى');
      return;
    }
    setOtpLoading(true);
    try {
      const data = await verifyAdminOtpApi(email.trim(), otp.value, rememberMe);
      persistTokens(data.token, data.refreshToken);
      router.push('/dashboard');
    } catch (err) {
      console.log(err);
      setOtpError('رمز التحقق غير صحيح يرجى التأكد مرة اخرى',
      );
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (isCountdownRunning) return;
    setOtpLoading(true);
    setOtpError(null);
    try {
      await loginAdminApi(email.trim(), password, rememberMe);
      otp.reset();
      startCountdown();
    } catch (err) {
      setOtpError(
        err instanceof Error ? err.message : 'فشل إعادة إرسال الرمز',
      );
    } finally {
      setOtpLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setStep('credentials');
    otp.reset();
    setOtpError(null);
  };

  return (
    <div className="flex min-h-screen bg-white" dir="rtl">
      <main className="flex w-full relative z-0 overflow-hidden">

        {/* ── Form Panel ────────────────────────────────────────────── */}
        <div className="flex flex-1 flex-col justify-center px-6 sm:px-12 md:px-16 lg:px-24 xl:px-32 relative bg-white">
          <div className="max-w-md mx-auto w-full">

            {/* Logo */}
            <div className="mb-10 flex justify-center">
              <Link href="/">
                <Image
                  src="/sparko.png"
                  alt="Sparko"
                  width={180}
                  height={60}
                  style={{ width: 'auto', height: 'auto' }}
                  className="object-contain"
                  priority
                />
              </Link>
            </div>

            {step === 'credentials' ? (
              /* ── Credentials Form ──────────────────────────────────── */
              <>
                {/* Heading */}
                <div className="mb-10 text-center">
                  <h1 className="text-xl sm:text-[23px] font-bold text-[#111827] leading-relaxed mb-3">
                    تسجيل الدخول إلى لوحة الإدارة
                  </h1>
                </div>

                <form onSubmit={handleLogin} noValidate className="space-y-5">
                  {/* Email */}
                  <div>
                    <label
                      htmlFor="admin-email"
                      className="block text-[14px] font-bold text-[#111827] mb-2 text-right"
                    >
                      الإيميل الإلكتروني
                    </label>
                    <input
                      id="admin-email"
                      type="email"
                      value={email}
                      placeholder="الإيميل الإلكتروني"
                      disabled={isLoading}
                      dir="rtl"
                      onChange={(e) => { setEmail(e.target.value); setError(null); }}
                      className={inputCls(Boolean(error))}
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label
                      htmlFor="admin-password"
                      className="block text-[14px] font-bold text-[#111827] mb-2 text-right"
                    >
                      كلمة المرور
                    </label>
                    <input
                      id="admin-password"
                      type="password"
                      value={password}
                      placeholder="كلمة المرور"
                      disabled={isLoading}
                      dir="rtl"
                      onChange={(e) => { setPassword(e.target.value); setError(null); }}
                      className={inputCls(Boolean(error))}
                    />
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="flex items-center justify-start gap-1.5 text-red-500 text-[13px] pt-1 font-semibold" dir="rtl">
                      <Icon icon="lucide:alert-circle" className="w-4 h-4 shrink-0 text-red-500" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Remember me + Forgot password */}
                  <div className="flex items-center justify-between mt-1">
                    <Checkbox
                      id="remember-me"
                      checked={rememberMe}
                      onChange={setRememberMe}
                      label="تذكرني"
                    />
                    <Link
                      href="/forgot-password?role=admin"
                      className="text-[13px] text-primary hover:text-[#E64D00] font-medium transition-colors cursor-pointer"
                    >
                      نسيت كلمة المرور
                    </Link>
                  </div>

                  {/* Submit */}
                  <div className="flex flex-col gap-4 mt-6 pt-2">
                    <button
                      id="admin-login-btn"
                      type="submit"
                      disabled={isLoading}
                      className={[
                        'w-full flex items-center justify-center gap-2',
                        'py-3.5 rounded-xl text-md font-bold h-16',
                        'bg-primary text-white transition-all cursor-pointer',
                        'hover:bg-[#E64D00] active:scale-[0.98]',
                        'focus:outline-none focus:ring-1 focus:ring-primary/20',
                        'disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100',
                      ].join(' ')}
                    >
                      {isLoading ? (
                        <Icon icon="lucide:loader-2" className="w-5 h-5 animate-spin" />
                      ) : (
                        <span>تسجيل دخول</span>
                      )}
                    </button>
                  </div>
                </form>

                {/* Footer note */}
                <div className="mt-10 text-center text-[13px] text-[#9CA3AF] font-medium">
                  وصول محدود بدعوة من إدارة النظام &quot;( مغلق )&quot;
                </div>
              </>
            ) : (
              /* ── OTP Verification ──────────────────────────────────── */
              <>
                {/* Info Card */}
                <div className="self-stretch justify-start font-bold mb-8 text-center text-2xl leading-12">تسجيل الدخول إلى لوحة الإدارة</div>
                <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 mb-8 flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <Icon icon="lucide:shield-check" className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-[17px]  text-primary mb-1">التحقق بخطوتين</h2>
                  <p className="text-[13px] text-gray-400 font-medium">
                    تم إرسال رمز التحقق إلى الإيميل الإلكتروني
                  </p>
                </div>

                <form onSubmit={handleVerifyOtp} noValidate>
                  <p className="text-[14px] font-bold text-gray-800 text-center mb-4">
                    رمز التحقق (أدخل الرمز المكون من 6 أرقام)
                  </p>

                  <div className="flex gap-8 justify-center mb-2" dir="ltr" onPaste={otp.handlePaste}>
                    {otp.digits.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { otp.refs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => { otp.handleChange(i, e.target.value); setOtpError(null); }}
                        onKeyDown={(e) => otp.handleKeyDown(i, e)}
                        className={[
                          'w-12 h-12 text-center text-xl font-bold rounded-xl border-2 focus:outline-none transition-all',
                          otpError
                            ? 'border-red-400 bg-red-50 text-red-600'
                            : digit
                              ? 'border-[#80EAC8] text-text-muted'
                              : 'border-gray-200 bg-white  focus:border-[#80EAC8] ',
                        ].join(' ')}
                      />
                    ))}
                  </div>

                  {/* Error */}
                  {otpError && (
                    <p className="mt-2 mb-1 text-[13px] text-red-500 text-right font-medium">
                      {otpError}
                    </p>
                  )}

                  {/* Resend */}
                  <div className="flex items-center justify-between gap-1.5 mt-4 mb-6 text-[13px] font-medium">
                    <span className="text-gray-500">لم يصلك الرمز؟</span>
                    {isCountdownRunning ? (
                      <span className="text-primary">إعادة الإرسال خلال 00:{countdown}</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={otpLoading}
                        className="text-primary font-semibold hover:underline disabled:opacity-50 cursor-pointer"
                      >
                        {otpLoading ? 'جاري الإرسال...' : 'إعادة الإرسال'}
                      </button>
                    )}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={otpLoading}
                    className="w-full py-3.5 bg-primary text-white font-bold rounded-xl text-[16px] hover:bg-[#E64D00] transition-colors disabled:opacity-60 flex items-center justify-center gap-2 h-[52px] cursor-pointer"
                  >
                    {otpLoading ? (
                      <>
                        <Icon icon="lucide:loader-2" className="w-5 h-5 animate-spin" />
                        <span>جاري التحقق...</span>
                      </>
                    ) : (
                      'تحقق'
                    )}
                  </button>
                </form>

                {/* Back to login */}
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="w-full mt-4 text-center text-[14px] text-gray-500 hover:text-gray-800 transition-colors font-semibold cursor-pointer"
                >
                  العودة لتسجيل الدخول
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Illustration Panel ────────────────────────────────────── */}
        <div className="absolute inset-0 -z-10 opacity-10 lg:opacity-100 lg:relative lg:flex lg:flex-1 items-center justify-center pointer-events-none lg:pointer-events-auto bg-white">
          <Image
            src="/image 7.png"
            alt="Sparko Illustration"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-contain"
            priority
          />
        </div>

      </main>
    </div>
  );
}
