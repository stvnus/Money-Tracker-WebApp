"use client";

import { useState, useContext, useEffect } from "react";
import {financeContext} from "@/app/library/store/financeContext"
import { currencyFormatter } from "@/app/library/utils";

import ExpenseCategoryItem from "@/app/components/organism/categoryExpense";

import AddIncomeModal from "@/app/components/organism/IncomeModal";
import AddExpenseModal from "@/app/components/organism/ExpenseModal";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);



export default function Home() {
  const [showAddIncomeModal, setShowAddIncomeModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const {expense, income} = useContext (financeContext);
  const [balance, setBalance] = useState(0)

useEffect(()=>{
  const newBalance = income.reduce((total, i) => {
    return total + i.amount;
  },0) -
  expense.reduce((total, e)=> {
    return total + e.total;
  },0);
  setBalance(newBalance);
},[expense, income])  
  return (
    <>
      {/* Add Income Modal */}
      <AddIncomeModal
        show={showAddIncomeModal}
        onClose={setShowAddIncomeModal}
      />
      <AddExpenseModal
      show={showAddExpenseModal}
      onClose={setShowAddExpenseModal}
      />
      <main className="container max-w-2xl px-6 mx-auto">
        <section className="py-3">
          <small className="text-gray-400 text-md">My Balance</small>
          <h2 className="text-4xl font-bold">{currencyFormatter(balance)}</h2>
        </section>

        <section className="flex items-center gap-2 py-3">
          <button onClick={() => {
            setShowAddExpenseModal(true);
          }} className="btn btn-primary">

            + Expenses
          </button>
          <button
            onClick={() => {
              setShowAddIncomeModal(true);
            }}
            className="btn btn-primary-outline"
          >
            + Income
          </button>
        </section>

        {/* Expenses */}
        <section className="py-6">
          <h3 className="text-2xl">My Expenses</h3>
          <div className="flex flex-col gap-4 mt-6">
            {expense.map((expense) => {
              return (
                <ExpenseCategoryItem
                  key={expense.id}
                  color={expense.color}
                  title={expense.title}
                  total={expense.total}
                />
              );
            })}
          </div>
        </section>

        {/* Chart Section */}
        <section className="py-6">
          <h3 className="text-2xl">Stats</h3>
          <div className="w-1/2 mx-auto">
            <Doughnut
              data={{
                labels: expense.map((expense) => expense.title),
                datasets: [
                  {
                    label: "Expenses",
                    data: expense.map((expense) => expense.total),
                    backgroundColor: expense.map((expense) => expense.color),
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