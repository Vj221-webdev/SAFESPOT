

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Classify a report description using AI
 * Returns category and urgency level
 */
export const classifyReport = async (description) => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  if (!description || description.trim().length < 5) {
    throw new Error('Description too short for classification');
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Cheaper and faster than GPT-4
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant that classifies community safety reports. Analyze the report description and return ONLY a JSON object with two fields:

1. "category" - Must be ONE of: lighting, vandalism, noise, waste, infrastructure, other
2. "urgency" - Must be ONE of: low, medium, high, critical

Categories explained:
- lighting: Streetlights, broken lights, dark areas
- vandalism: Graffiti, property damage, broken windows
- noise: Loud disturbances, construction noise, parties
- waste: Trash, illegal dumping, overflowing bins
- infrastructure: Potholes, broken sidewalks, damaged roads, fallen trees
- other: Anything else

Urgency levels:
- low: Minor issue, not time-sensitive (graffiti, litter)
- medium: Needs attention soon (broken light, potholes)
- high: Urgent, affects many people (dangerous road, flooding)
- critical: Immediate danger (exposed wires, gas leak, structural collapse)

Return ONLY valid JSON, no markdown, no explanation.`
          },
          {
            role: 'user',
            content: `Classify this report: "${description}"`
          }
        ],
        temperature: 0.3, // Lower temperature for more consistent results
        max_tokens: 100
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'AI classification failed');
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();

    // Parse JSON response
    let classification;
    try {
      // Remove markdown code blocks if present
      const jsonString = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      classification = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Invalid AI response format');
    }

    // Validate response
    const validCategories = ['lighting', 'vandalism', 'noise', 'waste', 'infrastructure', 'other'];
    const validUrgencies = ['low', 'medium', 'high', 'critical'];

    if (!validCategories.includes(classification.category)) {
      classification.category = 'other';
    }

    if (!validUrgencies.includes(classification.urgency)) {
      classification.urgency = 'medium';
    }

    return {
      category: classification.category,
      urgency: classification.urgency,
      confidence: 0.9, // GPT-4 is highly confident
      source: 'ai'
    };

  } catch (error) {
    console.error('AI Classification Error:', error);
    throw error;
  }
};

/**
 * Extract keywords from description using AI
 * Useful for search and pattern detection
 */
export const extractKeywords = async (description) => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Extract 3-5 key terms from this report. Return ONLY a JSON array of strings, no explanation.'
          },
          {
            role: 'user',
            content: description
          }
        ],
        temperature: 0.3,
        max_tokens: 50
      })
    });

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    const keywords = JSON.parse(content.replace(/```json\n?/g, '').replace(/```\n?/g, ''));

    return Array.isArray(keywords) ? keywords : [];
  } catch (error) {
    console.error('Keyword extraction error:', error);
    return [];
  }
};

/**
 * Analyze sentiment of report (angry, concerned, neutral)
 */
export const analyzeSentiment = async (description) => {
  if (!OPENAI_API_KEY) {
    return { sentiment: 'neutral', intensity: 0.5 };
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Analyze sentiment. Return JSON: {"sentiment": "angry|concerned|frustrated|neutral|positive", "intensity": 0.0-1.0}'
          },
          {
            role: 'user',
            content: description
          }
        ],
        temperature: 0.3,
        max_tokens: 50
      })
    });

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    const result = JSON.parse(content.replace(/```json\n?/g, '').replace(/```\n?/g, ''));

    return {
      sentiment: result.sentiment || 'neutral',
      intensity: result.intensity || 0.5
    };
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    return { sentiment: 'neutral', intensity: 0.5 };
  }
};

/**
 * Get AI suggestions for improving report description
 */
export const getSuggestions = async (description) => {
  if (!OPENAI_API_KEY || description.length > 200) {
    return null;
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'If this report is vague or lacks details, suggest ONE specific improvement in 10 words or less. If clear, return empty string.'
          },
          {
            role: 'user',
            content: description
          }
        ],
        temperature: 0.5,
        max_tokens: 30
      })
    });

    const data = await response.json();
    const suggestion = data.choices[0].message.content.trim();

    return suggestion.length > 0 && suggestion.length < 100 ? suggestion : null;
  } catch (error) {
    console.error('Suggestions error:', error);
    return null;
  }
};

/**
 * Check if API key is configured
 */
export const isAIAvailable = () => {
  return !!OPENAI_API_KEY && OPENAI_API_KEY.startsWith('sk-');
};