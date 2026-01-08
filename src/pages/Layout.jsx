

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Package, Home, Calculator, Phone, ShoppingBag, User, ChevronDown, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// USPS Holidays for 2025
const USPS_HOLIDAYS = [
  { date: '2025-01-01', name: "New Year's Day" },
  { date: '2025-01-20', name: "Martin Luther King Jr. Day" },
  { date: '2025-02-17', name: "Presidents' Day" },
  { date: '2025-05-26', name: "Memorial Day" },
  { date: '2025-06-19', name: "Juneteenth" },
  { date: '2025-07-04', name: "Independence Day" },
  { date: '2025-09-01', name: "Labor Day" },
  { date: '2025-10-13', name: "Columbus Day" },
  { date: '2025-11-11', name: "Veterans Day" },
  { date: '2025-11-27', name: "Thanksgiving Day" },
  { date: '2025-12-25', name: "Christmas Day" }
];

function getUpcomingHoliday() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayString = `${year}-${month}-${day}`;
  
  for (const holiday of USPS_HOLIDAYS) {
    const holidayDate = new Date(holiday.date + 'T00:00:00'); // Ensure UTC midnight for consistent comparison
    const holidayYear = holidayDate.getFullYear();
    const holidayMonth = String(holidayDate.getMonth() + 1).padStart(2, '0');
    const holidayDay = String(holidayDate.getDate()).padStart(2, '0');
    const holidayString = `${holidayYear}-${holidayMonth}-${holidayDay}`;
    
    // Calculate days difference using date strings parsed as UTC to avoid timezone issues
    const todayMs = new Date(todayString + 'T00:00:00').getTime();
    const holidayMs = new Date(holidayString + 'T00:00:00').getTime();
    const daysUntil = Math.round((holidayMs - todayMs) / (1000 * 60 * 60 * 24));
    
    // Show if within 3 days before the holiday OR on the holiday itself
    // daysUntil = 0 means today is the holiday
    // daysUntil = 1 means tomorrow is the holiday
    // daysUntil = 2 means day after tomorrow is the holiday
    // daysUntil = 3 means three days from now is the holiday
    if (daysUntil >= 0 && daysUntil <= 3) {
      return { ...holiday, daysUntil, holidayDate };
    }
  }
  
  return null;
}

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [holidayBannerDismissed, setHolidayBannerDismissed] = React.useState(false);
  const [headerScrolled, setHeaderScrolled] = React.useState(false);

  const upcomingHoliday = getUpcomingHoliday();
  
  React.useEffect(() => {
    if (upcomingHoliday) {
      const dismissedKey = `holiday-dismissed-${upcomingHoliday.date}`;
      const dismissed = localStorage.getItem(dismissedKey);
      setHolidayBannerDismissed(dismissed === 'true');
    }
  }, [upcomingHoliday?.date]);

  React.useEffect(() => {
    const handleScroll = () => {
      setHeaderScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const dismissHolidayBanner = () => {
    if (upcomingHoliday) {
      const dismissedKey = `holiday-dismissed-${upcomingHoliday.date}`;
      localStorage.setItem(dismissedKey, 'true');
      setHolidayBannerDismissed(true);
    }
  };

  // Check AFTER hooks are called
  if (currentPageName === 'PaymentSuccess' || currentPageName === 'PaymentCancel') {
    return <>{children}</>;
  }

  const navItems = [
    { name: "Home", path: createPageUrl("Home"), icon: Home },
    { name: "Services", path: createPageUrl("Services"), icon: Package },
    { name: "Shipping Calculator", path: createPageUrl("ShippingCalculator"), icon: Calculator },
    { name: "Store", path: createPageUrl("Store"), icon: ShoppingBag },
    { name: "Contact", path: createPageUrl("Contact"), icon: Phone },
  ];

  const isActive = (path) => location.pathname === path;
  const isMyAccountActive = isActive(createPageUrl("MyAccount")) || isActive(createPageUrl("CreateShipment"));

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        :root {
          --primary: 217 91% 30%;
          --primary-foreground: 0 0% 98%;
          --accent: 25 95% 53%;
          --accent-foreground: 0 0% 98%;
        }
        .holiday-banner {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 10000;
        }
        header {
          position: fixed;
          left: 0;
          right: 0;
          z-index: 9999;
          background-color: #fff;
          transition: all 0.3s ease;
        }
        header.scrolled {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .has-banner.header-offset {
          top: 52px;
        }
        .no-banner.header-offset {
          top: 0;
        }
        .main-content {
          padding-top: 80px; /* Default header height */
        }
        .has-banner.main-content-offset {
          padding-top: 132px; /* Holiday banner height (52px) + header height (80px) */
        }
      `}</style>

      {/* Holiday Closure Banner */}
      {upcomingHoliday && !holidayBannerDismissed && (
        <div className="holiday-banner bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm sm:text-base font-medium">
                {upcomingHoliday.daysUntil === 0 ? (
                  <>Following the USPS Holiday Schedule, we are closed today for <strong>{upcomingHoliday.name}</strong>.</>
                ) : (
                  <>Following the USPS Holiday Schedule, we will be closed on <strong>{new Date(upcomingHoliday.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</strong> for <strong>{upcomingHoliday.name}</strong>.</>
                )}
              </p>
            </div>
            <button
              onClick={dismissHolidayBanner}
              className="text-white hover:text-gray-200 transition-colors flex-shrink-0"
              aria-label="Dismiss announcement"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className={`bg-white border-b border-gray-100 shadow-sm ${headerScrolled ? 'scrolled' : ''} ${upcomingHoliday && !holidayBannerDismissed ? 'has-banner header-offset' : 'no-banner header-offset'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to={createPageUrl("Home")} className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-900 to-blue-700 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Monarch Mail</h1>
                <p className="text-xs text-gray-500">Business Services & More</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(item.path)
                      ? "bg-blue-900 text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* My Account Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                      isMyAccountActive
                        ? "bg-blue-900 text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    My Account
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl("MyAccount")} className="cursor-pointer">
                      <User className="w-4 h-4 mr-2" />
                      Account Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl("CreateShipment")} className="cursor-pointer">
                      <Package className="w-4 h-4 mr-2" />
                      Create Shipment
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Link to={createPageUrl("ReserveMailbox")}>
                <Button className="ml-4 bg-orange-500 hover:bg-orange-600 text-white shadow-md">
                  Reserve Mailbox
                </Button>
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden py-4 border-t border-gray-100">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? "text-blue-900 bg-blue-50"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              ))}
              
              {/* My Account Section - Mobile */}
              <div className="border-t border-gray-100 mt-2 pt-2">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">My Account</div>
                <Link
                  to={createPageUrl("MyAccount")}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                    isActive(createPageUrl("MyAccount"))
                      ? "text-blue-900 bg-blue-50"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <User className="w-5 h-5" />
                  Account Dashboard
                </Link>
                <Link
                  to={createPageUrl("CreateShipment")}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                    isActive(createPageUrl("CreateShipment"))
                      ? "text-blue-900 bg-blue-50"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Package className="w-5 h-5" />
                  Create Shipment
                </Link>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className={`main-content ${upcomingHoliday && !holidayBannerDismissed ? 'has-banner main-content-offset' : ''} min-h-[calc(10vh-5rem)]`}>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Monarch Mail</h3>
              </div>
              <p className="text-gray-400 mb-4">
                Your trusted partner for business solutions in Stone Oak and San Antonio.
              </p>
              <p className="text-sm text-gray-500">
                📍 20711 Wilderness Oak Ste 107<br/>
                San Antonio, TX 78258<br/>
                📞 (210) 265-5805<br/>
                ✉️ contact@themonarchmail.com
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to={createPageUrl("Services")} className="hover:text-white transition-colors">Mailbox Rentals</Link></li>
                <li><Link to={createPageUrl("Services")} className="hover:text-white transition-colors">U-Haul Rentals</Link></li>
                <li><Link to={createPageUrl("Services")} className="hover:text-white transition-colors">Notary Services</Link></li>
                <li><Link to={createPageUrl("Services")} className="hover:text-white transition-colors">Printing</Link></li>
                <li><Link to={createPageUrl("Services")} className="hover:text-white transition-colors">Custom Apparel</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to={createPageUrl("ShippingCalculator")} className="hover:text-white transition-colors">Shipping Calculator</Link></li>
                <li><Link to={createPageUrl("Store")} className="hover:text-white transition-colors">Online Store</Link></li>
                <li><Link to={createPageUrl("Contact")} className="hover:text-white transition-colors">Contact Us</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
            <p>&copy; 2024 Monarch Mail. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

