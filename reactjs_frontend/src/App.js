import React, { useState, useEffect } from 'react';
import './App.css';

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');

  // Effect: Apply theme to the document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Main Navigation Bar
  function AppNav() {
    return (
      <nav className="navbar" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0.7rem 2rem'
      }}>
        <span
          className="navbar-brand"
          style={{
            fontWeight: 700,
            fontSize: '1.35rem',
            color: 'var(--text-primary)',
            letterSpacing: '0.02em'
          }}
        >
          {/* Could be replaced with logo asset if desired */}
          <span role="img" aria-label="Pet paw" style={{marginRight: 8}}>🐾</span>
          PetConnect
        </span>
        <div>
          {/* Nav links placeholder; for MVP can just show Home, Login/Register */}
          <a
            className="App-link"
            href="#"
            style={{ marginRight: 16, fontWeight: 600, textDecoration: 'none', color: 'var(--text-primary)' }}
          >
            Home
          </a>
          <a
            className="App-link"
            href="#"
            style={{ marginRight: 16, fontWeight: 600, textDecoration: 'none', color: 'var(--text-primary)' }}
          >
            Find Pets
          </a>
          <a
            className="App-link"
            href="#"
            style={{ fontWeight: 600, textDecoration: 'none', color: 'var(--text-primary)' }}
          >
            Login / Register
          </a>
        </div>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          style={{marginLeft: 24}}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </nav>
    );
  }

  // PUBLIC_INTERFACE
  return (
    <div className="App">
      <AppNav />
      <main className="container" style={{
        margin: '0 auto',
        maxWidth: 800,
        padding: '3rem 1.2rem 1.6rem 1.2rem'
      }}>
        <section
          style={{
            margin: '0 auto',
            textAlign: 'center'
          }}
        >
          <h1 className="title" style={{
            fontFamily: "'Segoe UI', 'Roboto', sans-serif",
            fontSize: '2.6rem',
            fontWeight: 700,
            marginBottom: '1.1rem',
            color: 'var(--primary-color, var(--text-primary, #282c34))'
          }}>
            Welcome to PetConnect!
          </h1>
          <p className="subtitle" style={{
            fontSize: '1.3rem',
            marginBottom: 18,
            color: 'var(--text-secondary, #61dafb)'
          }}>
            A modern platform to adopt, rescue, and connect pets with loving families.
          </p>
          <p className="description" style={{
            maxWidth: 540,
            margin: '0 auto 2.2rem auto',
            fontSize: '1.08rem',
            color: 'var(--text-primary)'
          }}>
            Browse adoptable animals, list a pet in need, and connect with the community. Sign up to get started, or explore our listings as a guest.
          </p>
          <hr style={{
            width: "40%",
            margin: "2rem auto",
            border: "1px solid var(--border-color)"
          }}/>
          {/* Action buttons placeholder */}
          <div>
            <a className="btn"
              href="#"
              style={{
                background: 'var(--button-bg)',
                color: 'var(--button-text)',
                padding: '0.7rem 2.2rem',
                borderRadius: 8,
                fontWeight: 600,
                marginRight: 18,
                boxShadow: "0 2px 8px rgba(35,160,148,0.08)",
                fontSize: '1.07rem',
                display: 'inline-block',
                textDecoration: 'none'
              }}>
              View Pets
            </a>
            <a className="btn"
              href="#"
              style={{
                background: 'var(--bg-secondary)',
                color: 'var(--button-bg)',
                padding: '0.7rem 2.2rem',
                borderRadius: 8,
                fontWeight: 600,
                border: '1px solid var(--button-bg)',
                fontSize: '1.07rem',
                display: 'inline-block',
                textDecoration: 'none'
              }}>
              Register Pet
            </a>
          </div>
          <p style={{ fontSize: "0.97rem", marginTop: "2.1rem", color: "var(--text-secondary, #61dafb)" }}>
            Ready to join? <a href="#" style={{ color: "var(--button-bg)", fontWeight: "600" }}>Create an account</a> or <a href="#" style={{ color: "var(--button-bg)", fontWeight: "600" }}>Log in</a>
          </p>
        </section>
      </main>
    </div>
  );
}

export default App;
