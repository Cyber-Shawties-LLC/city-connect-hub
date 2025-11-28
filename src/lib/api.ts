import { CHAT_ENDPOINT, BACKEND_URL } from "./config";

// Penny Gradio API request format - Hugging Face Space uses Gradio
export interface PennyPayload {
  message: string;
  city?: string; // City selection (e.g., "Norfolk, VA")
  history?: Array<[string | null, string | null]>; // Chat history as tuples
  tenant_id?: string;
  user_id?: string;
  session_id?: string;
  // Location fields (both formats supported)
  lat?: number | null;
  lon?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  location_error?: string | null;
}

// Penny Gradio API response format - returns [chatbot_history, message]
// chatbot_history is an array of [user_message, bot_message] tuples
export interface PennyResponse {
  data: [
    Array<[string | null, string | null]>, // Updated chat history
    string // Cleared message input
  ];
  // For compatibility, we'll extract the last bot message
  response?: string;
  history?: Array<[string | null, string | null]>;
}

export async function talkToPenny(
  payload: PennyPayload
): Promise<PennyResponse> {
  try {
    // Gradio API - use /run endpoint (direct API call, simpler)
    // Format: POST with array of parameters [message, city, history]
    const res = await fetch(CHAT_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        payload.message,
        payload.city || "Norfolk, VA",
        payload.history || []
      ]),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'No error details');
      
      // If /run doesn't work, provide helpful error
      if (res.status === 404) {
        throw new Error(`Endpoint not found. The Gradio API endpoint might be different. Check the Space's API documentation.`);
      }
      
      throw new Error(`API Error: ${res.status} ${res.statusText} - ${errorText}`);
    }

    const result = await res.json();
    
    // Gradio returns [chatbot_history, cleared_message]
    // chatbot_history is array of [user_msg, bot_msg] tuples
    const history = Array.isArray(result) && result[0] ? result[0] : [];
    const lastMessage = history.length > 0 ? history[history.length - 1] : null;
    const botReply = lastMessage?.[1] || "I'm sorry, I didn't get a response.";
    
    return {
      data: result,
      response: botReply,
      history: history
    };
  } catch (error: any) {
    // Enhanced error logging
    console.error("Penny API call failed:", {
      endpoint: CHAT_ENDPOINT,
      payload,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}
