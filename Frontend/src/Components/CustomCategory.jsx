import React, { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import { getCategoryTheme } from '../Constant/categories';

const DEFAULT_CATEGORIES = [
  "Food",
  "Salary",
  "Movies",
  "Shopping",
  "Dress",
  "Games",
  "Parking",
  "Travel",
  "Service",
  "Investments"
];

const CustomCategory = ({ category, setCategory }) => {
  const [customCategories, setCustomCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('customCategories'));
      if (Array.isArray(stored)) {
        setCustomCategories(stored);
      }
    } catch (e) {
      console.error("Error reading custom categories:", e);
    }
  }, []);

  const handleAddCustomCategory = (e) => {
    if (e) e.preventDefault();
    const trimmed = newCategory.trim();
    if (!trimmed) return;

    const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();

    if (!DEFAULT_CATEGORIES.includes(formatted) && !customCategories.includes(formatted)) {
      const updated = [...customCategories, formatted];
      setCustomCategories(updated);
      try {
        localStorage.setItem('customCategories', JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
    }

    setCategory(formatted);
    setNewCategory('');
    setIsCreatingCustom(false);
  };

  const activeTheme = getCategoryTheme(category);

  return (
    <div className='flex flex-col gap-2'>
      <label className='text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider'>
        Category
      </label>

      <div className='flex items-center gap-2'>
        <div className='relative flex-1'>
          <select
            className='w-full p-2.5 pl-3 pr-8 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none transition-all'
            value={isCreatingCustom ? 'others' : category}
            onChange={(e) => {
              if (e.target.value === 'others') {
                setIsCreatingCustom(true);
              } else {
                setIsCreatingCustom(false);
                setCategory(e.target.value);
              }
            }}
          >
            <option value="" disabled>Select a Category</option>
            {DEFAULT_CATEGORIES.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
            {customCategories.length > 0 && (
              <optgroup label="Custom Categories">
                {customCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </optgroup>
            )}
            {category && !DEFAULT_CATEGORIES.includes(category) && !customCategories.includes(category) && (
              <optgroup label="Current category">
                <option value={category}>{category}</option>
              </optgroup>
            )}
            <option value="others">+ Create Custom Category</option>
          </select>
          <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400'>
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>

        {category && !isCreatingCustom && (
          <div 
            className='px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border'
            style={{ 
              backgroundColor: activeTheme.bgDark, 
              color: activeTheme.color,
              borderColor: activeTheme.border 
            }}
          >
            <span className='w-2 h-2 rounded-full' style={{ backgroundColor: activeTheme.color }} />
            {category}
          </div>
        )}
      </div>

      {isCreatingCustom && (
        <form onSubmit={handleAddCustomCategory} className='flex items-center gap-2 mt-1'>
          <input
            type='text'
            placeholder='Type custom category name...'
            value={newCategory}
            autoFocus
            onChange={(e) => setNewCategory(e.target.value)}
            className='flex-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-blue-500/60 text-slate-900 dark:text-white text-sm focus:outline-none'
          />
          <button
            type='submit'
            className='bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-xl text-sm font-semibold flex items-center gap-1 shadow-md transition-all cursor-pointer'
          >
            <FaPlus className='text-xs' /> Add
          </button>
          <button
            type='button'
            onClick={() => setIsCreatingCustom(false)}
            className='text-slate-400 hover:text-slate-700 dark:hover:text-white px-2 py-1 text-xs cursor-pointer'
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
};

export default CustomCategory;