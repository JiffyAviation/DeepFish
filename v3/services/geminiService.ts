import { GoogleGenerativeAI } from "@google/generative-ai";
import { Message, Role, AgentId } from "../types";

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Simple Gemini service for v1.0
 * Stripped down to just basic chat functionality
 */
export async function sendMessage(
  history: Message[],
  agentId: AgentId,
  systemPrompt: string
): Promise<string> {
  try {
    const model = ai.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      systemInstruction: systemPrompt
    });

    // Convert history to Gemini format
    const geminiHistory = history.slice(0, -1).map(msg => ({
      role: msg.role === Role.USER ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    const chat = model.startChat({
      history: geminiHistory
    });

    const lastMessage = history[history.length - 1];
    const result = await chat.sendMessage(lastMessage.text);
    const response = await result.response;

    return response.text();
  } catch (error) {
    console.error('[GeminiService] Error:', error);
    throw new Error(`AI Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export default { sendMessage };
