"use client"
import React, { useState } from "react";

import ButtonClient  from "./_components/ButtonClient";
import SearchBar from "./_components/SearchBar";

export default function Home() {
  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
      <h1>Manga Search</h1>
      <SearchBar />

      

    </div>
  );
}
