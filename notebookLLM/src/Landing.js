import React from 'react';
import './Landing.css';

function Landing({ onGetStarted }) {
  return (
    <div className="landing-page">
      <div className="landing-navbar">
        <div className="landing-logo">
          <span className="logo-icon">🤖</span>
          <span className="logo-text">Multi-modal LLM</span>
        </div>
        <button className="landing-nav-btn" onClick={onGetStarted}>
          Sign In
        </button>
      </div>

      <div className="landing-hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Your Intelligent
            <span className="gradient-text"> Document Assistant</span>
          </h1>
          <p className="hero-subtitle">
            Upload documents, ask questions, and get instant AI-powered answers.
            Support for PDFs, Word docs, images, and audio files.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary-large" onClick={onGetStarted}>
              Get Started Free
            </button>
            <button className="btn-secondary-large" onClick={onGetStarted}>
              Sign In
            </button>
          </div>
          <p className="hero-note">
            ✨ No credit card required • Start in seconds
          </p>
        </div>
        <div className="hero-image">
          <div className="hero-card hero-card-1">
            <div className="card-icon">📄</div>
            <div className="card-text">Upload Documents</div>
          </div>
          <div className="hero-card hero-card-2">
            <div className="card-icon">💬</div>
            <div className="card-text">Ask Questions</div>
          </div>
          <div className="hero-card hero-card-3">
            <div className="card-icon">✨</div>
            <div className="card-text">Get AI Answers</div>
          </div>
        </div>
      </div>

      <div className="landing-features">
        <h2 className="section-title">Powerful Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h3>Multi-Format Support</h3>
            <p>Upload PDFs, DOCX, images, and audio files. We handle them all seamlessly.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Intelligent Search</h3>
            <p>Advanced RAG (Retrieval-Augmented Generation) for accurate, context-aware answers.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Lightning Fast</h3>
            <p>Get instant responses powered by state-of-the-art language models.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure & Private</h3>
            <p>Your documents are stored securely. Activity tracking for complete transparency.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Activity Dashboard</h3>
            <p>Track all your uploads, queries, and interactions in one place.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎨</div>
            <h3>Beautiful Interface</h3>
            <p>Modern, intuitive design with dark/light themes and keyboard shortcuts.</p>
          </div>
        </div>
      </div>

      <div className="landing-how-it-works">
        <h2 className="section-title">How It Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Create Account</h3>
              <p>Sign up in seconds with just a username and password</p>
            </div>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Upload Documents</h3>
              <p>Drag & drop your files or browse to upload</p>
            </div>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Ask Questions</h3>
              <p>Type your question and get instant AI-powered answers</p>
            </div>
          </div>
        </div>
      </div>

      <div className="landing-stats">
        <div className="stat-item-landing">
          <div className="stat-number-landing">PDF, DOCX, Images</div>
          <div className="stat-label-landing">Supported Formats</div>
        </div>
        <div className="stat-item-landing">
          <div className="stat-number-landing">Advanced RAG</div>
          <div className="stat-label-landing">AI Technology</div>
        </div>
        <div className="stat-item-landing">
          <div className="stat-number-landing">100% Free</div>
          <div className="stat-label-landing">To Get Started</div>
        </div>
      </div>

      <div className="landing-cta">
        <h2 className="cta-title">Ready to Transform Your Document Workflow?</h2>
        <p className="cta-subtitle">Join users who are already experiencing the power of AI-assisted research</p>
        <button className="btn-cta" onClick={onGetStarted}>
          Get Started Now
        </button>
      </div>

      <div className="landing-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Multi-modal LLM</h4>
            <p>Your intelligent document assistant powered by advanced AI</p>
          </div>
          <div className="footer-section">
            <h4>Features</h4>
            <ul>
              <li>Multi-format support</li>
              <li>AI-powered answers</li>
              <li>Activity tracking</li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Technology</h4>
            <ul>
              <li>RAG Pipeline</li>
              <li>Vector Search</li>
              <li>LLM Integration</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Multi-modal LLM. Built with React & FastAPI.</p>
        </div>
      </div>
    </div>
  );
}

export default Landing;
