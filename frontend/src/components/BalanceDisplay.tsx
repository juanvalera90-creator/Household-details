'use client';

import { formatCurrency } from '@/lib/format';

interface BalanceDisplayProps {
  balances: {
    person1: { id: string; name: string; balance: number };
    person2: { id: string; name: string; balance: number };
  };
  /** Optional title. Default: "Current Balance" */
  title?: string;
}

export default function BalanceDisplay({ balances, title = 'Current Balance' }: BalanceDisplayProps) {
  const { person1, person2 } = balances;

  // Determine who owes whom
  const getBalanceText = () => {
    if (person1.balance > 0 && person2.balance < 0) {
      // Person1 is owed, Person2 owes
      return `${person2.name} owes $${formatCurrency(Math.abs(person2.balance))} to ${person1.name}`;
    } else if (person2.balance > 0 && person1.balance < 0) {
      // Person2 is owed, Person1 owes
      return `${person1.name} owes $${formatCurrency(Math.abs(person1.balance))} to ${person2.name}`;
    } else {
      // Balanced
      return 'All expenses are balanced';
    }
  };

  return (
    <div className="card" style={{ marginBottom: '1.5rem', backgroundColor: 'var(--primary-light)', border: '1px solid var(--primary-border)' }}>
      <h2 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>{title}</h2>
      
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span>{person1.name}:</span>
          <span style={{ fontWeight: 600, color: person1.balance >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            {person1.balance >= 0 ? '+' : ''}${formatCurrency(person1.balance)}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>{person2.name}:</span>
          <span style={{ fontWeight: 600, color: person2.balance >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            {person2.balance >= 0 ? '+' : ''}${formatCurrency(person2.balance)}
          </span>
        </div>
      </div>

      <div style={{
        padding: '0.75rem',
        backgroundColor: 'var(--card-bg)',
        borderRadius: '0.5rem',
        fontSize: '0.875rem',
        fontWeight: 500,
        textAlign: 'center',
      }}>
        {getBalanceText()}
      </div>
    </div>
  );
}


