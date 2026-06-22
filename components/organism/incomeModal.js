import { useRef, useEffect, useContext, useState } from "react";
import { currencyFormatter } from "@/library/utils";

import { financeContext } from "@/library/store/financeContext";
import { authContext } from "@/library/store/authContext";
import { toast } from "react-toastify";
// Icons
import { FaRegTrashAlt } from "react-icons/fa";

import Modal from "@/components/organism/modal";

function AddIncomeModal({ show, onClose }) {
  const amountRef = useRef();
  const descriptionRef = useRef();
  
  // STATE BARU UNTUK KATEGORI INCOME
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [incomeAmount, setIncomeAmount] = useState("");
  const [incomeDescription, setIncomeDescription] = useState("");

  // Refs untuk form tambah kategori baru
  const catTitleRef = useRef();
  const catColorRef = useRef();

  // State lokal untuk menampung daftar kategori pemasukan (bisa dipindah ke context jika ingin disimpan permanen)
  const [incomeCategories, setIncomeCategories] = useState([
    { id: "gaji", title: "Gaji & Upah", color: "#22c55e" },
    { id: "investasi", title: "Investasi", color: "#3b82f6" },
    { id: "freelance", title: "Freelance", color: "#a855f7" },
    { id: "hiburan", title: "Hadiah / Bonus", color: "#eab308" },
  ]);

  const { income, addIncomeItem, removeIncomeItem } = useContext(financeContext);
  const { user } = useContext(authContext);

  // Handler untuk menambah kategori baru (mirip expenseModal)
  const addIncomeCategoryHandler = (e) => {
    e.preventDefault();
    const title = catTitleRef.current.value;
    const color = catColorRef.current.value;

    if (!title.trim()) {
      toast.warning("Nama kategori tidak boleh kosong");
      return;
    }

    const newCat = {
      id: title.toLowerCase().replace(/\s+/g, "-"),
      title,
      color,
    };

    setIncomeCategories([...incomeCategories, newCat]);
    setShowAddCategoryForm(false);
    toast.success("Kategori pemasukan baru ditambahkan");
  };

  // Handler Utama Tambah Data Income
  const addIncomeHandler = async (e) => {
    e.preventDefault();

    if (!selectedCategory) {
      toast.warning("Silakan pilih kategori pemasukan terlebih dahulu");
      return;
    }

    // Cari detail kategori yang dipilih untuk disimpan ke database
    const categoryDetails = incomeCategories.find((cat) => cat.id === selectedCategory);

    const newIncome = {
      amount: +incomeAmount,
      description: incomeDescription,
      category: categoryDetails.title, // Menyimpan nama kategori
      categoryColor: categoryDetails.color, // Menyimpan warna kategori untuk UI
      CreatedAt: new Date(),
      uid: user.uid
    };

    try {
      await addIncomeItem(newIncome);
      
      // Reset Form State
      setIncomeAmount("");
      setIncomeDescription("");
      setSelectedCategory(null);
      toast.success("Data income berhasil ditambahkan");
    } catch (error) {
      console.log(error.message);
      toast.error(error.message);
    }
  };

  const deleteIncomeEntryHandler = async (incomeId) => {
    try {
      await removeIncomeItem(incomeId);
      toast.success("Data income berhasil dihapus");
    } catch (error) {
      console.log(error.message);
      toast.error(error.message);
    }
  };

  return (
    <Modal show={show} onClose={onClose}>
      <form onSubmit={addIncomeHandler} className="flex flex-col gap-4 flex-shrink-0">
        <div className="input-group">
          <label htmlFor="amount">Income Amount</label>
          <input
            type="number"
            name="amount"
            min={0.01}
            step={0.01}
            placeholder="Enter income amount" 
            required
            value={incomeAmount}
            onChange={(e) => setIncomeAmount(e.target.value)}
            onKeyDown={(e) => {
              if (["e", "E", "-", "+"].includes(e.key)) {
                e.preventDefault();
              }
            }}
          />
        </div>
    
        <div className="input-group">
          <label htmlFor="description">Description</label>
          <input
            name="description"
            type="text"
            placeholder="Enter income description"
            required
            value={incomeDescription}
            onChange={(e) => setIncomeDescription(e.target.value)}
          />
        </div>

        {/* --- SECTION PILIHAN KATEGORI INCOME (DIPICU JIKA INPUT SUDAH TERISI) --- */}
        {+incomeAmount > 0 && incomeDescription.trim().length > 0 && (
          <div className="flex flex-col gap-3 mt-2 border-t border-slate-800 pt-3 transition-all duration-300">
            <div className="flex items-center justify-between">
              <label className="text-slate-200 font-medium text-sm">Select Income Category</label>
              <button
                type="button"
                onClick={() => setShowAddCategoryForm(true)}
                className="text-xs text-lime-400 hover:text-lime-300 transition-colors"
              >
                + New Category
              </button>
            </div>

            {/* Form Tambah Kategori Income Baru */}
            {showAddCategoryForm && (
              <div className="flex items-center justify-between gap-2 p-1.5 bg-slate-800/50 rounded-xl border border-slate-700 text-xs">
                <input 
                  type="text" 
                  placeholder="Category Title" 
                  ref={catTitleRef} 
                  className="bg-slate-900 border-slate-700 text-xs py-1 px-2 h-7 w-full rounded-md" 
                />
                <label className="text-[11px] text-slate-400 whitespace-nowrap">Color</label>
                <input 
                  type="color" 
                  className="w-10 h-7 border-none cursor-pointer bg-transparent p-0 flex-shrink-0" 
                  ref={catColorRef} 
                  defaultValue="#22c55e"
                />
                <button
                  type="button"
                  onClick={addIncomeCategoryHandler}
                  className="btn btn-primary-outline text-[11px] px-2.5 h-7 flex items-center justify-center flex-shrink-0"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCategoryForm(false)}
                  className="btn btn-danger text-[11px] px-2.5 h-7 flex items-center justify-center flex-shrink-0"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Grid Item Pilihan Kategori */}
            <div className="max-h-[150px] overflow-y-auto pr-1 grid grid-cols-2 gap-2 w-full custom-scrollbar">
              {incomeCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className="w-full text-left block focus:outline-none"
                >
                  <div
                    style={{
                      boxShadow: cat.id === selectedCategory ? "0px 0px 8px #a3e635" : "none",
                      border: cat.id === selectedCategory ? "1px solid #a3e635" : "1px solid transparent",
                    }}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-xl transition-all hover:bg-slate-700"
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-xs font-medium truncate text-slate-200">{cat.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
    
        <button type="submit" className="btn btn-primary mt-2">
          Add Entry
        </button>
      </form>
    
      {/* Container History Pemasukan */}
      <div className="flex flex-col gap-4 mt-6 overflow-hidden flex-grow">
        <h3 className="text-xl font-bold flex-shrink-0">Income History</h3>
    
        <div className="max-h-[200px] overflow-y-auto pr-2 flex flex-col gap-3 custom-scrollbar
          [&::-webkit-scrollbar]:w-2
          [&::-webkit-scrollbar-track]:bg-slate-800
          [&::-webkit-scrollbar-thumb]:bg-slate-600
          [&::-webkit-scrollbar-thumb]:rounded-full">
          {income.map((i) => {
            return (
              <div className="flex justify-between items-center p-2.5 bg-slate-800/20 rounded-xl border border-slate-800/60" key={i.id}>
                <div className="flex items-start gap-2.5 min-w-0">
                  {/* Indicator Badge Kategori yang Disimpan */}
                  <div 
                    className="w-1.5 h-8 rounded-full flex-shrink-0 mt-0.5" 
                    style={{ backgroundColor: i.categoryColor || "#64748b" }}
                  />
                  <div className="truncate">
                    <p className="font-semibold text-sm text-slate-100 truncate">{i.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                        {i.category || "Uncategorized"}
                      </span>
                      <small className="text-[11px] text-slate-400">
                        {(i.CreatedAt?.toMillis 
                          ? new Date(i.CreatedAt.toMillis()) 
                          : new Date(i.CreatedAt)
                        ).toLocaleString('id-ID', {
                          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </small>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <span className="text-sm font-semibold text-green-400">{currencyFormatter(i.amount)}</span>
                  <button
                    type="button"
                    className="text-slate-500 hover:text-red-500 transition-colors p-1"
                    onClick={() => {
                      deleteIncomeEntryHandler(i.id);
                    }}
                  >
                    <FaRegTrashAlt size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}

export default AddIncomeModal;