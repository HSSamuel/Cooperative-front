import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardClientLayout from "./DashboardClientLayout";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 🚀 FIX: Await the cookies() function
  const cookieStore = await cookies();
  const token = cookieStore.get("coop_token")?.value;

  if (!token) {
    redirect("/login");
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  try {
    // Fetch all the required data for Redux state securely on the server
    const [accountRes, loansRes, txnRes] = await Promise.all([
      fetch(`${apiUrl}/account/my-account`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }),
      fetch(`${apiUrl}/loans/my-loans`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }),
      fetch(`${apiUrl}/account/transactions?limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }),
    ]);

    if (!accountRes.ok) throw new Error("Unauthorized");

    const initialAccount = await accountRes.json();
    const initialLoans = await loansRes.json();
    const initialTransactions = await txnRes.json();

    return (
      <DashboardClientLayout
        initialAccount={initialAccount}
        initialLoans={initialLoans}
        initialTransactions={initialTransactions}
      >
        {children}
      </DashboardClientLayout>
    );
  } catch (error) {
    redirect("/login");
  }
}
