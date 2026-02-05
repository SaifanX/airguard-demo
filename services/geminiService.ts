import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || ''; // Ensure this is available in your environment

const ai = new GoogleGenAI({ apiKey });

export const getCaptainCritique = async (
  userMessage: string,
  riskLevel: number,
  violations: string[],
  flightDetails: any,
  weather?: any,
  flightStats?: { distance: number; waypoints: number }
): Promise<string> => {
  if (!apiKey) {
    return "API Configuration Error: Captain Arjun is offline. (Missing API Key)";
  }

  const model = "gemini-3-flash-preview";
  
  const weatherContext = weather 
    ? `- Conditions: ${weather.condition}, Temp: ${weather.temp}°C, Wind: ${weather.windSpeed} km/h (${weather.windDirection}), Visibility: ${weather.visibility}km`
    : "- Weather data unavailable";

  const statsContext = flightStats
    ? `- Path Distance: ${flightStats.distance} km, Waypoints: ${flightStats.waypoints}`
    : "";

  const systemPrompt = `
    You are Captain Arjun, a retired Indian Air Force pilot and strict drone safety instructor.
    You speak with authority, professionalism, and brevity. You use aviation terminology.
    
    Current Flight Context:
    - Risk Level: ${riskLevel}%
    - Active Violations: ${violations.length > 0 ? violations.join(", ") : "None"}
    - Drone: ${flightDetails.model}
    - Altitude: ${flightDetails.altitude}m
    ${weatherContext}
    ${statsContext}
    
    Instructions:
    - If the user asks for a "Briefing", provide a structured pre-flight summary covering:
      1. Weather Assessment (Go/No-Go)
      2. Regulatory & Risk Status (Critical issues)
      3. Operational Advice (Based on altitude/distance)
      4. Final Verdict (Cleared for Takeoff / Grounded)
    - If risk is high (>50%), scold the pilot professionally and cite the violations.
    - If risk is low, approve the plan but remind them to maintain visual line of sight.
    - Keep responses concise (under 150 words) unless detailed briefing is requested.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: userMessage,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    return response.text || "Radio silence. Please repeat.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Comms failure. Unable to reach ATC.";
  }
};