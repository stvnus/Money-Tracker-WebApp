"use client";

import { useState, useContext, useEffect } from "react";
import { financeContext } from "@/library/store/financeContext";
import { authContext } from "@/library/store/authContext";
import { currencyFormatter } from "@/library/utils";

import ExpenseCategoryItem from "@/components/organism/categoryExpense";

import AddIncomeModal from "@/components/organism/incomeModal";
import AddExpensesModal from "@/components/organism/expenseModal";
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import SignIn from "@/components/signIn";


ChartJS.register(ArcElement, Tooltip, Legend);

export default function Home() {
  const [showAddIncomeModal, setShowAddIncomeModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showZeroBalanceNotification, setShowZeroBalanceNotification] = useState(false);
  
  const [balance, setBalance] = useState(0);

  const { expenses, income } = useContext(financeContext);
  const {user} = useContext(authContext)
  useEffect(() => {
    const newBalance =
      income.reduce((total, i) => {
        return total + i.amount;
      }, 0) -
      expenses.reduce((total, e) => {
        return total + e.total;
      }, 0);

    setBalance(newBalance);

   if (newBalance === 0) {
      setShowZeroBalanceNotification(true);
    } else {
      setShowZeroBalanceNotification(false);
    }
  }, [expenses, income]);


  if(!user) {
    return <SignIn />

  }
  const expenseLabels = expenses.map((expense) => expense.title);
  const expenseTotals = expenses.map((expense) => expense.total);
  const expenseColors = expenses.map((expense) => expense.color);

  // Add remaining balance if it's positive or zero
  if (balance >= 0) {
    expenseLabels.push("Sisa Saldo");
    expenseTotals.push(balance);
    expenseColors.push("#00ff00"); // You can choose the color you prefer
  }
  return (
    <>
   
      {/* Add Income Modal */}
      <AddIncomeModal
        show={showAddIncomeModal}
        onClose={setShowAddIncomeModal}
      />

      {/* Add Expenses Modal */}
      <AddExpensesModal
        show={showAddExpenseModal}
        onClose={setShowAddExpenseModal}
      />

      <main className="container max-w-2xl px-6 mx-auto">
      <section className="py-3 px-2 mb-1 bg-slate-800/50 rounded-2xl border border-white/10 shadow-xl backdrop-blur-sm flex flex-col items-center justify-center text-center">
  <div className="flex flex-col gap-1 items-center">
    <small className="text-slate-400 text-lg font-medium tracking-wide">
      Saldo Saat Ini
    </small>
    <h2 className="text-3xl font-bold text-white tracking-tight">
      {currencyFormatter(balance)}
    </h2>
  </div>

  {showZeroBalanceNotification && (
    <div className="mt-3 flex items-center justify-center gap-2 py-1.5 px-3 bg-amber-500/10 border border-amber-500/20 rounded-xl max-w-sm mx-auto">
    <div className="text-amber-500 flex-shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    </div>
    <p className="text-amber-200/90 text-xs font-medium text-left leading-none">
      Input saldo pemasukan terlebih dahulu
    </p>
  </div>
  )}
          <section className="flex items-center gap-4 py-3">
    <button
    onClick={() => {
      setShowAddIncomeModal(true);
    }}
    className="btn btn-success-outline flex items-center gap-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white transition-all"
    >
    <ArrowDownLeft size={20} />
    <span>Pemasukan</span>
    </button>
  
    <button
    onClick={() => {
      setShowAddExpenseModal(true);
    }}
    className="btn btn-secondary-outline flex items-center gap-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all"
   >
    <ArrowUpRight size={20} />
    <span>Pengeluaran</span>
  </button>
</section>
</section>



        {/* Expenses */}
        <section className="py-6">
          <h3 className="text-2xl">My Expenses</h3>
          <div className="flex flex-col gap-4 mt-6">
            {expenses.map((expense) => {
              return <ExpenseCategoryItem key={expense.id} expense={expense} />;
            })}
          </div>
        </section>

        {/* Chart Section */}
        <section className="py-6">
          <h3 className="text-2xl">Stats</h3>
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
