// src/components/PokemonCard.tsx

import React from 'react';
import Link from 'next/link';

// Define the props expected by the PokemonCard component
interface PokemonProps {
  name: string;  // Pokémon's name
  url: string;  // URL for fetching Pokémon data
  generation?: string;  // Optional Pokémon generation
  types?: string[];  // Optional list of Pokémon types
}

// Functional component for displaying a Pokémon card
const PokemonCard: React.FC<PokemonProps> = ({ name, url, generation, types }) => {
  // Extract Pokémon ID from the URL using a regular expression
  const idMatch = url.match(/\/pokemon\/(\d+)\//);
  const id = idMatch ? idMatch[1] : null;  // Get the ID from the match result
  // Construct the Pokémon image URL using the extracted ID
  const imageUrl = id ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png` : '';

  return (
    <Link href={`/pokemon/${name}`} legacyBehavior>
      {/* Link to the Pokémon's detail page */}
      <a className="pokemon-card bg-white shadow-lg rounded-lg p-4 flex flex-col items-center hover:shadow-xl transition-shadow duration-300 w-48 h-72">
        {/* Display the Pokémon image if available */}
        {imageUrl && (
          <img src={imageUrl} alt={name} className="w-24 h-24 object-contain" 
            onError={(e) => {
            e.currentTarget.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png`; // Fallback image if the Pokémon image fails to load
          }}
          />
        )}
        {/* Display the Pokémon name */}
        <h3 className="text-xl font-bold mt-2">{name.length > 15 ? `${name.substring(0, 15)}...` : name}</h3>
 
        {/* Display the Pokémon generation if available */}
        {generation && <p className="text-gray-500">{generation}</p>}
        {/* Display the Pokémon types if available */}
        {types && (
          <div className="flex flex-wrap space-x-1 mt-1">
            {types.map((type, index) => (
              <span key={index} className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {type}
              </span>
            ))}
          </div>
        )}
      </a>
    </Link>
  );
};

export default PokemonCard;
