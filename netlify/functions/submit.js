const nodemailer = require("nodemailer");

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

function escapeHtml(value) {
  return clean(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || "true") === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const rows = [
    ["Name", body.name],
    ["Age", body.age],
    ["Profession", body.profession],
    ["Marital Status", body.marital_status],
    ["City / Country", body.location],
    ["Email", body.email],
    ["Acting Skill", body.acting],
    ["Acting Notes", body.acting_notes],
    ["Advertisement Experience", body.ads],
    ["Advertisement Notes", body.ads_notes],
    ["Comfortable on Camera", body.camera],
    ["Short Script Performance", body.script],
    ["Preferred Products", body.preferred_products],
    ["Non-Preferred Products", body.non_preferred_products],
    ["Partial Body Exposure", body.partial_exposure],
    ["Exposure Boundaries", body.partial_exposure_notes],
    ["Provocative / Revealing Outfits", body.provocative_outfits],
    ["No-Face Filming for Nudity", body.no_face_nudity],
    ["Wardrobe Restrictions", body.wardrobe],
    ["Wardrobe Notes", body.wardrobe_notes],
    ["Non-Explicit Romantic Scenes", body.romantic],
    ["Travel for Shoots", body.travel],
    ["Preferred Project Types", body.project_types.join(", ")],
    ["Availability", body.availability],
    ["Additional Notes", body.additional_notes]
  ];

  const textBody = rows
    .map(([label, value]) => `${label}: ${clean(value)}`)
    .join("\n");

  const htmlRows = rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:10px;border:1px solid #ddd;font-weight:700;vertical-align:top;">${escapeHtml(label)}</td>
          <td style="padding:10px;border:1px solid #ddd;white-space:pre-wrap;">${escapeHtml(value)}</td>
        </tr>`
    )
    .join("");

  try {
    await transporter.sendMail({
      from: `"vezxoxo" <${process.env.SMTP_USER}>`,
      to: process.env.FORM_RECIPIENT,
      replyTo: clean(body.email),
      subject: `New vezxoxo application - ${clean(body.name)}`,
      text: textBody,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:760px;margin:auto;">
          <h2>New vezxoxo Application</h2>
          <table style="border-collapse:collapse;width:100%;">
            ${htmlRows}
          </table>
        </div>
      `
    });
  } catch {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Email delivery failed." })
    };
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ok: true })
  };
};
