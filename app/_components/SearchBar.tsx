"use client";
import React, { useState } from "react";

export default function SearchBar() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResults([]);
    try {
      const res = await fetch("/api/scrape/manga", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ search }),
      });
      const data = await res.json();
      if (data.results) setResults(data.results);
      else setError("No results found.");
    } catch (err) {
      setError("Search failed.");
    }
    setLoading(false);
  };

  return (
    <div>
      <form onSubmit={handleSearch} style={{ marginBottom: 24 }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search for manga..."
          style={{ padding: 8, width: "70%" }}
        />
        <button
          type="submit"
          style={{ marginLeft: 8, padding: 8 }}
          disabled={loading}
        >
          Search
        </button>
      </form>
      {error && (
        <div style={{ color: "red", marginBottom: 16 }}>{error}</div>
      )}
      {loading && <div>Loading...</div>}
      {results.length > 0 && (
        <ul>
          {results.map((manga, idx) => (
            <li key={manga.url || idx} style={{ marginBottom: 8 }}>
              <strong>{manga.title}</strong>{" "}
              <span style={{ fontSize: 12, color: "#888" }}>{manga.url}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}