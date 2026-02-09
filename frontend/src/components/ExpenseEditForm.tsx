'use client';

import { useState, useEffect } from 'react';

import { API_URL } from '@/lib/api';

interface Person {
  id: string;
  name: string;
}

interface Expense {
  id: string;
  amount: number;
  date: string;
  note?: string;
  paidBy: string;
  subCategory: {
    id: string;
    name: string;
    mainCategory: {
      id: string;
      name: string;
    };
  };
}

interface ExpenseEditFormProps {
  expense: Expense;
  persons: Person[];
  groupId: string;
  onCancel: () => void;
  onSaved: () => void;
}

export default function ExpenseEditForm({
  expense,
  persons,
  groupId,
  onCancel,
  onSaved,
}: ExpenseEditFormProps) {
  const [mainCategories, setMainCategories] = useState<any[]>([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>(expense.subCategory.id);
  const [amount, setAmount] = useState(expense.amount.toString());
  const [paidBy, setPaidBy] = useState(expense.paidBy);
  const [date, setDate] = useState(expense.date);
  const [note, setNote] = useState(expense.note || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCategories();
  }, [groupId]);

  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories/main/${groupId}`);
      if (!response.ok) throw new Error('Failed to load categories');
      const data = await response.json();
      setMainCategories(data);
      
      // Find the main category for current subcategory
      const mainCat = data.find((cat: any) =>
        cat.subCategories.some((sub: any) => sub.id === expense.subCategory.id)
      );
      if (mainCat) {
        setSelectedMainCategory(mainCat.id);
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
      const response = await fetch(`${API_URL}/expenses/${expense.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          subCategoryId: selectedSubCategory,
          paidBy,
          date,
          note: note.trim() || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update expense');
      }

      onSaved();
    } catch (err) {
      setError('Failed to update expense. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectedMainCat = mainCategories.find((cat) => cat.id === selectedMainCategory);
  const availableSubCategories = selectedMainCat?.subCategories || [];

  return (
    <form onSubmit={handleSubmit}>
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

      <div className="form-group">
        <label className="form-label" htmlFor="edit-mainCategory">
          Main Category
        </label>
        <select
          id="edit-mainCategory"
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
        <label className="form-label" htmlFor="edit-subCategory">
          Subcategory
        </label>
        <select
          id="edit-subCategory"
          className="form-select"
          value={selectedSubCategory}
          onChange={(e) => setSelectedSubCategory(e.target.value)}
          required
        >
          {availableSubCategories.map((subCat: any) => (
            <option key={subCat.id} value={subCat.id}>
              {subCat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="edit-amount">
          Amount ($)
        </label>
        <input
          id="edit-amount"
          type="number"
          step="0.01"
          min="0"
          className="form-input"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="edit-paidBy">
          Paid By
        </label>
        <select
          id="edit-paidBy"
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
        <label className="form-label" htmlFor="edit-date">
          Date
        </label>
        <input
          id="edit-date"
          type="date"
          className="form-input"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="edit-note">
          Note (Optional)
        </label>
        <textarea
          id="edit-note"
          className="form-textarea"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button type="button" onClick={onCancel} className="btn btn-secondary" style={{ flex: 1 }}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
}


