import { connectDB } from "@/lib/mongodb";
import Settings from "@/models/Settings";

async function getOrCreateSettings() {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({
      thicknessRatio: 0.15,
      maxAddons: 3,
      cups: [
        { name: "Small", ml: 250, price: 0 },
        { name: "Medium", ml: 350, price: 15 },
        { name: "Large", ml: 500, price: 30 },
      ],
    });
  }
  return settings;
}

export async function GET() {
  await connectDB();
  const settings = await getOrCreateSettings();
  return Response.json(settings);
}

// PUT /api/settings -> owner tunes thickness ratio, cup sizes, max addons
export async function PUT(req) {
  await connectDB();
  const body = await req.json();
  const settings = await getOrCreateSettings();
  Object.assign(settings, body);
  await settings.save();
  return Response.json(settings);
}
