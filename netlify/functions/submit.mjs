import { getStore } from "@netlify/blobs";

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

export default async (req) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed." }, { status: 405 });
  }

  let body;

  try {
    body = await req.json();
  } catch (error) {
    console.error("Invalid request body:", error);
    return Response.json({ error: "Submission failed." }, { status: 400 });
  }

  for (const field of requiredFields) {
    if (!clean(body[field])) {
      console.error("Missing required field:", field);
      return Response.json({ error: "Submission failed." }, { status: 400 });
    }
  }

  const age = Number(body.age);

  if (!Number.isInteger(age) || age < 18) {
    console.error("Invalid applicant age:", body.age);
    return Response.json({ error: "Submission failed." }, { status: 400 });
  }

  if (!Array.isArray(body.project_types) || body.project_types.length === 0) {
    console.error("No project type selected.");
    return Response.json({ error: "Submission failed." }, { status: 400 });
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
    const store = getStore("vezxoxo-applications");
    const key = `applications/${submission.created_at}-${submission.id}`;
    await store.setJSON(key, submission);

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Blob save error:", error);
    return Response.json({ error: "Submission failed." }, { status: 500 });
  }
};
