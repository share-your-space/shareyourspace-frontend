'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    Home, Users, BarChart2, CreditCard, Settings, Menu, Building,
    Briefcase, Calendar, UserPlus, Search, Users2, type LucideIcon, Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuthStore } from '@/store/authStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface NavLinkProps {
    href: string;
    icon: LucideIcon;
    label: string;
    isMobile?: boolean;
    onClick?: () => void;
}

const getInitials = (name?: string | null): string => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
};

const DashboardNavLink: React.FC<NavLinkProps> = ({ href, icon: Icon, label, isMobile, onClick }) => {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link
            href={href}
            onClick={onClick}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                ${isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }
                ${isMobile ? 'text-base' : ''}
            `}
        >
            <Icon className={`mr-3 h-5 w-5 ${isMobile ? 'h-6 w-6' : ''}`} />
            <span>{label}</span>
        </Link>
    );
};

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuthStore();
    const companyId = user?.company_id;
    const [isSheetOpen, setIsSheetOpen] = React.useState(false);

    if (!companyId) {
        // This can be a loading state or a redirect in a real app
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <p className="text-lg">Loading company information...</p>
                </div>
            </div>
        );
    }

    const navMenu = [
        {
            title: 'Main',
            links: [
                { href: `/company/${companyId}`, icon: Home, label: 'Overview' },
                { href: `/company/${companyId}/analytics`, icon: BarChart2, label: 'Analytics' },
                { href: `/company/${companyId}/inbox`, icon: Mail, label: 'Inbox' },
            ]
        },
        {
            title: 'Space Management',
            links: [
                { href: `/company/${companyId}/space-profile`, icon: Briefcase, label: 'Space Profile' },
                { href: `/company/${companyId}/workstations`, icon: Users2, label: 'Workstations' },
                { href: `/company/${companyId}/bookings`, icon: Calendar, label: 'Bookings' },
            ]
        },
        {
            title: 'Community',
            links: [
                { href: `/company/${companyId}/members`, icon: Users, label: 'Members' },
                { href: `/company/${companyId}/browse-tenants`, icon: Search, label: 'Browse Tenants' },
                { href: `/company/${companyId}/invites`, icon: UserPlus, label: 'Invites' },
            ]
        },
        {
            title: 'Company',
            links: [
                { href: `/company/${companyId}/billing`, icon: CreditCard, label: 'Billing' },
                { href: `/company/${companyId}/settings`, icon: Settings, label: 'Settings' },
            ]
        }
    ];

    const sidebarContent = (isMobile = false) => (
        <div className="flex flex-col h-full bg-background">
            <div className={`p-4 ${isMobile ? 'border-b' : ''}`}>
                <Link href={`/company/${companyId}`} className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-primary">
                        <AvatarImage src={user?.company?.logo_url || undefined} />
                        <AvatarFallback><Building /></AvatarFallback>
                    </Avatar>
                    <span className="font-bold text-xl truncate">{user?.company?.name || 'Dashboard'}</span>
                </Link>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-4">
                {navMenu.map((section) => (
                    <div key={section.title}>
                        <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{section.title}</h3>
                        <div className="space-y-1">
                            {section.links.map(link => (
                                <DashboardNavLink key={link.href} {...link} isMobile={isMobile} onClick={() => isMobile && setIsSheetOpen(false)} />
                            ))}
                        </div>
                    </div>
                ))}
            </nav>
            <div className="p-4 border-t mt-auto">
                 <Link href={`/users/${user?.id}`} className="flex items-center gap-3 group">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={user?.profile?.profile_picture_signed_url || undefined} />
                        <AvatarFallback>{getInitials(user?.full_name)}</AvatarFallback>
                    </Avatar>
                    <div className="truncate">
                        <p className="font-semibold text-sm group-hover:text-primary truncate">{user?.full_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                </Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen w-full bg-muted/40">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:w-64 md:border-r z-10">
                {sidebarContent()}
            </aside>

            <div className="md:pl-64 flex flex-col">
                {/* Mobile Header */}
                <header className="md:hidden sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4">
                    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                        <SheetTrigger asChild>
                            <Button size="icon" variant="outline">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="sm:max-w-xs p-0">
                            {sidebarContent(true)}
                        </SheetContent>
                    </Sheet>
                     <Link href={`/company/${companyId}`} className="flex items-center gap-2">
                        <span className="font-bold text-lg">{user?.company?.name || 'Dashboard'}</span>
                    </Link>
                </header>

                {/* Main Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
