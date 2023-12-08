import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
  try {
    // Authenticate the user
    const { userId } = auth();

    // Parse JSON from the request body
    const body = await req.json();
    
    // Destructure the 'name' from the request body
    const { name } = body;

    // Check if userId is available
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if 'name' is provided
    if (!name || typeof name !== "string" || name.trim() === "") {
      return new NextResponse("Name is required", { status: 400 });
    }

    // Create a new store using Prisma
    const store = await prismadb.store.create({
      data: {
        name,
        userid: userId,
      },
    });

    // Return the created store as JSON
    return NextResponse.json(store);
  } catch (error) {
    // Log the error for debugging purposes
    console.log("[STORES_POST]", error);

    // Return a generic internal error message with a 500 status
    return new NextResponse("Internal error", { status: 500 });
  }
}
