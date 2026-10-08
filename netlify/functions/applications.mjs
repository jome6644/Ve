import { getStore } from "@netlify/blobs";

export default async (req) => {
  if (req.method !== "GET") {
    return Response.json({ error: "Method not allowed." }, { status: 405 });
  }

  const expectedPassword = process.env.ADMIN_PASSWORD || "";
  const authorization = req.headers.get("authorization") || "";
  const suppliedPassword = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : "";

  if (!expectedPassword || suppliedPassword !== expectedPassword) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const store = getStore("vezxoxo-applications");
    const result = await store.list({ prefix: "applications/" });
    const applications = [];

    for (const blob of result.blobs) {
      const application = await store.get(blob.key, { type: "json" });
      if (application) {
        applications.push(application);
      }
    }

    applications.sort((a, b) =>
      String(b.created_at).localeCompare(String(a.created_at))
    );

    return Response.json(
      { applications },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Blob read error:", error);
    return Response.json({ error: "Could not load applications." }, { status: 500 });
  }
};
