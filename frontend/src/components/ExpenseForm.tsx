'use client';

import { useState, useEffect } from 'react';

import { API_URL } from '@/lib/api';

interface Person {
  id: string;
  name: string;
}

interface MainCategory {
  id: string;
  name: string;
  subCategories: SubCategory[];
}

interface SubCategory {
  id: string;
  name: string;
}

interface ExpenseFormProps {
  groupId: string;
  persons: Person[];
  onExpenseAdded: () => void;
}

export default function ExpenseForm({ groupId, persons, onExpenseAdded }: ExpenseFormProps) {
  const [mainCategories, setMainCategories] = useState<MainCategory[]>([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState<string>('');
  const [date, setDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  });
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCategories();
    if (persons.length > 0) {
      setPaidBy(persons[0].id);
    }
  }, [groupId, persons]);

  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories/main/${groupId}`);
      if (!response.ok) throw new Error('Failed to load categories');
      const data = await response.json();
      setMainCategories(data);
      if (data.length > 0) {
        setSelectedMainCategory(data[0].id);
        if (data[0].subCategories.length > 0) {
          setSelectedSubCategory(data[0].subCategories[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!selectedSubCategory || !amount || !paidBy || !date) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          subCategoryId: selectedSubCategory,
          paidBy,
          groupId,
          date,
          note: note.trim() || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create expense');
      }

      // Reset form
      setAmount('');
      setNote('');
      setDate(new Date().toISOString().split('T')[0]);
      if (mainCategories.length > 0 && mainCategories[0].subCategories.length > 0) {
        setSelectedSubCategory(mainCategories[0].subCategories[0].id);
      }

      onExpenseAdded();
    } catch (err) {
      setError('Failed to add expense. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectedMainCat = mainCategories.find((cat) => cat.id === selectedMainCategory);
  const availableSubCategories = selectedMainCat?.subCategories || [];

  return (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Add Expense</h2>

      {error && (
        <div style={{
          padding: '0.75rem',
          backgroundColor: 'var(--danger-bg)',
          color: 'var(--danger)',
          borderRadius: '0.5rem',
          marginBottom: '1rem',
          fontSize: '0.875rem',
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="mainCategory">
            Main Category
          </label>
          <select
            id="mainCategory"
            className="form-select"
            value={selectedMainCategory}
            onChange={(e) => {
              setSelectedMainCategory(e.target.value);
              const cat = mainCategories.find((c) => c.id === e.target.value);
              if (cat && cat.subCategories.length > 0) {
                setSelectedSubCategory(cat.subCategories[0].id);
              }
            }}
            required
          >
            {mainCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="subCategory">
            Subcategory
          </label>
          <select
            id="subCategory"
            className="form-select"
            value={selectedSubCategory}
            onChange={(e) => setSelectedSubCategory(e.target.value)}
            required
          >
            {availableSubCategories.map((subCat) => (
              <option key={subCat.id} value={subCat.id}>
                {subCat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="amount">
            Amount ($)
          </label>
          <input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            className="form-input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            inputMode="decimal"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="paidBy">
            Paid By
          </label>
          <select
            id="paidBy"
            className="form-select"
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            required
          >
            {persons.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="date">
            Date
          </label>
          <input
            id="date"
            type="date"
            className="form-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="note">
            Note (Optional)
          </label>
          <textarea
            id="note"
            className="form-textarea"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note..."
            rows={2}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <span className="spinner" /> : 'Add Expense'}
        </button>
      </form>
    </div>
  );
}


