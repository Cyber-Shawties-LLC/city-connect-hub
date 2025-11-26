import { CHAT_ENDPOINT } from "./config";

export interface PennyPayload {
  input: string;
  tenant_id?: string;
  lat?: number;
  lon?: number;
  role?: string;
}

export interface PennyResponse {
  response: any;
  intent: string;
  model_id: string;
  tenant_id: string;
  user_role: string;
  response_time_ms: number;
  error?: string;
}

export async function talkToPenny(
  payload: PennyPayload
): Promise<PennyResponse> {
  const res = await fetch(CHAT_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`API Error: ${res.status}`);
  }

  return res.json();
}
