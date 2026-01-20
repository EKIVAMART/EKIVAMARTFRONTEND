import { NextRequest, NextResponse } from "next/server";
import { verifyWebhook } from "@clerk/backend/webhooks";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  // verify incoming webhook (signature + body)
  let event;
  try {
    event = await verifyWebhook(req); 
    // returns { type: "user.created", data: { … } }
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return NextResponse.json({ error: "Invalid webhook" }, { status: 400 });
  }

  const { type, data } = event;

  try {
    switch (type) {
      case "user.created":
      case "user.updated":
        await prisma.user.upsert({
          where: { clerkId: data.id },
          update: {
            email: data.email_addresses?.[0]?.email_address || "",
            name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
            image: data.image_url || "",
          },
          create: {
            clerkId: data.id,
            email: data.email_addresses?.[0]?.email_address || "",
            name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
            image: data.image_url || "",
          },
        });
        break;

      case "user.deleted":
        await prisma.user.deleteMany({
          where: { clerkId: data.id },
        });
        break;

      default:
        console.warn("Unhandled event:", type);
        break;
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("DB persistence failed:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
