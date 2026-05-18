export async function generateCampaignBrief(prompt: string) {
  const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;

  if (!apiKey) {
    throw new Error('AI Configuration Error: API key is missing. Please check your .env file.');
  }

  const systemPrompt = `You are a Top-Tier Influencer Marketing Director at a premium agency.
Your task is to draft a crisp, modern, and highly professional campaign brief based on the user's input.

Tone and Style:
- Crisp, modern, and highly professional.
- No "fluffy" language, no emojis, and no filler words.
- Keep the brief concise but impactful (2-3 short, powerful paragraphs).
- Deliverables and Guardrails must be hyper-realistic, specific, and actionable.

Output Format:
Output a JSON object with these exact keys:
- title: A professional campaign name
- brief: The campaign overview
- deliverables: An array of 3-5 specific content deliverables
- guardrails: An array of 3-5 strict brand safety guidelines

Ensure the output is a valid JSON object. Do not include any text outside of the JSON object.`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2048,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Groq service is currently unavailable');
    }

    const data = await response.json();
    let content = data.choices[0].message.content;

    // Robust JSON Extraction
    try {
      if (!content || content.trim().length === 0) {
        throw new Error('AI returned an empty response.');
      }

      let jsonString = content.trim();

      // 1. Try to extract from markdown blocks first
      const jsonMatch = jsonString.match(/```(?:json)?\n?([\s\S]*?)```/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[1].trim());
        } catch (e) {
          console.warn('Failed to parse JSON block, trying fallback...');
          jsonString = jsonMatch[1].trim();
        }
      }

      // 2. Fallback: Find the first '{' and last '}' to extract the JSON object directly
      const start = jsonString.indexOf('{');
      const end = jsonString.lastIndexOf('}');
      if (start !== -1 && end !== -1) {
        const potentialJson = jsonString.substring(start, end + 1);
        try {
          return JSON.parse(potentialJson.trim());
        } catch (e) {
          console.warn('Failed to parse curly brace content, trying raw parse...');
        }
      }

      // 3. Last resort: Try parsing whatever we have left
      return JSON.parse(jsonString);
    } catch (parseError: any) {
      console.error('CRITICAL AI PARSE ERROR:');
      console.error('Raw Content Length:', content?.length);
      console.error('Raw Content Preview:', content?.substring(0, 500));
      console.error('Parse Error:', parseError.message);
      throw new Error(`AI produced an invalid response format (${parseError.message}). Please try again.`);
    }
  } catch (error: any) {
    console.error('AI Service Error:', error);
    throw error;
  }
}

export async function parseCampaignSummary(prompt: string) {
  const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;

  if (!apiKey) {
    throw new Error('AI Configuration Error: API key is missing. Please check your .env file.');
  }

  const systemPrompt = `You are an elite campaign architect.
Your task is to parse a campaign summary into a unified, high-fidelity JSON structure to pre-fill a campaign builder wizard.

Determine the Campaign Type ("ugc" or "influencer"):
- "ugc": If the brand needs content only for their own website, social feeds, or ads. Follower count doesn't matter.
- "influencer": If the brand wants creators to post directly to their own feeds to reach their audiences.

Unified JSON Output Schema:
{
  "campaignType": "ugc" or "influencer",
  "title": "A crisp, catchy, premium campaign title",
  "goal": "One of: Brand Awareness, User Acquisition, Engagement, Sales Conversion",
  "audience": "A concise description of target audience demographics based on the summary",
  
  // UGC-specific dynamic fields (prefill only if campaignType is "ugc")
  "ugcQuantity": 2, // integer (default 2)
  "ugcAspectRatio": "9:16 Vertical" or "16:9 Horizontal" or "1:1 Square",
  "includeRawFootage": true, // boolean (default true)
  "hookVariations": true, // boolean (default true)
  "usageRights": "Digital Ads for 30 Days" or "Digital Ads for 90 Days" or "Perpetual / Full Buyout",
  
  // Influencer Collab-specific dynamic fields (prefill only if campaignType is "influencer")
  "platforms": ["TikTok", "Instagram"], // Array containing: TikTok, Instagram, YouTube
  "format": "Reel" or "Short" or "Video" or "Story",
  "influencerTier": "Nano" or "Micro" or "Mid-Tier",
  "linkInBioRequired": true, // boolean
  "linkInBioDuration": "24 Hours" or "7 Days" or "30 Days",
  "discountCode": "PROMOCODE" or empty string,

  // Shared Foundation
  "hooks": "A mandatory engaging hook concept", 
  "talkingPoints": "Key product benefits or features to present", 
  "dos": "Specific instructions on visual showcase (e.g. 'Do show product up close')", 
  "donts": "Specific restrictions (e.g. 'Don't mention competitors')", 
  
  // Logistics
  "productLogistics": "Shipping product directly" or "Providing free pickup code" or "No physical product",
  "draftDeadline": "7 Days" or "14 Days", 
  "goLiveDeadline": "14 Days" or "30 Days",
  "budget": 5000 // A suggested budget integer based on inputs (e.g. flat rates 10000-25000 for UGC, or minimum tier pricing for influencer: Nano 5000, Micro 15000, Mid-Tier 50000)
}

Ensure the output is a valid JSON object. Do not include any text outside of the JSON object.`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 2048,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Groq service is currently unavailable');
    }

    const data = await response.json();
    let content = data.choices[0].message.content;

    try {
      if (!content || content.trim().length === 0) {
        throw new Error('AI returned an empty response.');
      }

      let jsonString = content.trim();

      // Extract JSON Block if Markdown format
      const jsonMatch = jsonString.match(/```(?:json)?\n?([\s\S]*?)```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1].trim());
      }

      const start = jsonString.indexOf('{');
      const end = jsonString.lastIndexOf('}');
      if (start !== -1 && end !== -1) {
        return JSON.parse(jsonString.substring(start, end + 1).trim());
      }

      return JSON.parse(jsonString);
    } catch (parseError: any) {
      throw new Error(`AI produced an invalid response format (${parseError.message}). Please try again.`);
    }
  } catch (error: any) {
    console.error('AI Service Error:', error);
    throw error;
  }
}

export async function fetchSocialInsights(
  handle: string, 
  platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter'
) {
  const normalizedHandle = handle.replace(/^@/, '').toLowerCase().trim();
  const geminiApiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  const groqApiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;

  const systemPrompt = `You are an elite, premium Social Media Auditing Engine.
Your goal is to find the real, genuine, and live social media details for the given user handle on the specified platform.
Use your Google Search tool to search for the profile page: e.g. "instagram.com/${handle}" or "${handle} instagram".
If you find the real profile page, extract:
- Display name (their actual name or brand name)
- Real Follower count (extract the actual number, e.g. 524, 1850, 10200, 1.2M etc.)
- Bio, Niche (Lifestyle, Beauty, Tech, Fitness, Food, Travel, Fashion, etc.)
- Engagement rate (simulate based on like/comment ratios, usually between 1.5% and 8.0%)
- Audience Demographics: gender split, age bracket, top countries.

CRITICAL FALLBACK RULE: If the profile is private, cannot be found, has 0 search results, or is not indexed, you are STRICTLY FORBIDDEN from explaining this or writing any conversational text or errors. Instead, you MUST construct highly realistic, professional-grade estimated data for the handle. You MUST set the returned "handle" exactly to "${handle}" and set "isPrivateOrEstimated" to true.

Return ONLY a strictly valid JSON object matching the following structure. Do not output any markdown ticks, conversational text, explanation or wrappers. Your entire response must parse successfully with JSON.parse():
{
  "handle": "${handle}",
  "displayName": "Full Name / Display Name",
  "followersCount": 42500, // integer
  "engagementRate": 4.8, // float percentage
  "niche": "Major category (e.g. Beauty, Tech, Fitness, Travel, Fashion, Food, Gaming, Lifestyle)",
  "contentStyle": "Description of content vibe",
  "isPrivateOrEstimated": true, // boolean (set to true if profile is private, unindexed, or metrics are estimated)
  "audienceGenderSplit": {
    "female": 78,
    "male": 22
  },
  "audienceAgeBracket": "25-34",
  "topGeos": ["India", "United States", "United Kingdom"],
  "recentPostThemes": ["Theme A", "Theme B", "Theme C"]
}`;

  const userPrompt = `Find real social media insights for the handle "${handle}" on platform "${platform}". Use Google Search to fetch the actual live profile state.`;

  // 1. Try Gemini 2.5-flash with Google Search Grounding for real-time live lookup
  if (geminiApiKey) {
    try {
      console.log(`[AI Social Service] Fetching live metrics using Gemini Search Grounding for ${handle} on ${platform}...`);
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\nUser Prompt: ${userPrompt}` }]
            }
          ],
          tools: [
            { googleSearch: {} }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          // Robust JSON parse from model response
          let jsonStr = text.trim();
          
          // Remove markdown blocks if present
          const jsonMatch = jsonStr.match(/```(?:json)?\n?([\s\S]*?)```/);
          if (jsonMatch) {
            jsonStr = jsonMatch[1].trim();
          } else {
            const start = jsonStr.indexOf('{');
            const end = jsonStr.lastIndexOf('}');
            if (start !== -1 && end !== -1) {
              jsonStr = jsonStr.substring(start, end + 1).trim();
            }
          }
          
          const parsed = JSON.parse(jsonStr);
          console.log(`[AI Social Service] Successfully parsed live search metrics for ${handle}!`);
          return parsed;
        }
      } else {
        const errText = await response.text();
        console.warn(`[AI Social Service] Gemini API returned error:`, errText);
      }
    } catch (geminiError) {
      console.error('[AI Social Service] Gemini Search Grounding failed, falling back to Groq...', geminiError);
    }
  }

  // 2. Fallback: Try Groq/Llama 3.3
  if (groqApiKey) {
    try {
      console.log(`[AI Social Service] Falling back to Groq Llama for ${handle}...`);
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.6,
          max_tokens: 1024,
          response_format: { type: "json_object" }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        let content = data.choices[0].message.content;
        return JSON.parse(content.trim());
      }
    } catch (groqError) {
      console.error('[AI Social Service] Groq analysis failed, using realistic estimation.', groqError);
    }
  }

  // 3. Fallback: Offline Intelligent Estimation
  console.log(`[AI Social Service] All AI services offline. Generating realistic metrics for ${handle}...`);
  return {
    handle,
    displayName: handle.startsWith('@') ? handle.substring(1).charAt(0).toUpperCase() + handle.substring(2) : handle.charAt(0).toUpperCase() + handle.substring(1),
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format",
    followersCount: 24500,
    engagementRate: 3.5,
    niche: "Lifestyle",
    contentStyle: "Modern & minimal lifestyle aesthetic",
    isPrivateOrEstimated: true,
    audienceGenderSplit: { female: 70, male: 30 },
    audienceAgeBracket: "18-24",
    topGeos: ["India", "United States"],
    recentPostThemes: ["Lifestyle vlog", "Product showcase"]
  };
}


