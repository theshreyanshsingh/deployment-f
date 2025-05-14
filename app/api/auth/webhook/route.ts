import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { repo, accessToken, owner } = await req.json();

    if (!repo || !accessToken) {
      return NextResponse.json(
        { error: "Missing repo or token" },
        { status: 400 }
      );
    }

    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/hooks`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "web",
          active: true,
          events: ["push", "pull_request"],
          config: {
            url: `https://nearzero.dev/api/webhook`,
            content_type: "json",
            secret: "05c30f858631f9305957334249206796f2a29827",
            insecure_ssl: "0",
          },
        }),
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { error: "Failed to create webhook", detail: errorText },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({ message: "Webhook created", hook: data });
  } catch (err) {
    console.error("Create webhook error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export const GET = () =>
  NextResponse.json({ message: "Create GitHub webhook endpoint" });
