import { useState } from "react";
import { currencyFormatter } from "@/library/utils";
import ViewIncomeModal from "@/components/organism/viewIncome"; // Dibuat pada Langkah 2

function IncomeCategoryItem({ incGroup }) {
  const [showViewIncomeModal, setShowViewIncomeModal] = useState(false);

  return (
    <>
      <ViewIncomeModal
        show={showViewIncomeModal}
        onClose={setShowViewIncomeModal}
        incomeGroup={incGroup}
      />
      <button
        className="w-full text-left block focus:outline-none"
        onClick={() => {
          setShowViewIncomeModal(true);
        }}
      >
        <div className="flex items-center justify-between px-4 py-4 bg-slate-700 rounded-3xl transition-all hover:bg-slate-600/50">
          <div className="flex items-center gap-2">
            <div
              className="w-[25px] h-[25px] rounded-full flex-shrink-0"
              style={{ backgroundColor: incGroup.color }}
            />
            <h4 className="capitalize font-normal text-slate-100">{incGroup.title}</h4>
          </div>
          <p className="font-semibold">
            {currencyFormatter(incGroup.total)}
          </p>
        </div>
      </button>
    </>
  );
}

export default IncomeCategoryItem;