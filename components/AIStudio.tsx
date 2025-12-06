import React, { useState, useEffect, useRef } from 'react';
import { Message, Role, Room, AgentProfile, AgentId, ExecutiveMemo } from '../types';
import { ROOMS, AGENTS, COMMON_CONTEXT, ORACLE_OVERRIDE_PROMPT } from '../constants';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';
import { Labs } from './Labs';
import { GodMode } from './GodMode';
import { GoogleGenerativeAI } from '@google/genai';
import { generateId } from '../utils/ids';
import { addMessageWithLimit } from '../utils/messageBuffer';

const AIStudio = () => {
    const [activeRoomId, setActiveRoomId] = useState<string>('main');
    const [activeAgentId, setActiveAgentId] = useState<string>(AgentId.MEI);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLabsOpen, setIsLabsOpen] = useState(false);
    const [isOracleMode, setIsOracleMode] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [godModeAgent, setGodModeAgent] = useState<string | null>(null);
    const [inbox, setInbox] = useState<ExecutiveMemo[]>([]);

    const [roomMessages, setRoomMessages] = useState<Record<string, Message[]>>(() =>
        Object.fromEntries(ROOMS.map(r => [r.id, []]))
    );

    const genAI = useRef<GoogleGenerativeAI | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
        if (apiKey) {
            genAI.current = new GoogleGenerativeAI(apiKey);
        }
    }, []);

    const activeRoom = ROOMS.find(r => r.id === activeRoomId) || ROOMS[0];
    const activeAgent = Object.values(AGENTS).find(a => a.id === activeAgentId) || AGENTS[AgentId.MEI];
    const messages = roomMessages[activeRoomId] || [];

    const handleSend = async (image?: string) => {
        const trimmedInput = input.trim();
        if (!trimmedInput && !image) return;

        if (!genAI.current) {
            console.error('[AIStudio] API key not configured');
            alert('API key not configured. Please add VITE_GOOGLE_API_KEY to Railway environment variables.');
            return;
        }

        // Capture current state to prevent race conditions
        const targetRoomId = activeRoomId;
        const targetAgent = activeAgent;

        // Generate unique ID (prevents collision)
        const userMessageId = generateId();

        const userMessage: Message = {
            id: userMessageId,
            role: Role.USER,
            text: trimmedInput,
            timestamp: new Date(),
            image
        };

        // Add user message with 1000-message limit (prevents memory leak)
        setRoomMessages(prev => {
            const roomMsgs = prev[targetRoomId] || [];
            const newMsgs = addMessageWithLimit(roomMsgs, userMessage, 1000);
            return { ...prev, [targetRoomId]: newMsgs };
        });

        setInput('');
        setIsLoading(true);

        // Cancel previous request if exists
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Create new abort controller
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        try {
            const model = genAI.current.getGenerativeModel({ model: 'gemini-pro' });
            const prompt = `${COMMON_CONTEXT}\n\n${isOracleMode ? ORACLE_OVERRIDE_PROMPT : ''}\n\nAgent: ${targetAgent.name}\n${targetAgent.basePrompt}\n\nUser: ${trimmedInput}`;

            const result = await model.generateContent(prompt);

            // Check if aborted
            if (abortController.signal.aborted) {
                console.log('[AIStudio] Request aborted');
                return;
            }

            const response = await result.response;
            const text = response.text();

            const aiMessage: Message = {
                id: generateId(),
                role: Role.MODEL,
                text,
                timestamp: new Date(),
                agentId: targetAgent.id as AgentId
            };

            setRoomMessages(prev => {
                const roomMsgs = prev[targetRoomId] || [];
                const newMsgs = addMessageWithLimit(roomMsgs, aiMessage, 1000);
                return { ...prev, [targetRoomId]: newMsgs };
            });

        } catch (error: any) {
            // Don't show error if request was aborted
            if (error.name === 'AbortError' || abortController.signal.aborted) {
                console.log('[AIStudio] Request cancelled');
                return;
            }

            console.error('[AIStudio] Error:', error);

            const errorMessage: Message = {
                id: generateId(),
                role: Role.MODEL,
                text: 'Sorry, there was an error processing your request.',
                timestamp: new Date(),
                isError: true
            };

            setRoomMessages(prev => {
                const roomMsgs = prev[targetRoomId] || [];
                const newMsgs = addMessageWithLimit(roomMsgs, errorMessage, 1000);
                return { ...prev, [targetRoomId]: newMsgs };
            });
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    };

    // Cleanup: abort pending requests on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    return (
        <div className="flex h-screen bg-zinc-950 text-zinc-200">
            <Sidebar
                activeRoomId={activeRoomId}
                activeAgentId={activeAgentId}
                onSelectRoom={setActiveRoomId}
                onSelectAgent={setActiveAgentId}
                onOpenLabs={() => setIsLabsOpen(true)}
                isLabsOpen={isLabsOpen}
                onToggleOracleMode={() => setIsOracleMode(!isOracleMode)}
                isOracleMode={isOracleMode}
                onBackup={() => console.log('Backup')}
                onRestore={() => console.log('Restore')}
                onToggleFullscreen={() => document.documentElement.requestFullscreen()}
                inboxCount={inbox.length}
                onOpenGodMode={setGodModeAgent}
                onEditAgent={(id) => console.log('Edit agent:', id)}
            />

            <ChatArea
                messages={messages}
                activeAgent={activeAgent}
                input={input}
                setInput={setInput}
                onSend={handleSend}
                isLoading={isLoading}
                roomName={activeRoom.name}
                themeColor={activeAgent.color}
                onSpeechResult={(text) => setInput(text)}
                isSpeaking={isSpeaking}
                isOracleMode={isOracleMode}
                inbox={inbox}
                onMarkMemoRead={(id) => console.log('Mark read:', id)}
                onReplyToMemo={(id, text) => console.log('Reply:', id, text)}
                onSetMemoStatus={(id, status) => console.log('Set status:', id, status)}
            />

            {isLabsOpen && (
                <Labs
                    agents={AGENTS}
                    onCreateAgent={(agent) => console.log('Create agent:', agent)}
                    initialAgentId={null}
                />
            )}

            {godModeAgent && (
                <GodMode
                    agent={Object.values(AGENTS).find(a => a.id === godModeAgent) || AGENTS[AgentId.MEI]}
                    onClose={() => setGodModeAgent(null)}
                    onEdit={() => console.log('Edit agent:', godModeAgent)}
                />
            )}
        </div>
    );
};

export default AIStudio;
