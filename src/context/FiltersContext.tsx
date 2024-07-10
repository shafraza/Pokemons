"use client";
import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface FiltersContextProps {
  searchTerm: string;  // The current search term for filtering Pokémon
  setSearchTerm: (term: string) => void;  // Function to update the search term
  filterType: string;  // The current Pokémon type filter
  setFilterType: (type: string) => void;  // Function to update the Pokémon type filter
  filterGeneration: string;  // The current Pokémon generation filter
  setFilterGeneration: (generation: string) => void;  // Function to update the Pokémon generation filter
}

// Create a Context for managing filter state
const FiltersContext = createContext<FiltersContextProps | undefined>(undefined);

export const FiltersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State for managing the search term
  const [searchTerm, setSearchTerm] = useState<string>('');
  // State for managing the Pokémon type filter
  const [filterType, setFilterType] = useState<string>('');
  // State for managing the Pokémon generation filter
  const [filterGeneration, setFilterGeneration] = useState<string>('');

  return (
    <FiltersContext.Provider
      value={{ searchTerm, setSearchTerm, filterType, setFilterType, filterGeneration, setFilterGeneration }}
    >
      {children}  {/* Provide the filter state and functions to the component tree */}
    </FiltersContext.Provider>
  );
};

export const useFilters = (): FiltersContextProps => {
  // Get the FiltersContext from the component tree
  const context = useContext(FiltersContext);
  if (context === undefined) {
    // Throw an error if useFilters is used outside of FiltersProvider
    throw new Error('useFilters must be used within a FiltersProvider');
  }
  return context;  // Return the context object for filter state management
};
