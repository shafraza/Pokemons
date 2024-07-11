"use client";

import React, { useEffect, useState } from 'react';
import PokemonCard from "~/app/_components/PokemonCard";
import { api } from "~/trpc/react";
import { useFilters } from '~/context/FiltersContext';
import type { Pokemon } from '~/types';

const PokemonList: React.FC = () => {
  const { 
    searchTerm, setSearchTerm, 
    filterType, setFilterType, 
    filterGeneration, setFilterGeneration, 
    totalFetchedPokemons, setTotalFetchedPokemons, 
    allPokemons, setAllPokemons,
    offset, setOffset
  } = useFilters();
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [allDataFetched, setAllDataFetched] = useState(false);

  const limit = 18; // Number of Pokémon displayed per page

  // Fetch Pokémon data and available types/generations
  const { data: initialPokemonsResult, isLoading: isPokemonsLoading, isError: isPokemonsError, error: pokemonsError } = api.pokemon.getInitialPokemons.useQuery(
    undefined,
    {
      enabled: allPokemons.length === 0, // Skip query if there are already fetched Pokémon
    }
  );

  const { data: typesData } = api.pokemon.getAllTypes.useQuery();
  const { data: generationsData } = api.pokemon.getAllGenerations.useQuery();

  useEffect(() => { 
    if (initialPokemonsResult) { 
        if(allPokemons.length === 0){
          setAllPokemons(initialPokemonsResult.pokemons);
          setTotalFetchedPokemons(initialPokemonsResult.pokemons.length); // Set the total fetched Pokémon count
        }
        setLoading(false);
        
    }
  }, [initialPokemonsResult]);

  
  const { data: remainingPokemonsResult, isLoading } = api.pokemon.getRemainingPokemons.useQuery(
    { nextOffset: offset },
    { enabled: !allDataFetched && allPokemons.length < 1302 } // Assuming 898 is the total number of Pokémon
  );

  useEffect(() => {
    if (remainingPokemonsResult?.pokemons) { 
      setAllPokemons((prev) => [...prev, ...remainingPokemonsResult.pokemons]);
      setTotalFetchedPokemons((prev) => prev + remainingPokemonsResult.pokemons.length); // Update the total fetched Pokémon count

      if (remainingPokemonsResult.pokemons.length < 100) {
        setAllDataFetched(true);
      } else {
        setOffset((prevOffset) => prevOffset + 100);
      }
    }
  }, [remainingPokemonsResult]);

  useEffect(() => {
    if (allPokemons.length === 0 && !allDataFetched) { 
      setOffset(100);
    }
  }, [allPokemons, allDataFetched]);

  if (loading || isPokemonsLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loader"></div>
      </div>
    );
  }

  if (isPokemonsError || error) {
    return <div className="text-center text-red-600">Error fetching Pokémon: {pokemonsError?.message || error}</div>;
  }

  const types: string[] = typesData ?? [];
  const generations: string[] = generationsData ?? [];

  const filteredPokemons = applyFilters(allPokemons);
  const totalPages = Math.ceil(filteredPokemons.length / limit);
  const currentPokemons = filteredPokemons.slice((currentPage - 1) * limit, currentPage * limit);

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

  const handleSearchTermChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value.toLowerCase());
    setCurrentPage(1);
  };

  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterType(event.target.value);
    setCurrentPage(1);
  };

  const handleGenerationChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterGeneration(event.target.value);
    setCurrentPage(1);
  };

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
      {currentPokemons.length? 
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
      : 
      <div className="flex items-center justify-center text-white">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[4rem]">
          404<span className="text-[hsl(280,100%,70%)]">:</span> Not Found.
        </h1>
      </div>
      }
        
      {/* Pagination Controls */}
      <div className="pagination">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PokemonList;
