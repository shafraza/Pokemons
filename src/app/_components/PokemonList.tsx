"use client"; // Indicates that this is a client-side component

import React, { useEffect, useState } from 'react';
import PokemonCard from "~/app/_components/PokemonCard"; // Importing the PokemonCard component
import { api } from "~/trpc/react"; // Importing the api instance from tRPC
import { useFilters } from '~/context/FiltersContext'; // Importing the useFilters hook from the FiltersContext
import type { Pokemon } from '~/types'; // Importing the Pokemon type

const PokemonList: React.FC = () => {
  const { 
    searchTerm, setSearchTerm, 
    filterType, setFilterType, 
    filterGeneration, setFilterGeneration, 
    allPokemons, setAllPokemons,
    offset, setOffset
  } = useFilters(); // Destructuring values from the FiltersContext
  const [currentPage, setCurrentPage] = useState<number>(1); // State for the current page number

  const [loading, setLoading] = useState<boolean>(true); // State for loading status
  const [error, setError] = useState<string | null>(null); // State for error messages

  const [allDataFetched, setAllDataFetched] = useState(false); // State to check if all data is fetched
  const [fetchingNextBatch, setFetchingNextBatch] = useState(false); // State to check if next batch is being fetched
  const [types, setTypes] = useState<string[]>([]); // State for storing Pokémon types
  const [generations, setGenerations] = useState<string[]>([]); // State for storing Pokémon generations

  const limit = 18; // Number of Pokémon displayed per page

  // Fetch Pokémon data and available types/generations
  const { data: initialPokemonsResult, isLoading: isPokemonsLoading, isError: isPokemonsError, error: pokemonsError } = api.pokemon.getInitialPokemons.useQuery(
    undefined,
    {
      enabled: allPokemons.length === 0, // Skip query if there are already fetched Pokémon
    }
  );

  const { data: typesData, isLoading: isTypesLoading } = api.pokemon.getAllTypes.useQuery(undefined, {
    enabled: types.length === 0 && allPokemons.length !== 0, // Only fetch if types are not already set
  });

  const { data: generationsData, isLoading: isGenerationsLoading } = api.pokemon.getAllGenerations.useQuery(undefined, {
    enabled: generations.length === 0 && allPokemons.length !== 0, // Only fetch if generations are not already set
  });

  // Update types state when typesData changes
  useEffect(() => {
    if (typesData && types.length === 0) {
      setTypes(typesData);
    }
  }, [typesData, types.length]);

  // Update generations state when generationsData changes
  useEffect(() => {
    if (generationsData && generations.length === 0) {
      setGenerations(generationsData);
    }
  }, [generationsData, generations.length]);

  // Update allPokemons state and loading state when initialPokemonsResult changes
  useEffect(() => { 
    if (initialPokemonsResult) { 
        if(allPokemons.length === 0){
          setAllPokemons(initialPokemonsResult.pokemons);
        }
        setLoading(false);
    }
  }, [initialPokemonsResult]);

  // Fetch remaining Pokémon data
  const { data: remainingPokemonsResult, isLoading: isRemainingLoading } = api.pokemon.getRemainingPokemons.useQuery(
    { nextOffset: offset },
    { enabled: !allDataFetched && allPokemons.length < 1302 && fetchingNextBatch} 
  );

  // Update allPokemons state and other states when remainingPokemonsResult changes
  useEffect(() => {
    if (remainingPokemonsResult?.pokemons) { 
      // setAllPokemons((prev) => [...prev, ...remainingPokemonsResult.pokemons]);
      setAllPokemons([...allPokemons, ...remainingPokemonsResult.pokemons]);

      if (remainingPokemonsResult.pokemons.length < 100) {
        setAllDataFetched(true);
      } else {
        setOffset(offset + 100);
      }
      setFetchingNextBatch(false); // Set fetching to false after fetching the batch
    }
  }, [remainingPokemonsResult]);

  // Set initial offset if allPokemons length is 0 and all data is not fetched
  useEffect(() => {
    if (allPokemons.length === 0 && !allDataFetched) { 
      setOffset(100);
    }
  }, [allPokemons, allDataFetched]);

  // Start fetching next batch when conditions are met
  useEffect(() => {
    if (!isRemainingLoading && !allDataFetched && allPokemons.length !== 0 && types.length !== 0 && generations.length !== 0) {
      setFetchingNextBatch(true); // Set fetching to true when starting to fetch the next batch
    }
  }, [isRemainingLoading, allDataFetched, allPokemons.length, types.length, generations.length]);

  // Show loading spinner if data is loading
  if (loading || isPokemonsLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loader"></div>
      </div>
    );
  }

  // Show error message if there is an error fetching Pokémon
  if (isPokemonsError || error) {
    return <div className="text-center text-red-600">Error fetching Pokémon: {pokemonsError?.message ?? error}</div>;
  }

  const filteredPokemons = applyFilters(allPokemons); // Apply filters to allPokemons
  const totalPages = Math.ceil(filteredPokemons.length / limit); // Calculate total pages
  const currentPokemons = filteredPokemons.slice((currentPage - 1) * limit, currentPage * limit); // Get current page Pokémon

  // Function to apply filters on Pokémon
  function applyFilters(pokemons: Pokemon[] = []) {
    let filtered = pokemons;

    if (searchTerm) {
      filtered = filtered.filter((pokemon) =>
        pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Get the names of the filtered Pokémon
    const filteredNames = filtered.map((pokemon) => pokemon.name.toLowerCase());
  
    // Include Pokémon whose evolutions are in the filtered names
    const evolutionMatches = pokemons.filter((pokemon) =>
      pokemon.evolutions?.some((evolution) => filteredNames.includes(evolution.toLowerCase()))
    );

    // Combine filtered Pokémon and those with matching evolutions
    filtered = [...filtered, ...evolutionMatches];

    // Remove duplicates
    filtered = filtered.filter((value, index, self) =>
      index === self.findIndex((t) => t.name === value.name)
    );

    if (filterType) {
      filtered = filtered.filter((pokemon) => pokemon.types?.includes(filterType));
    }

    if (filterGeneration) {
      filtered = filtered.filter((pokemon) => pokemon.generation === filterGeneration);
    }

    return filtered;
  }

  // Handle change in search term
  const handleSearchTermChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value.toLowerCase());
    setCurrentPage(1);
  };

  // Handle change in Pokémon type filter
  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterType(event.target.value);
    setCurrentPage(1);
  };

  // Handle change in Pokémon generation filter
  const handleGenerationChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterGeneration(event.target.value);
    setCurrentPage(1);
  };

  // Handle change in page number
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
        <h1 className=" font-extrabold tracking-tight">
          <span className="text-[hsl(280,100%,70%)]"></span> Could not find.
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

export default PokemonList; // Exporting the PokemonList component
