const { getStore } = require("@netlify/blobs");
const crypto = require("crypto");

const requiredFields = [
  "name",
  "age",
  "profession",
  "marital_status",
  "location",
  "email",
  "acting",
  "acting_notes",
  "ads",
  "ads_notes",
  "camera",
  "script",
  "preferred_products",
  "non_preferred_products",
  "partial_exposure",
  "partial_exposure_notes",
  "provocative_outfits",
  "no_face_nudity",
  "wardrobe",
  "wardrobe_notes",
  "romantic",
  "travel",
  "availability",
  "additional_notes"
];

function clean(value) {
  return String(value ?? "").trim();
}

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method not allowed." })
    };
  }

  let body;

  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Invalid request." })
    };
  }

  for (const field of requiredFields) {
    if (!clean(body[field])) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Missing required fields." })
      };
    }
  }

  const age = Number(body.age);

  if (!Number.isInteger(age) || age < 18) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Applicants must be 18 or older." })
    };
  }

  if (!Array.isArray(body.project_types) || body.project_types.length === 0) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Select at least one project type." })
    };
  }

  const submission = {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    name: clean(body.name),
    age,
    profession: clean(body.profession),
    marital_status: clean(body.marital_status),
    location: clean(body.location),
    email: clean(body.email),
    acting: clean(body.acting),
    acting_notes: clean(body.acting_notes),
    ads: clean(body.ads),
    ads_notes: clean(body.ads_notes),
    camera: clean(body.camera),
    script: clean(body.script),
    preferred_products: clean(body.preferred_products),
    non_preferred_products: clean(body.non_preferred_products),
    partial_exposure: clean(body.partial_exposure),
    partial_exposure_notes: clean(body.partial_exposure_notes),
    provocative_outfits: clean(body.provocative_outfits),
    no_face_nudity: clean(body.no_face_nudity),
    wardrobe: clean(body.wardrobe),
    wardrobe_notes: clean(body.wardrobe_notes),
    romantic: clean(body.romantic),
    travel: clean(body.travel),
    project_types: body.project_types.map(clean),
    availability: clean(body.availability),
    additional_notes: clean(body.additional_notes)
  };

  try {
    const store = getStore({ name: "vezxoxo-applications", consistency: "strong" });
    await store.setJSON(`applications/${submission.created_at}-${submission.id}`, submission);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: true })
    };
  } catch {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Could not save application." })
    };
  }
};
