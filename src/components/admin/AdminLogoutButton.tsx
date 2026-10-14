'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export const AdminLogoutButton: React.FC<{ username: string }> = ({ username }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (!confirm('관리자 시스템에서 로그아웃하시겠습니까?')) return;
    setLoading(true);

    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch {
      router.push('/admin/login');
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
    >
      <LogOut className="w-3.5 h-3.5" />
      <span>{loading ? '로그아웃 중...' : '시스템 로그아웃'}</span>
    </button>
  );
};

export default AdminLogoutButton;
