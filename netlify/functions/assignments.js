import { getStore } from "@netlify/blobs";

export default async (req) => {
  const store = getStore("potluck");

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // GET — return all assignments
    if (req.method === "GET") {
      let data = {};
      try {
        data = await store.get("assignments", { type: "json" }) || {};
      } catch (e) {
        data = {};
      }
      return Response.json(data, { headers: corsHeaders });
    }

    // POST — claim a dish slot
    if (req.method === "POST") {
      const body = await req.json();
      const { slotId, name, dish, diet } = body;

      if (!slotId || !name) {
        return Response.json(
          { error: "slotId and name are required" },
          { status: 400, headers: corsHeaders }
        );
      }

      // Get current assignments
      let current = {};
      try {
        current = await store.get("assignments", { type: "json" }) || {};
      } catch (e) {
        current = {};
      }

      // Check slot isn't already taken
      if (current[slotId]) {
        return Response.json(
          { error: "This slot is already claimed" },
          { status: 409, headers: corsHeaders }
        );
      }

      // Save the new assignment
      current[slotId] = {
        name: name.trim(),
        dish: (dish || "").trim(),
        diet: (diet || "").trim(),
        claimedAt: new Date().toISOString(),
      };

      await store.set("assignments", JSON.stringify(current));

      return Response.json({ ok: true, assignments: current }, { headers: corsHeaders });
    }

    // DELETE — remove a slot (host only)
    if (req.method === "DELETE") {
      const body = await req.json();
      const { slotId, hostKey } = body;

      // Simple host key check — set this in your Netlify env vars
      const validKey = process.env.HOST_KEY || "carol2024";
      if (hostKey !== validKey) {
        return Response.json(
          { error: "Unauthorized" },
          { status: 401, headers: corsHeaders }
        );
      }

      let current = {};
      try {
        current = await store.get("assignments", { type: "json" }) || {};
      } catch (e) {
        current = {};
      }

      delete current[slotId];
      await store.set("assignments", JSON.stringify(current));

      return Response.json({ ok: true, assignments: current }, { headers: corsHeaders });
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
  path: "/api/assignments",
};
