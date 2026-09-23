import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { X, Tag, Plus } from 'lucide-react';

export default function AddCategoryModal() {
  const {
    isAddCategoryOpen = false,
    setIsAddCategoryOpen = () => {},
    addCategory = () => {}
  } = useProject() || {};

  const [categoryName, setCategoryName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#10b981');

  if (!isAddCategoryOpen) return null;

  const colorPalette = [
    '#10b981', // emerald
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#f59e0b', // amber
    '#06b6d4', // cyan
    '#f97316', // orange
    '#14b8a6', // teal
    '#6366f1', // indigo
    '#84cc16'  // lime
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!categoryName?.trim()) {
      alert('Please enter a category name.');
      return;
    }
    addCategory?.({ name: categoryName.trim(), color: selectedColor });
    setCategoryName('');
    setIsAddCategoryOpen?.(false);
  };

  return (
    <div
      onClick={() => setIsAddCategoryOpen?.(false)}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e?.stopPropagation?.()}
        className="relative max-w-md w-full bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl p-6 text-slate-100 space-y-4"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Tag className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Add New Programme Category</h3>
          </div>
          <button
            onClick={() => setIsAddCategoryOpen?.(false)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Category Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Minor Irrigation Works, Sanitation..."
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              Category Theme Color
            </label>
            <div className="flex items-center space-x-2">
              {colorPalette.map(col => (
                <button
                  type="button"
                  key={col}
                  onClick={() => setSelectedColor(col)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    selectedColor === col ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: col }}
                />
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsAddCategoryOpen?.(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
            >
              <Plus className="w-4 h-4" />
              <span>Save Category</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
