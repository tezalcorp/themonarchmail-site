import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Package, Home, HelpCircle, Sparkles, X, AlertCircle } from "lucide-react";
import ClosingPopup from "@/components/ClosingPopup";
import ClosingChat from "@/components/ClosingChat";

// Closure dates for 2026 (USPS holiday schedule).
// The banner appears up to 3 days before each date and on the day itself.
const CLOSURE_DATES = [
  { date: "2026-01-01", name: "New Year's Day" },
  { date: "2026-01-19", name: "Martin Luther King Jr. Day" },
  { date: "2026-02-16", name: "Presidents' Day" },
  { date: "2026-05-25", name: "Memorial Day" },
  { date: "2026-06-19", name: "Juneteenth" },
  { date: "2026-07-04", name: "Independence Day" },
  { date: "2026-09-07", name: "Labor Day" },
  { date: "2026-10-12", name: "Columbus Day" },
  { date: "2026-11-11", name: "Veterans Day" },
  {
    date: "2026-11-26",
    name: "Thanksgiving Day",
    note: "Our last day for retail, mail, and package pickup is Wednesday, November 25.",
  },
  { date: "2026-12-25", name: "Christmas Day" },
];

function dayString(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getUpcomingHoliday() {
  const todayMs = new Date(dayString(new Date()) + "T00:00:00").getTime();
  for (const holiday of CLOSURE_DATES) {
    const holidayMs = new Date(holiday.date + "T00:00:00").getTime();
    const daysUntil = Math.round((holidayMs - todayMs) / (1000 * 60 * 60 * 24));
    if (daysUntil >= 0 && daysUntil <= 3) {
      return { ...holiday, daysUntil };
    }
  }
  return null;
}

const NAV_ITEMS = [
  { name: "Home", page: "Home", icon: Home },
  { name: "Closing FAQ", page: "FAQ", icon: HelpCircle },
  { name: "What's Next", page: "WhatsNext", icon: Sparkles },
];

export default function Layout({ children }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [holidayBannerDismissed, setHolidayBannerDismissed] = React.useState(false);
  const [headerScrolled, setHeaderScrolled] = React.useState(false);
  const [chatOpen, setChatOpen] = React.useState(false);

  const upcomingHoliday = getUpcomingHoliday();

  React.useEffect(() => {
    if (upcomingHoliday) {
      const dismissed = localStorage.getItem(`holiday-dismissed-${upcomingHoliday.date}`);
      setHolidayBannerDismissed(dismissed === "true");
    }
  }, [upcomingHoliday?.date]);

  React.useEffect(() => {
    const handleScroll = () => setHeaderScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const dismissHolidayBanner = () => {
    if (upcomingHoliday) {
      localStorage.setItem(`holiday-dismissed-${upcomingHoliday.date}`, "true");
      setHolidayBannerDismissed(true);
    }
  };

  const showBanner = upcomingHoliday && !holidayBannerDismissed;
  const isActive = (page) => location.pathname === createPageUrl(page) || (page === "Home" && location.pathname === "/");

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
          padding-top: 80px;
        }
        .has-banner.main-content-offset {
          padding-top: 132px;
        }
      `}</style>

      {/* Closure banner */}
      {showBanner && (
        <div className="holiday-banner bg-gradient-to-r from-red-600 to-red-700 px-4 py-3 text-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm font-medium sm:text-base">
                {upcomingHoliday.daysUntil === 0 ? (
                  <>We are closed today for <strong>{upcomingHoliday.name}</strong>.</>
                ) : (
                  <>
                    We will be closed on{" "}
                    <strong>
                      {new Date(upcomingHoliday.date + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric" })}
                    </strong>{" "}
                    for <strong>{upcomingHoliday.name}</strong>.
                  </>
                )}
                {upcomingHoliday.note && <span className="ml-1">{upcomingHoliday.note}</span>}
              </p>
            </div>
            <button onClick={dismissHolidayBanner} className="flex-shrink-0 text-white hover:text-gray-200" aria-label="Dismiss announcement">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header
        className={`border-b border-gray-100 bg-white shadow-sm ${headerScrolled ? "scrolled" : ""} ${
          showBanner ? "has-banner header-offset" : "no-banner header-offset"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <Link to={createPageUrl("Home")} className="group flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-900 to-blue-700 shadow-lg transition-transform group-hover:scale-105">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Monarch Mail</h1>
                <p className="text-xs text-gray-500">Stone Oak · San Antonio</p>
              </div>
            </Link>

            <nav className="hidden items-center gap-1 md:flex">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.name}
                  to={createPageUrl(item.page)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    isActive(item.page) ? "bg-blue-900 text-white shadow-md" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <button
              className="rounded-lg p-2 hover:bg-gray-100 md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {mobileMenuOpen && (
            <nav className="border-t border-gray-100 py-4 md:hidden">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.name}
                  to={createPageUrl(item.page)}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                    isActive(item.page) ? "bg-blue-50 text-blue-900" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>

      <main className={`main-content min-h-[calc(10vh-5rem)] ${showBanner ? "has-banner main-content-offset" : ""}`}>
        {children}
      </main>

      {/* Footer */}
      <footer className="mt-20 bg-gray-900 text-gray-300">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Monarch Mail</h3>
              </div>
              <p className="text-sm text-gray-400">
                20711 Wilderness Oak Ste 107
                <br />
                San Antonio, TX 78258
              </p>
              <p className="mt-3 text-sm text-gray-400">
                ✉️{" "}
                <a href="mailto:contact@themonarchmail.com" className="hover:text-white">
                  contact@themonarchmail.com
                </a>
              </p>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-white">Hours</h4>
              <ul className="space-y-1 text-sm">
                <li>Mon – Fri: 10:00 AM – 5:30 PM</li>
                <li>Saturday: By appointment</li>
                <li>Sunday: Closed</li>
                <li className="pt-2 text-gray-400">Through Wed, Nov 25, 2026</li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-white">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to={createPageUrl("Home")} className="transition-colors hover:text-white">Home</Link>
                </li>
                <li>
                  <Link to={createPageUrl("FAQ")} className="transition-colors hover:text-white">Closing FAQ</Link>
                </li>
                <li>
                  <Link to={createPageUrl("WhatsNext")} className="transition-colors hover:text-white">What's Next</Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
            <p>&copy; 2026 Monarch Mail. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <ClosingPopup onAskQuestion={() => setChatOpen(true)} />
      <ClosingChat open={chatOpen} onOpenChange={setChatOpen} />
    </div>
  );
}
