"use client";

import { useEffect, useState } from "react";

type Section = "home" | "about" | "posts" | "lab" | "resources" | "contact";

const sections: { id: Section; label: string; icon: string }[] = [
  { id: "home", label: "Home", icon: "⌂" },
  { id: "about", label: "About", icon: "♟" },
  { id: "posts", label: "Posts", icon: "▤" },
  { id: "lab", label: "Lab", icon: "◇" },
  { id: "resources", label: "Resources", icon: "▥" },
  { id: "contact", label: "Contact", icon: "✉" },
];

const posts = [
  ["Money", "Budgeting, saving, investing, and honest money notes.", "💵"],
  ["Travel", "Trips, costs, itineraries, and lessons from the road.", "✈️"],
  ["Life Notes", "Personal essays, habits, routines, and reflections.", "📄"],
  ["Guides", "Practical how-tos and helpful setup posts.", "💼"],
];

const lab = [
  ["Building", "Websites, tools, templates, and small side projects.", "🖥️"],
  ["Learning", "Languages, skills, systems, and personal growth.", "📖"],
  ["Hobbies", "Photography, cooking, music, and more.", "🍪"],
  ["Experiments", "Challenges, tiny bets, and life experiments.", "⚗️"],
];

const resources = [
  ["Books", "Money, mindset, creativity, and more.", "📚"],
  ["Tools / Apps", "Software, systems, and tools that help me.", "🔧"],
  ["Equipment", "Gear and setups I use and recommend.", "📷"],
  ["Other Finds", "Small internet treasures worth sharing.", "⭐"],
];

function CityScene({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`city-scene ${compact ? "compact" : ""}`} aria-hidden="true">
      <div className="moon" />
      <div className="shooting-star" />
      <div className="sky-specks" />
      <div className="buildings back"><i /><i /><i /><i /><i /><i /><i /></div>
      <div className="buildings front"><i /><i /><i /><i /><i /><i /></div>
      <div className="water" />
      {!compact && <div className="railing" />}
      {compact && <div className="person"><span /></div>}
    </div>
  );
}

function TitleBar({ title, onClose }: { title: string; onClose?: () => void }) {
  return (
    <div className="title-bar">
      <span>{title}</span>
      <div className="window-controls" aria-hidden={!onClose}>
        <button tabIndex={-1}>_</button><button tabIndex={-1}>□</button>
        <button onClick={onClose} aria-label={onClose ? "Close window" : undefined}>×</button>
      </div>
    </div>
  );
}

function HomePanel({ go }: { go: (s: Section) => void }) {
  return (
    <div className="home-panel">
      <div className="home-intro">
        <div><h1>HOME</h1><p>notes on money, projects,<br />travel, and becoming.</p></div>
        <CityScene compact />
      </div>
      <div className="home-grid">
        <section className="card latest">
          <h2>LATEST POST</h2>
          <div className="post-row">
            <div className="notebook-art"><b>2026</b><span>Field Notes</span><i>☕</i></div>
            <div><h3>The Quiet Systems<br />That Keep Me Moving</h3><small>July 17, 2026 · Life notes</small><p>A look at the small routines, defaults, and habits shaping what I build next.</p><button className="text-link" onClick={() => go("posts")}>Read more →</button></div>
          </div>
        </section>
        <section className="card status-card">
          <h2>CURRENT STATUS</h2>
          <p><b>🖥️ Building:</b> lowkey.exe v1</p>
          <p><b>🌱 Learning:</b> Better storytelling</p>
          <p><b>📖 Reading:</b> Something slowly</p>
          <p><b>✈️ Planning:</b> The next escape</p>
          <p><b>🎯 Focus:</b> Make less, mean more</p>
        </section>
      </div>
    </div>
  );
}

function ListPanel({ title, intro, items }: { title: string; intro: string; items: string[][] }) {
  return (
    <div className="list-panel">
      <h1>{title}</h1><p className="section-intro">{intro}</p>
      <div className="list-box">
        {items.map(([name, copy, icon]) => (
          <button className="list-item" key={name}>
            <span className="list-icon">{icon}</span><span><b>{name}</b><small>{copy}</small></span><span className="chev">›</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function MainContent({ section, go }: { section: Section; go: (s: Section) => void }) {
  if (section === "home") return <HomePanel go={go} />;
  if (section === "posts") return <ListPanel title="POSTS" intro="Thoughts, updates, guides, and lessons." items={posts} />;
  if (section === "lab") return <ListPanel title="LAB" intro="Things I’m building, learning, and exploring." items={lab} />;
  if (section === "resources") return <ListPanel title="RESOURCES" intro="Books, tools, and things I genuinely recommend." items={resources} />;
  if (section === "about") return (
    <div className="about-panel"><h1>ABOUT ME</h1><CityScene compact /><p>I’m the person behind <b>lowkey.exe</b>.</p><p>This is my small corner of the internet—part notebook, part workshop, part window into what I’m learning as I go.</p><p>I care about thoughtful work, financial freedom, creative independence, and leaving enough room for a life outside the screen.</p><p>Thanks for being here.</p></div>
  );
  return (
    <div className="contact-panel"><h1>CONTACT</h1><p className="section-intro">Let’s connect!</p>
      <div className="contact-grid"><div className="contact-links">
        <a href="mailto:hello@example.com"><span>✉️</span><b>Email<small>hello@example.com</small></b></a>
        <a href="https://github.com" target="_blank" rel="noreferrer"><span>🎮</span><b>GitHub<small>@lowkey</small></b></a>
        <a href="https://www.linkedin.com" target="_blank" rel="noreferrer"><span>💼</span><b>LinkedIn<small>/in/lowkey</small></b></a>
        <a href="https://www.instagram.com" target="_blank" rel="noreferrer"><span>📸</span><b>Instagram<small>@lowkey.jpg</small></b></a>
      </div><div className="support"><h3>SUPPORT LOWKEY.EXE</h3><p>If this space helped you, send a note or share it with a friend.</p><div className="pixel-mug">♥</div><a href="mailto:hello@example.com">Say hello</a></div></div>
    </div>
  );
}

function AppWindow({ section, setSection, close }: { section: Section; setSection: (s: Section) => void; close: () => void }) {
  return (
    <div className="app-window">
      <TitleBar title={`lowkey.exe — ${section.toUpperCase()}`} onClose={close} />
      <div className="app-body">
        <nav className="sidebar" aria-label="Main navigation">
          {sections.map((s) => <button key={s.id} className={section === s.id ? "active" : ""} onClick={() => setSection(s.id)}><span>{s.icon}</span>{s.label}</button>)}
        </nav>
        <main className="content"><MainContent section={section} go={setSection} /></main>
      </div>
      <div className="statusbar"><span>● &nbsp;Ready</span><span>Last updated: July 17, 2026</span></div>
    </div>
  );
}

function MiniWindow({ kind, close }: { kind: "notes" | "music" | "trash"; close: () => void }) {
  const names = { notes: "Notepad", music: "Music Player", trash: "Recycle Bin" };
  return <div className={`mini-window ${kind}`}><TitleBar title={names[kind]} onClose={close} />
    <div className="mini-content">{kind === "notes" ? <p>Today’s focus:<br />Build systems.<br />Stay lowkey.<br />Live intentionally.<br /><br /><span className="cursor">▌</span></p> : kind === "music" ? <><p>Lo-fi Playlist ♪</p><div className="track">Track 01</div><div className="player-buttons">|◀　▶　Ⅱ　▶|</div></> : <><div className="trash-big">♻️</div><p>0 items</p></>}</div>
    <div className="mini-status">Ready</div></div>;
}

export default function Home() {
  const [section, setSection] = useState<Section>("home");
  const [appOpen, setAppOpen] = useState(true);
  const [startOpen, setStartOpen] = useState(false);
  const [mini, setMini] = useState<null | "notes" | "music" | "trash">(null);
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
    update(); const timer = setInterval(update, 30000); return () => clearInterval(timer);
  }, []);

  const openApp = (target: Section = "home") => { setSection(target); setAppOpen(true); setStartOpen(false); };

  return (
    <div className="desktop-shell">
      <div className="desktop-bg"><CityScene /></div>
      <div className="desktop-icons">
        <button onDoubleClick={() => openApp("home")} onClick={() => openApp("home")}><span>🖥️</span>My Computer</button>
        <button onDoubleClick={() => setMini("notes")} onClick={() => setMini("notes")}><span>🗒️</span>Notepad</button>
        <button onDoubleClick={() => setMini("music")} onClick={() => setMini("music")}><span>💿</span>Music Player</button>
        <button onDoubleClick={() => setMini("trash")} onClick={() => setMini("trash")}><span>♻️</span>Recycle Bin</button>
      </div>
      <div className={`workspace ${appOpen ? "visible" : ""}`}>{appOpen && <AppWindow section={section} setSection={setSection} close={() => setAppOpen(false)} />}</div>
      {mini && <MiniWindow kind={mini} close={() => setMini(null)} />}
      {startOpen && <div className="start-menu"><div className="start-rail">lowkey.exe</div><div className="start-items">
        {sections.map((s) => <button key={s.id} onClick={() => openApp(s.id)}><span>{s.icon}</span>{s.label}</button>)}
        <hr /><button onClick={() => setStartOpen(false)}><span>◉</span>Shut Down…</button>
      </div></div>}
      <footer className="taskbar">
        <button className={`start-button ${startOpen ? "pressed" : ""}`} onClick={() => setStartOpen(!startOpen)}><span>▦</span> Start</button>
        <button className={`task-button ${appOpen ? "active" : ""}`} onClick={() => setAppOpen(!appOpen)}>🖥️ &nbsp;lowkey.exe</button>
        <div className="tray"><span>🔊</span><time>{time}</time></div>
      </footer>
    </div>
  );
}
