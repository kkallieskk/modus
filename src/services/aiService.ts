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

  const systemPrompt = `You are a professional campaign coordinator.
Your task is to parse a campaign summary into a structured JSON configuration to pre-fill a campaign creator wizard.

Expected JSON Output Schema:
{
  "title": "A crisp, catchy, premium campaign title",
  "goal": "One of: Brand Awareness, User Acquisition, Engagement, Sales Conversion",
  "audience": "A concise description of target audience demographics based on the summary",
  "platforms": ["Instagram", "TikTok"], // Array that can include: Instagram, TikTok, YouTube
  "format": "One of: Reel, Short, Video, Story",
  "quantity": 1, // An integer number of content deliverables
  "hooks": "A creative hook idea appropriate for this campaign", 
  "talkingPoints": "Key talking points about the product", 
  "dos": "Do focus on the primary value proposition, do show the product clearly", 
  "donts": "Don't use low quality lighting, don't mention competing brands", 
  "usageRights": "One of: Organic, Paid Ads",
  "ftcCompliance": true, // Boolean (default true)
  "draftDeadline": "7 Days", // String draft deadline
  "goLiveDeadline": "14 Days" // String go-live deadline
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

