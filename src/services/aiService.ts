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
  const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;

  if (!apiKey) {
    throw new Error('AI Configuration Error: API key is missing. Please check your .env file.');
  }

  const systemPrompt = `You are an elite, premium Social Media Auditing Engine.
Analyze the given social media handle and platform, and return an accurate, high-fidelity profile report.
If this is a real, famous creator, fetch and use their real statistics (followers, average views, recent content themes).
If this is a lesser-known or custom handle, parse the name intelligently (e.g., "@skincare_josh" -> skincare niche; "@fit_jenny" -> fitness niche) and synthesize highly realistic, logical statistics.

Output Schema:
{
  "handle": "@handle",
  "displayName": "Full Name / Channel Title",
  "avatarUrl": "A premium placeholder avatar link from unsplash or empty",
  "followersCount": 42500, // actual or realistic integer count
  "engagementRate": 4.8, // percentage float between 1.5% and 8.0%
  "niche": "Major category (e.g. Beauty, Tech, Fitness, Travel, Fashion, Food, Gaming)",
  "contentStyle": "Description of content vibe (e.g. Clean minimalism, Editorial, Relatable comedy)",
  "audienceGenderSplit": {
    "female": 78, // percentage (must sum to 100)
    "male": 22
  },
  "audienceAgeBracket": "25-34", // major age bracket
  "topGeos": ["India", "United States", "United Kingdom"], // array of top 3 geos
  "recentPostThemes": ["Morning routine GRWM", "Reviewing Lavender mist", "Weekly travel vlog"]
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
          { role: 'user', content: `Analyze this handle: "${handle}" on platform: "${platform}"` }
        ],
        temperature: 0.6,
        max_tokens: 1024,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      throw new Error('Social Auditing service is currently offline.');
    }

    const data = await response.json();
    let content = data.choices[0].message.content;
    return JSON.parse(content.trim());
  } catch (error) {
    console.error('Error fetching social insights:', error);
    // Safe fallbacks to keep UI running beautifully
    return {
      handle,
      displayName: handle.substring(1).charAt(0).toUpperCase() + handle.substring(2),
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format",
      followersCount: 24500,
      engagementRate: 3.5,
      niche: "UGC",
      contentStyle: "Modern & minimal lifestyle aesthetic",
      audienceGenderSplit: { female: 70, male: 30 },
      audienceAgeBracket: "18-24",
      topGeos: ["India", "United States"],
      recentPostThemes: ["Lifestyle vlog", "Product showcase"]
    };
  }
}


