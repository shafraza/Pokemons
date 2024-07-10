# Pokemons

**Sample App**

## Project Overview

The objective of this project was to develop a small application using TypeScript and Next.js to display real-time information from the Poké API. The application meets the following requirements:

1. **List of all Pokémon: name, generation, types, ordered by id**

   The main page of the project displays a list of all the Pokémon, ordered by id (by default). The list shows the name, generation, and types for each Pokémon. Additional relevant information is also displayed where applicable.

2. **Filters in the list: type and generation**

   Two selectors have been added to the search engine to filter the Pokémon list by Type and Generation, allowing users to narrow down the displayed Pokémon based on these criteria.

3. **Search by name: filter in real time, including evolutions**

   A text search engine is included to filter the list by Pokémon names in real time. This search engine also includes evolutions, so if a user searches for Pikachu, Pichu and Raichu will also appear in the results.

4. **Information page for each Pokémon: name, image, generation, types, evolutions, stats...**

   Clicking on a Pokémon from the list navigates to a detailed information page for that Pokémon. This page displays:
   - Name
   - Image
   - Generation
   - Types
   - Evolutions (with their images)
   - Stats

   Users can click on one of the evolutions to navigate to that Pokémon's page. The current evolution is always marked in some way to indicate that the user is viewing that Pokémon's page.

   Note: When returning to the list from any page, its state, including filters and search content, is maintained (unless the page is reloaded).

## Setup Guide

### Prerequisites

- **Node.js** (version 14.x or higher)
- **npm** (Node Package Manager)

### Getting Started

1. **Clone the Repository**

   ```bash
   git clone https://github.com/shafraza/Pokemons

   cd Pokemons
