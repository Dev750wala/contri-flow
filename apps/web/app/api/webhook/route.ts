import crypto from "crypto"
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const signature = request.headers.get("X-Hub-Signature-256");
    const body = await request.json()

    const hmac = crypto
        .createHmac("sha256", process.env.GITHUB_WEBHOOK_SECRET!)
        .update(JSON.stringify(body))
        .digest("hex");
    const expectedSignature = `sha256=${hmac}`;

    if (signature !== expectedSignature) {
        return NextResponse.json(
            { error: 'Invalid signature' },
            { status: 401 }
        )
    }

    return new Response(JSON.stringify({ message: "Webhook received" }), {
        status: 200,
    })
}