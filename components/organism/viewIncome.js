import { useContext } from "react";
import { financeContext } from "@/library/store/financeContext";
import Modal from "@/components/organism/modal";
import { currencyFormatter } from "@/library/utils";
import { toast } from "react-toastify";
import { FaRegTrashAlt } from "react-icons/fa";

function ViewIncomeModal({ show, onClose, incomeGroup }) {
  const { removeIncomeItem } = useContext(financeContext);

  // UTILITY UNTUK PARSING TANGGAL
  const parseDate = (dateField) => {
    if (!dateField) return new Date();
    return dateField.toMillis ? new Date(dateField.toMillis()) : new Date(dateField);
  };

  const deleteIncomeItemHandler = async (incomeId) => {
    try {
      await removeIncomeItem(incomeId);
      toast.success("Item pemasukan berhasil dihapus");
    } catch (error) {
      console.log(error.message);
      toast.error(error.message);
    }
  };

  if (!incomeGroup) return null;

  // URUTKAN DAFTAR ITEM DARI YANG TERBARU KE TERLAMA (Descending)
  const sortedIncomeItems = [...(incomeGroup.items || [])].sort((a, b) => {
    const dateA = parseDate(a.CreatedAt);
    const dateB = parseDate(b.CreatedAt);
    return dateB - dateA; // Waktu terbaru akan memiliki timestamp lebih besar
  });

  return (
    <Modal show={show} onClose={onClose}>
      <div className="flex items-center justify-between">
        <h2 className="text-4xl capitalize text-slate-100">{incomeGroup.title}</h2>
      </div>

      <div className="mt-6">
        <h3 className="my-4 text-2xl border-b border-slate-700 pb-2 text-slate-100">
          Income History
        </h3>

        <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-1">
          {sortedIncomeItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-700/50"
            >
              <div className="flex flex-col gap-1 min-w-0 flex-1">
                <p className="font-medium text-slate-100 capitalize truncate text-base">
                  {item.description || "No Description"}
                </p>
                <small className="text-xs text-slate-400">
                  {parseDate(item.CreatedAt).toLocaleString("id-ID", {
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

              <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                <span className="font-semibold text-green-400">
                  {currencyFormatter(item.amount)}
                </span>
                <button
                  onClick={() => deleteIncomeItemHandler(item.id)}
                  className="text-slate-400 hover:text-red-400 transition-colors p-1"
                >
                  <FaRegTrashAlt size={16} />
                </button>
              </div>
            </div>
          ))}

          {sortedIncomeItems.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">
              Belum ada history pemasukan.
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default ViewIncomeModal;