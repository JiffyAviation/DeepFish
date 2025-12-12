/**
 * Client-side API service
 * Communicates with local proxy server instead of directly with Gemini
 */

import { Message, Role, AgentId } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface AgentResponse {
    text: string;
    toolCalls?: any[];
}

export interface SpecialistResponse {
    text: string;
    images?: string[];
}

/**
 * Send message to agent via proxy server
 */
export const sendMessageToAgent = async (
    history: Message[],
    systemInstruction: string,
    modelName: string = "gemini-1.5-flash",
    agentId: string,
    tools?: any[]
): Promise<AgentResponse> => {
    // Filter out error messages from history
    const cleanHistory = history.filter(m => !m.isError).map(msg => ({
        role: msg.role === Role.USER ? 'user' : 'model',
        parts: msg.image
            ? [{ text: msg.text }, { inlineData: { mimeType: 'image/png', data: msg.image } }]
            : [{ text: msg.text }]
    }));

    const lastMessage = history[history.length - 1];

    // Safety check for empty message
    if (!lastMessage || !lastMessage.text) {
        return { text: "...", toolCalls: [] };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: lastMessage.text,
                model: modelName,
                systemInstruction,
                history: cleanHistory.slice(0, -1),
                tools: tools || undefined
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'API request failed');
        }

        const data = await response.json();

        return {
            text: data.text || "",
            toolCalls: data.functionCalls || []
        };

    } catch (error: any) {
        console.error("API Proxy Error:", error);

        if (error.message?.includes('503')) {
            throw new Error("Neural overload. Please retry.");
        }

        throw new Error(error.message || "Agent communication failed.");
    }
};

/**
 * Run specialist agent (stateless, single turn)
 */
export const runSpecialistAgent = async (
    agentId: string,
    systemInstruction: string,
    taskDescription: string,
    contextSummary: string,
    modelName: string
): Promise<SpecialistResponse> => {
    const prompt = `
    [INTERNAL SUB-AGENT REQUEST]
    CONTEXT SUMMARY: ${contextSummary}
    
    YOUR TASK: ${taskDescription}
    
    OUTPUT REQUIREMENT:
    - If writing code, output ONLY valid code blocks.
    - If designing, be vivid.
    - Be concise. The output goes back to the Lead Agent (Mei).
  `;

    try {
        const response = await fetch(`${API_BASE_URL}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt,
                model: modelName,
                systemInstruction
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'API request failed');
        }

        const data = await response.json();

        // Check for inline images
        let images: string[] = [];
        if (data.candidates && data.candidates[0]?.content?.parts) {
            for (const part of data.candidates[0].content.parts) {
                if (part.inlineData) {
                    images.push(part.inlineData.data);
                }
            }
        }

        return {
            text: data.text || "(No output generated)",
            images: images
        };

    } catch (e: any) {
        return {
            text: `[Agent Error - ${agentId}]: ${e.message}`,
            images: []
        };
    }
};
