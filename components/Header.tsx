'use client';

import React from 'react';
import { ChevronLeft, MoreVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useMounted } from '@/hooks/useMounted';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export function Header({ title, showBack = true, rightAction }: HeaderProps) {
  const router = useRouter();
  const mounted = useMounted();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-4">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack && (
            <button 
              onClick={() => router.back()}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          <div className="size-8 relative">
            {mounted && (
              <Image 
                src="https://lh3.googleusercontent.com/d/1hCUwRjRdjfohV4MliKVsC8Z7Ozty2308"
                alt="Ciep Logo"
                fill
                className="object-contain"
                priority
              />
            )}
          </div>
          <h1 className="text-lg font-bold tracking-tight">{title}</h1>
        </div>
        {rightAction || (
          <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <MoreVertical className="w-6 h-6" />
          </button>
        )}
      </div>
    </header>
  );
}
