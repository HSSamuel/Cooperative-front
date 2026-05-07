import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async Thunk to fetch all financial data concurrently
export const fetchFinancialData = createAsyncThunk(
  "finance/fetchData",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("coop_token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [accountRes, loansRes, txnRes] = await Promise.all([
        axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/account/my-account`,
          config,
        ),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/loans/my-loans`, config),
        axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/account/transactions`,
          config,
        ),
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
