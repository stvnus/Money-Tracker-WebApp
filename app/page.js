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

  const [balance, setBalance] = useState(0);
  const [activeTab, setActiveTab] = useState("expense");

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [availableYears, setAvailableYears] = useState([new Date().getFullYear().toString()]);

  const { expenses = [], income = [] } = useContext(financeContext);
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
    
    (expenses || []).forEach((cat) => {
      const itemsList = Array.isArray(cat?.items) ? cat.items : [];
      itemsList.forEach((item) => {
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

  // Filter Data Expenses berdasarkan Periode (PERBAIKAN UTAMA SAFE-GUARD)
  const filteredExpensesDashboard = (expenses || []).map((category) => {
    // Memastikan category.items bertipe Array agar tidak mengembalikan error '.filter of undefined'
    const categoryItems = Array.isArray(category?.items) ? category.items : [];

    const filteredItems = categoryItems.filter((item) => {
      if (!item) return false;
      const itemDate = parseDate(item.CreatedAt);
      const matchMonth = selectedMonth === "all" || itemDate.getMonth() === parseInt(selectedMonth);
      const matchYear = selectedYear === "all" || itemDate.getFullYear().toString() === selectedYear;
      return matchMonth && matchYear;
    });

    const newTotal = filteredItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    return {
      ...category,
      items: filteredItems,
      total: newTotal
    };
  }).filter((category) => category.items.length > 0);

  // Perhitungan total Dashboard (Filter Periode)
  const totalIncomeDashboard = filteredIncomeDashboard.reduce((total, i) => total + (Number(i.amount) || 0), 0);
  const totalExpenseDashboard = filteredExpensesDashboard.reduce((total, e) => total + e.total, 0);

  useEffect(() => {
    const newBalance = totalIncomeDashboard - totalExpenseDashboard;
    setBalance(newBalance);
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
    const categoryColor = item.categoryColor || "#10b981";
    
    if (!groups[categoryTitle]) {
      groups[categoryTitle] = {
        title: categoryTitle,
        color: categoryColor,
        total: 0,
        items: []
      };
    }
    groups[categoryTitle].total += (Number(item.amount) || 0);
    groups[categoryTitle].items.push(item);
    return groups;
  }, {});

  const groupedIncomeArray = Object.values(groupedIncomeMap);

  // Data Grafik Pengeluaran (Expense)
  const expenseChartData = {
    labels: filteredExpensesDashboard.map((cat) => cat.title),
    datasets: [
      {
        data: filteredExpensesDashboard.map((cat) => cat.total),
        backgroundColor: filteredExpensesDashboard.map((cat) => cat.color || "#f43f5e"),
        borderColor: "#0f172a",
        borderWidth: 2,
      },
    ],
  };

  // Data Grafik Pemasukan (Income)
  const incomeChartData = {
    labels: groupedIncomeArray.map((inc) => inc.title),
    datasets: [
      {
        data: groupedIncomeArray.map((inc) => inc.total),
        backgroundColor: groupedIncomeArray.map((inc) => inc.color || "#10b981"),
        borderColor: "#0f172a",
        borderWidth: 2,
      },
    ],
  };

  return (
    <>
      <AddIncomeModal show={showAddIncomeModal} onClose={setShowAddIncomeModal} />
      <AddExpensesModal show={showAddExpenseModal} onClose={setShowAddExpenseModal} />

      <Nav />

      <main className="container max-w-4xl px-4 sm:px-6 mx-auto mb-12">
        
        {/* DASHBOARD CARD CONTAINER */}
        <section className="p-5 mb-6 bg-slate-900/60 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-md flex flex-col gap-5">
       
          
          {/* BARIS 1: SALDO & PEMASUKAN/PENGELUARAN */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch border-b border-slate-700/50 pb-5">
            <div className="md:col-span-7 flex flex-col justify-center h-full bg-slate-900/40 p-5 rounded-xl border border-slate-700/40">
              <small className="text-slate-400 text-xs font-semibold tracking-wider uppercase">
                Saldo Periode Ini
              </small>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mt-2 truncate">
                {currencyFormatter(balance)}
              </h2>
            </div>

            <div className="md:col-span-5 flex flex-col gap-2.5 justify-center">
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
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-slate-900 text-slate-100 text-xs sm:text-sm border border-slate-700/80 rounded-lg py-1.5 px-3 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 cursor-pointer shadow-sm transition-colors"
              >
                <option value="all" className="bg-slate-900 text-slate-100">Semua Tahun</option>
                {availableYears.map((year) => (
                  <option key={year} value={year} className="bg-slate-900 text-slate-100">{year}</option>
                ))}
              </select>

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

              <button
                onClick={downloadPDFHandler}
                className="p-2 bg-lime-500 hover:bg-lime-400 text-slate-950 rounded-lg transition-colors flex items-center justify-center ml-1 font-semibold"
                title="Download PDF"
              >
                <Download size={16} />
              </button>
            </div>
          </div>

          {/* BARIS 3: RIWAYAT TRANSAKSI */}
          <div className="pt-2 border-b border-slate-800 pb-5">
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

        {/* GRAFIK STATISTIK DINAMIS */}
        <section className="mt-8 p-6 bg-slate-900/80 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-2 mb-6 pb-3 border-b border-slate-800">
            <PieIcon size={20} className={activeTab === "expense" ? "text-rose-400" : "text-emerald-400"} />
            <h3 className="text-lg font-bold text-slate-100">
              {activeTab === "expense" 
                ? "Statistik Pengeluaran Berdasarkan Kategori" 
                : "Statistik Pemasukan Berdasarkan Kategori"}
            </h3>
          </div>

          {activeTab === "expense" ? (
            filteredExpensesDashboard.length === 0 ? (
              <p className="text-slate-400 text-sm italic text-center py-8">
                Belum ada data pengeluaran kategori pada periode ini.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-5 h-56 sm:h-64 flex justify-center items-center">
                  <Doughnut 
                    data={expenseChartData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          callbacks: {
                            label: (context) => ` ${context.label}: ${currencyFormatter(context.raw)}`,
                          },
                        },
                      },
                      cutout: "70%",
                    }} 
                  />
                </div>

                <div className="md:col-span-7 flex flex-col justify-center gap-3">
                  <div className="flex flex-col gap-2.5">
                    {filteredExpensesDashboard.map((cat) => {
                      const percentage = totalExpenseDashboard > 0 
                        ? ((cat.total / totalExpenseDashboard) * 100).toFixed(1) 
                        : "0.0";
                      
                      return (
                        <div 
                          key={cat.id || cat.title} 
                          className="flex items-center justify-between text-xs sm:text-sm py-1.5 border-b border-slate-800/60 last:border-none"
                        >
                          <div className="flex items-center gap-3 min-w-[120px] truncate">
                            <span 
                              className="w-3.5 h-3.5 rounded-sm flex-shrink-0" 
                              style={{ backgroundColor: cat.color || "#f43f5e" }} 
                            />
                            <span className="text-slate-200 font-medium truncate">{cat.title}</span>
                          </div>

                          <span className="text-slate-300 font-semibold px-2">
                            {percentage}%
                          </span>

                          <span className="text-slate-300 font-medium text-right">
                            {currencyFormatter(cat.total)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-800 text-sm font-bold">
                    <span className="text-slate-400">Total Pengeluaran</span>
                    <span className="text-rose-400 text-base">
                      {currencyFormatter(totalExpenseDashboard)}
                    </span>
                  </div>
                </div>
              </div>
            )
          ) : (
            groupedIncomeArray.length === 0 ? (
              <p className="text-slate-400 text-sm italic text-center py-8">
                Belum ada data pemasukan kategori pada periode ini.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-5 h-56 sm:h-64 flex justify-center items-center">
                  <Doughnut 
                    data={incomeChartData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          callbacks: {
                            label: (context) => ` ${context.label}: ${currencyFormatter(context.raw)}`,
                          },
                        },
                      },
                      cutout: "70%",
                    }} 
                  />
                </div>

                <div className="md:col-span-7 flex flex-col justify-center gap-3">
                  <div className="flex flex-col gap-2.5">
                    {groupedIncomeArray.map((inc) => {
                      const percentage = totalIncomeDashboard > 0 
                        ? ((inc.total / totalIncomeDashboard) * 100).toFixed(1) 
                        : "0.0";
                      
                      return (
                        <div 
                          key={inc.title} 
                          className="flex items-center justify-between text-xs sm:text-sm py-1.5 border-b border-slate-800/60 last:border-none"
                        >
                          <div className="flex items-center gap-3 min-w-[120px] truncate">
                            <span 
                              className="w-3.5 h-3.5 rounded-sm flex-shrink-0" 
                              style={{ backgroundColor: inc.color || "#10b981" }} 
                            />
                            <span className="text-slate-200 font-medium truncate">{inc.title}</span>
                          </div>

                          <span className="text-slate-300 font-semibold px-2">
                            {percentage}%
                          </span>

                          <span className="text-slate-300 font-medium text-right">
                            {currencyFormatter(inc.total)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-800 text-sm font-bold">
                    <span className="text-slate-400">Total Pemasukan</span>
                    <span className="text-emerald-400 text-base">
                      {currencyFormatter(totalIncomeDashboard)}
                    </span>
                  </div>
                </div>
              </div>
            )
          )}
        </section>

      </main>
    </>
  );
}