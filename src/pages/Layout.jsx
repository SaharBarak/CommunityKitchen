

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { LayoutDashboard, Users, Settings, Calendar, LogOut, UserCheck, Mail, Soup } from "lucide-react";
import { User, AdminUser } from '@/api/entities';
import LoginPrompt from '@/components/auth/LoginPrompt';
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "לוח בקרה",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
  },
  {
    title: "יצירת אירוע",
    url: createPageUrl("CreateSurvey"),
    icon: Calendar,
  },
  {
    title: "ניהול אירועים",
    url: createPageUrl("ManageSurveys"),
    icon: Settings,
  },
  {
    title: "תבניות אימייל",
    url: createPageUrl("EmailTemplates"),
    icon: Mail,
  },
];

const superAdminItems = [
  {
    title: "ניהול מנהלים",
    url: createPageUrl("ManageAdmins"),
    icon: UserCheck,
  }
];

export default function Layout({ children, currentPageName }) {
  if (currentPageName === "Survey" || currentPageName === "CancelReservation") {
    return <>{children}</>;
  }

  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthorizedAdmin, setIsAuthorizedAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await User.me();
        if (user) {
          setIsAuthenticated(true);
          setCurrentUser(user);
          
          if (user.email.toLowerCase() === 'sahar.h.barak@gmail.com') {
            setIsSuperAdmin(true);
            setIsAuthorizedAdmin(true);
            const adminUsers = await AdminUser.list();
            const superAdminExists = adminUsers.find(admin => admin.email.toLowerCase() === user.email.toLowerCase());
            if (!superAdminExists) {
              await AdminUser.create({
                email: user.email,
                role: 'super_admin',
                active: true
              });
            }
          } else {
            const adminUsers = await AdminUser.list();
            const authorizedAdmin = adminUsers.find(admin => admin.email.toLowerCase() === user.email.toLowerCase() && admin.active);
            setIsAuthorizedAdmin(!!authorizedAdmin);
          }
        }
      } catch (e) {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [location.pathname]);

  const handleLogout = async () => {
    await User.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setIsAuthorizedAdmin(false);
    setIsSuperAdmin(false);
    window.location.reload();
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPrompt />;
  }

  if (!isAuthorizedAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-600 mb-6">You don't have permission to access the admin dashboard. Contact the super admin for access.</p>
          <Button onClick={handleLogout} variant="outline" className="rounded-xl">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  const allNavigationItems = [
    ...navigationItems,
    ...(isSuperAdmin ? superAdminItems : [])
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-blue-50" dir="rtl">
        <main className="flex-1 flex flex-col">
          <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4 md:hidden">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-full hover:bg-slate-100">
                <LogOut className="w-5 h-5 text-slate-600"/>
              </Button>
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold text-slate-900">מטבח קהילתי</h1>
                <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200" />
              </div>
            </div>
          </header>
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
        <Sidebar className="border-l border-slate-200 bg-white/80 backdrop-blur-sm">
          <SidebarHeader className="border-b border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Soup className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-lg">מטבח קהילתי</h2>
                <p className="text-xs text-slate-500 font-medium">פלטפורמה קהילתית</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 py-2">
                ניווט
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {allNavigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-slate-100 hover:text-slate-900 transition-all duration-200 rounded-xl mb-2 ${
                          location.pathname.includes(item.url) ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-600'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                          <item.icon className="w-4 h-4" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-full hover:bg-slate-200">
                <LogOut className="w-4 h-4 text-slate-600"/>
              </Button>
              <div className="flex-1 min-w-0 text-right">
                <p className="font-semibold text-slate-900 text-sm truncate">{currentUser?.full_name || 'Admin'}</p>
                <p className="text-xs text-slate-500 truncate">
                  {currentUser?.email} • {isSuperAdmin ? 'מנהל על' : 'מנהל'}
                </p>
              </div>
              <div className="w-8 h-8 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {currentUser?.full_name?.charAt(0) || 'A'}
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>
      </div>
    </SidebarProvider>
  );
}

