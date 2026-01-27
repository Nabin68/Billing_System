import { useState, useEffect } from "react";
import NepaliDate from "nepali-date-converter";

function Topbar() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const formatEnglishDate = (date) => {
    const day = date.getDate();
    const month = date.toLocaleDateString("en-IN", { month: "short" });
    const year = date.getFullYear();
    const weekday = date.toLocaleDateString("en-IN", { weekday: "short" });
    return { day, month, year, weekday };
  };

  // Convert English date to Nepali date (BS)
  const getNepaliDate = (date) => {
    try {
      const nepaliDate = new NepaliDate(date);
      const nepaliMonths = [
        "Baisakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin",
        "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"
      ];
      return {
        day: nepaliDate.getDate(),
        month: nepaliMonths[nepaliDate.getMonth()],
        year: nepaliDate.getYear()
      };
    } catch (error) {
      console.error("Nepali date conversion error:", error);
      return { day: "—", month: "—", year: "—" };
    }
  };

  const englishDate = formatEnglishDate(currentTime);
  const nepaliDate = getNepaliDate(currentTime);

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left Section - Welcome */}
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2.5 rounded-xl shadow-md">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-800">Welcome Back!</h1>
            <p className="text-xs text-gray-500">Manage your business efficiently</p>
          </div>
        </div>

        {/* Right Section - Date, Time & User */}
        <div className="flex items-center gap-3">
          {/* English Date */}
          <div className="hidden lg:flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
            <svg
              className="w-4 h-4 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <div>
              <p className="text-[10px] text-blue-600 font-semibold uppercase tracking-wide">English (AD)</p>
              <p className="text-xs font-bold text-gray-800">
                {englishDate.weekday}, {englishDate.month} {englishDate.day}, {englishDate.year}
              </p>
            </div>
          </div>

          {/* Nepali Date */}
          <div className="hidden lg:flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-lg border border-orange-200">
            <svg
              className="w-4 h-4 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <div>
              <p className="text-[10px] text-orange-600 font-semibold uppercase tracking-wide">Nepali (BS)</p>
              <p className="text-xs font-bold text-gray-800">
                {nepaliDate.month} {nepaliDate.day}, {nepaliDate.year}
              </p>
            </div>
          </div>

          {/* Time */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-blue-100 px-3 py-2 rounded-lg border border-blue-200">
            <svg
              className="w-4 h-4 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-[10px] text-blue-600 font-semibold uppercase tracking-wide">Time</p>
              <p className="text-xs font-bold text-blue-800 tabular-nums">
                {formatTime(currentTime)}
              </p>
            </div>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2.5 py-2 rounded-lg transition-colors">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow">
              <span className="text-white font-bold text-xs">BN</span>
            </div>
            <div className="hidden xl:block">
              <p className="text-xs font-semibold text-gray-800">Admin</p>
              <p className="text-[10px] text-gray-500">Bibek & Nabin</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;