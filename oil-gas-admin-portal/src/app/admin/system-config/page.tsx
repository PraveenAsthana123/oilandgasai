'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
export default function AdminRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/system-config'); }, [router]);
  return <div className="p-6 text-gray-400">Redirecting to /system-config...</div>;
}
