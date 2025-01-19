import path from "path";
import { promises as fs } from "fs";
import { NextResponse } from "next/server";

export async function GET() {
  const filePath = path.join(process.cwd(), "src/assets/favicon.ico");
  const fileBuffer = await fs.readFile(filePath);

  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": "image/x-icon",
    },
  });
}