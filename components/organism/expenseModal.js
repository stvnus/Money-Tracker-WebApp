"use client";

import { useState, useContext, useRef } from "react";
import { financeContext } from "@/library/store/financeContext";

import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import Modal from "@/components/organism/modal";

function AddExpensesModal({ show, onClose }) {
  const [expenseAmount, setExpenseAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showAddExpense, setShowAddExpense] = useState(false);

  const { expenses, addExpenseItem, addCategory } = useContext(financeContext);

  const titleRef = useRef();
  const colorRef = useRef();

  const addExpenseItemHandler = async () => {
    const expense = expenses.find((e) => {
      return e.id === selectedCategory;
    });

    const newExpense = {
      color: expense.color,
      title: expense.title,
      total: expense.total + +expenseAmount,
      items: [
        ...expense.items,
        {
          amount: +expenseAmount,
          CreatedAt: new Date(),
          id: uuidv4(),
        },
      ],
    };

    try {
      await addExpenseItem(selectedCategory, newExpense);

      console.log(newExpense);
      setExpenseAmount("");
      setSelectedCategory(null);
      onClose();
      toast.success("Expense item ditambahkan");
    } catch (error) {
      console.log(error.message);
      toast.error(error.message);
    }
  };

  const addCategoryHandler = async () => {
    const title = titleRef.current.value;
    const color = colorRef.current.value;

    try {
      await addCategory({ title, color, total: 0 });
      setShowAddExpense(false);
      toast.success("Kategori telah ditambahkan");
    } catch (error) {
      console.log(error.message);
      toast.error(error.message);
    }
  };

  return (
    <Modal show={show} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <label>Enter an amount..</label>
        <input
          type="number"
          min={0.01}
          step={0.01}
          placeholder="Enter expense amount"
          value={expenseAmount}
          onChange={(e) => {
            setExpenseAmount(e.target.value);
          }}
        />
      </div>

      {/* Expense Categories */}
      {expenseAmount > 0 && (
        <div className="flex flex-col gap-4 mt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl capitalize">Select expense category</h3>
            <button
              onClick={() => {
                setShowAddExpense(true);
              }}
              className="text-lime-400"
            >
              + New Category
            </button>
          </div>

          {showAddExpense && (
            <div className="flex items-center justify-between gap-2">
              <input type="text" placeholder="Enter Title" ref={titleRef} />

              <label>Pick Color</label>
              <input type="color" className="w-24 h-10" ref={colorRef} />
              <button
                onClick={addCategoryHandler}
                className="btn btn-primary-outline"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowAddExpense(false);
                }}
                className="btn btn-danger"
              >
                Cancel
              </button>
            </div>
          )}

          {/* === KONTANER SCROLL DIMULAI DI SINI === */}
          <div className="max-h-[190px] overflow-y-auto overflow-x-hidden pr-2 pl-2 py-2 flex flex-col gap-3 w-full
  [&::-webkit-scrollbar]:w-2
  [&::-webkit-scrollbar-track]:bg-slate-800
  [&::-webkit-scrollbar-thumb]:bg-slate-600
  [&::-webkit-scrollbar-thumb]:rounded-full
  [scrollbar-color:#475569_#1e293b] [scrollbar-width:thin]">
            {expenses.map((expense) => {
              return (
                <button
                  key={expense.id}
                  onClick={() => {
                    setSelectedCategory(expense.id);
                  }}
                  className="w-full text-left block focus:outline-none"
                >
                  <div
                    style={{
                      boxShadow:
                        expense.id === selectedCategory
                          ? "0px 0px 8px #a3e635"
                          : "none",
                      border:
                        expense.id === selectedCategory
                          ? "1px solid #a3e635"
                          : "1px solid transparent",
                    }}
                    className="flex items-center justify-between px-4 py-3 bg-slate-700 rounded-2xl transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Colored circle */}
                      <div
                        className="w-[18px] h-[18px] rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: expense.color,
                        }}
                      />
                      <h4 className="capitalize text-sm font-medium truncate">
                        {expense.title}
                      </h4>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          {/* === KONTANER SCROLL BERAKHIR DI SINI === */}
        </div>
      )}

      {expenseAmount > 0 && selectedCategory && (
        <div className="mt-6">
          <button className="btn btn-primary w-full" onClick={addExpenseItemHandler}>
            Add Expense
          </button>
        </div>
      )}
    </Modal>
  );
}

export default AddExpensesModal;