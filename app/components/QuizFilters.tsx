'use client';

import { useState } from 'react';

interface QuizFiltersProps {
  onFilterChange: (filters: {
    category: string;
    search: string;
    sortBy: string;
  }) => void;
}

export default function QuizFilters({ onFilterChange }: QuizFiltersProps) {
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const categories = ['All', 'General', 'Technology', 'History', 'Science'];

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    onFilterChange({ category: newCategory, search, sortBy });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearch = event.target.value;
    setSearch(newSearch);
    onFilterChange({ category, search: newSearch, sortBy });
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSortBy = event.target.value;
    setSortBy(newSortBy);
    onFilterChange({ category, search, sortBy: newSortBy });
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex space-x-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-2 rounded-lg ${
                category === cat
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search quizzes..."
            value={search}
            onChange={handleSearchChange}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <select
            value={sortBy}
            onChange={handleSortChange}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="points">Highest Points</option>
          </select>
        </div>
      </div>
    </div>
  );
} 