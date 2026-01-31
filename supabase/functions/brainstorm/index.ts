import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BrainstormRequest {
  ideaId: string;
  title: string;
  content?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { ideaId, title, content } = (await req.json()) as BrainstormRequest;

    if (!ideaId || !title) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: ideaId and title" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are "The Super-Mentor" — a fusion of three minds:
- Marty Cagan (product thinking: what's the real problem? what's valuable?)
- W. Chan Kim (Blue Ocean strategy: where's the uncontested space?)
- Paul Graham (startup instinct: what's the insight others are missing?)

YOUR VOICE - THIS IS CRITICAL:
- Talk like a real person. Not a corporate deck. Not a LinkedIn post.
- Vary your sentences. Short ones. Then maybe a longer one that builds on the thought.
- No buzzwords. Never say: leverage, synergy, game-changing, cutting-edge, innovative, disruptive, scalable, robust, seamless, holistic, paradigm, ecosystem.
- Be direct. If something's weak, say it's weak. If it's interesting, get excited about it.
- Use "you" and "your" — you're talking TO someone, not writing a report.
- It's okay to be uncertain. "I'm not sure, but..." or "This could go either way..." is honest.
- Throw in the occasional question back at them. Make them think.

You give:
1. REFINEMENTS: Specific ways to sharpen the idea. Not vague advice. Concrete moves.
2. WHAT-IF PROMPTS: Interesting angles they probably haven't considered. Push their thinking.
3. NEXT STEPS: What should they actually DO tomorrow? Real actions.
4. VERDICT: Your honest take on this idea in 2-3 sentences. Where's the potential? What's the risk? Be real.`;

    const userPrompt = `Here's an idea someone's working on:

Title: ${title}
${content ? `Details: ${content}` : '(No additional details provided)'}

Give them your Super-Mentor take. Remember — talk like a human, not a chatbot.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "provide_mentor_feedback",
              description: "Provide Super-Mentor feedback on the idea",
              parameters: {
                type: "object",
                properties: {
                  refinements: {
                    type: "array",
                    items: { type: "string" },
                    description: "Two specific, concrete improvements — no fluff",
                  },
                  whatIfs: {
                    type: "array",
                    items: { type: "string" },
                    description: "Two 'What if...' questions that push their thinking",
                  },
                  nextSteps: {
                    type: "array",
                    items: { type: "string" },
                    description: "Two real actions they can take tomorrow",
                  },
                  verdict: {
                    type: "string",
                    description: "Your honest 2-3 sentence take on this idea. Potential and risks. Be real.",
                  },
                },
                required: ["refinements", "whatIfs", "nextSteps", "verdict"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "provide_mentor_feedback" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      throw new Error("No suggestions returned from AI");
    }

    const suggestions = JSON.parse(toolCall.function.arguments);

    // Store suggestions in the database
    const suggestionsToInsert = [
      ...suggestions.refinements.map((content: string) => ({
        idea_id: ideaId,
        suggestion_type: "refinement",
        content,
      })),
      ...suggestions.whatIfs.map((content: string) => ({
        idea_id: ideaId,
        suggestion_type: "what_if",
        content,
      })),
      ...suggestions.nextSteps.map((content: string) => ({
        idea_id: ideaId,
        suggestion_type: "next_step",
        content,
      })),
      // Add the verdict as a new suggestion type
      {
        idea_id: ideaId,
        suggestion_type: "verdict",
        content: suggestions.verdict,
      },
    ];

    const { error: insertError } = await supabase
      .from("ai_suggestions")
      .insert(suggestionsToInsert);

    if (insertError) {
      console.error("Error storing suggestions:", insertError);
    }

    return new Response(
      JSON.stringify({ success: true, suggestions }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Brainstorm error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
