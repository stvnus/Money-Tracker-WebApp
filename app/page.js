"use client";

import { useState, useContext, useEffect } from "react";
import { financeContext } from "@/library/store/financeContext";
import { authContext } from "@/library/store/authContext";
import { currencyFormatter } from "@/library/utils";

import ExpenseCategoryItem from "@/components/organism/categoryExpense";
import IncomeCategoryItem from "@/components/organism/categoryIncome"; 
import RecentTransaction from "@/components/organism/recentTransaction";
import Nav from "@/components/molecules/nav"; 

import AddIncomeModal from "@/components/organism/incomeModal";
import AddExpensesModal from "@/components/organism/expenseModal";
import { ArrowDownLeft, ArrowUpRight, Calendar, Download } from "lucide-react";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import SignIn from "@/components/signIn";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Home() {
  const [showAddIncomeModal, setShowAddIncomeModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showZeroBalanceNotification, setShowZeroBalanceNotification] = useState(false);
  
  const [balance, setBalance] = useState(0);
  const [activeTab, setActiveTab] = useState("expense");

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [availableYears, setAvailableYears] = useState([new Date().getFullYear().toString()]);

  const { expenses, income } = useContext(financeContext);
  const { user } = useContext(authContext);

  const parseDate = (dateField) => {
    if (!dateField) return new Date();
    return dateField.toMillis ? new Date(dateField.toMillis()) : new Date(dateField);
  };

  useEffect(() => {
    const years = new Set();
    years.add(new Date().getFullYear().toString());

    income.forEach((inc) => {
      years.add(parseDate(inc.CreatedAt).getFullYear().toString());
    });
    
    expenses.forEach((cat) => {
      cat.items.forEach((item) => {
        years.add(parseDate(item.CreatedAt).getFullYear().toString());
      });
    });

    setAvailableYears(Array.from(years).sort((a, b) => b - a));
  }, [expenses, income]);

  // Filter Data Income berdasarkan Periode
  const filteredIncomeDashboard = income.filter((inc) => {
    const incDate = parseDate(inc.CreatedAt);
    const matchMonth = selectedMonth === "all" || incDate.getMonth() === parseInt(selectedMonth);
    const matchYear = selectedYear === "all" || incDate.getFullYear().toString() === selectedYear;
    return matchMonth && matchYear;
  });

  // Filter Data Expenses berdasarkan Periode
  const filteredExpensesDashboard = expenses.map((category) => {
    const filteredItems = category.items.filter((item) => {
      const itemDate = parseDate(item.CreatedAt);
      const matchMonth = selectedMonth === "all" || itemDate.getMonth() === parseInt(selectedMonth);
      const matchYear = selectedYear === "all" || itemDate.getFullYear().toString() === selectedYear;
      return matchMonth && matchYear;
    });

    const newTotal = filteredItems.reduce((sum, item) => sum + item.amount, 0);

    return {
      ...category,
      items: filteredItems,
      total: newTotal
    };
  }).filter((category) => category.items.length > 0);

  // Perhitungan total akumulasi
  const totalIncomeDashboard = filteredIncomeDashboard.reduce((total, i) => total + i.amount, 0);
  const totalExpenseDashboard = filteredExpensesDashboard.reduce((total, e) => total + e.total, 0);

  useEffect(() => {
    const newBalance = totalIncomeDashboard - totalExpenseDashboard;

    setBalance(newBalance);

    if (newBalance === 0 && filteredIncomeDashboard.length === 0) {
      setShowZeroBalanceNotification(true);
    } else {
      setShowZeroBalanceNotification(false);
    }
  }, [selectedMonth, selectedYear, expenses, income, totalIncomeDashboard, totalExpenseDashboard]);

  // Handler Download PDF
  const downloadPDFHandler = () => {
    const doc = new jsPDF();
    doc.text("Laporan Keuangan", 14, 15);
    doc.save(`Laporan_Keuangan_${selectedYear}_${selectedMonth}.pdf`);
  };

  if (!user) {
    return <SignIn />;
  }

  // Pengelompokan Income berdasarkan Kategori
  const groupedIncomeMap = filteredIncomeDashboard.reduce((groups, item) => {
    const categoryTitle = item.category || "Uncategorized";
    const categoryColor = item.categoryColor || "#64748b";
    
    if (!groups[categoryTitle]) {
      groups[categoryTitle] = {
        title: categoryTitle,
        color: categoryColor,
        total: 0,
        items: []
      };
    }
    groups[categoryTitle].total += item.amount;
    groups[categoryTitle].items.push(item);
    return groups;
  }, {});

  const groupedIncomeArray = Object.values(groupedIncomeMap);

  return (
    <>
      <AddIncomeModal show={showAddIncomeModal} onClose={setShowAddIncomeModal} />
      <AddExpensesModal show={showAddExpenseModal} onClose={setShowAddExpenseModal} />

      <Nav />

      <main className="container max-w-2xl px-6 mx-auto mb-12">
        
        {/* CARD SALDO UTAMA (TANPA GRAFIK) */}
        <section className="p-5 mb-4 bg-slate-800/50 rounded-2xl border border-white/10 shadow-xl backdrop-blur-sm flex flex-col gap-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center border-b border-slate-700/50 pb-5">
            
            {/* SISI KIRI: SALDO PERIODE INI */}
            <div className="flex flex-col justify-center h-full bg-slate-900/40 p-4 rounded-xl border border-slate-700/40">
              <small className="text-slate-400 text-xs font-semibold tracking-wide uppercase">
                Saldo Periode Ini
              </small>
              <h2 className="text-3xl font-extrabold text-white tracking-tight mt-1">
                {currencyFormatter(balance)}
              </h2>
            </div>

            {/* SISI KANAN: PEMASUKAN & PENGELUARAN */}
            <div className="flex flex-col gap-3 justify-center">
              
              <div 
                onClick={() => setShowAddIncomeModal(true)}
                className="flex items-center justify-between p-3 bg-slate-900/40 hover:bg-slate-900/80 rounded-xl border border-slate-700/40 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 group-hover:scale-105 transition-transform">
                    <ArrowDownLeft size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-slate-300">Pemasukan</span>
                    <span className="text-base font-bold text-green-400">
                      {currencyFormatter(totalIncomeDashboard)}
                    </span>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => setShowAddExpenseModal(true)}
                className="flex items-center justify-between p-3 bg-slate-900/40 hover:bg-slate-900/80 rounded-xl border border-slate-700/40 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 group-hover:scale-105 transition-transform">
                    <ArrowUpRight size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-slate-300">Pengeluaran</span>
                    <span className="text-base font-bold text-red-400">
                      {currencyFormatter(totalExpenseDashboard)}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* BAR PERIODE DASHBOARD */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2 text-slate-300 text-xs sm:text-sm font-medium">
              <Calendar size={16} className="text-lime-500" />
              <span>Periode Transaksi</span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-slate-900 text-xs sm:text-sm text-slate-200 border border-slate-700 rounded-lg py-1.5 px-3 focus:outline-none focus:border-lime-500 cursor-pointer"
              >
                <option value="all">Semua Tahun</option>
                {availableYears.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-slate-900 text-xs sm:text-sm text-slate-200 border border-slate-700 rounded-lg py-1.5 px-3 focus:outline-none focus:border-lime-500 cursor-pointer"
              >
                <option value="all">Semua Bulan</option>
                <option value="0">Januari</option>
                <option value="1">Februari</option>
                <option value="2">Maret</option>
                <option value="3">April</option>
                <option value="4">Mei</option>
                <option value="5">Juni</option>
                <option value="6">Juli</option>
                <option value="7">Agustus</option>
                <option value="8">September</option>
                <option value="9">Oktober</option>
                <option value="10">November</option>
                <option value="11">Desember</option>
              </select>

              <button
                onClick={downloadPDFHandler}
                className="p-2 bg-lime-500 text-slate-950 rounded-lg hover:bg-lime-400 transition-colors flex items-center justify-center ml-1"
                title="Download PDF"
              >
                <Download size={16} />
              </button>
            </div>
          </div>
      <RecentTransaction 
          income={income} 
          expenses={expenses} 
          selectedMonth={selectedMonth} 
          selectedYear={selectedYear} 
        />

        </section>

        {/* ORGANISM TRANSAKSI TERAKHIR */}
  
        {/* PILL SWITCHER TAB */}
        <section className="mb-6 p-1 bg-slate-900 rounded-xl border border-slate-800 flex w-full relative">
          <button
            onClick={() => setActiveTab("expense")}
            className={`flex-1 text-center py-2.5 rounded-lg text-sm font-semibold tracking-wide transition-all duration-200 ${
              activeTab === "expense" 
                ? "bg-slate-800 text-red-400 shadow-md border border-white/5" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            My Expenses ({filteredExpensesDashboard.length})
          </button>
          <button
            onClick={() => setActiveTab("income")}
            className={`flex-1 text-center py-2.5 rounded-lg text-sm font-semibold tracking-wide transition-all duration-200 ${
              activeTab === "income" 
                ? "bg-slate-800 text-green-400 shadow-md border border-white/5" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            My Income ({groupedIncomeArray.length})
          </button>
        </section>

        {/* TAB CONTENTS */}
        {activeTab === "expense" ? (
          <section className="py-4">
            <h3 className="text-2xl font-bold mb-4 text-slate-100">My Expenses</h3>
            {filteredExpensesDashboard.length === 0 ? (
              <p className="text-slate-400 text-sm italic text-center py-4">Tidak ada data pengeluaran pada periode ini.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {filteredExpensesDashboard.map((expense) => (
                  <ExpenseCategoryItem key={expense.id} expense={expense} />
                ))}
              </div>
            )}
          </section>
        ) : (
          <section className="py-4">
            <h3 className="text-2xl font-bold mb-4 text-slate-100">My Income</h3>
            {groupedIncomeArray.length === 0 ? (
              <p className="text-slate-400 text-sm italic text-center py-4">Tidak ada data pemasukan pada periode ini.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {groupedIncomeArray.map((incGroup) => (
                  <IncomeCategoryItem key={incGroup.title} incGroup={incGroup} />
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </>
  );
}