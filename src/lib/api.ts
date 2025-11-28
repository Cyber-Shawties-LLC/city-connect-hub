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
    // The error shows FastAPI expects a dictionary, but Gradio passes arrays
    // We need to use /run/predict which is the Gradio API endpoint
    // The backend error suggests the FastAPI endpoint is receiving the wrong format
    // Let's use the Gradio /run/predict endpoint with proper queue handling
    const sessionHash = payload.session_id || `session_${Date.now()}`;
    const predictEndpoint = `${BACKEND_URL}/run/predict`;
    
    const res = await fetch(predictEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fn_index: 1, // chat_with_penny_sync function index
        data: [
          payload.message,
          payload.city || "Norfolk, VA",
          payload.history || []
        ],
        session_hash: sessionHash,
        event_data: null
      }),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'No error details');
      throw new Error(`API Error: ${res.status} ${res.statusText} - ${errorText}`);
    }

    const result = await res.json();
    
    // Gradio returns { data: [chatbot_history, cleared_message] }
    // chatbot_history is array of [user_msg, bot_msg] tuples
    const responseData = result.data || result;
    const history = Array.isArray(responseData) && responseData[0] ? responseData[0] : [];
    const lastMessage = history.length > 0 ? history[history.length - 1] : null;
    const botReply = lastMessage?.[1] || "I'm sorry, I didn't get a response.";
    
    return {
      data: responseData,
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
