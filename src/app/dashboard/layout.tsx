import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardClientLayout from "./DashboardClientLayout";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("coop_token")?.value;

  if (!token) {
    redirect("/login");
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  let initialAccount, initialLoans, initialTransactions;
  let isMaintenance = false;
  let isUnauthorized = false;

  try {
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

    // 🚀 FIX: Avoid throwing errors inside the block. Check status carefully.
    if (accountRes.status === 503) {
      isMaintenance = true;
    } else if (!accountRes.ok) {
      isUnauthorized = true;
    } else {
      initialAccount = await accountRes.json();
      initialLoans = await loansRes.json();
      initialTransactions = await txnRes.json();
    }
  } catch (error) {
    isUnauthorized = true;
  }

  // 🚀 FIX: Safely trigger Next.js redirects OUTSIDE of try-catch blocks
  if (isMaintenance) {
    redirect("/login?clear=true&reason=maintenance");
  }
  if (isUnauthorized) {
    redirect("/login?clear=true");
  }

  return (
    <DashboardClientLayout
      initialAccount={initialAccount}
      initialLoans={initialLoans}
      initialTransactions={initialTransactions}
    >
      {children}
    </DashboardClientLayout>
  );
}
