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
    const { 
      name, 
      price,
      categoryId, 
      colorId,
      sizeId,
      images,
      isFeatured,
      isArchived,
     } = body;

    // Check if userId is available
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    // Check if 'label' is provided
    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!images || !images.length) {
      return new NextResponse("Images are required", { status: 400 });
    }

    if (!price) {
        return new NextResponse("Price is required", { status: 400 });
      }

      if (!categoryId) {
        return new NextResponse("Category Id required", { status: 400 });
      }

      if (!sizeId) {
        return new NextResponse("Size Id is required", { status: 400 });
      }

      if (!colorId) {
        return new NextResponse("Color Id is required", { status: 400 });
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
    

    // Create a new product using Prisma
    const product = await prismadb.product.create({
      data: {
        name,
        price,
        isFeatured,
        isArchived,
        categoryId,
        colorId,
        sizeId,
        storeId : params.storeId,
        images : {
          createMany: {
            data : [
              ...images.map((image : {url : string}) => image)
            ]
          }
        }
      },
    });

    // Return the created store as JSON
    return NextResponse.json(product);
  } catch (error) {
    // Log the error for debugging purposes
    console.log("[PRODUCTS_POST]", error);

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
    const { searchParams } =new URL(req.url);
    const  categoryId = searchParams.get("categoryId") || undefined;
    const  colorId = searchParams.get("colorId") || undefined;
    const  sizeId = searchParams.get("sizeId") || undefined;
    const  isFeatured = searchParams.get("isFeatured");


    if (!params.storeId) {
        return new NextResponse("Store Id is required", { status: 400 });
      }

    // Create a new product using Prisma
    const products = await prismadb.product.findMany({
      where : {
        storeId : params.storeId,
        categoryId,
        colorId,
        sizeId,
        isFeatured : isFeatured ? true : undefined,
        isArchived : false,
      },
      include : {
        images : true,
        category :true,
        color :true,
        size :true,
      },
      orderBy :{
        createdAt : 'desc'
      }
    });

    // Return the created store as JSON
    return NextResponse.json(products);
  } catch (error) {
    // Log the error for debugging purposes
    console.log("[PRODUCTS_GET]", error);

    // Return a generic internal error message with a 500 status
    return new NextResponse("Internal error", { status: 500 });
  }
}
