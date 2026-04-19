#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const SITE_URL = 'https://localpraxis.com';
const POSTS_DIR = path.join(__dirname, 'posts');
const BLOG_DIR = path.join(__dirname, 'blog');
const TODAY = new Date().toISOString().split('T')[0];

// ─── marked config ────────────────────────────────────────────────────────────
marked.setOptions({ breaks: true, gfm: true });

// ─── helpers ──────────────────────────────────────────────────────────────────
function formatDateDisplay(dateStr) {
  const d = new Date(dateStr + 'T12:00:00Z');
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  return `${months[d.getUTCMonth()]} ${String(d.getUTCDate()).padStart(2, '0')} ${d.getUTCFullYear()}`;
}

function formatDateISO(dateStr) {
  return new Date(dateStr + 'T12:00:00Z').toISOString();
}

function formatDateRFC(dateStr) {
  return new Date(dateStr + 'T12:00:00Z').toUTCString();
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// normalize YAML date (gray-matter parses bare ISO dates as Date objects)
function normalizeDate(raw, fallback) {
  if (!raw) return fallback;
  if (raw instanceof Date) {
    const y = raw.getUTCFullYear();
    const m = String(raw.getUTCMonth() + 1).padStart(2, '0');
    const d = String(raw.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return String(raw);
}

// ─── read & parse posts ───────────────────────────────────────────────────────
function readPosts() {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs.readdirSync(POSTS_DIR)
    .filter(f => f.endsWith('.md') && !f.startsWith('.'))
    .sort()
    .reverse()
    .map(file => {
      const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8');
      const { data, content } = matter(raw);
      const slug = data.slug || file.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '');
      const date = normalizeDate(data.date, file.slice(0, 10));
      return {
        title: data.title || 'Untitled',
        date,
        slug,
        description: data.description || '',
        tags: Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : []),
        body: content,
        html: marked.parse(content),
        file
      };
    });
}

// ─── shared CSS ───────────────────────────────────────────────────────────────
const SHARED_CSS = `
  :root {
    --paper: #D8DBD0;
    --ink: #0A0A0A;
    --red: #C8342E;
    --cyan: #4A90B8;
    --rule: var(--ink);
    --ink-mid: rgba(10, 10, 10, 0.65);
    --ink-light: rgba(10, 10, 10, 0.45);
    --font-display: 'Archivo Black', Impact, 'Helvetica Neue Condensed Black', sans-serif;
    --font-mono: 'IBM Plex Mono', ui-monospace, monospace;
    --font-body: 'Inter', system-ui, sans-serif;
    --font-size-section: clamp(2rem, 5vw, 5rem);
    --font-size-subsection: clamp(1.125rem, 2vw, 1.5rem);
    --font-size-body: 1rem;
    --font-size-xs: 0.65rem;
    --font-size-sm: 0.75rem;
    --font-size-md: 1rem;
    --ease: cubic-bezier(0.16, 1, 0.3, 1);
  }
  [data-theme="dark"] {
    --paper: #0A0A0A;
    --ink: #D8DBD0;
    --rule: var(--ink);
    --ink-mid: rgba(216, 219, 208, 0.7);
    --ink-light: rgba(216, 219, 208, 0.5);
  }
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    background-color: var(--paper);
    color: var(--ink);
    font-family: var(--font-mono);
    font-weight: 500;
    font-size: var(--font-size-body);
    line-height: 1.65;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  ::selection { background-color: var(--red); color: var(--paper); }
  @keyframes pageIn {
    from { opacity: 0; transform: scale(0.96); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes pageOut {
    from { opacity: 1; transform: scale(1); }
    to   { opacity: 0; transform: scale(1.04); }
  }
  body { animation: pageIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) both; transform-origin: center top; }
  body.page-leaving { animation: pageOut 0.28s cubic-bezier(0.4, 0, 1, 1) forwards; pointer-events: none; }
  .skip-link {
    position: absolute; top: -100%; left: 1rem;
    background: var(--ink); color: var(--paper);
    padding: 0.5rem 1rem; font-family: var(--font-mono);
    font-size: 0.85rem; z-index: 9999; transition: top 0.1s ease;
  }
  .skip-link:focus { top: 0; }
  .container { max-width: 1080px; margin: 0 auto; padding: 0 2rem; }
  nav {
    position: sticky; top: 0; z-index: 100;
    background-color: var(--paper);
    border-bottom: 2px solid var(--ink);
    padding: 1rem 0;
  }
  .nav-container {
    max-width: 1080px; margin: 0 auto; padding: 0 2rem;
    display: flex; justify-content: space-between; align-items: center;
  }
  .logo {
    font-family: var(--font-mono); font-size: 1.5rem; font-weight: 900;
    color: var(--ink); letter-spacing: -0.02em; text-decoration: none; text-transform: uppercase;
  }
  .logo-accent { color: var(--red); }
  nav ul { list-style: none; display: flex; gap: 2rem; align-items: center; }
  nav a {
    color: var(--ink); text-decoration: none; font-size: 13px;
    font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em;
    transition: color 0.1s ease;
  }
  nav a:hover { color: var(--cyan); }
  nav a.active { color: var(--cyan); }
  .nav-phone {
    font-size: 13px; color: var(--ink-mid); text-decoration: none;
    font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em;
    transition: color 0.1s ease; white-space: nowrap;
  }
  .nav-phone:hover { color: var(--cyan); }
  .theme-toggle-btn {
    background: none; font-family: var(--font-mono) !important;
    font-size: 11px !important; font-weight: 600 !important;
    color: var(--ink) !important; border: 1.5px solid var(--ink) !important;
    padding: 4px 8px !important; border-radius: 0; cursor: pointer;
    text-transform: uppercase; letter-spacing: 0.14em;
    transition: background-color 0.1s ease, color 0.1s ease;
  }
  .theme-toggle-btn:hover { background-color: var(--ink) !important; color: var(--paper) !important; }
  .hamburger { display: none; background: none; border: none; cursor: pointer; padding: 0.5rem; z-index: 1001; }
  .hamburger span { display: block; width: 22px; height: 2px; background: var(--ink); margin: 5px 0; transition: transform 0.1s ease, opacity 0.1s ease; }
  .hamburger.active span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
  .hamburger.active span:nth-child(2) { opacity: 0; }
  .hamburger.active span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
  @media (max-width: 768px) {
    .hamburger { display: block; }
    nav ul { display: none; }
    .nav-container { padding: 0 1.5rem; }
    .container { padding: 0 1.5rem; }
    nav.menu-open {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      width: 100%; height: 100dvh; background-color: var(--paper);
      border-bottom: none; z-index: 9999;
    }
    nav.menu-open .nav-container { height: 100%; flex-direction: column; justify-content: center; }
    nav.menu-open ul { display: flex; flex-direction: column; align-items: center; gap: 2rem; }
    nav.menu-open ul li a { font-size: 1.2rem; }
    nav.menu-open .hamburger { position: absolute; top: 1rem; right: 1.5rem; }
    nav.menu-open .logo { position: absolute; top: 1rem; left: 1.5rem; }
  }
  body > footer { background-color: var(--ink); padding: 3rem 0; }
  .footer-content {
    max-width: 1080px; margin: 0 auto; padding: 0 2rem;
    display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: center;
  }
  .footer-left { font-family: var(--font-mono); font-size: var(--font-size-md); color: var(--paper); font-weight: 500; }
  .footer-right { text-align: right; font-family: var(--font-mono); font-size: var(--font-size-sm); color: rgba(216, 219, 208, 0.6); }
  @media (max-width: 600px) {
    .footer-content { grid-template-columns: 1fr; gap: 1rem; }
    .footer-right { text-align: left; }
  }
`;

const SHARED_NAV_HTML = (activePage = '') => `
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <nav role="navigation" aria-label="Main navigation">
    <div class="nav-container">
      <a href="/" class="logo">Local<span class="logo-accent">Praxis</span></a>
      <button class="hamburger" aria-label="Toggle menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
      <ul>
        <li><a href="/#demos">Demos</a></li>
        <li><a href="/#process">Process</a></li>
        <li><a href="/#about">About</a></li>
        <li><a href="/blog/"${activePage === 'writing' ? ' class="active"' : ''}>Writing</a></li>
        <li><a href="/faq.html">FAQ</a></li>
        <li><a href="/#contact">Contact</a></li>
        <li><a href="tel:+13613322725" class="nav-phone">(361) 332-2725</a></li>
        <li><button id="theme-toggle" class="theme-toggle-btn" aria-label="Toggle dark mode">DARK</button></li>
      </ul>
    </div>
  </nav>
`;

const SHARED_FOOTER_HTML = `
  <footer>
    <div class="footer-content">
      <div class="footer-left">Local Praxis. Based in Port Aransas, TX.</div>
      <div class="footer-right"><a href="/privacy.html" style="color:rgba(216,219,208,0.6);text-decoration:none;">Privacy</a> &middot; &copy; 2026 James Johnson</div>
    </div>
  </footer>
`;

const SHARED_JS = `
  <script>
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (href && !href.startsWith('#') && !href.startsWith('tel:') && !href.startsWith('mailto:') && !href.startsWith('http') && !link.getAttribute('target')) {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          document.body.classList.add('page-leaving');
          setTimeout(() => { window.location = href; }, 280);
        });
      }
    });
    window.addEventListener('pageshow', e => {
      if (e.persisted) document.body.classList.remove('page-leaving');
    });
    const hamburger = document.querySelector('.hamburger');
    const navEl = document.querySelector('nav');
    const navUl = document.querySelector('nav ul');
    if (hamburger && navEl) {
      hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navEl.classList.toggle('menu-open');
        const isOpen = navEl.classList.contains('menu-open');
        hamburger.setAttribute('aria-expanded', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
      });
      navUl.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          hamburger.classList.remove('active');
          navEl.classList.remove('menu-open');
          hamburger.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        });
      });
    }
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('lp-theme');
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      themeToggle.textContent = 'LIGHT';
    }
    themeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        themeToggle.textContent = 'DARK';
        localStorage.setItem('lp-theme', 'light');
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.textContent = 'LIGHT';
        localStorage.setItem('lp-theme', 'dark');
      }
    });
  </script>
`;

// ─── blog index page ──────────────────────────────────────────────────────────
function buildBlogIndex(posts) {
  const postRows = posts.length === 0
    ? `<p class="no-posts">No posts yet.</p>`
    : `<ul class="post-list" role="list">
        ${posts.map(p => `
        <li class="post-entry">
          <time class="post-date" datetime="${p.date}">${formatDateDisplay(p.date)}</time>
          <div class="post-info">
            <a href="/blog/${p.slug}/" class="post-title-link">${p.title}</a>
            ${p.description ? `<p class="post-desc">${p.description}</p>` : ''}
          </div>
        </li>`).join('')}
      </ul>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Writing — Local Praxis</title>
  <meta name="description" content="Notes on software, small business, and building things that last. From James Johnson at Local Praxis in Port Aransas, TX.">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' fill='%230A0A0A'/><text x='50%25' y='50%25' dominant-baseline='central' text-anchor='middle' font-family='Archivo Black,Impact,sans-serif' font-size='14' font-weight='900' fill='%23D8DBD0'>LP</text></svg>">
  <meta name="theme-color" content="#D8DBD0">
  <meta property="og:title" content="Writing — Local Praxis">
  <meta property="og:description" content="Notes on software, small business, and building things that last. From James Johnson at Local Praxis in Port Aransas, TX.">
  <meta property="og:url" content="${SITE_URL}/blog/">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Local Praxis">
  <meta property="og:image" content="${SITE_URL}/og-image.png">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="canonical" href="${SITE_URL}/blog/">
  <link rel="alternate" type="application/rss+xml" title="Local Praxis Writing" href="${SITE_URL}/feed.xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    ${SHARED_CSS}
    /* Blog index */
    .blog-section {
      padding: clamp(3rem, 8vh, 5rem) 0 clamp(4rem, 10vh, 8rem);
    }
    .blog-headline {
      font-family: var(--font-display);
      font-size: var(--font-size-section);
      font-weight: 900;
      text-transform: uppercase;
      line-height: 0.9;
      letter-spacing: -0.045em;
      margin-bottom: clamp(2.5rem, 6vh, 4rem);
    }
    .blog-headline .red-period { color: var(--red); }
    .post-list { list-style: none; }
    .post-entry {
      display: grid;
      grid-template-columns: 130px 1fr;
      gap: 2.5rem;
      padding: 1.5rem 0;
      border-bottom: 1.5px solid var(--ink);
      align-items: start;
    }
    .post-entry:first-child { border-top: 1.5px solid var(--ink); }
    .post-date {
      font-family: var(--font-mono);
      font-size: 0.68rem;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--ink-mid);
      padding-top: 0.25rem;
      display: block;
    }
    .post-info { display: flex; flex-direction: column; }
    .post-title-link {
      font-family: var(--font-display);
      font-size: var(--font-size-subsection);
      font-weight: 900;
      text-transform: uppercase;
      color: var(--ink);
      text-decoration: none;
      letter-spacing: -0.02em;
      line-height: 1.1;
      transition: color 0.1s ease;
    }
    .post-title-link:hover { color: var(--red); }
    .post-desc {
      font-family: var(--font-body);
      font-size: 0.9rem;
      font-weight: 400;
      color: var(--ink-mid);
      line-height: 1.55;
      margin-top: 0.4rem;
    }
    .no-posts {
      font-family: var(--font-mono);
      font-size: 0.85rem;
      color: var(--ink-mid);
      padding: 2rem 0;
      border-top: 1.5px solid var(--ink);
    }
    @media (max-width: 600px) {
      .post-entry { grid-template-columns: 1fr; gap: 0.4rem; padding: 1.25rem 0; }
      .post-date { padding-top: 0; }
      .blog-headline { margin-bottom: 2rem; }
    }
  </style>
</head>
<body>
  ${SHARED_NAV_HTML('writing')}
  <main id="main-content">
    <section class="blog-section">
      <div class="container">
        <h1 class="blog-headline">Writing<span class="red-period">.</span></h1>
        ${postRows}
      </div>
    </section>
  </main>
  ${SHARED_FOOTER_HTML}
  ${SHARED_JS}
</body>
</html>`;
}

// ─── single post page ─────────────────────────────────────────────────────────
function buildPost(post) {
  const tagsHTML = post.tags.length > 0
    ? post.tags.map(t => `<span class="post-tag">${t}</span>`).join('')
    : '';

  const filedLine = post.tags.length > 0
    ? `Filed under ${post.tags.map(t => `<span class="post-tag">${t}</span>`).join(' ')}`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${post.title} — Local Praxis</title>
  <meta name="description" content="${post.description}">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' fill='%230A0A0A'/><text x='50%25' y='50%25' dominant-baseline='central' text-anchor='middle' font-family='Archivo Black,Impact,sans-serif' font-size='14' font-weight='900' fill='%23D8DBD0'>LP</text></svg>">
  <meta name="theme-color" content="#D8DBD0">
  <meta property="og:title" content="${post.title} — Local Praxis">
  <meta property="og:description" content="${post.description}">
  <meta property="og:url" content="${SITE_URL}/blog/${post.slug}/">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Local Praxis">
  <meta property="og:image" content="${SITE_URL}/og-image.png">
  <meta property="article:published_time" content="${formatDateISO(post.date)}">
  <meta property="article:author" content="James Johnson">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${post.title} — Local Praxis">
  <meta name="twitter:description" content="${post.description}">
  <meta name="twitter:image" content="${SITE_URL}/og-image.png">
  <link rel="canonical" href="${SITE_URL}/blog/${post.slug}/">
  <link rel="alternate" type="application/rss+xml" title="Local Praxis Writing" href="${SITE_URL}/feed.xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;700&display=swap" rel="stylesheet">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "${post.title.replace(/"/g, '\\"')}",
    "description": "${post.description.replace(/"/g, '\\"')}",
    "datePublished": "${formatDateISO(post.date)}",
    "author": {
      "@type": "Person",
      "name": "James Johnson",
      "url": "${SITE_URL}",
      "sameAs": ["${SITE_URL}", "https://github.com/orphicaxiom"]
    },
    "publisher": {
      "@type": "Organization",
      "name": "Local Praxis",
      "url": "${SITE_URL}"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "${SITE_URL}/blog/${post.slug}/"
    },
    "url": "${SITE_URL}/blog/${post.slug}/"
  }
  </script>
  <style>
    ${SHARED_CSS}
    /* Post page */
    .post-wrap {
      padding: clamp(3rem, 8vh, 5rem) 0 clamp(4rem, 10vh, 8rem);
    }
    .post-header { max-width: 800px; }
    .post-meta {
      font-family: var(--font-mono);
      font-size: 0.68rem;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--ink-mid);
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
      margin-bottom: 1.5rem;
    }
    .post-tag {
      font-family: var(--font-mono);
      font-size: 0.65rem;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      border: 1.5px solid var(--ink);
      padding: 2px 8px;
      color: var(--ink);
    }
    .post-title {
      font-family: var(--font-display);
      font-size: clamp(2rem, 6vw, 5rem);
      font-weight: 900;
      text-transform: uppercase;
      line-height: 0.9;
      letter-spacing: -0.045em;
      margin-bottom: 1.25rem;
      color: var(--ink);
    }
    .post-description {
      font-family: var(--font-body);
      font-size: 1.2rem;
      font-style: italic;
      font-weight: 400;
      color: var(--ink-mid);
      line-height: 1.5;
      margin-bottom: 2rem;
      max-width: 640px;
    }
    .post-rule {
      border: none;
      border-top: 1.5px solid var(--ink);
      margin: 0 0 3rem;
    }
    .post-body {
      font-family: var(--font-body);
      font-size: 1.0625rem;
      line-height: 1.7;
      max-width: 640px;
      color: var(--ink);
      font-weight: 400;
    }
    .post-body h2 {
      font-family: var(--font-display);
      font-size: var(--font-size-subsection);
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: -0.02em;
      line-height: 1.1;
      margin: 2.5rem 0 1rem;
      color: var(--ink);
    }
    .post-body h3 {
      font-family: var(--font-body);
      font-size: 1.1rem;
      font-weight: 700;
      line-height: 1.3;
      margin: 2rem 0 0.75rem;
      color: var(--ink);
    }
    .post-body p { margin-bottom: 1.5rem; }
    .post-body a { color: var(--red); text-decoration: none; }
    .post-body a:hover { text-decoration: underline; }
    .post-body ul,
    .post-body ol { margin: 0 0 1.5rem 1.5rem; }
    .post-body li { margin-bottom: 0.4rem; }
    .post-body code {
      font-family: var(--font-mono);
      font-size: 0.875em;
      background-color: color-mix(in srgb, var(--paper) 82%, var(--ink));
      padding: 0.1em 0.4em;
    }
    .post-body pre {
      font-family: var(--font-mono);
      font-size: 0.875rem;
      background-color: color-mix(in srgb, var(--paper) 82%, var(--ink));
      padding: 1.25rem 1.5rem;
      margin: 0 0 1.5rem;
      overflow-x: auto;
      border-left: 3px solid var(--ink);
    }
    .post-body pre code { background: none; padding: 0; font-size: inherit; }
    .post-body blockquote {
      font-family: var(--font-display);
      font-size: 1.2rem;
      font-weight: 900;
      font-style: italic;
      text-transform: uppercase;
      letter-spacing: -0.02em;
      line-height: 1.2;
      margin: 2rem 0;
      padding: 1.25rem 1.5rem;
      border-left: 4px solid var(--ink);
      background-color: color-mix(in srgb, var(--paper) 82%, var(--ink));
      color: var(--ink);
    }
    .post-body blockquote p { margin-bottom: 0; }
    .post-body hr {
      border: none;
      border-top: 1.5px solid var(--ink);
      margin: 2.5rem 0;
    }
    .post-footer {
      max-width: 640px;
      margin-top: 4rem;
      padding-top: 2rem;
      border-top: 1.5px solid var(--ink);
      font-family: var(--font-mono);
      font-size: 0.72rem;
      font-weight: 500;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--ink-mid);
    }
    .post-footer-filed { margin-bottom: 1.25rem; }
    .post-footer .post-tag { color: var(--ink-mid); border-color: var(--ink-mid); }
    .post-footer-back {
      display: inline-block;
      min-height: 44px;
      padding: 0.75rem 1.1rem;
      font-family: var(--font-mono);
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--ink);
      background-color: transparent;
      border: 1.5px solid var(--ink);
      text-decoration: none;
      line-height: 1.2;
      transition: background-color 0.1s ease, color 0.1s ease;
    }
    .post-footer-back:hover {
      background-color: var(--ink);
      color: var(--paper);
    }
    .post-footer-back .arrow {
      display: inline-block;
      margin-right: 0.4rem;
      transition: transform 0.1s ease;
    }
    .post-footer-back:hover .arrow { transform: translateX(-3px); }
    @media (max-width: 600px) {
      .post-description { font-size: 1.05rem; margin-bottom: 1.5rem; }
      .post-rule { margin-bottom: 2rem; }
      .post-body { font-size: 1rem; line-height: 1.65; }
      .post-body h2 { margin: 2rem 0 0.75rem; }
      .post-body h3 { margin: 1.5rem 0 0.5rem; }
      .post-body blockquote { padding: 1rem 1.1rem; font-size: 1.05rem; margin: 1.5rem 0; }
      .post-body pre { padding: 1rem 1.1rem; font-size: 0.8rem; }
      .post-meta { gap: 0.5rem; margin-bottom: 1.25rem; }
      .post-title { margin-bottom: 1rem; }
      .post-footer { margin-top: 3rem; }
    }
  </style>
</head>
<body>
  ${SHARED_NAV_HTML('writing')}
  <main id="main-content">
    <article class="post-wrap">
      <div class="container">
        <header class="post-header">
          <div class="post-meta">
            <time datetime="${post.date}">${formatDateDisplay(post.date)}</time>
            ${tagsHTML}
          </div>
          <h1 class="post-title">${post.title}</h1>
          ${post.description ? `<p class="post-description">${post.description}</p>` : ''}
          <hr class="post-rule">
        </header>
        <div class="post-body">
          ${post.html}
        </div>
        <footer class="post-footer">
          ${filedLine ? `<div class="post-footer-filed">${filedLine}</div>` : ''}
          <a href="/blog/" class="post-footer-back"><span class="arrow" aria-hidden="true">&larr;</span> Back to writing</a>
        </footer>
      </div>
    </article>
  </main>
  ${SHARED_FOOTER_HTML}
  ${SHARED_JS}
</body>
</html>`;
}

// ─── RSS feed ─────────────────────────────────────────────────────────────────
function buildFeed(posts) {
  const items = posts.map(p => `
  <item>
    <title><![CDATA[${p.title}]]></title>
    <link>${SITE_URL}/blog/${p.slug}/</link>
    <guid isPermaLink="true">${SITE_URL}/blog/${p.slug}/</guid>
    <pubDate>${formatDateRFC(p.date)}</pubDate>
    <description><![CDATA[${p.description}]]></description>
    <author>jim@localpraxis.com (James Johnson)</author>
    ${p.tags.map(t => `<category>${t}</category>`).join('\n    ')}
  </item>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Local Praxis — Writing</title>
    <link>${SITE_URL}</link>
    <description>Notes on software, small business, and building things that last. From James Johnson in Port Aransas, TX.</description>
    <language>en-us</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;
}

// ─── sitemap ──────────────────────────────────────────────────────────────────
function buildSitemap(posts) {
  const staticUrls = [
    { loc: `${SITE_URL}/`,            lastmod: TODAY },
    { loc: `${SITE_URL}/faq.html`,    lastmod: TODAY },
    { loc: `${SITE_URL}/privacy.html`,lastmod: TODAY },
    { loc: `${SITE_URL}/blog/`,       lastmod: TODAY },
    { loc: `${SITE_URL}/demos/booking.html`,   lastmod: TODAY },
    { loc: `${SITE_URL}/demos/inventory.html`, lastmod: TODAY },
    { loc: `${SITE_URL}/demos/portal.html`,    lastmod: TODAY },
    { loc: `${SITE_URL}/demos/rental.html`,    lastmod: TODAY },
  ];

  const postUrls = posts.map(p => ({
    loc: `${SITE_URL}/blog/${p.slug}/`,
    lastmod: p.date
  }));

  const allUrls = [...staticUrls, ...postUrls];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
  </url>`).join('\n')}
</urlset>`;
}

// ─── main ─────────────────────────────────────────────────────────────────────
function build() {
  const posts = readPosts();
  console.log(`Found ${posts.length} post(s)`);

  ensureDir(BLOG_DIR);

  // Blog index
  fs.writeFileSync(path.join(BLOG_DIR, 'index.html'), buildBlogIndex(posts));
  console.log('  wrote blog/index.html');

  // Individual posts
  posts.forEach(post => {
    const postDir = path.join(BLOG_DIR, post.slug);
    ensureDir(postDir);
    fs.writeFileSync(path.join(postDir, 'index.html'), buildPost(post));
    console.log(`  wrote blog/${post.slug}/index.html`);
  });

  // Feed
  fs.writeFileSync(path.join(__dirname, 'feed.xml'), buildFeed(posts));
  console.log('  wrote feed.xml');

  // Sitemap
  fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), buildSitemap(posts));
  console.log('  wrote sitemap.xml');

  console.log('Build complete.');
}

build();
