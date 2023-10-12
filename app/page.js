"use client";

import { useState } from "react";

import { currencyFormatter } from "@/app/library/utils";
import ExpenseCategoryItem from "@/app/components/organism/categoryExpense";
import Modal from "@/app/components/organism/modal";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const DUMMY_DATA = [
  {
    id: 1,
    title: "Entertainment",
    color: "#000",
    total: 500,
  },
  {
    id: 2,
    title: "Gass",
    color: "#009",
    total: 200,
  },
  {
    id: 3,
    title: "Fuel",
    color: "#000",
    total: 1200,
  },
  {
    id: 4,
    title: "Movies",
    color: "#000",
    total: 800,
  },
  {
    id: 5,
    title: "Holiday",
    color: "#000",
    total: 2000,
  },
];

export default function Home() {
  const [showAddIncomeModal, setShowAddIncomeModal] = useState(true);

  return (
    <>
      {/* Modal */}
      <Modal show={showAddIncomeModal} onClose={setShowAddIncomeModal}>
        <form>
          <div className="flex flex-col gap-4">
            <label htmlFor="amount">Income Amount</label>
            <input
            className="px-4 py-2 bg-slate-600 rounded-xl"
              type="number"
              name="amount"
              min={0.01}
              step={0.01}
              placeholder="Enter income amount"
              required
           />
          </div>
          <div className="flex flex-col gap-4">
            <label htmlFor="description">Description</label>
            <input
            className="px-4 py-2 bg-slate-600 rounded-xl"
              type="text"
              name="description"
         
              placeholder="Enter description"
              required
           />
          </div>
          <button type="submit" className="btn btn-primary"> Add Income</button>
        </form>
      </Modal>

      <main className="container max-w-2xl px-6 mx-auto">
        <section className="py-3">
          <small className="text-gray-400 text-md">My Balance</small>
          <h2 className="text-4xl font-bold">{currencyFormatter(100000)}</h2>
        </section>

        <section className="flex items-center gap-2 py-3">
          <button onClick={() => {}} className="btn btn-primary">
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
            {DUMMY_DATA.map((expense) => {
              return (
                <ExpenseCategoryItem
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
                labels: DUMMY_DATA.map((expense) => expense.title),
                datasets: [
                  {
                    label: "Expenses",
                    data: DUMMY_DATA.map((expense) => expense.total),
                    backgroundColor: DUMMY_DATA.map((expense) => expense.color),
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
