export interface Evolution {
    name: string;
    image: string;
  }
  
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
  
  // Define a type for basic Pokémon info
  export interface BasicPokemon {
    name: string;
    url: string;
  }
  
  // Define a type for Pokémon with additional details
  export interface Pokemon extends BasicPokemon {
    generation?: string;
    types?: string[];
  }
  
  export interface SpeciesResponse {
    generation: {
      name: string;
    };
    evolution_chain: {
      url: string;
    };
  }
  
  export interface PokemonListResponse {
    results: {
      name: string;
    }[];
  }

  export interface Pokemon {
    name: string;
    url: string;
    generation?: string;
    types?: string[];
  }
  
  export interface TypeResponse {
    types: string[];
  }
  
  export interface GenerationResponse {
    generations: string[];
  }