# 📖 Novel-Writer

A full-stack web application that scrapes online novel content and converts it into `.epub` files formatted for Apple Books — built to solve a real problem, end-to-end.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8?style=flat-square&logo=tailwindcss)
![Puppeteer](https://img.shields.io/badge/Puppeteer-24-40B5A4?style=flat-square&logo=googlechrome)

---

## What It Does

Novel-Writer takes a URL from an online novel site, scrapes each chapter using a headless browser, and packages the content into a properly formatted `.epub` file that can be imported directly into Apple Books.

The problem: online novel platforms are often hard to read on mobile, lack offline access, and don't support e-reader formatting. This tool automates the entire pipeline — from raw webpage to polished ebook — in a few clicks.

---

## Technical Highlights

**Web Scraping with Puppeteer**
Uses a headless Chromium browser to navigate paginated novel sites, handling dynamic content that plain HTTP requests can't reach. Chapters are fetched concurrently using `p-limit` to avoid rate limiting while maximizing throughput.

**ePub Generation Pipeline**
Scraped content is transformed and passed to `epub-gen`, which assembles a standards-compliant `.epub` file with correct metadata, chapter structure, and styling — ready for Apple Books without any manual editing.

**Full-Stack Next.js Architecture**
The frontend (React 19 + Tailwind CSS) lets users input a novel URL and trigger the generation process. The backend runs inside Next.js API routes, keeping the entire application in a single deployable project.

**Concurrency & Rate Limiting**
`p-limit` controls parallel chapter fetching to balance speed against getting blocked by the target site — a practical consideration in production scraping scenarios.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack) |
| Language | TypeScript 5 / JavaScript |
| Frontend | React 19, Tailwind CSS 4 |
| Scraping | Puppeteer 24 (headless Chromium) |
| HTTP | Axios |
| ePub Output | epub-gen |
| Concurrency | p-limit |
| Email (optional) | Nodemailer |

---

## Project Structure

```
novel-writer/
├── app/          # Next.js App Router pages and API routes
├── public/       # Static assets
├── styles/       # Global CSS and Tailwind config
├── node-test/    # Standalone Node scripts for scraping experiments
└── package.json
```

---

## Getting Started

**Prerequisites:** Node.js 18+, npm

```bash
git clone https://github.com/andrewfaircloth/novel-writer.git
cd novel-writer
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

To build for production:
```bash
npm run build
npm start
```

---

## Engineering Decisions

**Why Puppeteer over Axios for scraping?**
Many novel sites render chapters with JavaScript — a plain HTTP request only returns an empty shell. Puppeteer spins up a full headless browser, waits for content to load, and then extracts text reliably.

**Why Next.js for a scraping tool?**
Bundling the UI and the scraping API into a single Next.js project keeps deployment simple (one `npm run build`, one Vercel deploy) and avoids managing a separate backend service.

**Why epub-gen over building ePub from scratch?**
The ePub specification has complex requirements around file structure, metadata, and CSS. `epub-gen` handles the spec compliance; this project focuses on the scraping and content pipeline that feeds it.

---

## What I Learned

- Navigating anti-scraping measures (rate limiting, dynamic rendering, pagination)
- Structuring a Next.js project with both client-facing pages and server-side Node.js logic
- Working with binary file generation (ePub is a zipped XML format) in a web context
- Managing async concurrency in production-realistic scenarios with `p-limit`

---

## Author

**Andrew Faircloth** — Computer Science, University of Florida  
[GitHub](https://github.com/andrewfaircloth) · [LinkedIn](https://www.linkedin.com/in/andrew-faircloth-557136282)
