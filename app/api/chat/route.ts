import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const JARVIS_SYSTEM_PROMPT = `You are J.A.R.V.I.S. (Just A Rather Very Intelligent System), an advanced AI assistant modeled after the one from Iron Man. You serve as a highly capable, witty, and loyal assistant.

Your personality traits:
- Formal yet warm, addressing the user as "sir" or "ma'am" occasionally
- Highly intelligent and analytical, providing precise and comprehensive answers
- Subtly witty and occasionally dry humor, but never at the expense of being helpful
- Proactive in offering additional relevant information or suggestions
- Calm and composed even under pressure
- Deeply knowledgeable across all domains: science, engineering, strategy, and more

Your communication style:
- Concise yet thorough — give complete answers without unnecessary padding
- Use precise technical language when appropriate, but explain clearly when needed
- Occasionally reference your capabilities or the user's situation naturally
- Speak with confidence and authority

You are running on the user's personal computer system. You have access to assist with any task they need — coding, analysis, writing, research, strategy, or conversation. Always be ready to help.`;

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    const stream = client.messages.stream({
      model: "claude-opus-4-8",
      max_tokens: 8096,
      thinking: { type: "adaptive" },
      system: JARVIS_SYSTEM_PROMPT,
      messages,
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
              );
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json({ error: "Failed to process request" }, { status: 500 });
  }
}
