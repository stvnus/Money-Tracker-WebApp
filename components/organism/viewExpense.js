import { useContext, useState } from "react";
import { financeContext } from "@/library/store/financeContext";

import Modal from "@/components/organism/modal";
import { currencyFormatter } from "@/library/utils";
import { toast } from "react-toastify";
import { FaRegTrashAlt, FaPencilAlt, FaCheck, FaTimes } from "react-icons/fa";

function ViewExpenseModal({ show, onClose, expense }) {
  // Ambil deleteExpenseItem dari context (kita gunakan fungsi yang sama untuk meng-update array items)
  const { deleteExpenseItem, deleteExpenseCategory } = useContext(financeContext);

  // State untuk menyimpan ID item yang sedang di-edit dan teks deskripsi barunya
  const [editingItemId, setEditingItemId] = useState(null);
  const [editDescriptionValue, setEditDescriptionValue] = useState("");

  const deleteExpenseHandler = async () => {
    try {
      await deleteExpenseCategory(expense.id);
      toast.success("Kategori expense berhasil dihapus");
    } catch (error) {
      console.log(error.message);
      toast.error(error.message);
    }
  };

  const deleteExpenseItemHandler = async (item) => {
    try {
      const updatedItems = expense.items.filter((i) => i.id !== item.id);

      const updatedExpense = {
        ...expense, // Mempertahankan warna dan title kategori
        items: [...updatedItems],
        total: expense.total - item.amount,
      };

      await deleteExpenseItem(updatedExpense, expense.id);
      toast.success("Item pengeluaran berhasil dihapus");
    } catch (error) {
      console.log(error.message);
      toast.error(error.message);
    }
  };

  // Fungsi untuk meng-update deskripsi item pengeluaran
  const updateExpenseDescriptionHandler = async (item) => {
    if (!editDescriptionValue.trim()) {
      toast.warning("Deskripsi tidak boleh kosong");
      return;
    }

    try {
      const updatedItems = expense.items.map((i) => {
        if (i.id === item.id) {
          return { ...i, description: editDescriptionValue };
        }
        return i;
      });

      const updatedExpense = {
        ...expense,
        items: updatedItems,
      };

      await deleteExpenseItem(updatedExpense, expense.id);
      toast.success("Deskripsi pengeluaran berhasil diperbarui");
      setEditingItemId(null);
    } catch (error) {
      console.log(error.message);
      toast.error(error.message);
    }
  };

  return (
    <Modal show={show} onClose={onClose}>
      <div className="flex items-center justify-between">
        <h2 className="text-4xl capitalize text-slate-100">{expense.title}</h2>
        <button className="btn btn-danger" onClick={deleteExpenseHandler}>
          Delete Cat
        </button>
      </div>

      <div className="mt-6">
        <h3 className="my-4 text-2xl border-b border-slate-700 pb-2 text-slate-100">Expense History</h3>

        <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-1">
          {expense.items.map((item) => {
            const isEditing = editingItemId === item.id;

            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-700/50"
              >
                {/* SISI KIRI: Deskripsi & Tanggal */}
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  {isEditing ? (
                    <div className="flex items-center gap-2 w-full pr-4">
                      <input
                        type="text"
                        value={editDescriptionValue}
                        onChange={(e) => setEditDescriptionValue(e.target.value)}
                        className="bg-slate-900 border border-slate-600 text-xs py-1 px-2 h-8 w-full rounded-md text-slate-100 focus:outline-none focus:border-lime-400"
                        placeholder="Ubah deskripsi..."
                        onKeyDown={(e) => {
                          if (e.key === "Enter") updateExpenseDescriptionHandler(item);
                          if (e.key === "Escape") setEditingItemId(null);
                        }}
                        autoFocus
                      />
                      <button
                        onClick={() => updateExpenseDescriptionHandler(item)}
                        className="text-lime-400 hover:text-lime-300 p-1 bg-slate-900 rounded-md border border-slate-700 h-8 w-8 flex items-center justify-center flex-shrink-0"
                      >
                        <FaCheck size={12} />
                      </button>
                      <button
                        onClick={() => setEditingItemId(null)}
                        className="text-red-400 hover:text-red-300 p-1 bg-slate-900 rounded-md border border-slate-700 h-8 w-8 flex items-center justify-center flex-shrink-0"
                      >
                        <FaTimes size={12} />
                      </button>
                    </div>
                  ) : (
                    <div
                      className="flex items-center gap-2 group cursor-pointer"
                      onClick={() => {
                        setEditingItemId(item.id);
                        setEditDescriptionValue(item.description || "");
                      }}
                    >
                      {/* Format font disamakan menjadi font-medium, text-slate-100, dan text-base */}
                      <p className="font-medium text-slate-100 capitalize truncate text-base hover:text-lime-400 transition-colors">
                        {item.description || "No Description"}
                      </p>
                      <FaPencilAlt
                        size={11}
                        className="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                  )}

                  <small className="text-xs text-slate-400">
                    {(item.CreatedAt?.toMillis
                      ? new Date(item.CreatedAt.toMillis())
                      : new Date(item.CreatedAt)
                    ).toLocaleString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </small>
                </div>

                {/* SISI KANAN: Jumlah Nominal & Tombol Trash */}
                <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                  {/* Format font disesuaikan menjadi font-semibold dan text-slate-200 */}
                  <span className="font-semibold text-slate-200">
                    {currencyFormatter(item.amount)}
                  </span>
                  {!isEditing && (
                    <button
                      onClick={() => {
                        deleteExpenseItemHandler(item);
                      }}
                      className="text-slate-400 hover:text-red-400 transition-colors p-1"
                    >
                      <FaRegTrashAlt size={16} />
                    </button>
                  )}
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