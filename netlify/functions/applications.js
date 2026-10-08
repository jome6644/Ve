const { getStore } = require("@netlify/blobs");

function unauthorized() {
  return {
    statusCode: 401,
    headers: {
      "Content-Type": "application/json",
      "WWW-Authenticate": "Bearer"
    },
    body: JSON.stringify({ error: "Unauthorized." })
  };
}

exports.handler = async function (event) {
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method not allowed." })
    };
  }

  const password = process.env.ADMIN_PASSWORD || "";
  const auth = event.headers.authorization || "";
  const supplied = auth.startsWith("Bearer ") ? auth.slice(7) : "";

  if (!password || supplied !== password) {
    return unauthorized();
  }

  try {
    const store = getStore({ name: "vezxoxo-applications", consistency: "strong" });
    const result = await store.list({ prefix: "applications/" });

    const items = [];

    for (const blob of result.blobs) {
      const application = await store.get(blob.key, { type: "json", consistency: "strong" });
      if (application) {
        items.push(application);
      }
    }

    items.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      },
      body: JSON.stringify({ applications: items })
    };
  } catch {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Could not load applications." })
    };
  }
};
