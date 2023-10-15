import Modal from "@/app/components/organism/modal"
import { useState } from "react";
function AddExpenseModal({show, onClose}){
    const [expenseAmount, setExpenseAmount] = useState("")
   return(

    <Modal show={show} onClose={onClose}>
        <label>Enter a amount</label>
        <input 
        type="number"
        min={0.01}
        step={0.01}
        placeholder="Enter expense amount"
        value={expenseAmount}
        onChange={(e)=> {
            setExpenseAmount(e.target.value);
        }}
        />
    </Modal>
   );
}
export default AddExpenseModal;