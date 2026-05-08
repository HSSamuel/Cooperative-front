import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "@/lib/axios";

// 🚀 FIX: Define the explicit shape of the state so TypeScript knows cooperatorId exists
interface Cooperator {
  dateJoined?: string;
  createdAt?: string;
  [key: string]: any;
}

interface AccountState {
  totalSavings: number;
  availableCreditLimit: number;
  customMonthlySavings: number;
  cooperatorId?: Cooperator;
}

interface FinanceState {
  account: AccountState;
  loans: any[];
  transactions: any[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: FinanceState = {
  account: {
    totalSavings: 0,
    availableCreditLimit: 0,
    customMonthlySavings: 0,
  },
  loans: [],
  transactions: [],
  status: "idle",
  error: null,
};

// Async Thunk to fetch all financial data concurrently
export const fetchFinancialData = createAsyncThunk(
  "finance/fetchData",
  async (_, { rejectWithValue }) => {
    try {
      const [accountRes, loansRes, txnRes] = await Promise.all([
        apiClient.get("/account/my-account"),
        apiClient.get("/loans/my-loans"),
        apiClient.get("/account/transactions?limit=50"), // Added limit
      ]);

      return {
        account: accountRes.data,
        loans: loansRes.data,
        transactions: txnRes.data,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch data",
      );
    }
  },
);

const financeSlice = createSlice({
  name: "finance",
  initialState,
  reducers: {
    // Allows us to clear data on logout
    clearFinanceData: (state) => {
      state.account = {
        totalSavings: 0,
        availableCreditLimit: 0,
        customMonthlySavings: 0,
      };
      state.loans = [];
      state.transactions = [];
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFinancialData.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchFinancialData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.account = action.payload.account;
        state.loans = action.payload.loans;
        state.transactions = action.payload.transactions;
      })
      .addCase(fetchFinancialData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { clearFinanceData } = financeSlice.actions;
export default financeSlice.reducer;