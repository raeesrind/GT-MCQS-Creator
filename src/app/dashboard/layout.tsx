'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  Upload,
  FileText,
  BarChart3,
  GraduationCap,
  BookOpenCheck,
} from 'lucide-react';
import { Logo } from '@/components/icons/Logo';
import { useApp } from '@/providers/app-provider';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';

const navItems = [
  { href: '/dashboard/upload', icon: Upload, label: 'Upload Notes' },
  { href: '/dashboard/practice', icon: FileText, label: 'Practice Test' },
  { href: '/dashboard/grand-test', icon: GraduationCap, label: 'Grand Test' },
  { href: '/dashboard/performance', icon: BarChart3, label: 'Performance' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isLoaded, uploadedFiles } = useApp();
  const isMobile = useIsMobile();

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        {/* You can replace this with a proper skeleton loader */}
        <p>Loading...</p>
      </div>
    );
  }


  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Logo className="size-7 text-sidebar-primary" />
            <span className="text-lg font-semibold">ExamPrepAI</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.href)}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-background/95 px-4 sm:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1">
             <h1 className="text-lg font-semibold md:text-xl">
                {navItems.find(item => pathname.startsWith(item.href))?.label || 'Dashboard'}
             </h1>
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
             <BookOpenCheck className="size-4" />
             <span>{uploadedFiles.length} notes uploaded</span>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
