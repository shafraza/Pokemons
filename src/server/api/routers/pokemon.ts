import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import type { Pokemon, PokemonDetails, Evolution, BasicPokemon } from '~/types';

const t = initTRPC.create();
const baseUrl = process.env.POKEMON_BASE_API;

if (!baseUrl) {
  throw new Error('POKEMON_BASE_API environment variable is not defined');
}

interface PokemonListResponse {
  results: BasicPokemon[];
  next: string | null;
}

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

interface SpeciesResponse {
  generation: { name: string };
  evolution_chain: { url: string };
}

interface EvolutionChainResponse {
  chain: { species: { name: string }, evolves_to: EvolutionChainLink[] };
}

interface EvolutionChainLink {
  species: { name: string };
  evolves_to: EvolutionChainLink[];
}

export const pokemonRouter = t.router({
  getPokemons: t.procedure.query(async (): Promise<Pokemon[]> => {
    const allPokemons: Pokemon[] = [];
    let nextUrl: string | null = `${baseUrl}/pokemon/?limit=100`;

    try {
      while (nextUrl) {
        const response = await fetch(nextUrl);
        const data: PokemonListResponse = await response.json() as PokemonListResponse;

        const pokemons = await Promise.all(data.results.map(async (pokemon): Promise<Pokemon> => {
          const pokemonDetailsResponse = await fetch(pokemon.url);
          const pokemonDetails: PokemonDetailResponse = await pokemonDetailsResponse.json() as PokemonDetailResponse;
          const speciesResponse = await fetch(pokemonDetails.species.url);
          const speciesData: SpeciesResponse = await speciesResponse.json() as SpeciesResponse;


          return {
            name: pokemon.name,
            url: pokemon.url,
            generation: speciesData.generation.name,
            types: pokemonDetails.types.map(type => type.type.name),
          };
        }));

        allPokemons.push(...pokemons);
        nextUrl = data.next;
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error fetching Pokémon data: ${error.message}`);
      } else {
        throw new Error('Error fetching Pokémon data');
      }
    }

    return allPokemons;
  }),

  getAllTypes: t.procedure.query(async (): Promise<string[]> => {
    const response = await fetch(`${baseUrl}/type`);
    const data: { results: { name: string }[] } = await response.json() as { results: { name: string }[] };
    return data.results.map(type => type.name);
  }),

  getAllGenerations: t.procedure.query(async (): Promise<string[]> => {
    const response = await fetch(`${baseUrl}/generation`);
    const data: { results: { name: string }[] } = await response.json() as { results: { name: string }[] };

    return data.results.map(generation => generation.name);
  }),

  getPokemonDetails: t.procedure
    .input(z.object({ name: z.string() }))
    .query(async ({ input }): Promise<PokemonDetails> => {
      const fetchPokemonData = async (name: string): Promise<PokemonDetailResponse> => {
        const response = await fetch(`${baseUrl}/pokemon/${name}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch Pokémon data for ${name}`);
        }
        return response.json() as Promise<PokemonDetailResponse>;
      };

      const fetchSpeciesData = async (url: string): Promise<SpeciesResponse> => {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch Pokémon species data');
        }
        return response.json() as Promise<SpeciesResponse>;
      };

      const fetchEvolutionChainData = async (url: string): Promise<EvolutionChainResponse> => {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch Pokémon evolution chain data');
        }
        return response.json() as Promise<EvolutionChainResponse>;

      };

      const pokemonData = await fetchPokemonData(input.name);
      const speciesData = await fetchSpeciesData(pokemonData.species.url);
      const evolutionData = await fetchEvolutionChainData(speciesData.evolution_chain.url);

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

      const evolutions = await parseEvolutions(evolutionData.chain);

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

export type PokemonRouter = typeof pokemonRouter;
