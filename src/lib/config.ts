// Backend URL - Penny AI deployed on Hugging Face Spaces
// Space: CyberShawties/Penny_V2
// For production (Azure Static Web App), use the Hugging Face Space URL
// For local development, you can override with environment variable
const envUrl = (import.meta as any).env?.VITE_PENNY_BACKEND_URL;
export const BACKEND_URL = envUrl || "https://CYBERSHAWTIES-PENNY-V2.hf.space";

// Penny Gradio API endpoint - Hugging Face Space uses Gradio
// Try /run endpoint first (simpler, direct call)
export const CHAT_ENDPOINT = `${BACKEND_URL}/run/chat_with_penny_sync`;
