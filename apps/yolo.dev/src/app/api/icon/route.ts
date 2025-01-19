import path from "path";
import { promises as fs } from "fs";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const icon = url.searchParams.get("icon") || "apple-icon.png";
  const filePath = path.join(
    process.cwd(),
    `src/assets/${icon}`
  );

  try {
    const fileBuffer = await fs.readFile(filePath);
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": icon.includes("png") ? "image/png" : "image/svg+xml",
      },
    });
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }
}