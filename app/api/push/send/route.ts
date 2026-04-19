import { auth } from "@/lib/auth";
import { sendPushToUser } from "@/lib/push";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, title, body, url } = await req.json();
    if (!userId || !title || !body) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    await sendPushToUser(userId, { title, body, url });
    return Response.json({ success: true });
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
