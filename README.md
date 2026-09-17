# AI IT Support Triage Assistant

## Project Overview
This project is an AI-powered IT support triage assistant that helps classify user-reported support issues into a structured triage result. A user enters a support ticket, the system evaluates the issue, and the application returns a recommended category, priority, confidence score, summary, missing information, next diagnostic step, reasoning, and a follow-up question when more context is required.

The project is implemented as a React frontend and an Express backend that communicates with OpenRouter for AI-based classification.

## Key Features
- Ticket-based IT issue triage
- Category classification using the required set:
  - Network
  - Account
  - Application
  - Device
  - Other
- Priority classification using the required set:
  - Low
  - Medium
  - High
  - Critical
- Confidence scoring
- Structured summary of the issue
- Missing-information detection
- Recommended next step
- Explanation of the triage decision
- Follow-up question when additional context is needed
- Validation and safe error handling on the backend
- Support for ambiguous and incomplete tickets

## Tech Stack
### Frontend
- React
- Vite
- Tailwind CSS

### Backend
- Node.js
- Express

### AI Integration
- OpenRouter

## How It Works / Architecture
1. A user enters a support ticket in the React frontend.
2. The frontend sends the ticket to the Express backend.
3. The backend validates the incoming ticket data.
4. The backend forwards the ticket to OpenRouter AI.
5. The AI returns structured triage data in JSON format.
6. The backend validates and normalizes the response.
7. The backend returns the triage result to the frontend.
8. The frontend displays the category, priority, confidence, summary, missing information, next step, reasoning, and follow-up question when applicable.

## Local Setup
### Frontend
```bash
cd client
npm install
npm run dev
```

### Backend
```bash
cd server
npm install
npm run dev
```

The frontend runs locally with Vite, and the backend runs locally with Express.

## Environment Variables
Use local environment files only. Do not commit real secrets or API keys.

### Frontend
- `VITE_API_URL` — base URL for the frontend API requests

### Backend
- `OPENROUTER_API_KEY` — API key used to authenticate requests to OpenRouter
- `OPENROUTER_MODEL` — optional model override for the AI request
- `CLIENT_URL` — allowed frontend origin used by the backend CORS configuration

The project must keep real secrets out of Git and out of tracked files.

## API Endpoints
- `GET /api/health` — returns the backend health status
- `POST /api/triage` — submits a support ticket and receives structured triage output

## Deployment
- Frontend: https://ai-it-support-triage.vercel.app
- Backend: https://ai-it-support-triage.onrender.com

The frontend and backend are configured separately, and each environment must use the correct environment variables for its runtime.

## Challenge Coverage
This project is designed to support the official five challenge scenarios and the required classification categories:
- Network
- Account
- Application
- Device
- Other

The system also supports the required priority levels:
- Low
- Medium
- High
- Critical

## License
This project uses the existing project license configuration unless otherwise specified.
