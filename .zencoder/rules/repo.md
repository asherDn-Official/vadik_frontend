# Repository Overview

## Tech Stack
- **Framework**: React 18 with Vite build tooling
- **Language**: JavaScript (with some TypeScript files)
- **Styling**: Tailwind CSS
- **State/Form Handling**: React Hook Form, Context API
- **Charting**: Chart.js via react-chartjs-2

## Project Layout
- **src/pages**: Top-level route components rendered by the router
- **src/components**: Reusable UI components grouped by feature
- **src/api**: Axios configuration and API utilities
- **public/assets**: Static images and other asset files

## Common Commands
1. **Install dependencies**: `npm install`
2. **Start development server**: `npm run dev`
3. **Build for production**: `npm run build`
4. **Preview production build**: `npm run preview`
5. **Lint source files**: `npm run lint`

## Testing Notes
- No automated tests are configured by default.

## Additional Tips
- **Environment Variables**: Configure `.env` files in the project root if API endpoints differ across environments.
- **API Requests**: Use the shared Axios instance in `src/api/apiconfig.js` for consistent headers and error handling.
- **Styling**: Tailwind classes are used extensively; prefer utility classes over custom CSS unless necessary.