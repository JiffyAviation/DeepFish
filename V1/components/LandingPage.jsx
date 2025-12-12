import React, { useEffect, useRef } from 'react';
import './LandingPage.css';
import AgentCarousel from './AgentCarousel';

const LandingPage = () => {
  const codeBackgroundRef = useRef(null);

  // Floating code background animation
  useEffect(() => {
    const container = codeBackgroundRef.current;
    if (!container) return;

    const codeSnippets = [
      'const agent = new AI();',
      'function deploy() { ... }',
      'if (deadline === "urgent") rush();',
      'export default Studio;',
      'async await response();',
      'let creativity = ∞;',
      'while(working) { improve(); }',
      'import { Hanna } from "./agents";',
      'class DeepFish extends AI {}',
      'return perfection;',
      'const cost = calculate();',
      '// Ship it',
      'parallel.map(agent => work());',
      'try { innovate(); } catch {}',
      'System.log("Building...");'
    ];

    const colors = ['#00d4ff', '#ff00ff', '#00ff88', '#ff6b6b', '#ffd700'];

    // Create floating code elements
    const createFloatingCode = () => {
      const code = document.createElement('div');
      code.className = 'floating-code';
      code.textContent = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
      code.style.color = colors[Math.floor(Math.random() * colors.length)];
      code.style.top = `${Math.random() * 100}%`;
      code.style.animationDuration = `${15 + Math.random() * 20}s`;
      code.style.opacity = `${0.1 + Math.random() * 0.3}`;
      code.style.fontSize = `${10 + Math.random() * 6}px`;

      container.appendChild(code);

      // Remove after animation
      setTimeout(() => {
        code.remove();
      }, 35000);
    };

    // Create initial batch (increased from 15 to 37 for 150% density)
    for (let i = 0; i < 37; i++) {
      setTimeout(createFloatingCode, i * 300);
    }

    // Add new ones periodically (faster: 2000ms → 800ms)
    const interval = setInterval(createFloatingCode, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="landing-page">
      {/* Animated code background */}
      <div ref={codeBackgroundRef} className="code-background"></div>

      {/* Scan lines overlay */}
      <div className="scanlines"></div>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-icon">🐟</span>
            <span className="badge-text">AI Studio Platform</span>
          </div>

          <h1 className="hero-title">
            <span className="title-gradient">DeepFish</span>
            <span className="title-subtitle">Multi-Agent AI Studio</span>
          </h1>

          <p className="hero-description">
            Your team of 18 specialized AI agents.
            Uniquely trained and updated daily.
          </p>

          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">18</span>
              <span className="stat-label">Specialized Agents</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">∞</span>
              <span className="stat-label">Possibilities</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Always On</span>
            </div>
          </div>

          <div className="hero-cta">
            <button className="cta-primary" onClick={() => window.location.href = '/app'}>
              <span className="btn-text">Start Building</span>
              <span className="btn-arrow">→</span>
            </button>
            <button className="cta-secondary" onClick={() => document.getElementById('waitlist').scrollIntoView({ behavior: 'smooth' })}>
              <span className="btn-text">Join Waitlist</span>
            </button>
            <button className="cta-login" onClick={() => window.location.href = '/login'}>
              <span className="btn-text">Log In</span>
            </button>
          </div>
        </div>

        {/* Hero visual */}
        <div className="hero-visual">
          <div className="glass-card terminal-preview">
            <div className="terminal-header">
              <div className="terminal-dots">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
              </div>
              <span className="terminal-title">deepfish.app</span>
            </div>
            <div className="terminal-body">
              <div className="terminal-line">
                <span className="prompt">$</span>
                <span className="command">deepfish deploy --agents=all</span>
              </div>
              <div className="terminal-output">
                <div className="output-line">
                  <span className="check">✓</span> Hanna: UI design complete
                </div>
                <div className="output-line">
                  <span className="check">✓</span> IT: Backend deployed
                </div>
                <div className="output-line">
                  <span className="check">✓</span> Mei: Quality approved
                </div>
                <div className="output-line typing">
                  <span className="cursor">▊</span> Sally: Preparing launch...
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="scroll-indicator" onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>
          <div className="scroll-arrow">↓</div>
          <span className="scroll-text">More below</span>
        </div>
      </section>


      {/* Agent Carousel Billboard */}
      <section className="carousel-section">
        <div className="section-header">
          <h2 className="section-title">
            Meet Your <span className="highlight">AI Specialists</span>
          </h2>
          <p className="section-description">
            Swipe through our elite team of specialized agents
          </p>
        </div>
        <AgentCarousel />
      </section>


      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2 className="section-title">
            Your AI <span className="highlight">Dream Team</span>
          </h2>
          <p className="section-description">
            Every agent is a specialist. Together, they're unstoppable.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card glass-card">
            <div className="feature-icon">🎨</div>
            <h3 className="feature-title">Creative Studio</h3>
            <p className="feature-description">
              Hanna creates production-grade UI/UX, game assets, and visual designs.
              trained AI agent augmented image generation.
            </p>
            <div className="feature-tags">
              <span className="tag">UI/UX</span>
              <span className="tag">Assets</span>
              <span className="tag">Branding</span>
            </div>
          </div>

          <div className="feature-card glass-card">
            <div className="feature-icon">💻</div>
            <h3 className="feature-title">Engineering Team</h3>
            <p className="feature-description">
              IT, Root, and Skillz handle architecture, automation, and deployment.
              Production-grade code, not prototypes.
            </p>
            <div className="feature-tags">
              <span className="tag">Full-Stack</span>
              <span className="tag">DevOps</span>
              <span className="tag">APIs</span>
            </div>
          </div>

          <div className="feature-card glass-card">
            <div className="feature-icon">🎯</div>
            <h3 className="feature-title">Project Management</h3>
            <p className="feature-description">
              Mei is VP of Operations. Nothing happens without her approval
            </p>
            <div className="feature-tags">
              <span className="tag">Coordination</span>
              <span className="tag">QA</span>
              <span className="tag">Delivery</span>
            </div>
          </div>

          <div className="feature-card glass-card">
            <div className="feature-icon">📈</div>
            <h3 className="feature-title">Growth & Marketing</h3>
            <p className="feature-description">
              Sally and Vesper handle launches, investor relations, and real-world
              logistics with agentic web search access.
            </p>
            <div className="feature-tags">
              <span className="tag">Marketing</span>
              <span className="tag">VC Relations</span>
              <span className="tag">Travel</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works-section">
        <div className="section-header">
          <h2 className="section-title">
            Simple <span className="highlight">Workflow</span>
          </h2>
        </div>

        <div className="workflow-steps">
          <div className="workflow-step glass-card">
            <div className="step-number">01</div>
            <h3 className="step-title">Describe Your Vision</h3>
            <p className="step-description">
              Tell Mei what you need, he'll coordinate the team.
              Too slow? She can instantly create miltiples of anyone.
            </p>
          </div>

          <div className="workflow-arrow">→</div>

          <div className="workflow-step glass-card">
            <div className="step-number">02</div>
            <h3 className="step-title">Agents Execute</h3>
            <p className="step-description">
              Hanna designs, IT codes, QC tests - all in paralell,
              everyone working at the same time
            </p>
          </div>

          <div className="workflow-arrow">→</div>

          <div className="workflow-step glass-card">
            <div className="step-number">03</div>
            <h3 className="step-title">Get Results</h3>
            <p className="step-description">
              Production-ready deliverables. Fast, polished, bulletproof.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="pricing-section">
        <div className="pricing-container glass-card">
          <h2 className="pricing-title">Early Access Pricing</h2>
          <p className="pricing-description">
            Get lifetime access to select agents before launch
          </p>
          <div className="pricing-amount">
            <span className="currency">$</span>
            <span className="price">4.99</span>
          </div>
          <p className="pricing-note">
            Choose: Mei, Vesper, or Hanna • Limited Spots
          </p>
          <button className="pricing-cta">
            Secure Early Access
          </button>
        </div>
      </section>

      {/* Waitlist Section */}
      <section className="waitlist-section">
        <div className="waitlist-container glass-card">
          <h2 className="waitlist-title">Join the Waitlist</h2>
          <p className="waitlist-description">
            Be among the first to access DeepFish AI Studio
          </p>

          <form className="waitlist-form">
            <input
              type="email"
              placeholder="your@email.com"
              className="waitlist-input"
            />
            <button type="submit" className="waitlist-submit">
              Get Early Access
            </button>
          </form>

          <p className="waitlist-note">
            No spam. Just launch updates and exclusive features.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="footer-logo">🐟 DeepFish</span>
            <p className="footer-tagline">
              We create the highest quality work in the world.
            </p>
          </div>

          <div className="footer-links">
            <a href="#features">Features</a>
            <a href="#agents">Agents</a>
            <a href="#pricing">Pricing</a>
            <a href="#docs">Docs</a>
          </div>

          <div className="footer-social">
            <a href="#" className="social-link">Twitter</a>
            <a href="#" className="social-link">GitHub</a>
            <a href="#" className="social-link">Discord</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2025 DeepFish AI Studio.
            Built by the best, for the best.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
