import { useRef, useEffect, useContext } from "react";
import { currencyFormatter } from "@/library/utils";

import { financeContext } from "@/library/store/financeContext";
import { authContext } from "@/library/store/authContext";
import {toast} from "react-toastify"
// Icons
import { FaRegTrashAlt } from "react-icons/fa";

import Modal from "@/components/organism/modal";

function AddIncomeModal({ show, onClose }) {
  const amountRef = useRef();
  const descriptionRef = useRef();
  const { income, addIncomeItem, removeIncomeItem } =
    useContext(financeContext);

  const {user} = useContext(authContext);
  // Handler Functions
  const addIncomeHandler = async (e) => {
    e.preventDefault();

    const newIncome = {
      amount: +amountRef.current.value,
      description: descriptionRef.current.value,
      CreatedAt: new Date(),
      uid : user.uid
    };

    try {
      await addIncomeItem(newIncome);
      descriptionRef.current.value = "";
      amountRef.current.value = "";
      toast.success("data income berhasil ditambahkan")
    } catch (error) {
      console.log(error.message);
      toast.error(error.message)
    }
  };

  const deleteIncomeEntryHandler = async (incomeId) => {
    try {
      await removeIncomeItem(incomeId);
      toast.success("data income berhasil dihapus")
    } catch (error) {
      console.log(error.message);
      toast.error(error.message)
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
          ref={amountRef}
          min={0.01}
          step={0.01}
          placeholder="Enter income amount" required
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
  
      <div className="input-group">
        <label htmlFor="description">Description</label>
        <input
          name="description"
          ref={descriptionRef}
          type="text"
          placeholder="Enter income description"
          required
        />
      </div>
  
      <button type="submit" className="btn btn-primary">
        Add entry
      </button>
    </form>
  
    {/* Menggunakan flex-grow dan overflow-hidden agar membentengi bagian bawah */}
    <div className="flex flex-col gap-4 mt-6 overflow-hidden flex-grow">
      <h3 className="text-2xl font-bold flex-shrink-0">Income History</h3>
  
      {/* PERBAIKAN UTAMA: Scroll hanya dikunci di dalam container ini saja (Maksimal 3 Baris) */}
      <div className="max-h-[230px] overflow-y-auto pr-2 flex flex-col gap-4 custom-scrollbar [&::-webkit-scrollbar]:w-2
  [&::-webkit-scrollbar-track]:bg-slate-800
  [&::-webkit-scrollbar-thumb]:bg-slate-600
  [&::-webkit-scrollbar-thumb]:rounded-full
  [scrollbar-color:#475569_#1e293b] [scrollbar-width:thin]">
        {income.map((i) => {
          return (
            <div className="flex justify-between items-center" key={i.id}>
              <div>
                <p className="font-semibold">{i.description}</p>
                <small className="text-xs text-slate-400">
                  {(i.CreatedAt?.toMillis 
                    ? new Date(i.CreatedAt.toMillis()) 
                    : new Date(i.CreatedAt)
                  ).toLocaleString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                  })}
                </small>
              </div>
              <div className="flex items-center gap-2">
                <span>{currencyFormatter(i.amount)}</span>
                <button
                  className="text-slate-400 hover:text-red-500 transition-colors"
                  onClick={() => {
                    deleteIncomeEntryHandler(i.id);
                  }}
                >
                  <FaRegTrashAlt />
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
