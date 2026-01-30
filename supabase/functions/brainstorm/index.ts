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

    const systemPrompt = `You are a creative brainstorming partner helping users develop their ideas. You provide:
1. REFINEMENTS: Specific improvements to make the idea clearer, more actionable, or more compelling
2. WHAT-IF PROMPTS: Creative "What if..." questions that explore different angles or possibilities
3. NEXT STEPS: Concrete, actionable steps the user can take to move this idea forward

Be encouraging, creative, and practical. Keep each suggestion concise but valuable.`;

    const userPrompt = `Here's an idea I want to develop:

Title: ${title}
${content ? `Details: ${content}` : ''}

Please provide:
1. Two refinement suggestions to improve this idea
2. Two creative "What if..." prompts to explore new angles
3. Two concrete next steps I can take`;

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
              name: "provide_suggestions",
              description: "Provide brainstorming suggestions for the idea",
              parameters: {
                type: "object",
                properties: {
                  refinements: {
                    type: "array",
                    items: { type: "string" },
                    description: "Two specific improvements for the idea",
                  },
                  whatIfs: {
                    type: "array",
                    items: { type: "string" },
                    description: "Two creative 'What if...' prompts",
                  },
                  nextSteps: {
                    type: "array",
                    items: { type: "string" },
                    description: "Two concrete actionable next steps",
                  },
                },
                required: ["refinements", "whatIfs", "nextSteps"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "provide_suggestions" } },
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
    ];

    const { error: insertError } = await supabase
      .from("ai_suggestions")
      .insert(suggestionsToInsert);

    if (insertError) {
      console.error("Error storing suggestions:", insertError);
      // Still return the suggestions even if storage fails
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
