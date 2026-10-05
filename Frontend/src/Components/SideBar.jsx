import React from "react";
import { AiOutlineLogout } from "react-icons/ai";
import { FaChartPie } from "react-icons/fa";
import { HiOutlineReceiptRefund, HiOutlineShoppingBag } from "react-icons/hi2";
import { signOut } from "../Feature/Auth/userAuthSlice";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import logo from "../assets/expense-logo.png";
import ThemeToggle from "./ThemeToggle";

const SideBar = ({ setActive, active, isMobileOpen, setIsMobileOpen }) => {
  const navigate = useNavigate();
  const { currentUser } = useSelector(state => state.authUser);
  const dispatch = useDispatch();

  const userName = currentUser?.user?.userName || currentUser?.userName || "User";
  const userEmail = currentUser?.user?.email || currentUser?.email || "";

  const handleSignOut = () => {
    try {
      dispatch(signOut());
      localStorage.removeItem("token");
      localStorage.removeItem("persist:root");
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);
      navigate("/");
    }
  };

  const navItems = [
    {
      id: 1,
      label: "Dashboard",
      icon: FaChartPie,
    },
    {
      id: 2,
      label: "Income",
      icon: HiOutlineShoppingBag,
    },
    {
      id: 3,
      label: "Expense",
      icon: HiOutlineReceiptRefund,
    }
  ];

  return (
    <aside className="w-full lg:w-64 h-full flex flex-col justify-between p-4 glass-panel rounded-2xl shadow-xl transition-colors duration-300">
      <div>
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-slate-200 dark:border-slate-800">
          <img className="h-9 w-9 object-contain" src={logo} alt="Expense Tracker Logo" />
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Expense Tracker</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Smart Finance App</p>
          </div>
        </div>

        {/* User Profile Snippet */}
        <div className="flex items-center gap-3 px-3 py-3 mb-6 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/40">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{userName}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{userEmail || "Account Active"}</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActive(item.id);
                  if (setIsMobileOpen) setIsMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/40 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40 border border-transparent"
                }`}
              >
                <Icon className={`text-xl ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"}`} />
                <span>{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-4 bg-blue-600 dark:bg-blue-500 rounded-full"></span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Controls: Theme Toggle & Logout */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
        <ThemeToggle />

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-xs text-rose-600 dark:text-red-400 hover:bg-rose-50 dark:hover:bg-red-500/10 transition-all border border-transparent hover:border-rose-200 dark:hover:border-red-500/20 cursor-pointer"
        >
          <AiOutlineLogout className="text-base" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
};

export default SideBar;