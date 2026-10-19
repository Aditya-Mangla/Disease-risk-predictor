# Disease Risk - React conversion

This is a React/Vite conversion of the supplied Disease Risk frontend. Existing CSS/design files are reused rather than redesigned.

## Flow
1. Home page remains visually the same.
2. Clicking Start Health Assessment while logged out sends the user to Login.
3. Only a logged-in user can open the assessment.
4. Symptoms are shown 12 per page with the same Yes/No flow.
5. On completion, React sends the selected symptoms as a string array to the authenticated Express route at `VITE_DISEASE_API_URL` (default `http://localhost:8000/api/v1/prediction/disease-prediction`).
6. After Express returns a prediction, React saves the symptoms and result through the authenticated `/prediction/create` route.
7. The dashboard loads assessment history from the authenticated `/prediction/history` route.
8. If prediction or saving fails, the error page explains the failure rather than showing an unsaved result as complete.
9. Dashboard remains protected by login.

## Backend response
The UI recognizes these common disease keys either in the response body or inside its `data` field: `disease`, `prediction`, `predicted_disease`, `predictedDisease`, `result`.
It also recognizes optional risk fields: `risk_percentage`, `riskPercentage`, `risk_score`, `riskScore`, `percentage`, `risk_level`, `riskLevel`, `level`, `risk`.
If your backend uses different keys, edit `src/api.js`.

## Run
```bash
npm install
npm run dev
```

The default backend URL is `http://localhost:8000/api/v1`. Keep `localhost` in the browser URL so it matches the backend's default CORS origin. Override it or the prediction route in `.env` if needed:
```env
VITE_BACKEND_API_URL=http://localhost:8000/api/v1
# Optional full prediction endpoint override:
# VITE_DISEASE_API_URL=http://127.0.0.1:8000/api/v1/prediction/disease-prediction
```

Run the Express backend on port 8000 and the disease FastAPI service on port 8001; `DISEASE_MODEL_URL` must point to the FastAPI `/predict` route. For example, from `ML/Disease prediction Model`, run `python -m uvicorn main_basic:app --host 0.0.0.0 --port 8001 --reload`. The frontend sends the saved bearer token to the protected Express prediction route.
