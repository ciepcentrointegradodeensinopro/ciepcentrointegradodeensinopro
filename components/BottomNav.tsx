'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, BarChart2, User, BadgeCheck, LayoutDashboard, Users, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, label: 'Meu Login', href: '/dashboard' },
  { icon: BookOpen, label: 'Cursos', href: '/materials' },
  { icon: BadgeCheck, label: 'Carteira', href: '/id-card' },
  { icon: User, label: 'Perfil', href: '/profile' },
];

const adminNavItems = [
  { icon: LayoutDashboard, label: 'Meu Login', href: '/dashboard' },
  { icon: Users, label: 'Alunos', href: '/admin/students' },
  { icon: BookOpen, label: 'Cursos', href: '/materials' },
  { icon: Settings, label: 'Ajustes', href: '/admin/settings' },
];

interface BottomNavProps {
  isAdmin?: boolean;
}

export function BottomNav({ isAdmin = false }: BottomNavProps) {
  const pathname = usePathname();
  const items = isAdmin ? adminNavItems : navItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 px-4 pb-6 pt-2 z-50">
      <div className="max-w-md mx-auto flex justify-between items-center">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 flex-1 transition-colors",
                isActive ? "text-green-500" : "text-slate-400 dark:text-slate-500"
              )}
            >
              <Icon className={cn("w-6 h-6", isActive && "fill-current")} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
