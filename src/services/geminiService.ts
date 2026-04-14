import { GoogleGenAI } from "@google/genai";
import { supabase } from "../lib/supabase";

export const DAILY_LIMIT = 1500;

export const getGeminiStats = () => {
  const today = new Date().toISOString().split('T')[0];
  const statsStr = localStorage.getItem('gemini_stats');
  let stats = statsStr ? JSON.parse(statsStr) : { date: today, count: 0 };
  if (stats.date !== today) {
    stats = { date: today, count: 0 };
    localStorage.setItem('gemini_stats', JSON.stringify(stats));
  }
  return stats;
};

const incrementGeminiCount = () => {
  const stats = getGeminiStats();
  stats.count += 1;
  localStorage.setItem('gemini_stats', JSON.stringify(stats));
  window.dispatchEvent(new CustomEvent('gemini-stats-updated', { detail: stats }));
};

async function getSystemInstruction() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data, error } = await supabase
        .from('user_settings')
        .select('master_strategy')
        .eq('user_id', user.id)
        .single();

      if (data && data.master_strategy) {
        return `Today is April 12, 2026. You are a surgical trading AI. 
        Use Google Search for every price. 
        
        CORE STRATEGY (PRIORITY):
        ${data.master_strategy}
        
        Always analyze setups based on these specific rules. If a setup violates these, call it out.`;
      }
    }

    const localData = localStorage.getItem('user_settings_cache');
    if (localData) {
      const parsed = JSON.parse(localData);
      if (parsed.master_strategy) {
        return `Today is April 12, 2026. You are a surgical trading AI. 
        Use Google Search for every price. 
        
        CORE STRATEGY (PRIORITY):
        ${parsed.master_strategy}
        
        Always analyze setups based on these specific rules. If a setup violates these, call it out.`;
      }
    }
  } catch (err) {
    console.error("Error fetching system instruction:", err);
  }
  
  const hardcodedFallback = "You are a trading co-pilot for an NQ futures trader using PB Trading Theory. Rules: one trade per day, 1% risk, trade only 9:30-11AM NY time. Entry based on 5 minute FVG inversions. Only trade with the trend. Breakeven moved at intermediate highs and lows. Assess the setup described and give a verdict: high probability, medium probability, or low probability. If high probability suggest risking up to 1.5%. Be concise, maximum 3 sentences.";
  return `Today is April 12, 2026. You are a surgical trading AI. Use Google Search for every price. \n\nCORE STRATEGY:\n${hardcodedFallback}`;
}

export async function askGemini(
  prompt: string | { text: string; files: { inlineData: { data: string; mimeType: string } }[] }, 
  systemInstruction?: string,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const apiKey = process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("API Key Missing");

  const ai = new GoogleGenAI({ apiKey });
  const dynamicInstruction = await getSystemInstruction();
  const finalInstruction = systemInstruction || dynamicInstruction;

  const promptText = typeof prompt === 'string' ? prompt : prompt.text;
  
  try {
    if (onChunk) {
      const result = await ai.models.generateContentStream({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: promptText }] }],
        config: {
          systemInstruction: finalInstruction,
          tools: [{ googleSearch: {} }],
          temperature: 0
        }
      });

      let fullText = "";
      for await (const chunk of result) {
        const text = chunk.text;
        if (text) {
          fullText += text;
          onChunk(text);
        }
      }
      incrementGeminiCount();
      return fullText;
    } else {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: promptText }] }],
        config: {
          systemInstruction: finalInstruction,
          tools: [{ googleSearch: {} }],
          temperature: 0
        }
      });
      
      const responseText = response.text;
      if (!responseText) throw new Error("Empty response");
      incrementGeminiCount();
      return responseText;
    }
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
}
