import React, { useState, useEffect, useRef } from 'react';
import { Message, Role, Room, AgentProfile, AgentId, ExecutiveMemo } from '../types';
import { ROOMS, AGENTS, COMMON_CONTEXT, ORACLE_OVERRIDE_PROMPT } from '../constants';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';
import Labs from './Labs';
import GodMode from './GodMode';
import { GoogleGenerativeAI } from '@google/genai';

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

    const [roomMessages, setRoomMessages] = useState<Record<string, Message[]>>({
        main: [],
        creative: [],
        technical: [],
        executive: []
    });

    const genAI = useRef<GoogleGenerativeAI | null>(null);

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
        if (!input.trim() && !image) return;
        if (!genAI.current) {
            alert('API key not configured. Please add VITE_GOOGLE_API_KEY to Railway environment variables.');
            return;
        }

        const userMessage: Message = {
            id: Date.now().toString(),
            role: Role.USER,
            text: input,
            timestamp: new Date(),
            image
        };

        setRoomMessages(prev => ({
            ...prev,
            [activeRoomId]: [...(prev[activeRoomId] || []), userMessage]
        }));
        setInput('');
        setIsLoading(true);

        try {
            const model = genAI.current.getGenerativeModel({ model: 'gemini-pro' });
            const prompt = `${COMMON_CONTEXT}\n\n${isOracleMode ? ORACLE_OVERRIDE_PROMPT : ''}\n\nAgent: ${activeAgent.name}\n${activeAgent.basePrompt}\n\nUser: ${input}`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: Role.MODEL,
                text,
                timestamp: new Date(),
                agentId: activeAgent.id as AgentId
            };

            setRoomMessages(prev => ({
                ...prev,
                [activeRoomId]: [...(prev[activeRoomId] || []), aiMessage]
            }));
        } catch (error) {
            console.error('Error:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: Role.MODEL,
                text: 'Sorry, there was an error processing your request.',
                timestamp: new Date(),
                isError: true
            };
            setRoomMessages(prev => ({
                ...prev,
                [activeRoomId]: [...(prev[activeRoomId] || []), errorMessage]
            }));
        } finally {
            setIsLoading(false);
        }
    };

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
                    onClose={() => setIsLabsOpen(false)}
                    onToggleOracleMode={() => setIsOracleMode(!isOracleMode)}
                    isOracleMode={isOracleMode}
                />
            )}

            {godModeAgent && (
                <GodMode
                    agentId={godModeAgent}
                    onClose={() => setGodModeAgent(null)}
                />
            )}
        </div>
    );
};

export default AIStudio;
