'use client';

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

import { formatCurrency } from '@/lib/format';
import type { SummaryData } from '@/types/summary';

// Colors for charts
const CHART_COLORS = [
  '#2563eb', '#7c3aed', '#db2777', '#059669', '#d97706',
  '#dc2626', '#0891b2', '#4f46e5', '#ea580c', '#16a34a',
];

interface ExpenseChartsProps {
  groupId: string;
  persons: { id: string; name: string }[];
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  summary: SummaryData | null;
  summaryLoading: boolean;
  summaryError: string | null;
}

export default function ExpenseCharts({
  selectedMonth,
  onMonthChange,
  summary,
  summaryLoading,
  summaryError,
}: ExpenseChartsProps) {
  if (summaryLoading) {
    return (
      <div className="card" style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '2rem auto' }} />
        <p>Loading charts...</p>
      </div>
    );
  }

  if (summaryError) {
    return (
      <div className="card" style={{ border: '1px solid var(--danger)', backgroundColor: 'var(--danger-bg)' }}>
        <p style={{ color: 'var(--text-primary)' }}>{summaryError}</p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="card">
        <p>No data available{selectedMonth === 'all' ? '.' : ' for this month.'}</p>
      </div>
    );
  }

  const pieData = summary.mainCategoryTotals.map((cat, index) => ({
    name: cat.name,
    value: cat.total,
    fill: CHART_COLORS[index % CHART_COLORS.length],
  }));

  const barData = summary.mainCategoryTotals.map((cat, index) => ({
    name: cat.name.length > 12 ? cat.name.substring(0, 12) + '…' : cat.name,
    fullName: cat.name,
    amount: cat.total,
    fill: CHART_COLORS[index % CHART_COLORS.length],
  }));

  const personData = [
    { name: summary.person1.name, amount: summary.person1.totalPaid, fill: '#2563eb' },
    { name: summary.person2.name, amount: summary.person2.totalPaid, fill: '#7c3aed' },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const amount = data.value ?? data.amount;
      const name = data.fullName ?? data.name ?? payload[0].name;
      return (
        <div style={{
        backgroundColor: 'var(--card-bg)',
        padding: '0.5rem 0.75rem',
        border: '1px solid var(--border-color)',
          borderRadius: '0.5rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}>
          <div style={{ fontWeight: 600 }}>{name}</div>
          <div style={{ color: 'var(--primary)' }}>${formatCurrency(amount)}</div>
        </div>
      );
    }
    return null;
  };

  const isAllMonths = summary.month === 'all';
  const now = new Date();
  const currentMonthValue = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  return (
    <div>
      {/* Period Selector */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        {isAllMonths && (
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Showing all recorded expenses (all time).
          </p>
        )}
        <div className="form-group" style={{ marginBottom: selectedMonth !== 'all' ? '1rem' : 0 }}>
          <label className="form-label" htmlFor="charts-period">
            Period
          </label>
          <select
            id="charts-period"
            className="form-select"
            value={selectedMonth === 'all' ? 'all' : 'specific'}
            onChange={(e) => {
              if (e.target.value === 'all') {
                onMonthChange('all');
              } else {
                onMonthChange(selectedMonth === 'all' ? currentMonthValue : selectedMonth);
              }
            }}
          >
            <option value="all">All months</option>
            <option value="specific">Specific month</option>
          </select>
        </div>
        {selectedMonth !== 'all' && (
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="charts-month">
              Select Month
            </label>
            <input
              id="charts-month"
              type="month"
              className="form-input"
              value={selectedMonth}
              onChange={(e) => onMonthChange(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Total Spending */}
      <div className="card" style={{ marginBottom: '1.5rem', backgroundColor: 'var(--primary-light)', border: '1px solid var(--primary-border)' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
          {isAllMonths ? 'Total Spending (All Time)' : 'Total Spending'}
        </h2>
        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)' }}>
          ${formatCurrency(summary.totalSpending)}
        </div>
      </div>

      {/* Pie Chart - By Main Category */}
      {pieData.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Spending by Category</h2>
          <div style={{ width: '100%', height: 280, minHeight: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Bar Chart - By Main Category */}
      {barData.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Amount by Category</h2>
          <div style={{ width: '100%', height: 300, minHeight: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tickFormatter={(v) => `$${v.toLocaleString()}`} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="amount" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Bar Chart - Who Paid */}
      {personData.some((p) => p.amount > 0) && (
        <div className="card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Who Paid What</h2>
          <div style={{ width: '100%', height: 200, minHeight: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={personData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(v) => `$${v.toLocaleString()}`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="amount" name="Amount Paid" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {pieData.length === 0 && barData.length === 0 && (
        <div className="card">
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
            {isAllMonths ? 'No expenses recorded yet.' : 'No expenses in this month. Add some expenses to see charts.'}
          </p>
        </div>
      )}
    </div>
  );
}
