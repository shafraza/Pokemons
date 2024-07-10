"use client";

import React, { useState } from 'react';
import PokemonCard from "~/app/_components/PokemonCard";
import { api } from "~/trpc/react";
import { useFilters } from '~/context/FiltersContext';
import type { Pokemon } from '~/types';

const PokemonList: React.FC = () => {
  // Destructure filter and search state from the context
  const { searchTerm, setSearchTerm, filterType, setFilterType, filterGeneration, setFilterGeneration } = useFilters();
  const [currentPage, setCurrentPage] = useState<number>(1);

  const limit = 18; // Number of Pokémon displayed per page

  // Fetch Pokémon data and available types/generations
  const { data: pokemonsResult, isLoading: isPokemonsLoading, isError: isPokemonsError, error: pokemonsError } = api.pokemon.getPokemons.useQuery();
  const { data: typesData } = api.pokemon.getAllTypes.useQuery();
  const { data: generationsData } = api.pokemon.getAllGenerations.useQuery();

  const types: string[] = typesData ?? [];
  const generations: string[] = generationsData ?? [];

  // Show a loading spinner while data is being fetched
  if (isPokemonsLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loader"></div>
      </div>
    );
  }
  
  // Show an error message if there was a problem fetching the data
  if (isPokemonsError) {
    return <div className="text-center text-red-600">Error fetching Pokémon: {pokemonsError.message}</div>;
  }

  const pokemons: Pokemon[] = pokemonsResult ?? []; // Default to an empty array if no data is available
  const filteredPokemons = applyFilters(pokemons); // Filter Pokémon based on search term and selected filters
  const totalPages = Math.ceil(filteredPokemons.length / limit); // Calculate the total number of pages
  const currentPokemons = filteredPokemons.slice((currentPage - 1) * limit, currentPage * limit); // Get Pokémon for the current page

  // Function to apply search term and filters to the Pokémon list
  function applyFilters(pokemons: Pokemon[] = []) {
    let filtered = pokemons;

    if (searchTerm) {
      filtered = filtered.filter((pokemon) =>
        pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType) {
      filtered = filtered.filter((pokemon) => pokemon.types?.includes(filterType));
    }

    if (filterGeneration) {
      filtered = filtered.filter((pokemon) => pokemon.generation === filterGeneration);
    }
    return filtered;
  }

  // Handler for search term changes
  const handleSearchTermChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value.toLowerCase());
    setCurrentPage(1); // Reset to the first page when the search term changes
  };

  // Handler for changing Pokémon type filter
  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterType(event.target.value);
    setCurrentPage(1); // Reset to the first page when the filter changes
  };

  // Handler for changing Pokémon generation filter
  const handleGenerationChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterGeneration(event.target.value);
    setCurrentPage(1); // Reset to the first page when the filter changes
  };

  // Handler for changing the page
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="pokemon-list">
      {/* Filter Section */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search Pokémon..."
          value={searchTerm}
          onChange={handleSearchTermChange}
        />
        <select value={filterType} onChange={handleTypeChange}>
          <option value="">All Types</option>
          {types.map((type: string) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
        <select value={filterGeneration} onChange={handleGenerationChange}>
          <option value="">All Generations</option>
          {generations.map((generation: string) => (
            <option key={generation} value={generation}>
              {generation.charAt(0).toUpperCase() + generation.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Pokémon Cards Section */}
      <div className="pokemon-cards">
        {currentPokemons.map((pokemon) => (
          <PokemonCard
            key={pokemon.name}
            name={pokemon.name}
            url={pokemon.url}
            generation={pokemon.generation}
            types={pokemon.types}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="pagination">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1} // Disable the Previous button on the first page
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages} // Disable the Next button on the last page
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PokemonList;
