export const formatNaira = (koboAmount: number): string => {
  return new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(koboAmount / 100);
};

export const calculateLoanInterestKobo = (
  principalKobo: number,
  interestRatePercentage: number,
  tenureMonths: number,
): number => {
  const totalInterestRate = interestRatePercentage * (tenureMonths / 10);
  return Math.round(principalKobo * (totalInterestRate / 100));
};

export const calculateMonthlyDeductionKobo = (
  totalDueKobo: number,
  tenureMonths: number,
): number => {
  return totalDueKobo / tenureMonths;
};
