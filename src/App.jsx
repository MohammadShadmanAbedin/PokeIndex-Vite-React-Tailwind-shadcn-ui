import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import "./App.css";

// Color for each Pokemon type
const typeColors = {
  normal: "#a8a77a", fire: "#ee8130", water: "#6390f0", electric: "#f7d02c",
  grass: "#7ac74c", ice: "#96d9d6", fighting: "#c22e28", poison: "#a33ea1",
  ground: "#e2bf65", flying: "#a98ff3", psychic: "#f95587", bug: "#a6b91a",
  rock: "#b6a136", ghost: "#735797", dragon: "#6f35fc", dark: "#705746",
  steel: "#b7b7ce", fairy: "#d685ad",
};

/* ---------------- FAVORITES (saved in localStorage) ---------------- */
function useFavorites() {
  // Start with whatever was saved before (or an empty list)
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("favorites")) || [];
    } catch {
      return [];
    }
  });

  // Every time favorites change, save them to localStorage
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  // Add the name if it is not in the list, remove it if it is
  const toggleFavorite = (name) => {
    setFavorites((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  return { favorites, toggleFavorite };
}

/* ---------------- HOME PAGE ---------------- */
function Home() {
  const [pokemon, setPokemon] = useState([]);   // list from the API
  const [search, setSearch] = useState("");     // text in the search box
  const [loading, setLoading] = useState(true); // show skeletons while loading
  const [showFavs, setShowFavs] = useState(false); // show only favorites?
  const { favorites, toggleFavorite } = useFavorites();
  const navigate = useNavigate();               // used to change page

  // Runs once when the page loads: fetch the first 151 pokemon
  useEffect(() => {
    fetch("https://pokeapi.co/api/v2/pokemon?limit=151")
      .then((res) => res.json())
      .then((data) => {
        setPokemon(data.results);
        setLoading(false);
      });
  }, []);

  // The API url ends with the id, e.g. ".../pokemon/25/" -> "25"
  const getId = (url) => url.split("/").filter(Boolean).pop();

  // Keep pokemon that match the search text (and are favorites, if that filter is on)
  const filtered = pokemon.filter(
    (p) =>
      p.name.includes(search.toLowerCase()) &&
      (!showFavs || favorites.includes(p.name))
  );

  return (
    <div className="page-bg">
      {/* Header */}
      <header className="bg-red-600 text-white shadow-lg sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="pokeball" />
          <h1 className="text-2xl font-extrabold tracking-wide">PokeIndex</h1>
          <span className="ml-auto text-sm opacity-90">{filtered.length} Pokémon</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        <div className="flex gap-3 mb-8">
          <Input
            placeholder="🔍 Search Pokémon by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 bg-white rounded-full px-5 text-base shadow-md"
          />
          <Button
            variant={showFavs ? "default" : "outline"}
            onClick={() => setShowFavs(!showFavs)}
            className="h-12 rounded-full px-5 shadow-md"
          >
            ❤️ Favorites ({favorites.length})
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {/* Loading skeletons */}
          {loading &&
            Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-44 rounded-xl bg-gray-200 animate-pulse" />
            ))}

          {/* Pokemon cards */}
          {filtered.map((p) => (
            <Card
              key={p.name}
              onClick={() => navigate(`/pokemon/${p.name}`)}
              className="poke-card relative gap-2 py-4 bg-white/90"
            >
              {/* Heart button: stopPropagation so the card click does not open the detail page */}
              <button
                className="absolute top-3 left-4 text-xl cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(p.name);
                }}
              >
                {favorites.includes(p.name) ? "❤️" : "🤍"}
              </button>
              <CardContent className="flex flex-col items-center">
                <span className="self-end text-xs font-bold text-gray-400">
                  #{String(getId(p.url)).padStart(3, "0")}
                </span>
                <img
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${getId(p.url)}.png`}
                  alt={p.name}
                  className="w-28 h-28 object-contain"
                />
                <p className="capitalize font-bold mt-2">{p.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Nothing found */}
        {!loading && filtered.length === 0 && (
          <p className="text-center text-gray-500 mt-10">
            {showFavs && search === ""
              ? "No favorites yet. Tap 🤍 on a Pokémon to add one!"
              : `No Pokémon found for "${search}" 😢`}
          </p>
        )}
      </main>
    </div>
  );
}

/* ---------------- DETAIL PAGE ---------------- */
function Detail() {
  const { name } = useParams();           // gets "pikachu" (or an id) from the URL
  const [data, setData] = useState(null); // one pokemon details
  const { favorites, toggleFavorite } = useFavorites();
  const navigate = useNavigate();

  // Runs when the page loads (and again whenever name changes): fetch one pokemon
  useEffect(() => {
    setData(null); // show the loading state again
    fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
      .then((res) => res.json())
      .then((json) => setData(json));
  }, [name]);

  // Loading state
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 animate-pulse">
        Loading...
      </div>
    );
  }

  // The first type decides the page color
  const mainColor = typeColors[data.types[0].type.name];

  return (
    <div
      className="min-h-screen p-6"
      style={{ background: `linear-gradient(to bottom, ${mainColor}, white 70%)` }}
    >
      <div className="max-w-md mx-auto">
        {/* Top buttons: back, previous, next (all use useNavigate) */}
        <div className="flex items-center gap-2 mb-4">
          <Button variant="secondary" onClick={() => navigate("/")}>
            ← Back
          </Button>
          <div className="ml-auto flex gap-2">
            <Button
              variant="secondary"
              disabled={data.id <= 1}
              onClick={() => navigate(`/pokemon/${data.id - 1}`)}
            >
              ‹ Prev
            </Button>
            <Button
              variant="secondary"
              disabled={data.id >= 151}
              onClick={() => navigate(`/pokemon/${data.id + 1}`)}
            >
              Next ›
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden">
          <CardContent className="flex flex-col items-center gap-3">
            <span className="text-gray-400 font-bold">
              #{String(data.id).padStart(3, "0")}
            </span>
            <img
              src={data.sprites.other["official-artwork"].front_default}
              alt={data.name}
              className="w-56 h-56 object-contain drop-shadow-xl"
            />
            <h2 className="text-3xl font-extrabold capitalize">{data.name}</h2>

            {/* Favorite button (saved in localStorage) */}
            <Button
              variant={favorites.includes(data.name) ? "default" : "outline"}
              onClick={() => toggleFavorite(data.name)}
            >
              {favorites.includes(data.name) ? "❤️ Favorited" : "🤍 Add to favorites"}
            </Button>

            {/* Types */}
            <div className="flex gap-2">
              {data.types.map((t) => (
                <Badge
                  key={t.type.name}
                  className="capitalize text-white px-3 py-1 text-sm"
                  style={{ backgroundColor: typeColors[t.type.name] }}
                >
                  {t.type.name}
                </Badge>
              ))}
            </div>

            {/* Height and weight (API gives decimeters and hectograms) */}
            <div className="flex gap-10 mt-2 text-center">
              <div>
                <p className="font-bold text-lg">{data.height / 10} m</p>
                <p className="text-xs text-gray-500">Height</p>
              </div>
              <div>
                <p className="font-bold text-lg">{data.weight / 10} kg</p>
                <p className="text-xs text-gray-500">Weight</p>
              </div>
            </div>

            {/* Abilities */}
            <div className="flex flex-wrap justify-center gap-2">
              {data.abilities.map((a) => (
                <Badge key={a.ability.name} variant="outline" className="capitalize">
                  {a.ability.name}
                </Badge>
              ))}
            </div>

            {/* Base stats as bars (max stat value is about 255) */}
            <div className="w-full mt-4 space-y-2">
              <h3 className="font-bold">Base Stats</h3>
              {data.stats.map((s) => (
                <div key={s.stat.name} className="flex items-center gap-3 text-sm">
                  <span className="w-28 capitalize text-gray-600">
                    {s.stat.name.replace("-", " ")}
                  </span>
                  <span className="w-8 font-bold">{s.base_stat}</span>
                  <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(s.base_stat / 255) * 100}%`,
                        backgroundColor: mainColor,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ---------------- APP (routes) ---------------- */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pokemon/:name" element={<Detail />} />
      </Routes>
    </BrowserRouter>
  );
}