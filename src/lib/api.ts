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
    // Gradio API uses a queue system
    // We'll use the /queue/push endpoint which handles the queue automatically
    const sessionHash = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fnIndex = 1; // chat_with_penny_sync function index
    
    // Submit job to queue
    const submitRes = await fetch(`${BACKEND_URL}/queue/push`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: [
          payload.message,
          payload.city || "Norfolk, VA",
          payload.history || []
        ],
        event_data: null,
        fn_index: fnIndex,
        trigger_id: Math.random().toString(),
        session_hash: sessionHash
      }),
    });

    if (!submitRes.ok) {
      const errorText = await submitRes.text().catch(() => 'No error details');
      throw new Error(`API Error: ${submitRes.status} ${submitRes.statusText} - ${errorText}`);
    }

    const submitData = await submitRes.json();
    const eventId = submitData.event_id || submitData.hash;

    // Poll for results using Server-Sent Events or polling
    // For simplicity, we'll poll the status endpoint
    let attempts = 0;
    const maxAttempts = 60; // 30 seconds max (500ms * 60)
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        const statusRes = await fetch(`${BACKEND_URL}/queue/status`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            hash: sessionHash
          }),
        });
        
        if (statusRes.ok) {
          const status = await statusRes.json();
          
          if (status.status === "COMPLETE" && status.data) {
            const result = status.data;
            const history = Array.isArray(result) && result[0] ? result[0] : [];
            const lastMessage = history.length > 0 ? history[history.length - 1] : null;
            const botReply = lastMessage?.[1] || lastMessage?.[1] || "I'm sorry, I didn't get a response.";
            
            return {
              data: result,
              response: botReply,
              history: history
            };
          } else if (status.status === "FAILED") {
            throw new Error(`Job failed: ${status.message || "Unknown error"}`);
          }
          // Otherwise, still processing
        }
      } catch (pollError) {
        // Continue polling on error
      }
      
      attempts++;
    }
    
    throw new Error("Request timeout - Penny took too long to respond");
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
