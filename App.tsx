
import React, { useState, useEffect } from 'react';
import EmailGate from './components/EmailGate';
import LandingPage from './components/LandingPage';

// Lazy load the original AI Studio components only when needed
// This prevents the Google Gemini API key error on initial page load
const LazyOriginalApp = React.lazy(() => import('./OriginalApp'));


const App: React.FC = () => {
  // Check if user has submitted email
  const [hasSubmittedEmail, setHasSubmittedEmail] = useState(false);

  useEffect(() => {
    // Check localStorage on mount
    const submitted = localStorage.getItem('deepfish_email_submitted');
    if (submitted === 'true') {
      setHasSubmittedEmail(true);
    }
  }, []);

  const handleEmailSuccess = () => {
    setHasSubmittedEmail(true);
  };

  // If they haven't submitted email, show the email gate
  if (!hasSubmittedEmail) {
    return <EmailGate onSuccess={handleEmailSuccess} />;
  }

  // After email submission, show the landing page
  return <LandingPage />;
};

export default App;

// Original AI Studio component (kept for future use)
const OriginalApp: React.FC = () => {
  // Use The Engine
  const {
    agents,
    activeRoom,
    activeAgent,
    messages,
    isLoading,
    isSpeaking,
    isLabsOpen,
    isOracleMode,
    inbox, // Get inbox
    setIsLabsOpen,
    setActiveRoomId,
    setTempActiveAgentId,
    handleSendMessage,
    handleVoiceCommand,
    createNewAgent,
    toggleOracleMode,
    triggerBackup,
    restoreFromSnapshot,
    markMemoAsRead,
    replyToMemo,
    setMemoStatus
  } = useAgentEngine({ initialAgents: INITIAL_AGENTS, initialRooms: ROOMS });

  // UI State
  const [input, setInput] = useState("");
  const [godModeAgentId, setGodModeAgentId] = useState<string | null>(null);
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null);

  const onSelectRoom = (id: string) => {
    setActiveRoomId(id);
    setTempActiveAgentId(null);
    setIsLabsOpen(false);
    setGodModeAgentId(null);
    setEditingAgentId(null);
  };

  const onSelectAgent = (agentId: string) => {
    // Logic to switch to specific agent even if they don't have a room
    setTempActiveAgentId(agentId);
    // Find which room they are closest to, or just keep current room but switch agent context
    // For UX, if they have a room, go there. If not, stay in current room but override agent.
    const room = ROOMS.find(r => r.agentId === agentId);
    if (room) {
      setActiveRoomId(room.id);
      setTempActiveAgentId(null);
    }
    setIsLabsOpen(false);
    setGodModeAgentId(null);
    setEditingAgentId(null);
  };

  const handleEditAgent = (agentId: string) => {
    setEditingAgentId(agentId);
    setGodModeAgentId(null);
    setIsLabsOpen(true);
  };

  // Updated to accept image
  const handleSend = (image?: string) => {
    handleSendMessage(input, image);
    setInput("");
  };

  const handleVoiceWrapper = useCallback((text: string) => {
    const remainingText = handleVoiceCommand(text);
    if (remainingText) {
      setInput(remainingText);
      setTimeout(() => {
        handleSendMessage(remainingText);
        setInput("");
      }, 500);
    }
  }, [handleVoiceCommand, handleSendMessage]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen mode: ${err.message} (${err.name})`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Calculate unread memos
  const unreadCount = inbox ? inbox.filter(m => !m.isRead && m.status !== 'deleted' && m.status !== 'archived').length : 0;

  return (
    <div className={`flex h-screen w-full overflow-hidden transition-colors duration-500
        ${isOracleMode ? 'bg-black text-green-500' : 'bg-zinc-950 text-zinc-200'}
    `}>

      <Sidebar
        activeRoomId={activeRoom.isBoardroom ? 'boardroom' : activeRoom.id}
        activeAgentId={activeAgent.id}
        onSelectRoom={onSelectRoom}
        onSelectAgent={onSelectAgent}
        onOpenLabs={() => { setIsLabsOpen(true); setEditingAgentId(null); }}
        isLabsOpen={isLabsOpen}
        onToggleOracleMode={toggleOracleMode}
        isOracleMode={isOracleMode}
        onBackup={triggerBackup}
        onRestore={restoreFromSnapshot}
        onToggleFullscreen={toggleFullscreen}
        inboxCount={unreadCount}
        onOpenGodMode={(id) => setGodModeAgentId(id)}
        onEditAgent={handleEditAgent}
      />

      {/* Main Content Router */}
      <div className="flex-1 flex flex-col relative">
        {godModeAgentId ? (
          <GodMode
            agent={agents[godModeAgentId]}
            onClose={() => setGodModeAgentId(null)}
            onEdit={() => handleEditAgent(godModeAgentId)}
          />
        ) : isLabsOpen ? (
          <Labs
            agents={agents}
            onCreateAgent={createNewAgent}
            initialAgentId={editingAgentId}
          />
        ) : (
          <ChatArea
            messages={messages}
            activeAgent={activeAgent}
            input={input}
            setInput={setInput}
            onSend={handleSend}
            isLoading={isLoading}
            roomName={activeAgent.id === activeRoom.agentId ? activeRoom.name : `Call with ${activeAgent.name}`}
            themeColor={activeRoom.themeColor}
            onSpeechResult={handleVoiceWrapper}
            isSpeaking={isSpeaking}
            isOracleMode={isOracleMode}
            inbox={inbox}
            onMarkMemoRead={markMemoAsRead}
            onReplyToMemo={replyToMemo}
            onSetMemoStatus={setMemoStatus}
          />
        )}

        {/* Visual Indicator of Mei's Presence */}
        {!isOracleMode && !godModeAgentId && !isLabsOpen && (
          <div className="absolute top-4 right-4 z-50 pointer-events-none">
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full border border-zinc-800">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              <span className="text-[10px] text-zinc-400 font-mono uppercase">Mei Online</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
