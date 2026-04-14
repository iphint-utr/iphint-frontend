"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, X, Loader2, Mail, Lock, LogIn } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../../src/lib/hooks";
import {
  signInThunk,
  googleAuthThunk,
  selectSigninStatus,
  selectAuthError,
} from "@/lib/store/slices/userSlice";

// ─── i18n messages (co-located) ───────────────────────────────────────────────
const messages = {
  ko: {
    title: "로그인",
    continueGoogle: "Google 계정으로 계속하기",
    or: "OR",
    email: "이메일",
    emailPlaceholder: "이메일을 입력하세요",
    emailInvalid: "유효한 이메일을 입력하세요.",
    password: "비밀번호",
    passwordPlaceholder: "비밀번호를 입력하세요",
    forgotPassword: "비밀번호를 잊으셨나요?",
    submit: "로그인",
    submitting: "처리 중...",
    noAccount: "계정이 없으신가요?",
    goSignup: "회원가입",
    errorCredentials: "이메일 또는 비밀번호가 올바르지 않습니다.",
    errorWrong: "오류가 발생했습니다. 다시 시도해 주세요.",
  },
  en: {
    title: "Sign In",
    continueGoogle: "Continue with Google",
    or: "OR",
    email: "Email",
    emailPlaceholder: "Enter your email",
    emailInvalid: "Enter a valid email address.",
    password: "Password",
    passwordPlaceholder: "Enter your password",
    forgotPassword: "Forgot password?",
    submit: "Sign In",
    submitting: "Processing...",
    noAccount: "Don't have an account?",
    goSignup: "Sign Up",
    errorCredentials: "Invalid email or password.",
    errorWrong: "Something went wrong. Please try again.",
  },
} as const;

type Locale = keyof typeof messages;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Props ────────────────────────────────────────────────────────────────────
interface SignInPageProps {
  params: Promise<{ locale: 'en'|'ko' }>;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function SignInPage({ params }: SignInPageProps) {
  const {locale} = use(params) 
  const t      = messages[locale] ?? messages.ko;

  const dispatch     = useAppDispatch();
  const router       = useRouter();
  const signinStatus = useAppSelector(selectSigninStatus);
  const serverError  = useAppSelector(selectAuthError);

  const [form, setForm]     = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const touch  = (k: string) => setTouched((p) => ({ ...p, [k]: true }));
  const setField = (k: keyof typeof form, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  // ── Derived ────────────────────────────────────────────────
  const emailOk   = EMAIL_RE.test(form.email);
  const isLoading = signinStatus === "loading";
  const canSubmit = emailOk && form.password.length >= 1 && !isLoading;

  // ── Error message resolution ───────────────────────────────
  const errorMsg =
    serverError === "INVALID_CREDENTIALS" ? t.errorCredentials : t.errorWrong;

  // ── Handlers ───────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!canSubmit) return;
    const result = await dispatch(signInThunk(form));
    if (signInThunk.fulfilled.match(result)) {
      router.push(`/${locale}/dashboard`);
    }
  };

  const handleGoogle = async () => {
    const result = await dispatch(googleAuthThunk());
    if (googleAuthThunk.fulfilled.match(result)) {
      router.push(`/${locale}/dashboard`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-start justify-center p-4">
      <div className="mt-10 bg-white w-full max-w-sm rounded-sm shadow-sm px-7 py-10 border border-gray-200">

        {/* Title */}
        <h1 className=" text-2xl md:text-4xl font-black text-center text-gray-900 mb-7 tracking-tight">
          {t.title}
        </h1>

        {/* Google */}
        <button
          onClick={handleGoogle}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-sm py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition mb-5 disabled:opacity-50"
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <GoogleIcon />}
          {t.continueGoogle}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-medium">{t.or}</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {t.email} <span className="text-blue-500">*</span>
          </label>
          <div className="relative">
            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              onBlur={() => touch("email")}
              onKeyDown={handleKeyDown}
              placeholder={t.emailPlaceholder}
              className={inputCls(touched.email && !emailOk)}
            />
          </div>
          {touched.email && !emailOk && (
            <p className="text-xs text-red-400 mt-1">{t.emailInvalid}</p>
          )}
        </div>

        {/* Password */}
        <div className="mb-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {t.password} <span className="text-blue-500">*</span>
          </label>
          <div className="relative">
            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showPw ? "text" : "password"}
              value={form.password}
              onChange={(e) => setField("password", e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.passwordPlaceholder}
              className={inputCls(false)}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {/* Forgot password */}
        <div className="flex justify-end mb-6">
          <Link
            href={`/${locale}/forgot-password`}
            className="text-xs text-blue-500 hover:underline font-medium"
          >
            {t.forgotPassword}
          </Link>
        </div>

        {/* Error banner */}
        {signinStatus === "error" && serverError && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-sm px-4 py-2.5 mb-4">
            <X size={13} className="text-red-500 shrink-0" />
            <p className="text-xs text-red-500 font-medium">{errorMsg}</p>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={submitBtnCls(Boolean(canSubmit))}
        >
          {isLoading ? (
            <><Loader2 size={15} className="animate-spin" />{t.submitting}</>
          ) : (
            <><LogIn size={15} />{t.submit}</>
          )}
        </button>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          {t.noAccount}{" "}
          <Link
            href={`/${locale}/signup`}
            className="text-red-500 font-semibold hover:underline"
          >
            {t.goSignup}
          </Link>
        </p>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

// ─── Class name helpers ───────────────────────────────────────────────────────
const baseInput =
  "w-full border rounded-sm pl-9 pr-10 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-blue-50";

function inputCls(hasError: boolean | undefined) {
  return `${baseInput} ${
    hasError
      ? "border-red-300 focus:border-red-400"
      : "border-gray-200 focus:border-blue-400"
  }`;
}

function submitBtnCls(enabled: boolean) {
  const base =
    "w-full py-3.5 rounded-sm text-sm font-bold flex items-center justify-center gap-2 transition";
  return enabled
    ? `${base} bg-blue-500 text-white hover:bg-blue-600 shadow-md shadow-blue-100`
    : `${base} bg-gray-100 text-gray-400 cursor-not-allowed`;
}