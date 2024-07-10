import { HydrateClient } from "~/trpc/server";
import PokemonList from '~/app/_components/PokemonList';

export default async function Home() {

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-black">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-8">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem] text-white">
           Pokémons <span className="text-[hsl(280,100%,70%)]">T3</span> App
          </h1>
          <PokemonList />
        </div>
      </main>
    </HydrateClient>
  );
}
