// Interface for Pokémon evolution details
export interface Evolution {
  name: string;
  image: string;
}

// Interface for detailed Pokémon information
export interface PokemonDetails {
  id: number;
  name: string;
  generation: string;
  types: string[];
  height: number;
  weight: number;
  abilities: string[];
  stats: Record<string, number>;
  evolutions: Evolution[];
}

// Interface for basic Pokémon information
export interface BasicPokemon {
  name: string;
  url: string;
}

// Interface for Pokémon with additional details
export interface Pokemon extends BasicPokemon {
  generation?: string;
  types?: string[];
}

// Interface for species response from the API
export interface SpeciesResponse {
  generation: {
    name: string;
  };
  evolution_chain: {
    url: string;
  };
}

// Interface for Pokémon list response from the API
export interface PokemonListResponse {
  results: {
    name: string;
  }[];
}

// Interface for Pokémon with additional details (overlapping definition)
export interface Pokemon {
  name: string;
  url: string;
  generation?: string;
  types?: string[];
  evolutions: string[];
}

// Interface for type response from the API
export interface TypeResponse {
  types: string[];
}

// Interface for generation response from the API
export interface GenerationResponse {
  generations: string[];
}
