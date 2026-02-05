
import { GoogleGenAI } from "@google/genai";
import { AthleteStats } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = "You are Bacon Dao, a world-class performance nutrition and S&C coach. You provide direct, professional, and science-backed advice for elite athletes. Format responses in clean Markdown. NEVER use nested header-bold markers like '##**' or '###**'. Use '###' for clear section headers. Use bold text only for specific emphasis or labels.";

async function callGemini(modelName: string, contents: any, tools: any[] = []): Promise<string> {
  try {
    const config: any = { 
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
    };
    if (tools.length > 0) config.tools = tools;

    const response = await ai.models.generateContent({
      model: modelName,
      contents,
      config
    });

    if (!response || !response.text) {
      throw new Error("Empty response from AI engine.");
    }

    return response.text;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(`AI_ERROR: ${error.message || "The AI encountered an unexpected hurdle."}`);
  }
}

export async function askCoach(question: string) {
  try {
    return await callGemini('gemini-3-flash-preview', question);
  } catch (e: any) {
    return `### Error\n${e.message}`;
  }
}

export async function analyzeMealImage(imageBase64: string, description: string, goal: string) {
  const prompt = `Analyze this meal for a college athlete (Goal: ${goal}). 
  User Description: "${description}". 
  Identify foods and estimate macros precisely. 
  If unsure about portion sizes or preparation, ask the user a clarifying question to refine your estimate.
  CRITICAL: You MUST include a "### Macros" section at the very end.
  Format the macros EXACTLY as follows (no ranges, just single integer numbers followed by 'g'):
  - Protein: [number]g
  - Carbs: [number]g
  - Fats: [number]g
  - Calories: [number] kcal`;

  try {
    return await callGemini('gemini-3-flash-preview', {
      parts: [
        { text: prompt },
        { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } }
      ]
    });
  } catch (e: any) {
    throw e;
  }
}

export async function refineAnalysis(prevAnalysis: string, followUp: string, goal: string) {
  const prompt = `Previous Analysis: "${prevAnalysis}". 
  Athlete Follow-up: "${followUp}". 
  Re-calculate macros for a ${goal} goal.
  CRITICAL: You MUST include a "### Macros" section.
  Format the macros EXACTLY as follows (use single integer estimates):
  - Protein: [number]g
  - Carbs: [number]g
  - Fats: [number]g
  - Calories: [number] kcal`;

  try {
    return await callGemini('gemini-3-flash-preview', prompt);
  } catch (e: any) {
    throw e;
  }
}

export async function analyzeMealText(description: string, goal: string) {
  const prompt = `Estimate macros for this meal description: "${description}". Goal: ${goal}. 
  If you need more info (e.g. was it fried or grilled?), ask a brief clarifying question at the start.
  CRITICAL: You MUST include a "### Macros" section.
  Format the macros EXACTLY as follows (use single integer estimates, no ranges):
  - Protein: [number]g
  - Carbs: [number]g
  - Fats: [number]g
  - Calories: [number] kcal`;

  try {
    return await callGemini('gemini-3-flash-preview', prompt);
  } catch (e: any) {
    throw e;
  }
}

export async function buildScavengerRecipe(ingredients: string, goal: string) {
  try {
    return await callGemini('gemini-3-flash-preview', `I have: ${ingredients}. Goal: ${goal}. Give me one quick, elite performance recipe with clear steps.`);
  } catch (e: any) {
    return `### Kitchen Error\n${e.message}`;
  }
}

export async function generateGroceryPlan(params: {
  stats: AthleteStats,
  budget: string,
  location: string,
  favoriteFoods: string,
  preferences: string
}) {
  const { stats, budget, location, favoriteFoods, preferences } = params;
  const prompt = `Weekly grocery plan for a ${stats.sport} athlete. Budget: $${budget}. Location: ${location}. 
  Athlete Likes: ${stats.likes}. Dislikes: ${stats.dislikes}. 
  User Inputs: Favs: ${favoriteFoods}. Prefs: ${preferences}. Use ### for headers.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }]
      }
    });

    return {
      text: response.text || "Failed to generate plan.",
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c: any) => ({
        title: c.web?.title || 'Source',
        uri: c.web?.uri || '#'
      })) || []
    };
  } catch (error: any) {
    return { text: `### Retrieval Error\n${error.message}`, sources: [] };
  }
}

export async function generateWorkout(stats: AthleteStats, days: number, focus: string) {
  const prompt = `Create a high-performance ${days}-day athletic training split for a ${stats.sport} ${stats.position}. 
  Goal: ${stats.goal}. Current Season: ${stats.season}. Protocol Focus: ${focus}.
  
  STRUCTURE REQUIREMENTS FOR EACH TRAINING DAY:
  1. ENCAPSULATION: Wrap the entire day's content between "---DAY_START---" and "---DAY_END---".
  2. TITLE: Use "### Day [X]: [Focus Area Title]".
  3. WARM-UP: Include a mandatory "### Movement Preparation & Warm-up" section (approx. 8-12 minutes).
  4. GROUPING: Group primary exercises by movement category or muscle group (e.g., "### Explosive Power", "### Primary Lower Body Strength").
  5. EXERCISE FORMAT: Each exercise MUST follow this EXACT pattern (The pipe symbols are mandatory):
     - **[Exercise Name]** | [Sets] x [Reps] | **Rest: [Time]** | RPE: [Number] [ALT_START] Alt: [Alternative Movement Suggestion] [ALT_END]
  6. COOL-DOWN: Include a mandatory "### Recovery & Joint Health" section (approx. 5-10 minutes).

  STRUCTURE REQUIREMENTS FOR REST/RECOVERY DAYS:
  1. Use "### Day [X]: Rest & Active Recovery".
  2. Include "### Active Recovery Strategy" (e.g. Mobility flow, swimming, light walk).
  3. Include "### Mental Recovery Strategy" (e.g. CNS down-regulation, breathwork).

  CRITICAL: 
  - Ensure 'Rest: [Time]' is always clearly visible and bolded.
  - Every single main exercise MUST have an alternative suggested in the [ALT_START]...[ALT_END] block.
  - Use '###' for all sub-headers. No nested markdown like '##**'.
  - Be direct, high-performance focused, and professional.`;
  
  try {
    return await callGemini('gemini-3-pro-preview', prompt);
  } catch (e: any) {
    throw e;
  }
}

export async function researchTopic(query: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Research performance topic: ${query}.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }]
      }
    });
    
    return {
      text: response.text || "No findings.",
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c: any) => ({
        title: c.web?.title || 'Source',
        uri: c.web?.uri || '#'
      })) || []
    };
  } catch (error: any) {
    return { text: `### Error\n${error.message}`, sources: [] };
  }
}
