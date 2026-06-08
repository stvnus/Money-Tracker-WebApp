import { useContext } from "react";
import { financeContext } from "@/library/store/financeContext";

import Modal from "@/components/organism/modal";
import { currencyFormatter } from "@/library/utils";
import { toast } from "react-toastify";
import { FaRegTrashAlt } from "react-icons/fa";

function ViewExpenseModal({ show, onClose, expense }) {
  const { deleteExpenseItem, deleteExpenseCategory } =
    useContext(financeContext);

  const deleteExpenseHandler = async () => {
    try {
      await deleteExpenseCategory(expense.id);
      toast.success("kategori expense berhasil dihapus");
    } catch (error) {
      console.log(error.message);
      toast.error(error.message);
    }
  };

  const deleteExpenseItemHandler = async (item) => {
    try {
      //  Remove the item from the list
      const updatedItems = expense.items.filter((i) => i.id !== item.id);

      // Update the expense balance
      const updatedExpense = {
        items: [...updatedItems],
        total: expense.total - item.amount,
      };

      await deleteExpenseItem(updatedExpense, expense.id);
      toast.success("data expense berhasil dihapus");
    } catch (error) {
      console.log(error.message);
      toast.error(error.message);
    }
  };

  return (
    <Modal show={show} onClose={onClose}>
      <div className="flex items-center justify-between">
        <h2 className="text-4xl capitalize">{expense.title}</h2>
        <button onClick={deleteExpenseHandler} className="btn btn-danger">
          Delete
        </button>
      </div>

      <div className="mt-6">
        <h3 className="my-4 text-2xl border-b border-slate-700 pb-2">Expense History</h3>
        
        {/* Kontainer list history dengan scroll tipis jika terlalu panjang */}
        <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-1">
          {expense.items.map((item) => {
            return (
              <div key={item.id} className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
                
                {/* SISI KIRI: Deskripsi & Tanggal Menumpuk Rapi */}
                <div className="flex flex-col gap-1 min-w-0">
                  <p className="font-medium text-slate-100 capitalize truncate text-base">
                    {item.description || "No Description"} 
                  </p>
                  <small className="text-xs text-slate-400">
                    {(item.CreatedAt?.toMillis 
                      ? new Date(item.CreatedAt.toMillis()) 
                      : new Date(item.CreatedAt)
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

                {/* SISI KANAN: Jumlah Nominal & Tombol Trash */}
                <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                  <span className="font-semibold text-slate-200">
                    {currencyFormatter(item.amount)}
                  </span>
                  <button
                    onClick={() => {
                      deleteExpenseItemHandler(item);
                    }}
                    className="text-slate-400 hover:text-red-400 transition-colors p-1"
                  >
                    <FaRegTrashAlt size={16} />
                  </button>
                </div>

              </div>
            );
          })}
          
          {expense.items.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">Belum ada history pengeluaran.</p>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default ViewExpenseModal;