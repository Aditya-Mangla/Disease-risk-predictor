# Disease Risk - React conversion

This is a React/Vite conversion of the supplied Disease Risk frontend. Existing CSS/design files are reused rather than redesigned.

## Flow
1. Home page remains visually the same.
2. Clicking Start Health Assessment while logged out sends the user to Login.
3. Only a logged-in user can open the assessment.
4. The same 45 symptoms are shown, 12 per page, with the same Yes/No flow.
5. On completion, React sends one POST request to `VITE_DISEASE_API_URL` (default `http://127.0.0.1:5000/predict-disease`).
6. If the backend returns a valid response, the response is displayed.
7. If the backend fails, times out, returns a non-JSON response, or returns no response, the error page is shown.
8. Dashboard remains protected by login.

## Backend response
The UI recognizes these common disease keys: `disease`, `prediction`, `predicted_disease`, `predictedDisease`, `result`.
It also recognizes optional risk fields: `risk_percentage`, `riskPercentage`, `risk_score`, `riskScore`, `percentage`, `risk_level`, `riskLevel`, `level`, `risk`.
If your backend uses different keys, edit `src/api.js`.

## Run
```bash
npm install
npm run dev
```

Set your real backend endpoint in `.env`:
```env
VITE_DISEASE_API_URL=http://127.0.0.1:5000/predict-disease
```

Your Python backend must allow CORS from the Vite frontend origin.
