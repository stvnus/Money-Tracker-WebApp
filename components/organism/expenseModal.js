"use client";

import { useState, useContext, useRef } from "react";
import { financeContext } from "@/library/store/financeContext";

import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import Modal from "@/components/organism/modal";

function AddExpensesModal({ show, onClose }) {
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDescription, setExpenseDescription] = useState(""); 
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showAddExpense, setShowAddExpense] = useState(false);

  const { expenses, addExpenseItem, addCategory } = useContext(financeContext);

  const titleRef = useRef();
  const colorRef = useRef();

  const addExpenseItemHandler = async () => {
    if (!expenseDescription.trim()) {
      toast.warning("Silakan masukkan deskripsi pengeluaran");
      return;
    }

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
          description: expenseDescription,
          CreatedAt: new Date(),
          id: uuidv4(),
        },
      ],
    };

    try {
      await addExpenseItem(selectedCategory, newExpense);

      console.log(newExpense);
      setExpenseAmount("");
      setExpenseDescription(""); 
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
      {/* Container utama yang membatasi tinggi maksimum modal agar bisa di-scroll saat screen di-scale/zoom */}
      <div className="max-h-[80vh] overflow-y-auto pr-1 flex flex-col gap-4
        [&::-webkit-scrollbar]:w-1.5
        [&::-webkit-scrollbar-track]:bg-transparent
        [&::-webkit-scrollbar-thumb]:bg-slate-700
        [&::-webkit-scrollbar-thumb]:rounded-full">
        
        {/* 1. Input Utama */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-slate-200 font-medium">Enter an amount..</label>
            <input
              type="number"
              min={0.01}
              step={0.01}
              placeholder="Enter expense amount"
              value={expenseAmount}
              onChange={(e) => {
                setExpenseAmount(e.target.value);
              }}
              onKeyDown={(e) => {
                if (
                  e.key === "e" || 
                  e.key === "E" || 
                  e.key === "-" || 
                  e.key === "+" || 
                  e.key === "."
                ) {
                  e.preventDefault();
                }
              }}
            />
          </div>

          {/* Input Description */}
          {expenseAmount > 0 && (
            <div className="flex flex-col gap-1 transition-all duration-300">
              <label className="text-slate-200 font-medium">Description</label>
              <input
                type="text"
                placeholder="E.g., Beli nasi goreng, Bayar listrik..."
                value={expenseDescription}
                onChange={(e) => {
                  setExpenseDescription(e.target.value);
                }}
              />
            </div>
          )}
        </div>

        {/* 2. Modul Kategori dan Button */}
        {expenseAmount > 0 && expenseDescription.trim() > "" && (
          <div className="flex flex-col gap-3 mt-1 transition-all duration-300">
            
            {/* Header Kategori */}
            <div className="flex items-center justify-between">
              <h3 className="text capitalize text-slate-100 text-sm">Select expense category</h3>
              <button
                onClick={() => {
                  setShowAddExpense(true);
                }}
                className="text-lime-400 hover:text-lime-300 transition-colors text-xs"
              >
                + New Category
              </button>
            </div>

            {/* Form Tambah Kategori Baru */}
            {showAddExpense && (
              <div className="flex items-center justify-between gap-2 p-1.5 bg-slate-800/50 rounded-xl border border-slate-700 text-xs">
                <input 
                  type="text" 
                  placeholder="Enter Title" 
                  ref={titleRef} 
                  className="bg-slate-900 border-slate-700 text-xs py-1 px-2 h-7 w-full rounded-md" 
                />
                
                <label className="text-[11px] text-slate-400 whitespace-nowrap">Pick Color</label>
                
                <input 
                  type="color" 
                  className="w-10 h-7 border-none cursor-pointer bg-transparent p-0 flex-shrink-0" 
                  ref={colorRef} 
                />
                
                <button
                  onClick={addCategoryHandler}
                  className="btn btn-primary-outline text-[11px] px-2.5 h-7 flex items-center justify-center flex-shrink-0"
                >
                  Create
                </button>
                
                <button
                  onClick={() => {
                    setShowAddExpense(false);
                  }}
                  className="btn btn-danger text-[11px] px-2.5 h-7 flex items-center justify-center flex-shrink-0"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Daftar Scroll Kategori */}
            <div className="max-h-[160px] overflow-y-auto overflow-x-hidden pr-2 pl-2 py-2 grid grid-cols-2 gap-3 w-full
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
                      className="flex items-center justify-between px-3 py-3 bg-slate-700 rounded-2xl transition-all hover:bg-slate-600/50"
                    >
                      <div className="flex items-center gap-2 min-w-0 w-full">
                        <div
                          className="w-[16px] h-[16px] rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: expense.color,
                          }}
                        />
                        <h4 className="capitalize text-xs font-medium truncate text-slate-200 w-full">
                          {expense.title}
                        </h4>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Tombol Utama */}
            {selectedCategory && (
              <div className="mt-2 pt-2 border-t border-slate-800/60 w-full">
                <button className="btn btn-primary w-full py-3" onClick={addExpenseItemHandler}>
                  Add Expense
                </button>
              </div>
            )}

          </div>
        )}
      </div>
    </Modal>
  );
}

export default AddExpensesModal;