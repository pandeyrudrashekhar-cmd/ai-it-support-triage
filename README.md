# AI IT Support Triage Assistant

## Overview
This project is an AI-powered IT support triage assistant that converts an IT issue or support ticket into structured triage data, including categorization, priority, confidence, missing information, recommended next actions, and clear follow-up questions when more context is needed.

## Features
- Category classification
- Priority classification
- Confidence scoring
- Issue summary
- Missing information identification
- Recommended next best action
- AI reasoning
- Follow-up question when information is insufficient
- Support for ambiguous tickets
- Safe error handling

## Tech Stack
### Frontend
- React
- Vite
- Tailwind CSS

### Backend
- Node.js
- Express

### AI
- OpenRouter

## Project Structure
- `client/` — React frontend application
- `server/` — Express API and triage processing logic

## Local Setup
Install dependencies and start the services locally:

```bash
cd client
npm install
npm run dev
```

```bash
cd server
npm install
npm run dev
```

Real API keys must be placed in environment variables and must never be committed to the repository.

## Environment Variables
The project uses environment variables already present in the existing application:

- `VITE_API_URL` — frontend API base URL
- `OPENROUTER_API_KEY` — backend OpenRouter API key
- `OPENROUTER_MODEL` — optional model override used by the backend when configured

Do not commit real secrets. Use local `.env` files only and keep them ignored by Git.

## API
The application exposes the following API endpoints:

- `GET /api/health` — health check
- `POST /api/triage` — triage a support ticket and return structured triage data

## Testing / Verification
The application has been verified against the official challenge tickets plus additional ambiguous, complex, and failure-handling scenarios to confirm expected triage behavior and safe UI responses.

## Deployment
The frontend and backend can be deployed separately. Each deployment environment must be configured with the required environment variables and the appropriate API base URL.

## License
This project uses the existing project license configuration unless otherwise specified.
