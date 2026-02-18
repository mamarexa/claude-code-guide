import { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc, increment } from "firebase/firestore";
import data from "./data.json";

// Try to import Firebase config, fall back to null if not configured yet
let firebaseConfig = null;
try {
  const config = await import("./firebase.config.js");
  firebaseConfig = config.firebaseConfig;
} catch (e) {
  console.warn("Firebase not configured yet. Comments disabled.");
}

// Initialize Firebase if configured
let db = null;
if (firebaseConfig) {
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } catch (e) {
    console.error("Firebase initialization failed:", e);
  }
}

// Color palettes
const LIGHT = {
  bg: "#faf8f5",
  headerBg: "#ffffff",
  headerBorder: "#f0e8e0",
  sidebarActive: "#fff4ed",
  cardBg: "#ffffff",
  cardBorder: "#f0e8e0",
  cardActiveBg: "#fff4ed",
  cardActiveBorder: "#e87c4e",
  codeBg: "#faf6f2",
  codeBorder: "#ede4da",
  codeText: "#3a2820",
  textPrimary: "#1f1410",
  textSecondary: "#5a4635",
  textMuted: "#9a8570",
  noteText: "#6b5040",
  accent: "#d97548",
  accentLight: "#fff4ed",
  inlineCode: "#fdf8f4",
};

const DARK = {
  bg: "#0f1419",
  headerBg: "#1a1f26",
  headerBorder: "#2a3038",
  sidebarActive: "#1f2429",
  cardBg: "#1a1f26",
  cardBorder: "#2a3038",
  cardActiveBg: "#1f2429",
  cardActiveBorder: "#e87c4e",
  codeBg: "#161b22",
  codeBorder: "#2a3038",
  codeText: "#c9d1d9",
  textPrimary: "#e6e8eb",
  textSecondary: "#b1b7c0",
  textMuted: "#8a909a",
  noteText: "#9da5b0",
  accent: "#e87c4e",
  accentLight: "#1f2429",
  inlineCode: "#161b22",
};

// Type config generator
const getTypeConfig = (isDark) => ({
  code: { label: "CMD", bg: "#c45f33" },
  shortcut: { label: "KEY", bg: "#d97548" },
  command: { label: "/", bg: "#e87c4e" },
  tip: { label: "TIP", bg: "#f59c76" },
  model: { label: "AI", bg: "#a84d26" },
});

function CopyBtn({ text, C }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        setOk(true);
        setTimeout(() => setOk(false), 1400);
      }}
      title="Copy"
      style={{
        position: "absolute", top: 8, right: 8,
        background: ok ? C.accent : "transparent",
        border: `1px solid ${ok ? C.accent : C.codeBorder}`,
        borderRadius: 4, padding: "2px 8px",
        fontSize: 10, color: ok ? "#fff" : C.textMuted,
        cursor: "pointer", transition: "all 0.18s",
        fontFamily: "inherit", letterSpacing: "0.05em",
        whiteSpace: "nowrap",
      }}
    >{ok ? "✓ copied" : "copy"}</button>
  );
}

function PlatformBlock({ mac, win, C }) {
  const [tab, setTab] = useState("mac");
  const same = mac === win;
  const content = tab === "mac" ? mac : win;
  return (
    <div style={{ marginTop: 12 }}>
      {!same && (
        <div style={{ display: "flex", gap: 4, marginBottom: 7 }}>
          {[["mac", "⌘ macOS"], ["win", "⊞ Win/Linux"]].map(([p, label]) => (
            <button key={p} onClick={e => { e.stopPropagation(); setTab(p); }}
              style={{
                padding: "3px 12px", borderRadius: 5, border: "none",
                background: tab === p ? C.accent : C.accentLight,
                color: tab === p ? "#fff" : C.textSecondary,
                fontSize: 11, fontWeight: tab === p ? 600 : 400,
                cursor: "pointer", transition: "all 0.15s",
                fontFamily: "inherit",
              }}
            >{label}</button>
          ))}
        </div>
      )}
      {same && <div style={{ marginBottom: 5, fontSize: 10, color: C.textMuted }}>⌘ macOS · ⊞ Win/Linux</div>}
      <div style={{
        position: "relative", background: C.codeBg,
        border: `1px solid ${C.codeBorder}`, borderRadius: 7,
        padding: "10px 48px 10px 14px",
      }}>
        <pre style={{
          margin: 0, fontFamily: "'SF Mono','Fira Code',monospace",
          fontSize: 12.5, color: C.codeText,
          whiteSpace: "pre-wrap", wordBreak: "break-all", lineHeight: 1.65,
        }}>{content}</pre>
        <CopyBtn text={content} C={C} />
      </div>
    </div>
  );
}

function Card({ item, C, typeConfig }) {
  const [open, setOpen] = useState(false);
  const tc = typeConfig[item.type] || typeConfig.tip;
  return (
    <div
      onClick={() => setOpen(o => !o)}
      style={{
        background: open ? C.cardActiveBg : C.cardBg,
        border: `1px solid ${open ? C.cardActiveBorder : C.cardBorder}`,
        borderRadius: 10, padding: "13px 14px", cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: open ? "0 2px 14px rgba(232,124,78,0.15)" : "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
        <span style={{
          fontSize: 9, fontWeight: 700, background: tc.bg,
          color: "#fff", padding: "2px 7px", borderRadius: 3,
          letterSpacing: "0.08em", flexShrink: 0, fontFamily: "monospace", marginTop: 2,
        }}>{tc.label}</span>
        <span style={{
          fontSize: 13, color: C.textPrimary, fontWeight: 500,
          letterSpacing: "-0.01em", lineHeight: 1.35, flex: 1,
        }}>{item.title}</span>
        <span style={{
          color: C.textMuted, fontSize: 12, flexShrink: 0,
          transition: "transform 0.2s",
          transform: open ? "rotate(180deg)" : "none",
        }}>▾</span>
      </div>
      {open && (
        <div onClick={e => e.stopPropagation()}>
          <PlatformBlock mac={item.mac} win={item.win} C={C} />
          {item.note && (
            <p style={{
              margin: "9px 0 0", fontSize: 12.5, color: C.noteText,
              lineHeight: 1.6, fontStyle: "italic",
            }}>{item.note}</p>
          )}
        </div>
      )}
    </div>
  );
}

function Comments({ sectionId, C }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [author, setAuthor] = useState("");
  
  useEffect(() => {
    if (!db) return;
    const q = query(
      collection(db, "comments"),
      orderBy("votes", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsData = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(c => c.sectionId === sectionId);
      setComments(commentsData);
    });
    return () => unsubscribe();
  }, [sectionId]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!db || !newComment.trim()) return;
    try {
      await addDoc(collection(db, "comments"), {
        sectionId,
        author: author.trim() || "Anonymous",
        text: newComment.trim(),
        votes: 0,
        createdAt: new Date().toISOString()
      });
      setNewComment("");
      setAuthor("");
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };
  
  const vote = async (commentId, delta) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, "comments", commentId), {
        votes: increment(delta)
      });
    } catch (err) {
      console.error("Error voting:", err);
    }
  };
  
  if (!db) {
    return (
      <div style={{
        marginTop: 24, padding: 16, background: C.accentLight,
        border: `1px solid ${C.cardBorder}`, borderRadius: 8,
        fontSize: 12, color: C.textMuted,
      }}>
        💬 Comments disabled. Configure Firebase to enable. See SETUP.md
      </div>
    );
  }
  
  return (
    <div style={{ marginTop: 24 }}>
      <h3 style={{ fontSize: 15, color: C.textPrimary, marginBottom: 12 }}>
        💬 Comments ({comments.length})
      </h3>
      
      <form onSubmit={handleSubmit} style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Your name (optional)"
          value={author}
          onChange={e => setAuthor(e.target.value)}
          style={{
            width: "100%", boxSizing: "border-box", padding: "8px 12px",
            border: `1px solid ${C.cardBorder}`, borderRadius: 6,
            background: C.cardBg, color: C.textPrimary,
            fontSize: 13, marginBottom: 8, fontFamily: "inherit",
          }}
        />
        <textarea
          placeholder="Add a comment or tip..."
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          style={{
            width: "100%", boxSizing: "border-box", padding: "8px 12px",
            border: `1px solid ${C.cardBorder}`, borderRadius: 6,
            background: C.cardBg, color: C.textPrimary,
            fontSize: 13, minHeight: 80, fontFamily: "inherit", resize: "vertical",
          }}
        />
        <button
          type="submit"
          style={{
            marginTop: 8, padding: "8px 16px", background: C.accent,
            color: "#fff", border: "none", borderRadius: 6,
            fontSize: 13, cursor: "pointer", fontWeight: 600,
          }}
        >Post Comment</button>
      </form>
      
      {comments.map(comment => (
        <div key={comment.id} style={{
          padding: 12, background: C.cardBg,
          border: `1px solid ${C.cardBorder}`, borderRadius: 6,
          marginBottom: 8,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <strong style={{ fontSize: 13, color: C.textPrimary }}>{comment.author}</strong>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button
                onClick={() => vote(comment.id, 1)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 16, padding: 0, color: C.textMuted,
                }}
              >▲</button>
              <span style={{ fontSize: 13, color: C.textSecondary, minWidth: 20, textAlign: "center" }}>
                {comment.votes}
              </span>
              <button
                onClick={() => vote(comment.id, -1)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 16, padding: 0, color: C.textMuted,
                }}
              >▼</button>
            </div>
          </div>
          <p style={{
            margin: 0, fontSize: 13, color: C.textSecondary,
            lineHeight: 1.5, whiteSpace: "pre-wrap",
          }}>{comment.text}</p>
        </div>
      ))}
    </div>
  );
}

function SearchBar({ value, onChange, C }) {
  return (
    <div style={{ position: "relative", marginBottom: 24 }}>
      <span style={{
        position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)",
        color: C.textMuted, fontSize: 15, pointerEvents: "none",
      }}>⌕</span>
      <input
        type="text" value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search commands, shortcuts, tips…"
        style={{
          width: "100%", boxSizing: "border-box",
          padding: "11px 36px 11px 36px",
          border: `1px solid ${C.cardBorder}`, borderRadius: 10,
          background: C.cardBg, fontSize: 13, color: C.textPrimary,
          outline: "none", fontFamily: "inherit", transition: "border-color 0.2s",
        }}
        onFocus={e => (e.target.style.borderColor = C.accent)}
        onBlur={e => (e.target.style.borderColor = C.cardBorder)}
      />
      {value && (
        <button onClick={() => onChange("")}
          style={{
            position: "absolute", right: 11, top: "50%",
            transform: "translateY(-50%)", background: "none", border: "none",
            cursor: "pointer", color: C.textMuted, fontSize: 17, padding: 0,
          }}>×</button>
      )}
    </div>
  );
}

function MainGuide({ darkMode, setDarkMode }) {
  const [active, setActive] = useState(data.sections[0]?.id || "");
  const [search, setSearch] = useState("");
  const [showComments, setShowComments] = useState({});
  
  const C = darkMode ? DARK : LIGHT;
  const typeConfig = getTypeConfig(darkMode);
  
  const displayed = search.trim()
    ? data.sections.map(s => ({
        ...s,
        items: s.items.filter(item =>
          [item.title, item.mac, item.win, item.note || ""]
            .some(t => t.toLowerCase().includes(search.toLowerCase()))
        ),
      })).filter(s => s.items.length > 0)
    : data.sections.filter(s => s.id === active);
    
  const repoUrl = "https://github.com/YOUR-USERNAME/claude-code-guide";
  
  return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      fontFamily: "'Palatino Linotype','Book Antiqua',Georgia,serif",
      color: C.textPrimary, transition: "background 0.3s, color 0.3s",
    }}>
      {/* Header */}
      <div style={{
        background: C.headerBg, borderBottom: `1px solid ${C.headerBorder}`,
        padding: "0 24px", display: "flex", alignItems: "center",
        justifyContent: "space-between", height: 56,
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <div style={{
            width: 30, height: 30, background: "#e87c4e", borderRadius: 7,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: darkMode ? "#0f1419" : "#fff", fontSize: 15, fontWeight: "bold",
          }}>◈</div>
          <div>
            <div style={{ fontSize: 14.5, fontWeight: 600, color: C.textPrimary }}>
              Claude Code
            </div>
            <div style={{ fontSize: 9.5, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.09em" }}>
              Community Guide
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <a
            href={`${repoUrl}/issues/new?template=feedback.yml`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "6px 12px", background: C.accentLight,
              border: `1px solid ${C.cardBorder}`, borderRadius: 6,
              fontSize: 12, color: C.textSecondary, textDecoration: "none",
              cursor: "pointer", transition: "all 0.2s",
            }}
          >💬 Feedback</a>
          <Link
            to="/admin"
            style={{
              padding: "6px 12px", background: C.accentLight,
              border: `1px solid ${C.cardBorder}`, borderRadius: 6,
              fontSize: 12, color: C.textSecondary, textDecoration: "none",
              cursor: "pointer", transition: "all 0.2s",
            }}
          >⚙️ Admin</Link>
          <button
            onClick={() => {
              setDarkMode(d => !d);
              localStorage.setItem("darkMode", !darkMode);
            }}
            title={darkMode ? "Light mode" : "Dark mode"}
            style={{
              background: C.accentLight, color: C.textSecondary,
              fontSize: 18, padding: "6px 10px", borderRadius: 8,
              border: `1px solid ${C.cardBorder}`, cursor: "pointer",
              transition: "all 0.2s", display: "flex", alignItems: "center",
            }}
          >{darkMode ? "☀" : "☾"}</button>
        </div>
      </div>
      
      <div style={{ display: "flex", maxWidth: 1060, margin: "0 auto" }}>
        {/* Sidebar */}
        <div style={{
          width: 206, flexShrink: 0, padding: "22px 0 32px 14px",
          position: "sticky", top: 56, height: "calc(100vh - 56px)",
          overflowY: "auto",
        }}>
          <div style={{
            fontSize: 9, letterSpacing: "0.13em", textTransform: "uppercase",
            color: C.textMuted, marginBottom: 10, paddingLeft: 12,
          }}>Sections</div>
          {data.sections.map(s => {
            const on = s.id === active && !search;
            return (
              <button key={s.id}
                onClick={() => { setActive(s.id); setSearch(""); }}
                style={{
                  width: "100%", textAlign: "left",
                  background: on ? C.sidebarActive : "transparent",
                  border: "none", borderRadius: 8, padding: "7px 12px",
                  cursor: "pointer", fontSize: 12.5,
                  color: on ? C.textPrimary : C.textSecondary,
                  fontWeight: on ? 600 : 400,
                  display: "flex", alignItems: "center", gap: 8,
                  transition: "all 0.14s", fontFamily: "inherit",
                  marginBottom: 1,
                }}
              >
                <span style={{ color: s.color, fontSize: 13, flexShrink: 0 }}>{s.icon}</span>
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
        
        {/* Main Content */}
        <div style={{ flex: 1, padding: "22px 24px 64px 18px" }}>
          <SearchBar value={search} onChange={setSearch} C={C} />
          
          {search && displayed.length === 0 && (
            <div style={{ textAlign: "center", color: C.textMuted, padding: "56px 0", fontSize: 14 }}>
              No results for "{search}"
            </div>
          )}
          
          {displayed.map(section => (
            <div key={section.id} style={{ marginBottom: 36 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 13 }}>
                <span style={{ color: section.color, fontSize: 19 }}>{section.icon}</span>
                <h2 style={{
                  margin: 0, fontSize: 17, fontWeight: 600,
                  color: C.textPrimary, letterSpacing: "-0.02em",
                }}>{section.label}</h2>
                <span style={{
                  fontSize: 10, color: C.textMuted, letterSpacing: "0.05em",
                  background: C.accentLight, padding: "2px 9px", borderRadius: 20,
                }}>{section.items.length}</span>
                <button
                  onClick={() => setShowComments(prev => ({
                    ...prev,
                    [section.id]: !prev[section.id]
                  }))}
                  style={{
                    marginLeft: "auto", background: "none",
                    border: `1px solid ${C.cardBorder}`, borderRadius: 6,
                    padding: "4px 10px", fontSize: 11, color: C.textSecondary,
                    cursor: "pointer", fontFamily: "inherit",
                  }}
                >{showComments[section.id] ? "Hide" : "Show"} Comments</button>
              </div>
              
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(295px, 1fr))",
                gap: 8,
              }}>
                {section.items.map((item, i) => (
                  <Card key={i} item={item} C={C} typeConfig={typeConfig} />
                ))}
              </div>
              
              {showComments[section.id] && (
                <Comments sectionId={section.id} C={C} />
              )}
            </div>
          ))}
          
          {!search && (
            <div style={{
              marginTop: 40, padding: "18px 22px",
              background: C.accentLight, borderRadius: 12,
              fontSize: 12.5, color: C.noteText, lineHeight: 1.8,
              borderLeft: `3px solid ${C.accent}`,
            }}>
              <div style={{ fontWeight: 700, color: C.textPrimary, marginBottom: 6, fontSize: 13 }}>
                ✦ Contributing
              </div>
              Have a tip to share? <a
                href={`${repoUrl}/issues/new?template=contribution.yml`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: C.accent, fontWeight: 600, textDecoration: "none" }}
              >Submit it via GitHub Issues</a> and it will be reviewed for inclusion.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminPanel({ darkMode }) {
  const C = darkMode ? DARK : LIGHT;
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchContributions();
  }, []);
  
  const fetchContributions = async () => {
    try {
      // Try to import admin config
      let adminConfig = null;
      try {
        const config = await import("./admin.config.js");
        adminConfig = config.adminConfig;
      } catch (e) {
        setError("Admin config not found. See SETUP.md");
        setLoading(false);
        return;
      }
      
      const response = await fetch(
        `https://api.github.com/repos/${adminConfig.owner}/${adminConfig.repo}/issues?labels=contribution&state=open`,
        {
          headers: {
            'Authorization': `token ${adminConfig.githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );
      
      if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
      
      const data = await response.json();
      setIssues(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };
  
  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.textPrimary,
      padding: 24, fontFamily: "'Palatino Linotype','Book Antiqua',Georgia,serif",
    }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ margin: 0, fontSize: 24 }}>🔧 Admin Panel</h1>
          <Link
            to="/"
            style={{
              padding: "8px 16px", background: C.accentLight,
              border: `1px solid ${C.cardBorder}`, borderRadius: 6,
              fontSize: 13, color: C.textSecondary, textDecoration: "none",
            }}
          >← Back to Guide</Link>
        </div>
        
        {loading && <p style={{ color: C.textMuted }}>Loading contributions...</p>}
        
        {error && (
          <div style={{
            padding: 16, background: C.cardBg,
            border: `2px solid #e74c3c`, borderRadius: 8,
            color: "#e74c3c", marginBottom: 16,
          }}>
            <strong>Error:</strong> {error}
            <p style={{ margin: "8px 0 0", fontSize: 13 }}>
              Make sure you've created <code style={{
                background: C.codeBg, padding: "2px 6px",
                borderRadius: 3, fontFamily: "monospace",
              }}>src/admin.config.js</code> with your GitHub token. See SETUP.md
            </p>
          </div>
        )}
        
        {!loading && !error && issues.length === 0 && (
          <p style={{ color: C.textMuted }}>No pending contributions. Great work!</p>
        )}
        
        {issues.map(issue => (
          <div key={issue.id} style={{
            padding: 16, background: C.cardBg,
            border: `1px solid ${C.cardBorder}`, borderRadius: 8,
            marginBottom: 16,
          }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 16, color: C.textPrimary }}>
              {issue.title}
            </h3>
            <div style={{
              fontSize: 12, color: C.textMuted, marginBottom: 12,
            }}>
              By {issue.user.login} · #{issue.number}
            </div>
            <div style={{
              padding: 12, background: C.codeBg,
              borderRadius: 6, fontSize: 13, color: C.textSecondary,
              whiteSpace: "pre-wrap", marginBottom: 12,
            }}>{issue.body}</div>
            <div style={{ display: "flex", gap: 8 }}>
              <a
                href={issue.html_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "8px 16px", background: C.accent,
                  color: "#fff", border: "none", borderRadius: 6,
                  fontSize: 13, textDecoration: "none", fontWeight: 600,
                }}
              >View on GitHub</a>
              <button
                onClick={() => {
                  alert("To approve: Copy the issue details and paste into src/data.json, then close the issue on GitHub. Automated approval coming soon!");
                }}
                style={{
                  padding: "8px 16px", background: C.accentLight,
                  border: `1px solid ${C.cardBorder}`, borderRadius: 6,
                  fontSize: 13, color: C.textSecondary, cursor: "pointer",
                  fontFamily: "inherit", fontWeight: 600,
                }}
              >Approve & Add</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });
  
  return (
    <Routes>
      <Route path="/" element={<MainGuide darkMode={darkMode} setDarkMode={setDarkMode} />} />
      <Route path="/admin" element={<AdminPanel darkMode={darkMode} />} />
    </Routes>
  );
}
