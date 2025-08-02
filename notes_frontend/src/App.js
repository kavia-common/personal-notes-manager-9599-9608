import React, { useState, useEffect, useRef } from "react";
import "./App.css";

/* PUBLIC_INTERFACE
 * The Notes App main component.
 * - Light, minimalistic theming with #1976d2 (primary), #424242 (secondary), #ffb300 (accent).
 * - Features: add, edit, delete, search, and view notes.
 * - Uses Supabase for backend persistence.
 */

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_KEY;

// Dynamically import Supabase
function useSupabase() {
  const [supabase, setSupabase] = useState(null);
  useEffect(() => {
    import("@supabase/supabase-js").then(({ createClient }) => {
      setSupabase(createClient(SUPABASE_URL, SUPABASE_KEY));
    });
  }, []);
  return supabase;
}

// Utility function for formatting (shorten text, date)
function formatDate(iso) {
  const date = new Date(iso);
  return (
    date.toLocaleDateString() +
    " " +
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
}

// PUBLIC_INTERFACE
function App() {
  const supabase = useSupabase();
  const [notes, setNotes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", body: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const titleInputRef = useRef(null);

  // Fetch notes from Supabase
  useEffect(() => {
    if (!supabase) return;
    async function fetchNotes() {
      setLoading(true);
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) setErrorMsg(error.message);
      else setNotes(data || []);
      setLoading(false);
    }
    fetchNotes();
    // Re-fetch when supabase changes (first mount)
  }, [supabase]);

  // PUBLIC_INTERFACE
  // Create new note
  async function handleAddNote(e) {
    e.preventDefault();
    setErrorMsg("");
    if (!form.title.trim()) {
      setErrorMsg("Title is required.");
      return;
    }
    if (!supabase) return;
    const { data, error } = await supabase
      .from("notes")
      .insert([{ title: form.title, body: form.body }])
      .select();
    if (error) setErrorMsg(error.message);
    else {
      setNotes([data[0], ...notes]);
      setForm({ title: "", content: "" });
      setSelectedId(data[0].id);
      setIsEditing(false);
    }
  }

  // PUBLIC_INTERFACE
  // Start editing note
  function handleEditNote(note) {
    setIsEditing(true);
    setSelectedId(note.id);
    setForm({ title: note.title, body: note.body });
    setTimeout(() => {
      titleInputRef.current && titleInputRef.current.focus();
    }, 0);
  }

  // PUBLIC_INTERFACE
  // Update note
  async function handleUpdateNote(e) {
    e.preventDefault();
    setErrorMsg("");
    if (!form.title.trim()) {
      setErrorMsg("Title is required.");
      return;
    }
    if (!supabase) return;
    const { data, error } = await supabase
      .from("notes")
      .update({ title: form.title, body: form.body, updated_at: new Date().toISOString() })
      .eq("id", selectedId)
      .select();
    if (error) setErrorMsg(error.message);
    else {
      // Update in local state
      setNotes((prev) =>
        prev.map((n) => (n.id === selectedId ? { ...n, ...data[0] } : n))
      );
      setIsEditing(false);
    }
  }

  // PUBLIC_INTERFACE
  // Delete note
  async function handleDeleteNote(id) {
    if (!supabase) return;
    if (!window.confirm("Delete this note?")) return;
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (error) setErrorMsg(error.message);
    else {
      setNotes((prev) => prev.filter((n) => n.id !== id));
      if (selectedId === id) setSelectedId(null);
      setIsEditing(false);
    }
  }

  // PUBLIC_INTERFACE
  // Select a note for viewing (not editing)
  function handleSelectNote(note) {
    setSelectedId(note.id);
    setIsEditing(false);
    setForm({ title: note.title, body: note.body });
  }

  // PUBLIC_INTERFACE
  // Change form fields
  function handleFormChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  // PUBLIC_INTERFACE
  // Search notes by title or content
  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      (note.body || "").toLowerCase().includes(search.toLowerCase())
  );

  const current = notes.find((n) => n.id === selectedId);

  // Monochrome style for all UI elements
  const styles = {
    sidebar: {
      background: "#fafafa",
      borderRight: "1px solid #d1d1d1",
      width: 270,
      minWidth: 180,
      maxWidth: 320,
      height: "calc(100vh - 60px)",
      overflowY: "auto",
      padding: "0.8rem 0.5rem",
    },
    main: {
      flexGrow: 1,
      padding: "2rem 2.5rem",
      background: "#fff",
      minHeight: "calc(100vh - 60px)",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
    },
    header: {
      background: "#111",
      color: "#fff",
      padding: "0 2rem",
      minHeight: 60,
      display: "flex",
      alignItems: "center",
      fontWeight: 600,
      fontSize: "1.55rem",
      letterSpacing: "2px",
      borderBottom: "2px solid #222",
    },
    noteListItem: (active) => ({
      padding: "10px 10px",
      marginBottom: 4,
      borderRadius: 8,
      border: active ? "2px solid #111" : "1px solid #d1d1d1",
      background: active ? "#ededed" : "#fff",
      fontWeight: active ? 600 : 400,
      color: "#222",
      boxShadow: active ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
      cursor: "pointer",
      transition: "all 0.2s",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }),
    btn: {
      background: "#111",
      color: "#fff",
      padding: "0.49rem 1.2rem",
      borderRadius: 8,
      border: "none",
      fontWeight: 500,
      fontSize: 15,
      marginRight: 12,
      cursor: "pointer",
      boxShadow: "0 1px 5px rgba(0,0,0,0.07)",
      transition: "background 0.15s",
    },
    btnAccent: {
      background: "#fff",
      color: "#111",
      border: "1px solid #111",
      padding: "0.49rem 1.2rem",
      borderRadius: 8,
      fontWeight: 500,
      fontSize: 15,
      marginRight: 0,
      cursor: "pointer",
      boxShadow: "0 1px 5px rgba(0,0,0,0.05)",
      transition: "background 0.15s, color 0.15s",
    },
    input: {
      border: "1px solid #bbb",
      borderRadius: 6,
      padding: "7px 12px",
      fontSize: 16,
      marginBottom: 10,
      width: "100%",
      background: "#fff",
      color: "#111",
      outline: "none",
    },
    errormsg: {
      color: "#c00",
      fontSize: 15,
      marginBottom: 12
    }
  };

  return (
    <div style={{ fontFamily: "system-ui, Arial, sans-serif", background: "#fff", minHeight: "100vh" }}>
      {/* Header */}
      <div style={styles.header}>
        <span style={{ flexGrow: 1 }}>🗒️ Minimal Notes</span>
        <a
          style={{ color: "#fff", marginLeft: 18, letterSpacing: 0, fontSize: "1rem", textDecoration: "none" }}
          className="mono-link"
          href="https://supabase.com/"
          target="_blank"
          rel="noopener noreferrer"
        >Powered by Supabase</a>
      </div>
      <div style={{ display: "flex", alignItems: "stretch", width: "100%" }}>
        {/* Sidebar */}
        <aside style={styles.sidebar}>
          <input
            type="text"
            placeholder="Search notes..."
            aria-label="Search notes"
            style={{ ...styles.input, marginBottom: 12 }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button
            style={{ ...styles.btnAccent, width: "100%" }}
            onClick={() => {
              setSelectedId(null);
              setForm({ title: "", body: "" });
              setIsEditing(true);
              setTimeout(() => titleInputRef.current && titleInputRef.current.focus(), 0);
            }}
          >+ New Note</button>
          <div style={{ marginTop: 16 }}>
            {loading ? (
              <div style={{ color: "#bbb", fontSize: 15 }}>Loading...</div>
            ) : filteredNotes.length === 0 ? (
              <div style={{ color: "#bbb", fontSize: 16, marginTop: 30, textAlign: "center" }}>
                <div style={{ fontSize: 32 }}>📄</div>
                No notes found.
              </div>
            ) : (
              filteredNotes.map((note) => (
                <div
                  key={note.id}
                  style={styles.noteListItem(selectedId === note.id && !isEditing)}
                  onClick={() => handleSelectNote(note)}
                  tabIndex={0}
                  aria-label={`View note: ${note.title}`}
                  onKeyDown={e => (e.key === "Enter" || e.key === " ") && handleSelectNote(note)}
                >
                  <span style={{
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 156, display: "inline-block"
                  }}>
                    {note.title}
                  </span>
                  <span style={{
                    fontSize: 11, color: "#888", marginLeft: 8
                  }}>
                    {note.updated_at ? formatDate(note.updated_at) : ""}
                  </span>
                  <button
                    title="Edit"
                    aria-label={`Edit note ${note.title}`}
                    style={{ ...styles.btn, background: "#fff", color: "#111", fontSize: 13, padding: "2px 10px", marginLeft: 5, marginRight: 0, border: "1px solid #aaa" }}
                    onClick={e => { e.stopPropagation(); handleEditNote(note); }}
                  >✎</button>
                  <button
                    title="Delete"
                    aria-label={`Delete note ${note.title}`}
                    style={{ ...styles.btn, background: "#fff", color: "#c00", fontSize: 13, padding: "2px 10px", marginLeft: 4, marginRight: 0, border: "1px solid #aaa" }}
                    onClick={e => { e.stopPropagation(); handleDeleteNote(note.id); }}
                  >🗑️</button>
                </div>
              ))
            )}
          </div>
        </aside>
        {/* Main View / Note details and editor */}
        <main style={styles.main}>
          {errorMsg && <div style={styles.errormsg}>{errorMsg}</div>}
          {isEditing ? (
            <form style={{ width: "100%", maxWidth: 650 }} onSubmit={selectedId ? handleUpdateNote : handleAddNote}>
              <input
                type="text"
                name="title"
                required
                placeholder="Title"
                ref={titleInputRef}
                style={{ ...styles.input, fontSize: 20, fontWeight: 500 }}
                value={form.title}
                onChange={handleFormChange}
                autoFocus
              />
              <textarea
                name="body"
                placeholder="Content"
                style={{
                  ...styles.input,
                  minHeight: 90,
                  resize: "vertical",
                  fontFamily: "inherit"
                }}
                value={form.body}
                onChange={handleFormChange}
              />
              <div style={{ marginTop: 8, display: "flex" }}>
                <button
                  type="submit"
                  style={styles.btn}
                  aria-label={selectedId ? "Update note" : "Add note"}
                >{selectedId ? "Save" : "Add"}</button>
                <button
                  type="button"
                  style={{ ...styles.btn, background: "#fff", color: "#111", border: "1px solid #222" }}
                  onClick={() => { setIsEditing(false); setErrorMsg(""); }}
                >Cancel</button>
              </div>
            </form>
          ) : current ? (
            <div style={{ width: "100%", maxWidth: 650 }}>
              <div style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 6, whiteSpace: "pre-wrap", color: "#111" }}>
                {current.title}
              </div>
              <div style={{ color: "#888", fontSize: 14, marginBottom: 20 }}>
                Last edited: {formatDate(current.updated_at)}
              </div>
              <div style={{
                fontSize: 17,
                lineHeight: 1.65,
                color: "#232323",
                background: "#fafafa",
                padding: "22px 24px",
                borderRadius: 11,
                border: "1px solid #e3e3e3",
                minHeight: 110,
                whiteSpace: "pre-wrap"
              }}>
                {current.body}
              </div>
              <div style={{ marginTop: 18 }}>
                <button
                  style={styles.btnAccent}
                  onClick={() => handleEditNote(current)}
                  aria-label="Edit this note"
                >Edit</button>
                <button
                  style={{ ...styles.btn, background: "#fff", color: "#c00", border: "1px solid #aaa" }}
                  onClick={() => handleDeleteNote(current.id)}
                  aria-label="Delete this note"
                >Delete</button>
              </div>
            </div>
          ) : (
            <div style={{ color: "#bbb", fontSize: 23, marginTop: 80 }}>
              Select a note or add a new one.<br /><span style={{ fontSize: 50 }}>📝</span>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
