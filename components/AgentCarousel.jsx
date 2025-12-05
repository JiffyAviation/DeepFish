import React, { useState, useRef, useEffect } from 'react';
import './AgentCarousel.css';

// Import avatar images
import oracleAvatar from '../Avatars/oracle.jpg';
import hannaAvatar from '../Avatars/hanna.jpg';
import meiAvatar from '../Avatars/mei.png';
import aiteeAvatar from '../Avatars/Aitee.png';
import vesperAvatar from '../Avatars/vesper.jpg';
import abacusAvatar from '../Avatars/Abacus.jpg';

// First 6 agents from constants.ts
const FEATURED_AGENTS = [
  {
    id: 'oracle',
    name: 'The Architect',
    title: 'Omniscient System',
    description: 'The Unseen Hand.',
    icon: oracleAvatar,
    color: '#f0f0f0'
  },
  {
    id: 'hanna',
    name: 'Hanna',
    title: 'Senior Art Director',
    description: 'UI/UX, Production Design, & Visual Assets.',
    icon: hannaAvatar,
    color: '#ff6b6b'
  },
  {
    id: 'mei',
    name: 'Mei',
    title: 'Studio Director',
    description: 'Orchestrates the Elite Design Team. Quality Control.',
    icon: meiAvatar,
    color: '#4ecdc4'
  },
  {
    id: 'it',
    name: 'IT',
    title: 'Principal Architect',
    description: 'Backend & Infrastructure.',
    icon: aiteeAvatar,
    color: '#888888'
  },
  {
    id: 'vesper',
    name: 'Vesper',
    title: 'Global Concierge',
    description: 'Real-world logistics, travel, & investor relations.',
    icon: vesperAvatar,
    color: '#ffb86c'
  },
  {
    id: 'abacus',
    name: 'ABACUS',
    title: 'Strategic Owner',
    description: 'Parent company. Boardroom Moderator.',
    icon: abacusAvatar,
    color: '#ffd700'
  },
  {
    id: 'einstein',
    name: 'Einstein',
    title: 'Theoretical Physicist',
    description: 'Complex systems, quantum mechanics, & breakthrough innovations.',
    icon: '🧠', // Replace with avatar when ready: einsteinAvatar
    color: '#9b59b6'
  }
];

const AgentCarousel = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const carouselRef = useRef(null);

  const totalPages = Math.ceil(FEATURED_AGENTS.length / 6);

  // Mouse drag handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const diff = e.clientX - startX;
    setTranslateX(diff);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;

    setIsDragging(false);

    // Threshold for page change (100px)
    if (translateX < -100 && currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
    } else if (translateX > 100 && currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }

    setTranslateX(0);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    const diff = e.touches[0].clientX - startX;
    setTranslateX(diff);
  };

  const handleTouchEnd = () => {
    if (translateX < -100 && currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
    } else if (translateX > 100 && currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
    setTranslateX(0);
  };

  // Calculate transform
  const getTransform = () => {
    const pageOffset = -currentPage * 100;
    const dragOffset = (translateX / window.innerWidth) * 100;
    return `translateX(calc(${pageOffset}% + ${dragOffset}px))`;
  };

  return (
    <section className="agent-carousel-section">
      <div className="section-header">
        <h2 className="section-title">
          Meet the <span className="highlight">JSons</span>
        </h2>
        <p className="section-description">
          Your specialized AI team. Each agent is an expert in their domain.
        </p>
      </div>

      <div
        className="carousel-container"
        ref={carouselRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={`carousel-track ${isDragging ? 'dragging' : ''}`}
          style={{ transform: getTransform() }}
        >
          <div className="carousel-page">
            <div className="agents-grid">
              {FEATURED_AGENTS.map(agent => (
                <div key={agent.id} className="agent-card-circle">
                  <div
                    className="agent-avatar-circle"
                    style={{
                      borderColor: agent.color,
                      boxShadow: `0 0 30px ${agent.color}40`
                    }}
                  >
                    <img src={agent.icon} alt={agent.name} className="avatar-image" />
                  </div>

                  <div className="agent-info">
                    <h3
                      className="agent-name"
                      style={{ color: agent.color }}
                    >
                      {agent.name}
                    </h3>
                    <p className="agent-title">{agent.title}</p>
                    <p className="agent-description">{agent.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Drag hint */}
        {!isDragging && (
          <div className="drag-hint">
            ← Drag to explore →
          </div>
        )}
      </div>

      {/* Page indicators */}
      {totalPages > 1 && (
        <div className="page-indicators">
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              className={`page-dot ${index === currentPage ? 'active' : ''}`}
              onClick={() => setCurrentPage(index)}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Coming soon badge */}
      {totalPages > 1 && currentPage === 0 && (
        <div className="more-agents-badge">
          <span>+12 more agents</span>
        </div>
      )}
    </section>
  );
};

export default AgentCarousel;
