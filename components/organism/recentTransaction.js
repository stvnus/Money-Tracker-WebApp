import { useState } from "react";
import { Clock, ArrowDownCircle, ArrowUpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { currencyFormatter } from "@/library/utils";

function RecentTransaction({ income = [], expenses = [], selectedMonth = "all", selectedYear = "all" }) {
  const [showAll, setShowAll] = useState(false);

  const parseDate = (dateField) => {
    if (!dateField) return new Date();
    return dateField.toMillis ? new Date(dateField.toMillis()) : new Date(dateField);
  };

  const allTransactions = [
    ...income.map((inc) => ({
      id: inc.id,
      type: "income",
      title: inc.category || "Pemasukan",
      description: inc.description || "Tanpa Deskripsi",
      amount: inc.amount,
      createdAt: parseDate(inc.CreatedAt),
    })),
    ...expenses.flatMap((cat) =>
      cat.items.map((item) => ({
        id: item.id,
        type: "expense",
        title: cat.title,
        description: item.description || "Tanpa Deskripsi",
        amount: item.amount,
        createdAt: parseDate(item.CreatedAt),
      }))
    ),
  ];

  const filteredTransactions = allTransactions.filter((item) => {
    const itemDate = item.createdAt;
    const matchMonth = selectedMonth === "all" || itemDate.getMonth() === parseInt(selectedMonth);
    const matchYear = selectedYear === "all" || itemDate.getFullYear().toString() === selectedYear;
    return matchMonth && matchYear;
  });

  const sortedTransactions = filteredTransactions.sort((a, b) => b.createdAt - a.createdAt);
  const displayedTransactions = showAll ? sortedTransactions : sortedTransactions.slice(0, 3);

  if (sortedTransactions.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-xs text-slate-400 italic">Belum ada riwayat transaksi pada periode ini.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header Transaksi */}
     

      {/* Item List Transaksi */}
      <div className="flex flex-col gap-2.5">
        {displayedTransactions.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between bg-slate-900/50 p-3 rounded-xl border border-slate-800/80 hover:border-slate-700/60 transition-all"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {item.type === "income" ? (
                <ArrowDownCircle className="text-emerald-400 flex-shrink-0" size={20} />
              ) : (
                <ArrowUpCircle className="text-rose-400 flex-shrink-0" size={20} />
              )}

              <div className="flex flex-col truncate">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-200 truncate">{item.title}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800/80 text-slate-400 border border-slate-700/50">
                    {item.type === "income" ? "Income" : "Expense"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{item.description}</p>
              </div>
            </div>

            <div className="flex flex-col items-end flex-shrink-0 ml-3">
              <span className={`text-xs font-bold ${item.type === "income" ? "text-emerald-400" : "text-rose-400"}`}>
                {item.type === "income" ? "+" : "-"}
                {currencyFormatter(item.amount)}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5">
                {item.createdAt.toLocaleString("id-ID", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Tombol Toggle "Lihat Semua" */}
      {sortedTransactions.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-3 pt-2.5 flex items-center justify-center gap-1 text-xs text-lime-400 hover:text-lime-300 transition-colors font-medium"
        >
          {showAll ? (
            <>
              <span>Sembunyikan</span>
              <ChevronUp size={14} />
            </>
          ) : (
            <>
              <span>Lihat Semua ({sortedTransactions.length - 3} lainnya)</span>
              <ChevronDown size={14} />
            </>
          )}
        </button>
      )}
    </div>
  );
}

export default RecentTransaction;