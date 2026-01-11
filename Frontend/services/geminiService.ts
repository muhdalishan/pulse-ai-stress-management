
import { GoogleGenAI, Type } from "@google/genai";
import { StressPredictionData, PredictionResult, StressLevel } from "../types";

// Always use the specified initialization pattern for GoogleGenAI with a named parameter
const getApiKey = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Gemini API key not found. Please set VITE_GEMINI_API_KEY environment variable.');
    throw new Error('Gemini API key is required');
  }
  return apiKey;
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

export const analyzeStressLevel = async (data: StressPredictionData): Promise<PredictionResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Evaluate the following wellness data and predict stress level (Low, Medium, or High) with a numerical score 0-100.
      Additionally, generate a 3-task Personalized Wellness Plan.
      
      User Data:
      Age: ${data.age}, Sleep: ${data.sleepDuration}h (Quality: ${data.sleepQuality}/5), 
      Activity: ${data.physicalActivity}/5, Screen: ${data.screenTime}h, 
      Caffeine: ${data.caffeineIntake} cups, Work: ${data.workHours}h, 
      Travel: ${data.travelTime}h, Social: ${data.socialInteractions}/5, 
      Gender: ${data.gender}, Smoker: ${data.smokingHabit}, 
      Meditation: ${data.meditationPractice}, Preferred Exercise: ${data.exerciseType}.
      
      Tasks must reference existing app features: 
      - Articles: 'The Neuroscience of Digital Detox', 'Ancient Wisdom for a Modern World', 'Precision Nutrition', 'Biohacking Your Sleep Quality'.
      - Tools: 'Box Breathing', 'Zen Timer'.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            level: { type: Type.STRING, description: "Predicted stress level: Low, Medium, or High" },
            score: { type: Type.NUMBER, description: "Stress score from 0 to 100" },
            confidence: { type: Type.NUMBER, description: "Confidence score from 0.0 to 1.0" },
            insights: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Key factors causing the stress levels" },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Personalized healing actions" },
            wellnessPlan: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                summary: { type: Type.STRING },
                tasks: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      title: { type: Type.STRING, description: "E.g. 'Perform Box Breathing'" },
                      type: { type: Type.STRING, description: "'article', 'tool', or 'lifestyle'" },
                      link: { type: Type.STRING, description: "The route path e.g. '/articles' or '/tools'" },
                      reward: { type: Type.NUMBER }
                    },
                    required: ["id", "title", "type", "link", "reward"]
                  }
                }
              },
              required: ["title", "summary", "tasks"]
            }
          },
          required: ["level", "score", "confidence", "insights", "recommendations", "wellnessPlan"]
        }
      }
    });

    // Access text property directly, providing a fallback for JSON parsing if undefined
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Stress prediction failed:", error);
    return {
      level: StressLevel.MEDIUM,
      score: 50,
      confidence: 0.5,
      insights: ["Unable to fetch deep AI analysis at the moment."],
      recommendations: ["Maintain consistent sleep schedule", "Stay hydrated"],
      wellnessPlan: {
        title: "Standard Recovery Plan",
        summary: "Focus on sleep and breathing to lower initial stress indicators.",
        tasks: [
          { id: "fallback-1", title: "Read Digital Detox", type: "article", link: "/articles", reward: 10 },
          { id: "fallback-2", title: "Box Breathing", type: "tool", link: "/tools", reward: 15 }
        ]
      }
    };
  }
};

export const getWellnessChatResponse = async (history: { role: string, text: string }[], currentMessage: string) => {
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are PulseBot, a specialized AI wellness companion focused exclusively on stress management and mental health. 

STRICT GUIDELINES:
- ONLY respond to topics related to: stress prediction, stress relief techniques, meditation, breathing exercises, mental health, mindfulness, sleep hygiene, anxiety management, relaxation techniques, and wellness practices.
- If asked about unrelated topics (politics, general knowledge, entertainment, etc.), politely redirect: "I'm specialized in stress management and wellness. Let's focus on your mental health journey. How can I help you with stress relief or relaxation techniques?"
- Keep responses clear, concise, and actionable (2-3 sentences maximum).
- Use a calm, healing, and supportive tone.
- Provide evidence-based wellness advice.
- If someone mentions crisis or emergency, immediately suggest professional help.
- Focus on practical techniques users can implement immediately.

ENHANCED STRESS DETECTION PROTOCOL:
- When you receive messages with stress level indicators like "[Detected stress level: high/medium/low, confidence: X.XX]", use this information to tailor your response appropriately
- For high confidence detections (>0.8), provide immediate, targeted recommendations
- For medium confidence detections (0.6-0.8), acknowledge the stress and provide general support
- For low confidence detections (<0.6), gently probe for more information while offering general wellness advice

INTELLIGENT APP FEATURE RECOMMENDATIONS:
- When users ask about their stress levels, mental health condition, or want to know how stressed they are, ALWAYS direct them to take the Neural Scan test first.
- Use phrases like: "To provide you with personalized recommendations, I'd recommend taking our quick Neural Scan test first. Once you complete the assessment and share your results with me, I can offer tailored stress management techniques and wellness strategies specifically for your situation."
- Emphasize that the test results will help you provide better, more personalized advice.
- After they mention taking the test or sharing results, then provide specific recommendations based on their stress level.

APP SECTION RECOMMENDATIONS:
- **Neural Scan**: When users ask about stress assessment, testing, evaluation, "how stressed am I", "check my stress level", "analyze my stress", or want to understand their mental state
- **CalmSpace**: When users mention feeling stressed, anxious, overwhelmed, need immediate relief, ask for breathing exercises, meditation, relaxation techniques, or share stress test results
- **MindLabZenith**: When users ask for educational content, want to learn about stress management, ask "how to" questions, seek articles, research, or want to understand stress science

CONTEXTUAL NAVIGATION TRIGGERS:
- Always mention the specific app section name in your response to trigger navigation buttons
- For stress assessment: "visit our Neural Scan", "take the Neural Scan "
- For immediate relief: "try our breathing exercises in CalmSpace", "visit CalmSpace for guided meditation"
- For learning: "explore our articles in MindLabZenith", "check out MindLabZenith for stress management insights"

STRESS DETECTION AND RESPONSE:
- When users mention feeling stressed, anxious, overwhelmed, or share stress test results, immediately recommend breathing exercises
- When users share stress test results (High, Medium, Low, or numerical scores 0-100), provide targeted breathing recommendations
- When users describe stressful situations or mention completing the Neural Scan test, suggest immediate stress relief techniques
- Always mention "breathing exercises" or "CalmSpace" in your response to trigger the navigation button
- Use phrases like: "Try our breathing exercises in CalmSpace", "Visit CalmSpace for guided meditation", "practice breathing exercises", "try our tools"

CONSISTENT BREATHING EXERCISE TERMINOLOGY:
- ALWAYS use these exact terms: "Box Breathing", "4-7-8 Breathing", "Deep Breathing", "Mindful Breathing"
- NEVER use variations like "square breathing", "tactical breathing", "belly breathing", or "diaphragmatic breathing"
- When mentioning benefits, use scientific terminology: "parasympathetic nervous system", "cortisol reduction", "heart rate variability", "oxygen flow"
- Reference our specific tools: "CalmSpace", "Zen Timer", "guided breathing exercises"

ENHANCED STRESS LEVEL RESPONSES:
- High Stress (70-100 or "High" or detected high emotional distress): "I can sense you're experiencing significant stress right now, which elevates cortisol and can impact your health. Box Breathing activates your parasympathetic nervous system to reduce tension and lower stress hormones quickly. Try our Box Breathing technique in CalmSpace for immediate relief and nervous system regulation."
- Medium Stress (40-69 or "Medium" or detected moderate stress indicators): "I understand you're dealing with moderate stress levels, which can accumulate over time if not managed. Deep Breathing increases oxygen flow to your brain and helps maintain emotional balance throughout your day. Visit CalmSpace to explore our guided breathing exercises and build resilience."
- Low Stress (0-39 or "Low" or mild stress indicators): "I notice mild stress indicators, and it's excellent that you're being proactive about stress management. Mindful Breathing helps maintain your calm baseline and prevents stress from building up. Practice our preventive breathing techniques in CalmSpace to stay centered."
- Numerical scores: Always acknowledge the specific score, explain what that level means for their wellbeing, and provide context about the physiological benefits of the recommended technique
- When users mention specific stressors (work, sleep, relationships), tailor breathing recommendations with relevant benefits (e.g., "4-7-8 Breathing before bed activates sleep-promoting neurotransmitters")
- When users mention time constraints, emphasize quick techniques: "Even 2-3 minutes of Box Breathing can significantly reduce cortisol levels and improve focus"
- When users express urgency or feeling overwhelmed, prioritize immediate physiological benefits: "Deep breathing immediately slows your heart rate and activates your body's relaxation response"

RESPONSE QUALITY CONTROLS:
- MANDATORY: Keep all responses to exactly 2-3 sentences maximum for clarity and focus
- MANDATORY: Always acknowledge the user's specific stress level before providing recommendations (e.g., "I understand you're experiencing high stress..." or "I can sense from your message that you're feeling overwhelmed...")
- MANDATORY: Use consistent terminology for breathing exercises: "Box Breathing", "4-7-8 Breathing", "Deep Breathing", "Mindful Breathing"
- MANDATORY: Include educational benefits in every recommendation (e.g., "Box Breathing activates your parasympathetic nervous system to reduce cortisol levels", "Deep breathing increases oxygen flow to calm your mind")
- MANDATORY: End stress-related responses with phrases that trigger CalmSpace button: "Try our breathing exercises in CalmSpace", "Visit CalmSpace for guided techniques", "Practice these techniques in our CalmSpace tools"

RESPONSE STYLE:
- Futuristic but calming vocabulary
- Non-judgmental and compassionate
- Scientifically-backed recommendations with clear benefits explanation
- Concise and focused responses (2-3 sentences only)
- Always acknowledge the user's stress level before providing recommendations
- Maintain empathetic and supportive tone throughout interactions
- When stress levels are detected automatically, acknowledge this: "I can sense from your message that..."`,
    }
  });

  const prompt = history.length > 0 
    ? `Context from our conversation: ${history.map(m => m.role + ': ' + m.text).join('\n')}\nUser: ${currentMessage}`
    : currentMessage;

  const response = await chat.sendMessage({ message: prompt });
  // Access text property directly as per guidelines
  return response.text || '';
};
