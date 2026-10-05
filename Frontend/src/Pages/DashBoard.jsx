import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Loading from "../Components/Loading";
import SideBar from "../Components/SideBar";
import DashboardRight from "../Pages/DashboardRight";
import ThemeToggle from "../Components/ThemeToggle";
import { FaChartPie, FaBars, FaTimes } from "react-icons/fa";
import { HiOutlineReceiptRefund, HiOutlineShoppingBag } from "react-icons/hi2";
import logo from "../assets/expense-logo.png";

const DashBoard = () => {
  const { loading } = useSelector((state) => state.authUser);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [active, setActive] = useState(() => {
    try {
      const activeNumber = localStorage.getItem('active');
      return activeNumber ? JSON.parse(activeNumber) : 1;
    } catch (e) {
      return 1;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('active', JSON.stringify(active));
    } catch (e) {
      console.error(e);
    }
  }, [active]);

  const getPageTitle = () => {
    switch (active) {
      case 2:
        return "Income Management";
      case 3:
        return "Expense Management";
      default:
        return "Financial Dashboard";
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-[#0a0e17] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
      {loading ? (
        <div className="w-full h-screen flex justify-center items-center">
          <Loading />
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row max-w-[1600px] w-full mx-auto p-3 sm:p-5 lg:p-6 gap-6">
          
          {/* Desktop Sidebar (lg and above) */}
          <div className="hidden lg:block lg:w-64 flex-shrink-0 sticky top-6 h-[calc(100vh-3rem)]">
            <SideBar active={active} setActive={setActive} />
          </div>

          {/* Mobile & Tablet Header with Navigation & Theme Toggle */}
          <div className="lg:hidden flex items-center justify-between p-3 glass-panel rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <img className="h-8 w-8 object-contain" src={logo} alt="Logo" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">{getPageTitle()}</h3>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle compact={true} />
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <FaTimes className="text-lg" /> : <FaBars className="text-lg" />}
              </button>
            </div>
          </div>

          {/* Mobile Sliding Drawer */}
          {isMobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-start p-4">
              <div className="w-72 max-w-[85vw] h-full">
                <SideBar
                  active={active}
                  setActive={setActive}
                  isMobileOpen={isMobileMenuOpen}
                  setIsMobileOpen={setIsMobileMenuOpen}
                />
              </div>
              <div 
                className="flex-1 h-full cursor-pointer" 
                onClick={() => setIsMobileMenuOpen(false)}
              />
            </div>
          )}

          {/* Main Content Area */}
          <main className="flex-1 min-w-0 pb-16 lg:pb-0">
            <DashboardRight active={active} />
          </main>

          {/* Mobile Sticky Bottom Tab Bar */}
          <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-4 py-2 flex justify-around items-center transition-colors duration-300">
            <button
              onClick={() => setActive(1)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-all ${
                active === 1 
                  ? "text-blue-600 dark:text-blue-400 font-semibold" 
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              <FaChartPie className="text-xl" />
              <span className="text-[11px]">Dashboard</span>
            </button>
            <button
              onClick={() => setActive(2)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-all ${
                active === 2 
                  ? "text-emerald-600 dark:text-emerald-400 font-semibold" 
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              <HiOutlineShoppingBag className="text-xl" />
              <span className="text-[11px]">Income</span>
            </button>
            <button
              onClick={() => setActive(3)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-all ${
                active === 3 
                  ? "text-rose-600 dark:text-rose-400 font-semibold" 
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              <HiOutlineReceiptRefund className="text-xl" />
              <span className="text-[11px]">Expense</span>
            </button>
          </nav>

        </div>
      )}
    </div>
  );
};

export default DashBoard;