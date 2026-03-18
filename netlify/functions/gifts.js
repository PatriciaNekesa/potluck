import { getStore } from "@netlify/blobs";

export default async (req) => {
  const store = getStore("potluck");

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // GET — return all gift contributions
    if (req.method === "GET") {
      let data = {};
      try {
        data = await store.get("gifts", { type: "json" }) || {};
      } catch (e) {
        data = {};
      }
      return Response.json(data, { headers: corsHeaders });
    }

    // POST — add a gift contribution
    if (req.method === "POST") {
      const body = await req.json();
      const { contributionId, name, amount } = body;

      if (!contributionId || !name || !amount) {
        return Response.json(
          { error: "contributionId, name, and amount are required" },
          { status: 400, headers: corsHeaders }
        );
      }

      const parsedAmount = parseInt(amount, 10);
      if (isNaN(parsedAmount) || parsedAmount < 1000) {
        return Response.json(
          { error: "Amount must be at least 1,000 UGX" },
          { status: 400, headers: corsHeaders }
        );
      }

      // Get current gifts
      let current = {};
      try {
        current = await store.get("gifts", { type: "json" }) || {};
      } catch (e) {
        current = {};
      }

      // Save the new contribution
      current[contributionId] = {
        name: name.trim(),
        amount: parsedAmount,
        status: "pledged",
        contributedAt: Date.now(),
      };

      await store.set("gifts", JSON.stringify(current));

      return Response.json({ ok: true, gifts: current }, { headers: corsHeaders });
    }

    // PUT — toggle contribution status (host only)
    if (req.method === "PUT") {
      const body = await req.json();
      const { contributionId, hostKey } = body;

      // Simple host key check — set this in your Netlify env vars
      const validKey = process.env.HOST_KEY || "carol2024";
      if (hostKey !== validKey) {
        return Response.json(
          { error: "Unauthorized" },
          { status: 401, headers: corsHeaders }
        );
      }

      if (!contributionId) {
        return Response.json(
          { error: "contributionId is required" },
          { status: 400, headers: corsHeaders }
        );
      }

      // Get current gifts
      let current = {};
      try {
        current = await store.get("gifts", { type: "json" }) || {};
      } catch (e) {
        current = {};
      }

      if (!current[contributionId]) {
        return Response.json(
          { error: "Contribution not found" },
          { status: 404, headers: corsHeaders }
        );
      }

      // Toggle status
      current[contributionId].status = current[contributionId].status === "pledged" ? "received" : "pledged";
      await store.set("gifts", JSON.stringify(current));

      return Response.json({ ok: true, gifts: current }, { headers: corsHeaders });
    }

    return Response.json({ error: "Method not allowed" }, { status: 405, headers: corsHeaders });

  } catch (err) {
    console.error("Function error:", err);
    return Response.json(
      { error: "Something went wrong" },
      { status: 500, headers: corsHeaders }
    );
  }
};

export const config = {
  path: "/api/gifts",
};
