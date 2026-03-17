# IdeaFlow

An AI-powered idea management platform for capturing, developing, and organizing creative thoughts. IdeaFlow pairs a visual dashboard with an AI brainstorming partner that automatically generates refinements, "what if" explorations, next steps, and mentor-style verdicts for every idea you save.

**Live demo:** [creative-nexus-link.lovable.app](https://creative-nexus-link.lovable.app)

## Features

- **Quick Capture** -- Save ideas with a title, optional description, and color tag in one step.
- **AI Brainstorming** -- A Supabase Edge Function (`brainstorm`) automatically generates four types of AI suggestions for each new idea: refinements, what-if prompts, next steps, and a mentor verdict.
- **Visual Dashboard** -- Color-coded idea cards displayed in a grid layout with priority badges, timestamps, and inline AI suggestion panels.
- **Idea Detail View** -- Dedicated workspace for each idea with notes, related ideas, and full AI suggestion history.
- **Authentication** -- Email/password sign-up and sign-in via Supabase Auth with protected routes.
- **Search and Filter** -- Full-text search across all ideas from the dashboard.
- **Idea Lifecycle** -- Archive, delete, set priority levels, and configure staleness reminders per idea.
- **Responsive UI** -- Animated interface built with Framer Motion, optimized for desktop and mobile.

## Tech Stack

| Layer       | Technology                                                   |
|-------------|--------------------------------------------------------------|
| Framework   | React 18, TypeScript, Vite                                   |
| Styling     | Tailwind CSS, shadcn/ui (Radix primitives), Framer Motion    |
| Backend     | Supabase (PostgreSQL, Auth, Edge Functions)                   |
| Data        | TanStack React Query for server state management             |
| Routing     | React Router v6                                              |
| Forms       | React Hook Form, Zod validation                              |
| Testing     | Vitest, React Testing Library                                |

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- A [Supabase](https://supabase.com) project with the required tables (`ideas`, `ai_suggestions`, `tags`, `idea_tags`, `idea_connections`, `idea_notes`, `profiles`) and a `brainstorm` Edge Function deployed

### Installation

```bash
git clone https://github.com/roneni/idea-bloom-studio.git
cd idea-bloom-studio
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Tests

```bash
npm test
```

## Project Structure

```
src/
  components/
    ideas/          -- IdeaCard, IdeaGrid, QuickCapture, AiSuggestionsPanel, DashboardHeader
    ui/             -- shadcn/ui component library
  hooks/            -- useAuth, useIdeas, useAiSuggestions, use-toast, use-mobile
  pages/            -- Index (landing), Auth, Dashboard, IdeaDetail, NotFound
  types/            -- TypeScript type definitions (Idea, Tag, AISuggestion, etc.)
  integrations/     -- Supabase client configuration
```

## License

This project is private.
