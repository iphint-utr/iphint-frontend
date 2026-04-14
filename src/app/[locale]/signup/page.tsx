"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye, EyeOff, Check, X, Loader2,
  User, Mail, Lock, ShieldCheck, UserPlus,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../lib/hooks";
import {
  signUpThunk,
  googleAuthThunk,
  resetEmailVerify,
  selectSignupStatus,
  selectEmailVerifyStatus,
  selectAuthError,
} from "../../../lib/store/slices/userSlice";

// ─── i18n messages (co-located) ───────────────────────────────────────────────
const messages = {
  ko: {
    title: "회원가입",
    continueGoogle: "Google 계정으로 계속하기",
    or: "OR",
    name: "이름",
    namePlaceholder: "이름을 입력하세요",
    nameRequired: "이름을 입력하세요.",
    email: "이메일",
    emailPlaceholder: "이메일을 입력하세요",
    emailInvalid: "유효한 이메일을 입력하세요.",
    verify: "인증하기",
    verified: "인증됨",
    verifying: "인증 중...",
    password: "비밀번호",
    passwordPlaceholder: "비밀번호를 입력하세요",
    pwAlpha: "영문",
    pwNum: "숫자",
    pwSpecial: "특수문자",
    pwLen: "8자 이상",
    confirmPassword: "비밀번호 확인",
    confirmPlaceholder: "비밀번호를 다시 입력하세요",
    confirmMatch: "비밀번호 일치",
    confirmNoMatch: "비밀번호 불일치",
    age18: "만 18세 이상입니다",
    submit: "가입하기",
    submitting: "처리 중...",
    haveAccount: "이미 계정이 있으신가요?",
    goSignin: "로그인",
    errorWrong: "오류가 발생했습니다. 다시 시도해 주세요.",
  },
  en: {
    title: "Sign Up",
    continueGoogle: "Continue with Google",
    or: "OR",
    name: "Name",
    namePlaceholder: "Enter your name",
    nameRequired: "Name is required.",
    email: "Email",
    emailPlaceholder: "Enter your email",
    emailInvalid: "Enter a valid email address.",
    verify: "Verify",
    verified: "Verified",
    verifying: "Verifying...",
    password: "Password",
    passwordPlaceholder: "Enter your password",
    pwAlpha: "Letter",
    pwNum: "Number",
    pwSpecial: "Symbol",
    pwLen: "8+ chars",
    confirmPassword: "Confirm Password",
    confirmPlaceholder: "Re-enter your password",
    confirmMatch: "Passwords match",
    confirmNoMatch: "Passwords don't match",
    age18: "I am 18 years or older",
    submit: "Create Account",
    submitting: "Processing...",
    haveAccount: "Already have an account?",
    goSignin: "Sign In",
    errorWrong: "Something went wrong. Please try again.",
  },
} as const;

type Locale = keyof typeof messages;

// ─── Password rules ───────────────────────────────────────────────────────────
const PW_RULES = [
  { key: "pwAlpha"   as const, test: (p: string) => /[a-zA-Z]/.test(p) },
  { key: "pwNum"     as const, test: (p: string) => /[0-9]/.test(p) },
  { key: "pwSpecial" as const, test: (p: string) => /[^a-zA-Z0-9]/.test(p) },
  { key: "pwLen"     as const, test: (p: string) => p.length >= 8 },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Props ────────────────────────────────────────────────────────────────────
interface SignUpPageProps {
  params: Promise<{ locale: 'en'|'ko' }>;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function SignUpPage({ params }: SignUpPageProps) {
  const { locale } = use(params);

  const t = messages[locale] ?? messages.ko;

  const dispatch      = useAppDispatch();
  const router        = useRouter();
  const signupStatus  = useAppSelector(selectSignupStatus);
  const verifyStatus  = useAppSelector(selectEmailVerifyStatus);
  const serverError   = useAppSelector(selectAuthError);

  const [form, setForm] = useState({
    name: "", email: "", password: "", confirm: "", isAdult: false,
  });
  const [showPw, setShowPw]   = useState(false);
  const [showCf, setShowCf]   = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const touch = (k: string) => setTouched((p) => ({ ...p, [k]: true }));
  const setField = (k: keyof typeof form, v: string | boolean) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (k === "email") dispatch(resetEmailVerify());
  };

  // ── Derived state ──────────────────────────────────────────
  const emailOk    = EMAIL_RE.test(form.email);
  
  const verifying  = verifyStatus === "loading";
  const pwAllPass  = PW_RULES.every((r) => r.test(form.password));
  const pwMatch    = form.password !== "" && form.password === form.confirm;
  const isLoading  = signupStatus === "loading";

  const canSubmit =
    form.name.trim() !== "" &&
    emailOk &&
    pwAllPass &&
    pwMatch &&
    form.isAdult &&
    !isLoading;

    

  // ── Handlers ───────────────────────────────────────────────
  

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const result = await dispatch(
      signUpThunk({
        name: form.name,
        email: form.email,
        password: form.password,
        isAdult: form.isAdult,
      })
    );
    if (signUpThunk.fulfilled.match(result)) {
      router.push(`/${locale}/dashboard`);
    }
  };

  const handleGoogle = async () => {
    const result = await dispatch(googleAuthThunk());
    if (googleAuthThunk.fulfilled.match(result)) {
      router.push(`/${locale}/dashboard`);
    }
  };

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-start justify-center ">
      <div className="mt-10 bg-white w-full max-w-md shadow-sm px-7 py-10 border border-gray-200 rounded-sm">

        {/* Title */}
        <h1 className=" text-2xl md:text-4xl font-black text-center text-gray-900 mb-7 tracking-tight">
          {t.title}
        </h1>

        {/* Google */}
        <button
          onClick={handleGoogle}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-sm py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition mb-5 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <GoogleIcon />
          )}
          {t.continueGoogle}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-gray-300" />
          <span className="text-xs text-gray-400 font-medium">{t.or}</span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>

        {/* Name */}
        <div className="mb-4">
          <FieldLabel text={t.name} />
          <div className="relative">
            <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              onBlur={() => touch("name")}
              placeholder={t.namePlaceholder}
              className={inputCls(touched.name && !form.name.trim(), "pl-9 pr-4")}
            />
          </div>
          <FieldError show={touched.name && !form.name.trim()} msg={t.nameRequired} />
        </div>

        {/* Email + Verify */}
        <div className="mb-4">
          <FieldLabel text={t.email} />
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                onBlur={() => touch("email")}
                placeholder={t.emailPlaceholder}
                className={inputCls(touched.email && !emailOk, "pl-9 pr-4")}
              />
            </div>
            
          </div>
          <FieldError show={touched.email && !emailOk} msg={t.emailInvalid} />
        </div>

        {/* Password */}
        <div className="mb-4">
          <FieldLabel text={t.password} />
          <div className="relative">
            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showPw ? "text" : "password"}
              value={form.password}
              onChange={(e) => setField("password", e.target.value)}
              placeholder={t.passwordPlaceholder}
              className={inputCls(false, "pl-9 pr-10")}
            />
            <EyeToggle show={showPw} onToggle={() => setShowPw((v) => !v)} />
          </div>
          {/* Rules */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
            {PW_RULES.map((r) => (
              <span
                key={r.key}
                className={`flex items-center gap-1 text-xs font-medium transition-colors ${
                  r.test(form.password) ? "text-blue-500" : "text-gray-400"
                }`}
              >
                <Check size={10} strokeWidth={3} />
                {t[r.key]}
              </span>
            ))}
          </div>
        </div>

        {/* Confirm Password */}
        <div className="mb-4">
          <FieldLabel text={t.confirmPassword} />
          <div className="relative">
            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showCf ? "text" : "password"}
              value={form.confirm}
              onChange={(e) => setField("confirm", e.target.value)}
              placeholder={t.confirmPlaceholder}
              className={confirmInputCls(form.confirm, pwMatch)}
            />
            <EyeToggle show={showCf} onToggle={() => setShowCf((v) => !v)} />
          </div>
          {form.confirm && (
            <p
              className={`flex items-center gap-1 text-xs mt-1 font-medium ${
                pwMatch ? "text-green-500" : "text-red-400"
              }`}
            >
              {pwMatch ? <Check size={11} /> : <X size={11} />}
              {pwMatch ? t.confirmMatch : t.confirmNoMatch}
            </p>
          )}
        </div>

        {/* 18+ */}
        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer group select-none">
            <div
              onClick={() => setField("isAdult", !form.isAdult)}
              className={`w-5 h-5 rounded-sm border-2 flex items-center justify-center shrink-0 transition ${
                form.isAdult
                  ? "bg-blue-500 border-blue-500"
                  : "border-gray-300 group-hover:border-blue-400"
              }`}
            >
              {form.isAdult && <Check size={11} color="white" strokeWidth={3} />}
            </div>
            <span className="flex items-center gap-1.5 text-sm text-gray-600 font-medium">
              <ShieldCheck
                size={14}
                className={form.isAdult ? "text-blue-500" : "text-gray-400"}
              />
              {t.age18}
            </span>
          </label>
        </div>

        {/* Error banner */}
        {serverError && <ErrorBanner msg={t.errorWrong} />}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={submitBtnCls(Boolean(canSubmit))}
        >
          {isLoading ? (
            <><Loader2 size={15} className="animate-spin" />{t.submitting}</>
          ) : (
            <><UserPlus size={15} />{t.submit}</>
          )}
        </button>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          {t.haveAccount}{" "}
          <Link
            href={`/${locale}/signin`}
            className="text-red-500 font-semibold hover:underline"
          >
            {t.goSignin}
          </Link>
        </p>
      </div>
    </div>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────
function FieldLabel({ text }: { text: string }) {
  return (
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
      {text} <span className="text-blue-500">*</span>
    </label>
  );
}

function FieldError({ show, msg }: { show: boolean | undefined; msg: string }) {
  if (!show) return null;
  return <p className="text-xs text-red-400 mt-1">{msg}</p>;
}

function EyeToggle({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
    >
      {show ? <EyeOff size={15} /> : <Eye size={15} />}
    </button>
  );
}

function ErrorBanner({ msg }: { msg: string }) {
  return (
    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-sm px-4 py-2.5 mb-4">
      <X size={13} className="text-red-500 shrink-0" />
      <p className="text-xs text-red-500 font-medium">{msg}</p>
    </div>
  );
}

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
  "w-full border rounded-sm py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-blue-50";

function inputCls(hasError: boolean | undefined, spacing: string) {
  return `${baseInput} ${spacing} ${
    hasError
      ? "border-red-300 focus:border-red-400"
      : "border-gray-200 focus:border-blue-400"
  }`;
}

function confirmInputCls(value: string, match: boolean) {
  if (!value) return `${baseInput} pl-9 pr-10 border-gray-200 focus:border-blue-400`;
  return `${baseInput} pl-9 pr-10 ${
    match
      ? "border-green-300 focus:border-green-400"
      : "border-red-300 focus:border-red-400"
  }`;
}

function verifyBtnCls(verified: boolean, verifying: boolean) {
  const base =
    "flex items-center gap-1.5 text-xs font-bold px-3 py-2.5 rounded-sm transition whitespace-nowrap disabled:cursor-not-allowed";
  if (verified) return `${base} bg-green-100 text-green-600 border border-green-200`;
  if (verifying) return `${base} bg-blue-100 text-blue-400 border border-blue-100`;
  return `${base} bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600`;
}

function submitBtnCls(enabled: boolean) {
  const base =
    "w-full py-3.5 rounded-sm text-sm font-bold flex items-center justify-center gap-2 transition";
  return enabled
    ? `${base} bg-blue-500 text-white hover:bg-blue-600 shadow-md shadow-blue-100`
    : `${base} bg-gray-100 text-gray-400 cursor-not-allowed`;
}