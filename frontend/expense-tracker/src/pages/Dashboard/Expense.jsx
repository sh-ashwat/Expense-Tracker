import { useState, useEffect } from "react";
import { useUserAuth } from "../../hooks/useUserAuth";
import Dashboardlayout from "../../components/layouts/DashboardLayout";
import { API_PATHS } from "../../utils/apiPaths";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-hot-toast";
import ExpenseOverview from "../../components/Expense/ExpenseOverview";
import AddExpenseForm from "../../components/Expense/AddExpenseForm";
import Modal from "../../components/Modal";
import ExpenseList from "../../components/Expense/ExpenseList";
import DeleteAlert from "../../components/DeleteAlert";

const Expense = () => {
  useUserAuth();

  const [expenseData, setExpenseData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    show: false,
    data: null,
  });

  const [openAddExpenseModel, setOpenAddExpenseModel] = useState(false);

  // Get All Expense Details
  const fetchExpenseData = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const response = await axiosInstance.get(
        `${API_PATHS.EXPENSE.GET_ALL_EXPENSE}`
      );
      if (response.data) {
        setExpenseData(response.data);
      }
    } catch (error) {
      console.log("Something went wrong. Please try again.", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Add Expense
  const handleAddExpense = async (expense) => {
    const { category, amount, date, icon } = expense;

    // Validation Checks
    if (!category.trim()) {
      toast.error("Category is required.");
      return;
    }

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      toast.error("Amount should be a valid greater than 0.");
      return;
    }

    if (!date) {
      toast.error("Date is required.");
      return;
    }

    try {
      await axiosInstance.post(API_PATHS.EXPENSE.ADD_EXPENSE, {
        category,
        amount,
        date,
        icon,
      });
      setOpenAddExpenseModel(false);
      toast.success("Expense added successfully.");
      fetchExpenseData(); 
    } catch (error) {
      console.error(
        "Error adding expense:",
        error.response?.data?.message || error.message
      );
    }
  };


    // Delete Expense
    const deleteExpense = async (id) => {
      try {
        await axiosInstance.delete(API_PATHS.EXPENSE.DELETE_EXPENSE(id));
        
        setOpenDeleteAlert({ show: false, data: null });
        toast.success("Expense deleted successfully.");
        fetchExpenseDeta();
      } catch (error) {
        console.error(
          "Error deleting expense:",
          error.response?.data?.message || error.message
        );
        }
      
    };
  
  // Handle download Expense
// Handle download Expense
const handleDownloadExpenseDetails = async () => {
  try {
    const response = await axiosInstance.get(
      API_PATHS.EXPENSE.DOWNLOAD_EXPENSE, 
      {
        responseType: "blob",
      }
    );

    // Create a URL for the blob
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "expense-details.xlsx");
    document.body.appendChild(link); 
    link.click(); 
    link.remove(); 
    window.URL.revokeObjectURL(url); 
  } catch (error) {
    console.error("Error downloading expense details:", error);
    toast.error("Failed to download expense details.");
  }
};

  useEffect(() => {
    fetchExpenseData(); 
  }, []);

  return (
    <Dashboardlayout activeMenu="Expense">
      <div className="my-5 mx-auto">
        <div className="grid grid-cols-1  gap-6">
          <div className="">
            <ExpenseOverview
              transactions={expenseData}
              onExpenseIncome={() => setOpenAddExpenseModel(true)}
            />
          </div>
          <ExpenseList 
            transactions={expenseData}
            onDelete={(id) => {
              setOpenDeleteAlert({ show: true, data:id });
            }}
            onDownload={handleDownloadExpenseDetails}
            />
        </div>
        <Modal
          isOpen={openAddExpenseModel} 
          onClose={() => setOpenAddExpenseModel(false)}
          title="Add Expense"
        >
          <AddExpenseForm onAddExpense={handleAddExpense} />
        </Modal>

        <Modal
        isOpen={openDeleteAlert.show}
        onClose={() => setOpenDeleteAlert({ show: false, data: null })}
        title="Delete Expense"
        >
          <DeleteAlert
          content="Are you sure you want to delete this expense?"
          onDelete={() => deleteExpense(openDeleteAlert.data)}
          />
        </Modal>
      </div>
    </Dashboardlayout>
  );
};

export default Expense;
