"use client";

import { useState, useContext, useEffect } from "react";
import { financeContext } from "@/library/store/financeContext";
import { authContext } from "@/library/store/authContext";
import { currencyFormatter } from "@/library/utils";

import ExpenseCategoryItem from "@/components/organism/categoryExpense";

import AddIncomeModal from "@/components/organism/incomeModal";
import AddExpensesModal from "@/components/organism/expenseModal";


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
      <section className="py-3">
          <small className="text-gray-400 text-md">Saldo</small>
          <h2 className="text-4xl font-bold">{currencyFormatter(balance)}</h2>
          {showZeroBalanceNotification && (
            <div className="text-red-500 mt-2">
              Harap input saldo pemasukan terlebih dahulu
            </div>
          )}
        </section>

        <section className="flex items-center gap-2 py-3">
          <button
            onClick={() => {
              setShowAddExpenseModal(true);
            }}
            className="btn btn-primary"
          >
            + Pengeluaran
          </button>
          <button
            onClick={() => {
              setShowAddIncomeModal(true);
            }}
            className="btn btn-primary-outline"
          >
            + Pemasukan
          </button>
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
