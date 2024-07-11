import { initTRPC } from '@trpc/server'; // Importing initTRPC from tRPC server
import { z } from 'zod'; // Importing zod for schema validation
import type { Pokemon, PokemonDetails, Evolution, BasicPokemon } from '~/types'; // Importing types

const t = initTRPC.create(); // Initializing tRPC
const baseUrl = process.env.POKEMON_BASE_API; // Getting the base URL for Pokémon API from environment variables

if (!baseUrl) {
  throw new Error('POKEMON_BASE_API environment variable is not defined'); // Throwing an error if the environment variable is not defined
}

// Interface for Pokémon list response
interface PokemonListResponse {
  results: BasicPokemon[];
  next: string | null;
}

// Interface for Pokémon detail response
interface PokemonDetailResponse {
  id: number;
  name: string;
  species: { url: string };
  types: { type: { name: string } }[];
  height: number;
  weight: number;
  abilities: { ability: { name: string } }[];
  stats: { stat: { name: string }, base_stat: number }[];
  sprites: { front_default: string | null };
}

// Interface for species response
interface SpeciesResponse {
  generation: { name: string };
  evolution_chain: { url: string };
}

// Interface for evolution chain response
interface EvolutionChainResponse {
  chain: { species: { name: string }, evolves_to: EvolutionChainLink[] };
}

// Interface for evolution chain link
interface EvolutionChainLink {
  species: { name: string };
  evolves_to: EvolutionChainLink[];
}

// Function to fetch evolution chain data
const getEvolutionChain = async (url: string, mainPokemon: string): Promise<string[]> => {

  // Helper function to fetch evolution chain data from API
  const fetchEvolutionChainData = async (url: string): Promise<EvolutionChainResponse> => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch Pokémon evolution chain data'); // Throwing an error if the fetch fails
    }
    return response.json() as Promise<EvolutionChainResponse>;
  };

  const evolutions: string[] = []; // Array to store evolution names

  // Recursive function to get all evolutions in the chain
  const getEvolutions = (chain: EvolutionChainLink) => {
    if (chain.species.name !== mainPokemon) {
      evolutions.push(chain.species.name); // Adding evolution name to the array
    }
    chain.evolves_to.forEach((evolution: EvolutionChainLink) => getEvolutions(evolution)); // Recursively getting evolutions
  };

  const evolutionData = await fetchEvolutionChainData(url); // Fetching evolution chain data
  getEvolutions(evolutionData.chain); // Getting evolutions from the chain

  return evolutions; // Returning the list of evolutions
};

// Defining the pokemonRouter with tRPC procedures
export const pokemonRouter = t.router({
  // Procedure to get initial Pokémon data
  getInitialPokemons: t.procedure.query(async (): Promise<{ pokemons: Pokemon[] }> => {
    const response = await fetch(`${baseUrl}/pokemon/?limit=100`); // Fetching the first 100 Pokémon
    const data: PokemonListResponse = await response.json() as PokemonListResponse;

    // Fetching details for each Pokémon
    const pokemons = await Promise.all(data.results.map(async (pokemon): Promise<Pokemon> => {
      const pokemonDetailsResponse = await fetch(pokemon.url);
      const pokemonDetails: PokemonDetailResponse = await pokemonDetailsResponse.json() as PokemonDetailResponse;
      const speciesResponse = await fetch(pokemonDetails.species.url);
      const speciesData: SpeciesResponse = await speciesResponse.json() as SpeciesResponse;

      const evolutionChainUrl = speciesData.evolution_chain.url;
      const evolutions = await getEvolutionChain(evolutionChainUrl, pokemon.name);

      // Returning Pokémon data with details
      return {
        name: pokemon.name,
        url: pokemon.url,
        generation: speciesData.generation.name,
        types: pokemonDetails.types.map(type => type.type.name),
        evolutions,
      };
    }));

    return { pokemons }; // Returning the list of Pokémon
  }),

  // Procedure to get remaining Pokémon data with offset
  getRemainingPokemons: t.procedure
  .input(z.object({ nextOffset: z.number() })) // Input validation with zod
  .query(async ({ input }): Promise<{ pokemons: Pokemon[] }> => {
    const limit = 100;
    const response = await fetch(`${baseUrl}/pokemon/?offset=${input.nextOffset}&limit=${limit}`); // Fetching the next set of Pokémon
    const data: PokemonListResponse = await response.json() as PokemonListResponse;

    // Fetching details for each Pokémon
    const pokemons = await Promise.all(data.results.map(async (pokemon): Promise<Pokemon> => {
      const pokemonDetailsResponse = await fetch(pokemon.url);
      const pokemonDetails: PokemonDetailResponse = await pokemonDetailsResponse.json() as PokemonDetailResponse;
      const speciesResponse = await fetch(pokemonDetails.species.url);
      const speciesData: SpeciesResponse = await speciesResponse.json() as SpeciesResponse;

      const evolutionChainUrl = speciesData.evolution_chain.url;
      const evolutions = await getEvolutionChain(evolutionChainUrl, pokemon.name);

      // Returning Pokémon data with details
      return {
        name: pokemon.name,
        url: pokemon.url,
        generation: speciesData.generation.name,
        types: pokemonDetails.types.map(type => type.type.name),
        evolutions,
      };
    }));

    return { pokemons }; // Returning the list of Pokémon
  }),

  // Procedure to get all Pokémon types
  getAllTypes: t.procedure.query(async (): Promise<string[]> => {
    const response = await fetch(`${baseUrl}/type`); // Fetching all Pokémon types
    const data: { results: { name: string }[] } = await response.json() as { results: { name: string }[] };
    return data.results.map(type => type.name); // Returning the list of types
  }),

  // Procedure to get all Pokémon generations
  getAllGenerations: t.procedure.query(async (): Promise<string[]> => {
    const response = await fetch(`${baseUrl}/generation`); // Fetching all Pokémon generations
    const data: { results: { name: string }[] } = await response.json() as { results: { name: string }[] };

    return data.results.map(generation => generation.name); // Returning the list of generations
  }),

  // Procedure to get detailed data for a specific Pokémon
  getPokemonDetails: t.procedure
    .input(z.object({ name: z.string() })) // Input validation with zod
    .query(async ({ input }): Promise<PokemonDetails> => {
      // Helper function to fetch Pokémon data
      const fetchPokemonData = async (name: string): Promise<PokemonDetailResponse> => {
        const response = await fetch(`${baseUrl}/pokemon/${name}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch Pokémon data for ${name}`); // Throwing an error if the fetch fails
        }
        return response.json() as Promise<PokemonDetailResponse>;
      };

      // Helper function to fetch species data
      const fetchSpeciesData = async (url: string): Promise<SpeciesResponse> => {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch Pokémon species data'); // Throwing an error if the fetch fails
        }
        return response.json() as Promise<SpeciesResponse>;
      };

      // Helper function to fetch evolution chain data
      const fetchEvolutionChainData = async (url: string): Promise<EvolutionChainResponse> => {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch Pokémon evolution chain data'); // Throwing an error if the fetch fails
        }
        return response.json() as Promise<EvolutionChainResponse>;
      };

      const pokemonData = await fetchPokemonData(input.name); // Fetching Pokémon data
      const speciesData = await fetchSpeciesData(pokemonData.species.url); // Fetching species data
      const evolutionData = await fetchEvolutionChainData(speciesData.evolution_chain.url); // Fetching evolution chain data

      // Helper function to parse evolutions
      const parseEvolutions = async (chain: EvolutionChainLink): Promise<Evolution[]> => {
        const evolutions: Evolution[] = [];
        let current: EvolutionChainLink | undefined = chain;
        while (current) {
          const evolutionPokemonData = await fetchPokemonData(current.species.name);
          evolutions.push({
            name: current.species.name,
            image: evolutionPokemonData.sprites.front_default ?? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png`,
          });
          current = current.evolves_to[0] ?? undefined;
        }
        return evolutions;
      };

      const evolutions = await parseEvolutions(evolutionData.chain); // Parsing evolutions

      // Returning detailed Pokémon data
      return {
        id: pokemonData.id,
        name: pokemonData.name,
        generation: speciesData.generation.name,
        types: pokemonData.types.map(type => type.type.name),
        height: pokemonData.height,
        weight: pokemonData.weight,
        abilities: pokemonData.abilities.map(ability => ability.ability.name),
        stats: pokemonData.stats.reduce((acc, stat) => {
          acc[stat.stat.name] = stat.base_stat;
          return acc;
        }, {} as Record<string, number>),
        evolutions,
      };
    }),
});

export type PokemonRouter = typeof pokemonRouter; // Exporting the type for the router
