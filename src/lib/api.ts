import { CHAT_ENDPOINT, BACKEND_URL, API_URL } from "./config";

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
    // Call Hugging Face Space directly (no Azure Function)
    const sessionHash = payload.session_id || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Prepare Gradio API request format
    const dataArray = [
      payload.message || "",
      payload.city || "Norfolk, VA",
      payload.history || []
    ];
    
    const requestBody = {
      data: dataArray,
      event_data: null,
      fn_index: 1, // Try fn_index 1 first (most common for chat functions)
      session_hash: sessionHash
    };
    
    console.log("Calling Penny directly via Hugging Face Space:", {
      endpoint: `${BACKEND_URL}/run/predict`,
      payload: {
        message: payload.message,
        city: payload.city,
        history_length: payload.history?.length || 0
      }
    });
    
    // Try /run/predict endpoint (Gradio's standard API endpoint)
    let predictEndpoint = `${BACKEND_URL}/run/predict`;
    let res = await fetch(predictEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    // If /run/predict fails, try /api/predict (Gradio 4.x+)
    if (!res.ok && (res.status === 404 || res.status === 500)) {
      console.log("Trying /api/predict endpoint...");
      predictEndpoint = `${BACKEND_URL}/api/predict`;
      res = await fetch(predictEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
    }
    
    // If still failing, try fn_index 0
    if (!res.ok && res.status === 500) {
      console.log("Trying fn_index 0...");
      requestBody.fn_index = 0;
      res = await fetch(predictEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
    }

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'No error details');
      console.error("Penny API error response:", {
        status: res.status,
        statusText: res.statusText,
        errorText: errorText.substring(0, 500)
      });
      throw new Error(`API Error: ${res.status} ${res.statusText} - ${errorText.substring(0, 200)}`);
    }

    const result = await res.json();
    console.log("Penny API response:", result);
    
    // Handle Gradio response format
    // Gradio returns { data: [chatbot_history, cleared_message] }
    // chatbot_history is array of [user_msg, bot_msg] tuples
    const responseData = result.data || result;
    
    // Handle different response formats
    let history: Array<[string | null, string | null]> = [];
    let botReply = "I'm sorry, I didn't get a response.";
    
    if (Array.isArray(responseData)) {
      // Standard format: [chatbot_history, cleared_message]
      if (responseData[0] && Array.isArray(responseData[0])) {
        history = responseData[0];
        const lastMessage = history.length > 0 ? history[history.length - 1] : null;
        botReply = lastMessage?.[1] || responseData[1] || botReply;
      } else if (responseData[0] && typeof responseData[0] === 'string') {
        // Sometimes it's just the message string
        botReply = responseData[0];
      }
    } else if (typeof responseData === 'string') {
      botReply = responseData;
    }
    
    return {
      data: responseData,
      response: botReply,
      history: history
    };
  } catch (error: any) {
    // Enhanced error logging
    console.error("Penny API call failed:", {
      endpoint: CHAT_ENDPOINT,
      backendUrl: BACKEND_URL,
      payload,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}
