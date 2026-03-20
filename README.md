# SelfSheet

A minimalist, compact, and highly functional habit tracker application built with Next.js. SelfSheet allows you to track personal protocols daily, switch between beautiful custom themes, and even digitize physical habit-tracking sheets using AI.

## Features
- **Daily Protocol Tracking:** Easily add, rename, toggle, and delete daily habits and protocols.
- **AI Image Import:** Upload a picture of your physical tracking sheet, and AI will automatically parse and import your checked days into the app.
- **Export Data:** Export your monthly spreadsheet to an `.xlsx` file, or download your progress trend chart straight to a PNG.
- **Custom Theming:** Built-in dynamic theme engine (Light, Black, Sunset, Nightown, Sea) featuring a completely custom and keyboard-accessible UI.
- **Authentication:** Secure user registration and login to keep your data private.
- **Compact & Responsive:** Flat, minimalist aesthetics that work beautifully on both desktop and mobile devices.

## Tech Stack
- **Framework:** Next.js (App Router) & React
- **Database:** PostgreSQL + Drizzle ORM
- **AI Integration:** Google Gemini (`@ai-sdk/google`)
- **Charting & Data:** Recharts, `xlsx`, `html2canvas`, `date-fns`

## Getting Started

### Prerequisites
Make sure you have [Bun](https://bun.sh/) installed and a running PostgreSQL database.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/SureshAmal/selfsheet.git
   cd selfsheet
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Set up your environment variables. Create a `.env.local` file in the root directory:
   ```env
   POSTGRES_URL="postgres://username:password@localhost:5432/selfsheet"
   GOOGLE_GENERATIVE_AI_API_KEY="your_gemini_api_key_here"
   ```

4. Generate and run the database migrations:
   ```bash
   bunx drizzle-kit generate
   bunx drizzle-kit push
   ```

5. Start the development server:
   ```bash
   bun run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to run the application.
