import { formatCurrency } from "@/lib/utils";

type SummaryCardProps = {
  title: string;
  amount: number;
  variant: "income" | "expenditure" | "net";
};

const variantStyles = {
  income: {
    bg: "bg-green-50 border-green-200",
    icon: "text-green-600 bg-green-100",
    amount: "text-green-700",
  },
  expenditure: {
    bg: "bg-red-50 border-red-200",
    icon: "text-red-600 bg-red-100",
    amount: "text-red-700",
  },
  net: {
    bg: "bg-blue-50 border-blue-200",
    icon: "text-blue-600 bg-blue-100",
    amount: "text-blue-700",
  },
};

const icons = {
  income: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
    </svg>
  ),
  expenditure: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
    </svg>
  ),
  net: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
};

export function SummaryCard({ title, amount, variant }: SummaryCardProps) {
  const styles = variantStyles[variant];

  return (
    <div className={`rounded-xl border p-6 shadow-sm ${styles.bg}`}>
      <div className="flex items-center gap-3">
        <div className={`rounded-lg p-2 ${styles.icon}`}>
          {icons[variant]}
        </div>
        <p className="text-sm font-medium text-stone-600">{title}</p>
      </div>
      <p className={`mt-3 text-2xl font-bold ${styles.amount}`}>
        {formatCurrency(amount)}
      </p>
    </div>
  );
}
