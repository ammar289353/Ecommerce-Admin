import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function POST(
    req: Request, 
     { params } :{params: {storeId : string} }  
)
     
{
  try {
    // Authenticate the user
    const { userId } = auth();

    // Parse JSON from the request body
    const body = await req.json();
    
    // Destructure the 'name' from the request body
    const { name ,value } = body;

    // Check if userId is available
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    // Check if 'label' is provided
    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!value) {
        return new NextResponse("Value is required", { status: 400 });
      }

    if (!params.storeId) {
        return new NextResponse("Store ID is required", { status: 400 });
      }

    const storeByUserId = await prismadb.store.findFirst({
        where : {
            id : params.storeId,
            userid : userId
        }
    })

    if (!storeByUserId) {
        return new NextResponse("Unauthorized", { status: 403 });
      }
    

    // Create a new billboard using Prisma
    const color = await prismadb.color.create({
      data: {
        name,
        value,
        storeId : params.storeId,
      },
    });

    // Return the created store as JSON
    return NextResponse.json(color);
  } catch (error) {
    // Log the error for debugging purposes
    console.log("[COLORS_POST]", error);

    // Return a generic internal error message with a 500 status
    return new NextResponse("Internal error", { status: 500 });
  }
}


export async function GET(
    req: Request, 
     { params } = {params: {storeId : "string"} }  
)
     
{
  try {
    if (!params.storeId) {
        return new NextResponse("Store ID is required", { status: 400 });
      }

    // Create a new billboard using Prisma
    const colors = await prismadb.color.findMany({
      where : {
        storeId : params.storeId,
      }
    });

    // Return the created store as JSON
    return NextResponse.json(colors);
  } catch (error) {
    // Log the error for debugging purposes
    console.log("[COLORS_GET]", error);

    // Return a generic internal error message with a 500 status
    return new NextResponse("Internal error", { status: 500 });
  }
}
