import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "@/lib/axios";

// Async Thunk to fetch all financial data concurrently
export const fetchFinancialData = createAsyncThunk(
  "finance/fetchData",
  async (_, { rejectWithValue }) => {
    try {
      const [accountRes, loansRes, txnRes] = await Promise.all([
        apiClient.get("/account/my-account"),
        apiClient.get("/loans/my-loans"),
        apiClient.get("/account/transactions"),
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
  initialState: {
    account: {
      totalSavings: 0,
      availableCreditLimit: 0,
      customMonthlySavings: 0,
    },
    loans: [],
    transactions: [],
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null as string | null,
  },
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
