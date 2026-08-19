import { NextResponse } from "next/server";

export async function GET() {
  // Temporary stub so dashboard doesn't break
  return NextResponse.json(
  {
    success: true,
    astro: {
      sunSign: null,
      moonSign: null,
      ascendant: null,
      dominantElement: null,
      dominantPlanet: null,
    },
  },
  { status: 200 }
);
}