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

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { workspaces } = await readWorkspaces();
    const workspace = workspaces.find((w) => w.id === context.params.id);

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(workspace);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch workspace" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params; // Destructure id from params
    const workspaceData = await request.json();
    const { workspaces } = await readWorkspaces();

    const index = workspaces.findIndex((w) => w.id === id);
    if (index === -1) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    const updatedWorkspace = {
      ...workspaces[index],
      ...workspaceData,
      id, // Use the extracted id
      lastModified: new Date(),
    };

    workspaces[index] = updatedWorkspace;
    await writeWorkspaces(workspaces);

    return NextResponse.json(updatedWorkspace);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update workspace" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { workspaces } = await readWorkspaces();
    const filteredWorkspaces = workspaces.filter(
      (w) => w.id !== context.params.id
    );

    if (filteredWorkspaces.length === workspaces.length) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    await writeWorkspaces(filteredWorkspaces);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete workspace" },
      { status: 500 }
    );
  }
}
