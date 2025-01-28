//#todo DELETE THIS ENTIRE FILE AND FOLDER STRUCTURE (src/app/api/) WHEN REAL BACKEND IS INTEGRATED
// This is temporary dummy API implementation

import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { Workspace } from "@/components/workspace/types";

const DUMMY_DATA_PATH = path.join(
  process.cwd(),
  "src/dummy-data/workspaces.json"
);

async function readWorkspaces(): Promise<{ workspaces: Workspace[] }> {
  try {
    const data = await fs.readFile(DUMMY_DATA_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return { workspaces: [] };
  }
}

async function writeWorkspaces(workspaces: Workspace[]): Promise<void> {
  await fs.writeFile(DUMMY_DATA_PATH, JSON.stringify({ workspaces }, null, 2));
}

export async function GET() {
  try {
    const data = await readWorkspaces();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch workspaces" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const workspaceData = await request.json();
    const { workspaces } = await readWorkspaces();

    const newWorkspace: Workspace = {
      ...workspaceData,
      id: Math.random().toString(36).substr(2, 9),
      lastModified: new Date(),
    };

    workspaces.push(newWorkspace);
    await writeWorkspaces(workspaces);

    return NextResponse.json(newWorkspace);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create workspace" },
      { status: 500 }
    );
  }
}
