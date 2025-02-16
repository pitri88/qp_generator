import React from "react";
import { Link } from "react-router-dom";
import { theme } from '../styles/theme';

export default function Home() {
  return (
    <div className="home">
      <header className="header-main">
        <div className="header-content">
          {/* <div className="logo">QPG</div> */}
          <div className="nav-links">
            <Link to="/login-admin" className="login-button">
              Admin Login
            </Link>
            <Link to="/login-faculty" className="login-button">
              Faculty Login
            </Link>
          </div>
        </div>
      </header>

      <main className="hero-section">
        <div className="hero-content">
          <h1>Question Paper Generator</h1>
          <p>Create and manage question papers efficiently</p>
          <div className="features">
            <div className="feature-card">
              <div className="icon">📝</div>
              <h3>Easy Creation</h3>
              <p>Create question papers with just a few clicks</p>
            </div>
            <div className="feature-card">
              <div className="icon">🎯</div>
              <h3>Smart Filtering</h3>
              <p>Filter questions by CO, BT level, and more</p>
            </div>
            <div className="feature-card">
              <div className="icon">📊</div>
              <h3>Organized Management</h3>
              <p>Manage your question bank efficiently</p>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .home {
          min-height: 100vh;
          background: linear-gradient(135deg, ${theme.colors.primary.main}, ${theme.colors.secondary.main});
        }

        .header-main {
          padding: 1rem 2rem;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
        }

        .nav-links {
          display: flex;
          gap: 1rem;
        }

        .login-button {
          padding: 0.5rem 1.5rem;
          border-radius: ${theme.borderRadius.md};
          background: rgba(255, 255, 255, 0.2);
          color: white;
          text-decoration: none;
          transition: all 0.2s;
        }

        .login-button:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }

        .hero-section {
          padding: 4rem 2rem;
          color: white;
          text-align: center;
        }

        .hero-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        h1 {
          font-size: 3rem;
          margin-bottom: 1rem;
          font-weight: 700;
        }

        .hero-content > p {
          font-size: 1.25rem;
          margin-bottom: 3rem;
          opacity: 0.9;
        }

        .features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin-top: 4rem;
        }

        .feature-card {
          background: rgba(255, 255, 255, 0.1);
          padding: 2rem;
          border-radius: ${theme.borderRadius.lg};
          backdrop-filter: blur(10px);
          transition: transform 0.2s;
        }

        .feature-card:hover {
          transform: translateY(-5px);
        }

        .icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .feature-card h3 {
          font-size: 1.25rem;
          margin-bottom: 0.5rem;
        }

        .feature-card p {
          opacity: 0.8;
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
}
