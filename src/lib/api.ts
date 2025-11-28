import { CHAT_ENDPOINT } from "./config";

// Penny FastAPI request format - matches the repo's API spec
export interface PennyPayload {
  message: string;
  tenant_id?: string;
  user_id?: string;
  session_id?: string;
  // Location fields (both formats supported)
  lat?: number | null;
  lon?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  location_error?: string | null;
  // Legacy fields
  role?: string;
}

// Penny FastAPI response format - matches the repo's response spec
export interface PennyResponse {
  response: string | any;
  intent: string;
  tenant_id: string;
  session_id?: string;
  timestamp?: string;
  response_time_ms: number;
  error?: string;
}

export async function talkToPenny(
  payload: PennyPayload
): Promise<PennyResponse> {
  try {
    const res = await fetch(CHAT_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'No error details');
      throw new Error(`API Error: ${res.status} ${res.statusText} - ${errorText}`);
    }

    return res.json();
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
