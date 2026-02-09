export interface SummaryData {
  month: string;
  totalSpending: number;
  person1: { id: string; name: string; totalPaid: number; balance: number };
  person2: { id: string; name: string; totalPaid: number; balance: number };
  mainCategoryTotals: { name: string; total: number }[];
  subCategoryTotals: { name: string; mainCategory: string; total: number }[];
}
