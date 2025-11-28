// Backend URL - Penny AI deployed on Hugging Face Spaces
// Space: CyberShawties/Penny_V2
// For production (Azure Static Web App), use the Hugging Face Space URL
// For local development, you can override with environment variable
const envUrl = (import.meta as any).env?.VITE_PENNY_BACKEND_URL;
export const BACKEND_URL = envUrl || "https://CYBERSHAWTIES-PENNY-V2.hf.space";

// Penny FastAPI endpoint - matches the /chat route from the repo
// If your deployment uses /api/chat, change this to: `${BACKEND_URL}/api/chat`
export const CHAT_ENDPOINT = `${BACKEND_URL}/chat`;

// Alternative endpoint if /chat doesn't work (uncomment to try):
// export const CHAT_ENDPOINT = `${BACKEND_URL}/api/chat`;
