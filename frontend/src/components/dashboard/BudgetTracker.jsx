import React, { useEffect, useState } from 'react'
import { GlassCard } from '../ui/GlassCard'
import { useTripStore } from '../../store/useTripStore'
import { Wallet, Plus, Trash2, PieChart, Info, DollarSign } from 'lucide-react'

export default function BudgetTracker() {
  const {
    expenses,
    expenseSummary,
    fetchExpenses,
    fetchExpenseSummary,
    addExpense,
    deleteExpense
  } = useTripStore();

  const [budgetLimit, setBudgetLimit] = useState(() => {
    return parseInt(localStorage.getItem('trip_budget_limit')) || 25000;
  });

  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [cat, setCat] = useState('Food');
  const [paidBy, setPaidBy] = useState('Me');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchExpenses();
    fetchExpenseSummary();
  }, [fetchExpenses, fetchExpenseSummary]);

  const handleSaveBudget = (val) => {
    const num = Math.max(0, parseInt(val) || 0);
    setBudgetLimit(num);
    localStorage.setItem('trip_budget_limit', num.toString());
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!desc.trim() || !amount) return;

    setSubmitting(true);
    try {
      await addExpense({
        description: desc,
        amount: parseFloat(amount),
        category: cat,
        paidBy: paidBy,
        expenseDate: new Date().toISOString().split('T')[0]
      });
      setDesc('');
      setAmount('');
    } catch (err) {
      alert("Failed to add expense");
    } finally {
      setSubmitting(false);
    }
  };

  const totalSpent = expenseSummary?.totalSpent || 0;
  const remaining = Math.max(0, budgetLimit - totalSpent);
  const spentPercent = budgetLimit > 0 ? Math.min(100, Math.round((totalSpent / budgetLimit) * 100)) : 0;

  // SVG circular properties
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (spentPercent / 100) * circumference;

  const isGroup = expenseSummary?.travelMode === 'GROUP';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      
      {/* LEFT: Overview Ring & Add Expense */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Budget Circle Card */}
        <GlassCard className="p-5 flex items-center justify-between gap-4 bg-white/[0.04]">
          <div className="space-y-4 flex-1">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-white/40 uppercase tracking-wider block">Set Trip Budget limit (₹)</label>
              <input
                type="number"
                value={budgetLimit}
                onChange={(e) => handleSaveBudget(e.target.value)}
                className="w-full bg-transparent border-b border-white/10 focus:border-violet-500 py-1 text-lg font-black text-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[9px] font-bold text-white/40 uppercase tracking-wide">Total Spent</p>
                <p className="text-sm font-black text-red-400">₹{Math.round(totalSpent)}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-white/40 uppercase tracking-wide">Remaining</p>
                <p className="text-sm font-black text-emerald-400">₹{Math.round(remaining)}</p>
              </div>
            </div>

            {isGroup && (
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-white/60">
                <span className="flex items-center gap-1 font-bold">
                  <Info className="w-3 h-3 text-violet-400" />
                  <span>Split ({expenseSummary?.groupSize} Pax):</span>
                </span>
                <span className="font-black text-violet-300">₹{Math.round(expenseSummary?.perPersonSplit)} each</span>
              </div>
            )}
          </div>

          {/* SVG Progress Ring */}
          <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              {/* Back track */}
              <circle
                cx="56"
                cy="56"
                r={radius}
                className="stroke-white/5 fill-transparent"
                strokeWidth="8"
              />
              {/* Active fill */}
              <circle
                cx="56"
                cy="56"
                r={radius}
                className="stroke-violet-600 fill-transparent transition-all duration-500"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-base font-black text-white">{spentPercent}%</span>
              <span className="text-[8px] font-bold text-white/40 uppercase">Spent</span>
            </div>
          </div>
        </GlassCard>

        {/* Add Expense Form */}
        <GlassCard className="p-5 space-y-4 bg-white/[0.04]">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1">
            <Plus className="w-4 h-4 text-violet-400" />
            <span>Add Trip Expense</span>
          </h4>

          <form onSubmit={handleAddExpense} className="space-y-3">
            <div>
              <input
                type="text"
                required
                placeholder="Expense Description (e.g. Goa Dinner)"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full glass-input text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                required
                min="0"
                step="0.01"
                placeholder="Amount (₹)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full glass-input text-xs"
              />

              <select
                value={cat}
                onChange={(e) => setCat(e.target.value)}
                className="w-full glass-input text-xs bg-slate-900 text-white"
              >
                <option value="Food">🍲 Food & Dining</option>
                <option value="Transport">🚗 Travel & Transit</option>
                <option value="Stay">🏨 Hotel / Homestay</option>
                <option value="Entry">🎟️ Entry Ticket</option>
                <option value="Other">🪙 General Other</option>
              </select>
            </div>

            {isGroup && (
              <div>
                <input
                  type="text"
                  placeholder="Paid by (e.g. Aravind)"
                  value={paidBy}
                  onChange={(e) => setPaidBy(e.target.value)}
                  className="w-full glass-input text-xs"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-violet-650 hover:bg-violet-700 text-xs font-bold text-white shadow-md transition-all disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Log Expense"}
            </button>
          </form>
        </GlassCard>

      </div>

      {/* RIGHT: Expense Table & Category Breakdown */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Category breakdown progress bars */}
        <GlassCard className="p-5 space-y-4 bg-white/[0.04]">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <PieChart className="w-4 h-4 text-violet-400" />
            <span>Category Expenditure Analysis</span>
          </h4>

          <div className="space-y-3">
            {Object.keys(expenseSummary?.categoryBreakdown || {}).map((category) => {
              const amt = expenseSummary.categoryBreakdown[category];
              const pct = totalSpent > 0 ? Math.round((amt / totalSpent) * 100) : 0;
              return (
                <div key={category} className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-white/80">{category}</span>
                    <span className="text-white/50">₹{Math.round(amt)} ({pct}%)</span>
                  </div>
                  {/* Category Progress Bar */}
                  <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div 
                      className="h-full bg-violet-600 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Expense Log Listing */}
        <GlassCard className="p-5 bg-white/[0.04]">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
            Expense Logging Logs ({expenses.length})
          </h4>

          <div className="max-h-[220px] overflow-y-auto custom-scrollbar">
            {expenses.length === 0 ? (
              <p className="text-center py-10 text-xs text-white/35">No expenses logged for this trip yet.</p>
            ) : (
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-white/40 border-b border-white/5 text-[9px] uppercase tracking-wide">
                    <th className="pb-2">Description</th>
                    <th className="pb-2">Category</th>
                    {isGroup && <th className="pb-2">Paid By</th>}
                    <th className="pb-2 text-right">Amount</th>
                    <th className="pb-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {expenses.map((e) => (
                    <tr key={e.id} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 font-bold text-white max-w-[150px] truncate" title={e.description}>
                        {e.description}
                      </td>
                      <td className="py-2.5">
                        <span className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] text-white/60 font-semibold border border-white/5">
                          {e.category}
                        </span>
                      </td>
                      {isGroup && <td className="py-2.5 text-white/70 font-semibold">{e.paidBy || "Me"}</td>}
                      <td className="py-2.5 text-right font-black text-white">₹{e.amount}</td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => deleteExpense(e.id)}
                          className="w-7 h-7 rounded-lg bg-red-950/20 text-red-400 hover:bg-red-655 hover:text-white border border-red-900/30 flex items-center justify-center ml-auto transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </GlassCard>

      </div>

    </div>
  )
}
