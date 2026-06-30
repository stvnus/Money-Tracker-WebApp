"use client";

import { useState, useContext, useEffect } from "react";
import { financeContext } from "@/library/store/financeContext";
import { authContext } from "@/library/store/authContext";
import { currencyFormatter } from "@/library/utils";

import ExpenseCategoryItem from "@/components/organism/categoryExpense";

import AddIncomeModal from "@/components/organism/incomeModal";
import AddExpensesModal from "@/components/organism/expenseModal";
import { ArrowDownLeft, ArrowUpRight, Download, Calendar } from 'lucide-react';

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import SignIn from "@/components/signIn";

// IMPORT JSPDF & AUTOTABLE
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Home() {
  const [showAddIncomeModal, setShowAddIncomeModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showZeroBalanceNotification, setShowZeroBalanceNotification] = useState(false);
  
  const [balance, setBalance] = useState(0);
  
  // STATE FILTER TAB (expense atau income)
  const [activeTab, setActiveTab] = useState("expense");

  // STATE FILTER (Default tahun sekarang, bulan semua)
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [availableYears, setAvailableYears] = useState([new Date().getFullYear().toString()]);

  const { expenses, income, removeIncomeItem } = useContext(financeContext);
  const { user } = useContext(authContext);

  // UTILITY UNTUK PARSING DATE
  const parseDate = (dateField) => {
    if (!dateField) return new Date();
    return dateField.toMillis ? new Date(dateField.toMillis()) : new Date(dateField);
  };

  // KUMPULKAN DAFTAR TAHUN SECARA DINAMIS
  useEffect(() => {
    const years = new Set();
    years.add(new Date().getFullYear().toString());

    income.forEach(inc => {
      years.add(parseDate(inc.CreatedAt).getFullYear().toString());
    });
    
    expenses.forEach(cat => {
      cat.items.forEach(item => {
        years.add(parseDate(item.CreatedAt).getFullYear().toString());
      });
    });

    setAvailableYears(Array.from(years).sort((a, b) => b - a));
  }, [expenses, income]);

  // ==========================================
  // LOGIKA FILTER REALTIME UNTUK DASHBOARD
  // ==========================================

  // 1. Filter Data Income Realtime
  const filteredIncomeDashboard = income.filter((inc) => {
    const incDate = parseDate(inc.CreatedAt);
    const matchMonth = selectedMonth === "all" || incDate.getMonth() === parseInt(selectedMonth);
    const matchYear = selectedYear === "all" || incDate.getFullYear().toString() === selectedYear;
    return matchMonth && matchYear;
  });

  // 2. Filter Data Expenses Realtime (Recalculate total per category)
  const filteredExpensesDashboard = expenses.map((category) => {
    // Filter item di dalam kategori ini
    const filteredItems = category.items.filter((item) => {
      const itemDate = parseDate(item.CreatedAt);
      const matchMonth = selectedMonth === "all" || itemDate.getMonth() === parseInt(selectedMonth);
      const matchYear = selectedYear === "all" || itemDate.getFullYear().toString() === selectedYear;
      return matchMonth && matchYear;
    });

    // Hitung ulang total pengeluaran untuk kategori ini pada periode terpilih
    const newTotal = filteredItems.reduce((sum, item) => sum + item.amount, 0);

    return {
      ...category,
      items: filteredItems,
      total: newTotal
    };
  }).filter(category => category.items.length > 0); // Hanya tampilkan kategori yang ada transaksinya di periode ini

  // Saldo dihitung berdasarkan data yang sudah terfilter agar Dashboard mencerminkan periode tersebut
  useEffect(() => {
    const totalIncome = filteredIncomeDashboard.reduce((total, i) => total + i.amount, 0);
    const totalExpense = filteredExpensesDashboard.reduce((total, e) => total + e.total, 0);
    const newBalance = totalIncome - totalExpense;

    setBalance(newBalance);

    if (newBalance === 0 && filteredIncomeDashboard.length === 0) {
      setShowZeroBalanceNotification(true);
    } else {
      setShowZeroBalanceNotification(false);
    }
  }, [selectedMonth, selectedYear, expenses, income]);


  // DOWNLOAD PDF REPORT WITH TOTALS
  const downloadPDFReport = () => {
    const doc = new jsPDF();
    const timestamp = new Date().toLocaleDateString('id-ID', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

    const monthNames = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    
    const reportMonthText = selectedMonth === "all" ? "SEMUA BULAN" : monthNames[parseInt(selectedMonth)].toUpperCase();
    const reportYearText = selectedYear === "all" ? "SEMUA TAHUN" : selectedYear;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("LAPORAN KEUANGAN PERSONAL", 14, 20);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Periode Laporan: ${reportMonthText} ${reportYearText}`, 14, 27);
    doc.text(`Tanggal Cetak: ${timestamp}`, 14, 32);
    doc.text(`User: ${user?.email || "Pengguna"}`, 14, 37);

    doc.setDrawColor(200, 200, 200);
    doc.line(14, 42, 196, 42); 
    
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL SALDO KESELURUHAN: ${currencyFormatter(balance)}`, 14, 50);

    const totalPeriodIncome = filteredIncomeDashboard.reduce((sum, item) => sum + item.amount, 0);

    doc.text("A. Riwayat Pemasukan (Income)", 14, 62);
    
    const incomeRows = filteredIncomeDashboard.map((inc, index) => [
      index + 1,
      inc.description || "Tanpa Deskripsi",
      parseDate(inc.CreatedAt).toLocaleString('id-ID'),
      currencyFormatter(inc.amount)
    ]);

    incomeRows.push([
      "", 
      "TOTAL PEMASUKAN PERIODE INI", 
      "", 
      currencyFormatter(totalPeriodIncome)
    ]);

    autoTable(doc, {
      startY: 66,
      head: [["No", "Deskripsi Pemasukan", "Tanggal", "Jumlah"]],
      body: incomeRows,
      theme: "striped",
      headStyles: { fillColor: [34, 197, 94] }, 
      styles: { font: "helvetica", fontSize: 9 },
      didParseCell: (data) => {
        if (data.row.index === incomeRows.length - 1) {
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });

    const expenseRows = [];
    let no = 1;
    let totalPeriodExpense = 0;

    filteredExpensesDashboard.forEach((category) => {
      category.items.forEach((item) => {
        totalPeriodExpense += item.amount;
        expenseRows.push([
          no++,
          category.title,
          item.description || "Tanpa Deskripsi",
          parseDate(item.CreatedAt).toLocaleString('id-ID'),
          currencyFormatter(item.amount)
        ]);
      });
    });

    expenseRows.push([
      "", 
      "TOTAL PENGELUARAN PERIODE INI", 
      "", 
      "", 
      currencyFormatter(totalPeriodExpense)
    ]);

    const finalYAfterIncome = doc.lastAutoTable.finalY || 70;
    doc.text("B. Riwayat Pengeluaran (Expense)", 14, finalYAfterIncome + 12);

    autoTable(doc, {
      startY: finalYAfterIncome + 16,
      head: [["No", "Kategori", "Deskripsi Pengeluaran", "Tanggal", "Jumlah"]],
      body: expenseRows,
      theme: "striped",
      headStyles: { fillColor: [239, 68, 68] }, 
      styles: { font: "helvetica", fontSize: 9 },
      didParseCell: (data) => {
        if (data.row.index === expenseRows.length - 1) {
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });

    const finalYAfterExpense = doc.lastAutoTable.finalY || 150;
    doc.setFont("helvetica", "bold");
    doc.text("C. Ringkasan Arus Kas Periode Ini", 14, finalYAfterExpense + 15);
    
    doc.setFont("helvetica", "normal");
    doc.text(`+ Total Pemasukan : ${currencyFormatter(totalPeriodIncome)}`, 20, finalYAfterExpense + 23);
    doc.text(`- Total Pengeluaran : ${currencyFormatter(totalPeriodExpense)}`, 20, finalYAfterExpense + 29);
    
    const netPeriod = totalPeriodIncome - totalPeriodExpense;
    doc.setFont("helvetica", "bold");
    doc.text(`= Selisih Periode Ini : ${currencyFormatter(netPeriod)}`, 20, finalYAfterExpense + 37);

    const fileMonthName = selectedMonth === "all" ? "Semua_Bulan" : monthNames[parseInt(selectedMonth)];
    const fileYearName = selectedYear === "all" ? "Semua_Tahun" : selectedYear;
    doc.save(`Laporan_${fileMonthName}_${fileYearName}.pdf`);
  };

  if (!user) {
    return <SignIn />;
  }

  // LOGIKA GROUPING UNTUK INCOME BERDASARKAN KATEGORI (Menggunakan data terfilter)
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

  // DATA GRAFIK DOUGHNUT UNTUK EXPENSE (Menggunakan data terfilter)
  const expenseLabels = filteredExpensesDashboard.map((expense) => expense.title);
  const expenseTotals = filteredExpensesDashboard.map((expense) => expense.total);
  const expenseColors = filteredExpensesDashboard.map((expense) => expense.color);

  if (balance > 0) {
    expenseLabels.push("Sisa Saldo");
    expenseTotals.push(balance);
    expenseColors.push("#22c55e");
  }

  // DATA GRAFIK DOUGHNUT UNTUK INCOME
  const incomeLabels = groupedIncomeArray.map((inc) => inc.title);
  const incomeTotals = groupedIncomeArray.map((inc) => inc.total);
  const incomeColors = groupedIncomeArray.map((inc) => inc.color);

  return (
    <>
      <AddIncomeModal show={showAddIncomeModal} onClose={setShowAddIncomeModal} />
      <AddExpensesModal show={showAddExpenseModal} onClose={setShowAddExpenseModal} />

      <main className="container max-w-2xl px-6 mx-auto mb-12">
        
        {/* CARD SALDO UTAMA */}
        <section className="py-6 px-4 mb-4 bg-slate-800/50 rounded-2xl border border-white/10 shadow-xl backdrop-blur-sm flex flex-col items-center justify-center text-center">
          <div className="flex flex-col gap-1 items-center">
            <small className="text-slate-400 text-sm font-medium tracking-wide uppercase">
              Saldo Periode Ini
            </small>
            <h2 className="text-4xl font-bold text-white tracking-tight mt-1">
              {currencyFormatter(balance)}
            </h2>
          </div>

          {showZeroBalanceNotification && (
            <div className="mt-3 flex items-center justify-center gap-2 py-1.5 px-3 bg-amber-500/10 border border-amber-500/20 rounded-xl max-w-sm mx-auto">
              <p className="text-amber-200/90 text-xs font-medium">
                Belum ada transaksi pemasukan pada periode ini
              </p>
            </div>
          )}

          <section className="flex items-center gap-4 mt-5">
            <button
              onClick={() => setShowAddIncomeModal(true)}
              className="btn btn-success-outline flex items-center gap-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white transition-all py-2 px-4 rounded-xl text-sm font-medium"
            >
              <ArrowDownLeft size={18} />
              <span>Pemasukan</span>
            </button>
          
            <button
              onClick={() => setShowAddExpenseModal(true)}
              className="btn btn-secondary-outline flex items-center gap-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all py-2 px-4 rounded-xl text-sm font-medium"
            >
              <ArrowUpRight size={18} />
              <span>Pengeluaran</span>
            </button>
          </section>
        </section>

        {/* CONTROLLER FILTER PERIODE */}
        <section className="mb-6 p-4 bg-slate-800/30 rounded-xl border border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-300 text-sm font-medium">
            <Calendar size={16} className="text-lime-500" />
            <span>Periode Dashboard:</span>
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-slate-900 text-sm text-slate-200 border border-slate-700 rounded-lg py-1.5 px-3 focus:outline-none focus:border-lime-500 cursor-pointer min-w-[110px]"
            >
              <option value="all">Semua Tahun</option>
              {availableYears.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-slate-900 text-sm text-slate-200 border border-slate-700 rounded-lg py-1.5 px-3 focus:outline-none focus:border-lime-500 cursor-pointer min-w-[120px]"
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
              onClick={downloadPDFReport}
              className="p-2 rounded-lg bg-lime-500 text-slate-900 hover:bg-lime-400 active:scale-95 transition-all flex items-center justify-center gap-1.5 font-semibold text-sm px-4"
              title="Download PDF"
            >
              <Download size={16} />
            </button>
          </div>
        </section>

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

        {/* KONTEN KONDISIONAL BERDASARKAN TAB */}
        {activeTab === "expense" ? (
          <>
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

            <section className="py-6 border-t border-slate-800 mt-6">
              <h3 className="text-2xl font-bold mb-4 text-slate-100">Stats Expenses</h3>
              <div className="w-1/2 mx-auto">
                {filteredExpensesDashboard.length === 0 ? (
                  <p className="text-slate-500 text-center text-sm">Tidak ada data untuk grafik.</p>
                ) : (
                  <Doughnut
                    data={{
                      labels: expenseLabels,
                      datasets: [
                        {
                          label: "Expenses",
                          data: expenseTotals,
                          backgroundColor: expenseColors,
                          borderColor: ["#18181b"],
                          borderWidth: 5,
                        },
                      ],
                    }}
                  />
                )}
              </div>
            </section>
          </>
        ) : (
          <>
            <section className="py-4">
              <h3 className="text-2xl font-bold mb-4 text-slate-100">My Income</h3>
              {groupedIncomeArray.length === 0 ? (
                <p className="text-slate-400 text-sm italic text-center py-4">Tidak ada data pemasukan pada periode ini.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {groupedIncomeArray.map((incGroup) => (
                    <button 
                      key={incGroup.title} 
                      className="w-full text-left block focus:outline-none"
                    >
                      <div className="flex items-center justify-between px-4 py-4 bg-slate-800/60 border border-slate-700/40 rounded-2xl transition-all hover:bg-slate-700/50">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full flex-shrink-0"
                            style={{ backgroundColor: incGroup.color }}
                          />
                          <h4 className="capitalize text-sm font-semibold text-slate-200">
                            {incGroup.title}
                          </h4>
                        </div>
                        <p className="text-sm font-bold text-green-400">
                          {currencyFormatter(incGroup.total)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section className="py-6 border-t border-slate-800 mt-6">
              <h3 className="text-2xl font-bold mb-4 text-slate-100">Stats Income</h3>
              <div className="w-1/2 mx-auto">
                {groupedIncomeArray.length === 0 ? (
                  <p className="text-slate-500 text-center text-sm">Tidak ada data untuk grafik.</p>
                ) : (
                  <Doughnut
                    data={{
                      labels: incomeLabels,
                      datasets: [
                        {
                          label: "Income",
                          data: incomeTotals,
                          backgroundColor: incomeColors,
                          borderColor: ["#18181b"],
                          borderWidth: 5,
                        },
                      ],
                    }}
                  />
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </>
  );
}