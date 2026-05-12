export const formatNaira = (koboAmount: number) => {
  return new Intl.NumberFormat("en-NG", { minimumFractionDigits: 2 }).format(
    koboAmount / 100,
  );
};

export const getStatusBadge = (status: string) => {
  if (status === "APPROVED")
    return (
      <span className="text-emerald-500 font-bold text-xs uppercase">
        Active
      </span>
    );
  if (status === "REPAID")
    return (
      <span className="text-slate-500 font-bold text-xs uppercase">Repaid</span>
    );
  if (status === "REJECTED")
    return (
      <span className="text-red-500 font-bold text-xs uppercase">Rejected</span>
    );
  return (
    <span className="text-amber-500 font-bold text-xs uppercase">Pending</span>
  );
};
