import fetch from "node-fetch";

export async function POST(req, context) {
  const hfURL = "https://huggingface.co/spaces/pythonprincess/Penny_V2.2";
  const token = process.env.HF_TOKEN;

  const input = await req.json();

  const response = await fetch(hfURL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input)
  });

  const result = await response.json();
  return new Response(JSON.stringify(result), {
    headers: { "Content-Type": "application/json" }
  });
}
