'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Lock, User, AlertCircle, ArrowLeft, Building2, Eye, EyeOff, Info } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !password) {
      setErrorMsg('아이디와 비밀번호를 모두 입력해 주십시오.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || '로그인에 실패했습니다.');
        setLoading(false);
        return;
      }

      router.push(data.redirectTo || '/admin/dashboard');
      router.refresh();
    } catch {
      setErrorMsg('서버와 통신할 수 없습니다. 잠시 후 다시 시도해 주세요.');
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setUsername('admin');
    setPassword('Admin1234!');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* 배경 장식 */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-xl">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            미래스마트산업진흥원
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            콘텐츠 통합 관리 시스템 (Admin CMS)
          </p>
        </div>

        <div className="mt-8 bg-slate-800/90 border border-slate-700/80 rounded-3xl p-8 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-700/60 text-slate-200">
            <ShieldCheck className="w-5 h-5 text-sky-400" />
            <h2 className="text-sm font-bold">관리자 직접 인증 로그인</h2>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-3 animate-in fade-in"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-semibold text-slate-300 mb-1.5"
              >
                관리자 아이디 또는 이메일
              </label>
              <div className="relative">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin 또는 admin@smartindustry.or.kr"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-hidden focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-300 mb-1.5"
              >
                비밀번호
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  className="w-full pl-10 pr-11 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-hidden focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                  aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 초기 기본 계정 안내 배너 & 자동입력 */}
            <div className="p-3 rounded-xl bg-sky-950/50 border border-sky-800/60 text-xs text-sky-200 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <span className="font-bold text-sky-300">초기 계정:</span>{' '}
                  <code className="px-1.5 py-0.5 rounded bg-sky-900 text-sky-100 font-mono">admin</code>{' '}
                  / PW:{' '}
                  <code className="px-1.5 py-0.5 rounded bg-sky-900 text-sky-100 font-mono">Admin1234!</code>
                  <div className="text-[10px] text-sky-400/90 mt-0.5">
                    (비밀번호 첫 글자 대문자 ‘A’ 포함)
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleFillDemo}
                className="shrink-0 px-2.5 py-1 text-[11px] font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors shadow-xs"
              >
                자동 입력
              </button>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg hover:shadow-sky-500/25 disabled:opacity-50"
              >
                {loading ? '인증 확인 중...' : '시스템 로그인'}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-700/60 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>진흥원 공개 포털 메인으로 이동</span>
            </Link>
          </div>
        </div>

        {/* 보안 안내 배너 */}
        <div className="mt-6 text-center text-[11px] text-slate-500 leading-relaxed">
          본 시스템은 인가된 관리자만 접속할 수 있습니다.
          <br />
          비밀번호 5회 연속 오류 시 계정이 15분간 자동으로 잠기며, 모든 접속은 감사로그에 기록됩니다.
        </div>
      </div>
    </div>
  );
}
