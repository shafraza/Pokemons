"use client";

import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Pokemon } from '~/types';

interface FiltersContextProps {
  searchTerm: string;  // The current search term for filtering Pokémon
  setSearchTerm: (term: string) => void;  // Function to update the search term
  filterType: string;  // The current Pokémon type filter
  setFilterType: (type: string) => void;  // Function to update the Pokémon type filter
  filterGeneration: string;  // The current Pokémon generation filter
  setFilterGeneration: (generation: string) => void;  // Function to update the Pokémon generation filter
  totalFetchedPokemons: number;  // Total number of Pokémon fetched
  setTotalFetchedPokemons: (count: number) => void;  // Function to update the total fetched Pokémon count
  allPokemons: Pokemon[];  // Array of all fetched Pokémon
  setAllPokemons: (pokemons: Pokemon[]) => void;  // Function to update the array of all Pokémon
  offset: number; 
  setOffset: (count: number) => void; 
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
  // State for managing the total number of Pokémon fetched
  const [totalFetchedPokemons, setTotalFetchedPokemons] = useState<number>(0);
  // State for managing the array of all Pokémon
  const [allPokemons, setAllPokemons] = useState<Pokemon[]>([]);

  const [offset, setOffset] = useState<number>(0);
  
  return (
    <FiltersContext.Provider
      value={{ searchTerm, 
        setSearchTerm, filterType, 
        setFilterType, filterGeneration, 
        setFilterGeneration, totalFetchedPokemons, 
        setTotalFetchedPokemons, allPokemons, 
        setAllPokemons, offset, setOffset
      }}
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
