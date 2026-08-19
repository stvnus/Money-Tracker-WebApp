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
import { ArrowDownLeft, ArrowUpRight, Calendar, Download, PieChart as PieIcon } from "lucide-react";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import SignIn from "@/components/signIn";

import jsPDF from "jspdf";

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

  // Perhitungan total
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

  // Download PDF Laporan
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

  // Data Konfigurasi Grafik berdasarkan Kategori Pengeluaran
  const categoryChartData = {
    labels: filteredExpensesDashboard.map((cat) => cat.title),
    datasets: [
      {
        data: filteredExpensesDashboard.map((cat) => cat.total),
        backgroundColor: filteredExpensesDashboard.map((cat) => cat.color || "#3b82f6"),
        borderColor: "#0f172a",
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#94a3b8",
          font: { size: 12 },
          boxWidth: 12,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.label}: ${currencyFormatter(context.raw)}`,
        },
      },
    },
  };

  return (
    <>
      <AddIncomeModal show={showAddIncomeModal} onClose={setShowAddIncomeModal} />
      <AddExpensesModal show={showAddExpenseModal} onClose={setShowAddExpenseModal} />

      <Nav />

      <main className="container max-w-4xl px-4 sm:px-6 mx-auto mb-12">
        
        {/* SINGLE CONTAINER DASHBOARD CARD */}
        <section className="p-5 mb-6 bg-slate-900/60 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-md flex flex-col gap-5">
          
          {/* BARIS 1: PROPORSI 60% : 40% (GRID 12 KOLOM) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch border-b border-slate-700/50 pb-5">

            {/* SISI KIRI: SALDO PERIODE INI (60% / 7 KOLOM) */}
            <div className="md:col-span-7 flex flex-col justify-center h-full bg-slate-900/40 p-5 rounded-xl border border-slate-700/40">
              <small className="text-slate-400 text-xs font-semibold tracking-wider uppercase">
                Saldo Periode Ini
              </small>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mt-2 truncate">
                {currencyFormatter(balance)}
              </h2>
            </div>

            {/* SISI KANAN: PEMASUKAN & PENGELUARAN (40% / 5 KOLOM) */}
            <div className="md:col-span-5 flex flex-col gap-2.5 justify-center">
              
              {/* PEMASUKAN */}
              <div 
                onClick={() => setShowAddIncomeModal(true)}
                className="flex-1 flex items-center justify-between p-3 bg-slate-900/40 hover:bg-slate-800/50 rounded-xl border border-slate-700/40 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0 group-hover:scale-105 transition-transform">
                    <ArrowDownLeft size={16} />
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="text-[11px] font-medium text-slate-300">Pemasukan</span>
                    <span className="text-xs sm:text-sm font-bold text-emerald-400 truncate">
                      {currencyFormatter(totalIncomeDashboard)}
                    </span>
                  </div>
                </div>
              </div>

              {/* PENGELUARAN */}
              <div 
                onClick={() => setShowAddExpenseModal(true)}
                className="flex-1 flex items-center justify-between p-3 bg-slate-900/40 hover:bg-slate-800/50 rounded-xl border border-slate-700/40 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 flex-shrink-0 group-hover:scale-105 transition-transform">
                    <ArrowUpRight size={16} />
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="text-[11px] font-medium text-slate-300">Pengeluaran</span>
                    <span className="text-xs sm:text-sm font-bold text-rose-400 truncate">
                      {currencyFormatter(totalExpenseDashboard)}
                    </span>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* BARIS 2: BAR PERIODE DASHBOARD */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2 text-slate-300 text-xs sm:text-sm font-medium">
              <Calendar size={16} className="text-lime-400" />
              <span>Periode:</span>
            </div>

          <div className="flex items-center gap-2">
  {/* SELECT TAHUN */}
  <select
    value={selectedYear}
    onChange={(e) => setSelectedYear(e.target.value)}
    className="bg-slate-900 text-slate-100 text-xs sm:text-sm border border-slate-700/80 rounded-lg py-1.5 px-3 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 cursor-pointer shadow-sm transition-colors"
  >
    <option value="all" className="bg-slate-900 text-slate-100">
      Semua Tahun
    </option>
    {availableYears.map((year) => (
      <option key={year} value={year} className="bg-slate-900 text-slate-100">
        {year}
      </option>
    ))}
  </select>

  {/* SELECT BULAN */}
  <select
    value={selectedMonth}
    onChange={(e) => setSelectedMonth(e.target.value)}
    className="bg-slate-900 text-slate-100 text-xs sm:text-sm border border-slate-700/80 rounded-lg py-1.5 px-3 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 cursor-pointer shadow-sm transition-colors"
  >
    <option value="all" className="bg-slate-900 text-slate-100">Semua Bulan</option>
    <option value="0" className="bg-slate-900 text-slate-100">Januari</option>
    <option value="1" className="bg-slate-900 text-slate-100">Februari</option>
    <option value="2" className="bg-slate-900 text-slate-100">Maret</option>
    <option value="3" className="bg-slate-900 text-slate-100">April</option>
    <option value="4" className="bg-slate-900 text-slate-100">Mei</option>
    <option value="5" className="bg-slate-900 text-slate-100">Juni</option>
    <option value="6" className="bg-slate-900 text-slate-100">Juli</option>
    <option value="7" className="bg-slate-900 text-slate-100">Agustus</option>
    <option value="8" className="bg-slate-900 text-slate-100">September</option>
    <option value="9" className="bg-slate-900 text-slate-100">Oktober</option>
    <option value="10" className="bg-slate-900 text-slate-100">November</option>
    <option value="11" className="bg-slate-900 text-slate-100">Desember</option>
  </select>

  {/* TOMBOL UNDUH PDF */}
  <button
    onClick={downloadPDFHandler}
    className="p-2 bg-lime-500 hover:bg-lime-400 text-slate-950 rounded-lg transition-colors flex items-center justify-center ml-1 font-semibold"
    title="Download PDF"
  >
    <Download size={16} />
  </button>
</div>
          </div>

          {/* BARIS 3: RIWAYAT TRANSAKSI MENYATU SEAMLESS */}
          <div className="pt-2">
            <RecentTransaction 
              income={income} 
              expenses={expenses} 
              selectedMonth={selectedMonth} 
              selectedYear={selectedYear} 
            />
          </div>

        </section>

        {/* PILL SWITCHER TAB */}
        <section className="mb-6 p-1 bg-slate-900 rounded-xl border border-slate-800 flex w-full relative">
          <button
            onClick={() => setActiveTab("expense")}
            className={`flex-1 text-center py-2.5 rounded-lg text-sm font-semibold tracking-wide transition-all duration-200 ${
              activeTab === "expense" 
                ? "bg-slate-800 text-rose-400 shadow-md border border-white/5" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            My Expenses ({filteredExpensesDashboard.length})
          </button>
          <button
            onClick={() => setActiveTab("income")}
            className={`flex-1 text-center py-2.5 rounded-lg text-sm font-semibold tracking-wide transition-all duration-200 ${
              activeTab === "income" 
                ? "bg-slate-800 text-emerald-400 shadow-md border border-white/5" 
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

        {/* GRAFIK STATISTIK BERDASARKAN KATEGORI PENGELUARAN */}
        <section className="mt-8 p-6 bg-slate-900/60 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
            <PieIcon size={18} className="text-lime-400" />
            <h3 className="text-lg font-bold text-slate-100">Statistik Pengeluaran Berdasarkan Kategori</h3>
          </div>

          {filteredExpensesDashboard.length === 0 ? (
            <p className="text-slate-400 text-sm italic text-center py-8">
              Belum ada data pengeluaran kategori pada periode ini.
            </p>
          ) : (
            <div className="w-full h-64 sm:h-72 flex justify-center items-center">
              <Doughnut data={categoryChartData} options={chartOptions} />
            </div>
          )}
        </section>

      </main>
    </>
  );
}