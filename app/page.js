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
  
  // STATE FILTER (Default tahun sekarang, bulan semua)
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [availableYears, setAvailableYears] = useState([new Date().getFullYear().toString()]);

  const { expenses, income } = useContext(financeContext);
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

  useEffect(() => {
    const newBalance =
      income.reduce((total, i) => total + i.amount, 0) -
      expenses.reduce((total, e) => total + e.total, 0);

    setBalance(newBalance);

    if (newBalance === 0) {
      setShowZeroBalanceNotification(true);
    } else {
      setShowZeroBalanceNotification(false);
    }
  }, [expenses, income]);

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

    // 1. Header Laporan Dokumen
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

    // ==========================================
    // 2. BAGIAN INCOMOE (PEMASUKAN)
    // ==========================================
    const filteredIncome = income.filter((inc) => {
      const incDate = parseDate(inc.CreatedAt);
      const matchMonth = selectedMonth === "all" || incDate.getMonth() === parseInt(selectedMonth);
      const matchYear = selectedYear === "all" || incDate.getFullYear().toString() === selectedYear;
      return matchMonth && matchYear;
    });

    // HITUNG TOTAL INCOME PADA PERIODE INI
    const totalPeriodIncome = filteredIncome.reduce((sum, item) => sum + item.amount, 0);

    doc.text("A. Riwayat Pemasukan (Income)", 14, 62);
    
    const incomeRows = filteredIncome.map((inc, index) => [
      index + 1,
      inc.description || "Tanpa Deskripsi",
      parseDate(inc.CreatedAt).toLocaleString('id-ID'),
      currencyFormatter(inc.amount)
    ]);

    // Tambahkan baris total di paling bawah tabel income
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
      // Membuat baris terakhir (Total) bertekstur Bold
      didParseCell: (data) => {
        if (data.row.index === incomeRows.length - 1) {
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });

    // ==========================================
    // 3. BAGIAN EXPENSE (PENGELUARAN)
    // ==========================================
    const expenseRows = [];
    let no = 1;
    let totalPeriodExpense = 0; // HITUNG TOTAL EXPENSE PADA PERIODE INI

    expenses.forEach((category) => {
      category.items.forEach((item) => {
        const itemDate = parseDate(item.CreatedAt);
        const matchMonth = selectedMonth === "all" || itemDate.getMonth() === parseInt(selectedMonth);
        const matchYear = selectedYear === "all" || itemDate.getFullYear().toString() === selectedYear;
        
        if (matchMonth && matchYear) {
          totalPeriodExpense += item.amount; // Tambahkan ke total pengeluaran periode
          expenseRows.push([
            no++,
            category.title,
            item.description || "Tanpa Deskripsi",
            itemDate.toLocaleString('id-ID'),
            currencyFormatter(item.amount)
          ]);
        }
      });
    });

    // Tambahkan baris total di paling bawah tabel expense
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
      // Membuat baris terakhir (Total) bertekstur Bold
      didParseCell: (data) => {
        if (data.row.index === expenseRows.length - 1) {
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });

    // ==========================================
    // 4. RINGKASAN AKHIR PERIODE (OPSIONAL & BAGUS UNTUK REVIEW)
    // ==========================================
    const finalYAfterExpense = doc.lastAutoTable.finalY || 150;
    doc.setFont("helvetica", "bold");
    doc.text("C. Ringkasan Arus Kas Periode Ini", 14, finalYAfterExpense + 15);
    
    doc.setFont("helvetica", "normal");
    doc.text(`+ Total Pemasukan : ${currencyFormatter(totalPeriodIncome)}`, 20, finalYAfterExpense + 23);
    doc.text(`- Total Pengeluaran : ${currencyFormatter(totalPeriodExpense)}`, 20, finalYAfterExpense + 29);
    
    const netPeriod = totalPeriodIncome - totalPeriodExpense;
    doc.setFont("helvetica", "bold");
    doc.text(`= Selisih Periode Ini : ${currencyFormatter(netPeriod)}`, 20, finalYAfterExpense + 37);

    // Nama file PDF menyesuaikan bulan dan tahun pilihan
    const fileMonthName = selectedMonth === "all" ? "Semua_Bulan" : monthNames[parseInt(selectedMonth)];
    const fileYearName = selectedYear === "all" ? "Semua_Tahun" : selectedYear;
    doc.save(`Laporan_${fileMonthName}_${fileYearName}.pdf`);
  };
  if (!user) {
    return <SignIn />;
  }

  const expenseLabels = expenses.map((expense) => expense.title);
  const expenseTotals = expenses.map((expense) => expense.total);
  const expenseColors = expenses.map((expense) => expense.color);

  if (balance >= 0) {
    expenseLabels.push("Sisa Saldo");
    expenseTotals.push(balance);
    expenseColors.push("#00ff00");
  }

  return (
    <>
      <AddIncomeModal show={showAddIncomeModal} onClose={setShowAddIncomeModal} />
      <AddExpensesModal show={showAddExpenseModal} onClose={setShowAddExpenseModal} />

      <main className="container max-w-2xl px-6 mx-auto">
        
        {/* CARD SALDO UTAMA (BERSIH TANPA FILTER MENUMPUK) */}
        <section className="py-6 px-4 mb-4 bg-slate-800/50 rounded-2xl border border-white/10 shadow-xl backdrop-blur-sm flex flex-col items-center justify-center text-center">
          <div className="flex flex-col gap-1 items-center">
            <small className="text-slate-400 text-sm font-medium tracking-wide uppercase">
              Saldo Saat Ini
            </small>
            <h2 className="text-4xl font-bold text-white tracking-tight mt-1">
              {currencyFormatter(balance)}
            </h2>
          </div>

          {showZeroBalanceNotification && (
            <div className="mt-3 flex items-center justify-center gap-2 py-1.5 px-3 bg-amber-500/10 border border-amber-500/20 rounded-xl max-w-sm mx-auto">
              <p className="text-amber-200/90 text-xs font-medium">
                Input saldo pemasukan terlebih dahulu
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

        {/* CONTROLLER FILTER BARU: DI LUAR CARD & LEBIH LUAS */}
        <section className="mb-6 p-4 bg-slate-800/30 rounded-xl border border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-300 text-sm font-medium">
            <Calendar size={16} className="text-lime-500" />
            <span>Unduh Laporan per Periode:</span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* 1. Pilih Tahun Dulu */}
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

            {/* 2. Baru Pilih Bulan */}
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

            {/* 3. Tombol Ekspor PDF */}
            <button 
              onClick={downloadPDFReport}
              className="p-2 rounded-lg bg-lime-500 text-slate-900 hover:bg-lime-400 active:scale-95 transition-all flex items-center justify-center gap-1.5 font-semibold text-sm px-4"
              title="Download PDF"
            >
              <Download size={16} />
            </button>
          </div>
        </section>

        {/* Expenses */}
        <section className="py-4">
          <h3 className="text-2xl font-bold mb-4">My Expenses</h3>
          <div className="flex flex-col gap-4">
            {expenses.map((expense) => {
              return <ExpenseCategoryItem key={expense.id} expense={expense} />;
            })}
          </div>
        </section>

        {/* Chart Section */}
        <section className="py-6">
          <h3 className="text-2xl font-bold mb-4">Stats</h3>
          <div className="w-1/2 mx-auto">
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
          </div>
        </section>
      </main>
    </>
  );
}