// Backend URL - Penny AI deployed on Hugging Face Spaces
// Space: pythonprincess/Penny_V2.2
// URL: https://huggingface.co/spaces/pythonprincess/Penny_V2.2
// For production (Azure Static Web App), use the Hugging Face Space URL
// For local development, you can override with environment variable
const envUrl = (import.meta as any).env?.VITE_PENNY_BACKEND_URL;
export const BACKEND_URL = envUrl || "https://pythonprincess-penny-v2-2.hf.space";

// Azure Static Web Apps API endpoint (for Python functions)
// This will be proxied by Azure to the actual Azure Function
export const API_URL = (import.meta as any).env?.VITE_API_URL || "/api";

// Penny Gradio API endpoint - Hugging Face Space uses Gradio
// Use /run/predict endpoint (Gradio's standard API endpoint)
export const CHAT_ENDPOINT = `${BACKEND_URL}/run/predict`;
