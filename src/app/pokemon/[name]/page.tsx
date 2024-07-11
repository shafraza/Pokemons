"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from "~/trpc/react";
import type { Evolution } from '~/types'; // Import the type definitions

const PokemonDetailPage: React.FC<{ params: { name: string } }> = ({ params }) => {
  const { name } = params; // Extract Pokémon name from URL parameters
  const router = useRouter();
  const [evolutions, setEvolutions] = useState<Evolution[]>([]); // State to store Pokémon evolutions
  const { data, isLoading, error } = api.pokemon.getPokemonDetails.useQuery({ name });
  

  // Update evolutions state when Pokémon data is fetched or updated
  useEffect(() => {
    if (data) {
      setEvolutions(data.evolutions);
    }
  }, [data]);

  // Show a loading spinner while Pokémon details are being fetched
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loader-detail"></div>
      </div>
    );
  }

  // Show an error message if there was a problem fetching Pokémon details
  if (error) {
    return <div className="text-center text-red-600">Error fetching Pokémon details: {error.message}</div>;
  }

  // Show a message if the Pokémon is not found or the name does not match
  if (!data || data.name !== name) {
    return <div className="text-center text-xl font-semibold">Pokémon not found</div>;
  }

  const { id, generation, types, height, weight, abilities, stats } = data; // Destructure Pokémon properties for use in the component

  return (
    <div className="relative">
      {/* Back Button */}
      <button
        onClick={() => router.push('/')} // Navigate back to the Pokémon list
        className="absolute top-4 left-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition-colors"
      >
        Back to List
      </button>
  
      {/* Detail Page Content */}
      <div className="pokemon-detail bg-gradient-to-r from-blue-100 to-blue-300 shadow-lg rounded-lg p-4 max-w-md mx-auto mt-8">
        {/* Pokémon Name */}
        <h2 className="text-3xl font-bold mb-2 text-center">{data.name}</h2>
        {/* Pokémon Image */}

        <img
          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`}
          alt={data.name}
          className="w-24 h-24 mx-auto mb-4 border-4 border-blue-400 rounded-lg shadow-md"
          onError={(e) => {
            e.currentTarget.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png`; // Fallback image if the Pokémon image fails to load
          }}
        />
        {/* Pokémon Details */}
        <div className="text-center mb-2">
          <p className="text-lg font-semibold">Generation: <span className="text-gray-700">{generation ? generation.slice(generation.indexOf('-') + 1) : null}</span></p>
          <p className="text-lg font-semibold">Height: <span className="text-gray-700">{height} m</span></p>
          <p className="text-lg font-semibold">Weight: <span className="text-gray-700">{weight} kg</span></p>
        </div>
        {/* Pokémon Types */}
        <div className="mb-2">
          <h3 className="text-xl font-semibold text-center">Types:
            <span className="ml-2">
              {types?.map((type) => (
                <span key={type} className="bg-blue-500 text-white px-2 py-1 rounded text-sm font-semibold mr-1">{type}</span>
              ))}
            </span>
          </h3>
        </div>
        {/* Pokémon Abilities */}
        <div className="mb-2">
          <h3 className="text-xl font-semibold text-center">Abilities:
            <span className="ml-2">
              {abilities?.map((ability) => (
                <span key={ability} className="bg-purple-500 text-white px-2 py-1 rounded text-sm font-semibold mr-1">{ability}</span>
              ))}
            </span>
          </h3>
        </div>
        {/* Pokémon Evolutions */}
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-1 text-center">Evolutions:</h3>
          <div className="flex flex-wrap gap-2 justify-center mb-2">
            {evolutions?.map((evolution) => (
              <Link href={`/pokemon/${evolution.name}`} key={evolution.name} className="text-center m-3">
                <div>
                  {/* Evolution Image */}
      
                  <img src={evolution.image} alt={evolution.name} className="w-24 h-24 mb-2" />
                  {/* Evolution Name */}
                  <span className={`px-2 py-1 rounded-full text-sm font-semibold ${evolution.name === data.name ? 'bg-yellow-300 text-black' : 'bg-gray-300'}`}>
                    {evolution.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
        {/* Pokémon Stats */}
        <div>
          <h3 className="text-xl font-semibold mb-2 text-center">Stats:</h3>
          <div className="space-y-2">
            {stats && Object.entries(stats).map(([statName, statValue]) => (
              <div key={statName} className="flex justify-between items-center text-lg font-semibold">
                {/* Stat Name */}
                <span className="text-gray-700">{statName}:</span>
                <div className="flex-1 h-3 bg-gray-200 rounded-full mx-2">
                  {/* Stat Bar */}
                  <div
                    className={`h-full bg-green-500 rounded-full`}
                    style={{ width: `${Math.min(statValue, 100)}%` }}  // Limit the width to 100%
                  ></div>
                </div>
                {/* Stat Value */}
                <span className="text-gray-700">{statValue}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokemonDetailPage;
