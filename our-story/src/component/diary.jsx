// src/component/diary.jsx
import { useEffect, useState } from "react";
import "../styling/diary.css";

export default function Diary() {
  const [profiles, setProfiles] = useState([]);
  const [active, setActive] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [entries, setEntries] = useState([]);

  // modals
  const [showNewProfile, setShowNewProfile] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPass, setNewPass] = useState("");
  const [createErr, setCreateErr] = useState("");

  const [showNewEntry, setShowNewEntry] = useState(false);
  const [entryTitle, setEntryTitle] = useState("");
  const [entryDate, setEntryDate] = useState("");
  const [entryBody, setEntryBody] = useState("");

  const [showView, setShowView] = useState(false);
  const [viewing, setViewing] = useState(null);

  const [passInput, setPassInput] = useState("");
  const [unlockErr, setUnlockErr] = useState("");

  /** ---------- API CONNECTION ---------- **/
  const api = {
    async listProfiles() {
      const r = await fetch("/api/profiles");
      return r.json();
    },
    async createProfile(name, password) {
      const r = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });
      return r.json();
    },
    async listEntries(profile) {
      const r = await fetch(`/api/diary/${encodeURIComponent(profile)}`);
      return r.json();
    },
    async addEntry(profile, password, entry) {
      const r = await fetch(`/api/diary/${encodeURIComponent(profile)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, entry }),
      });
      return r.json();
    },
  };

  /** ---------- LOAD PROFILES ---------- **/
  useEffect(() => {
    api.listProfiles().then(setProfiles).catch(console.error);
  }, []);

  /** ---------- LOAD ENTRIES ON PROFILE CHANGE ---------- **/
  useEffect(() => {
    if (!active) return;
    setUnlocked(false);
    setPassInput("");
    setUnlockErr("");
    api.listEntries(active).then(setEntries).catch(console.error);
  }, [active]);

  /** ---------- CREATE PROFILE ---------- **/
  async function handleCreateProfile(e) {
    e.preventDefault();
    setCreateErr("");
    const name = newName.trim();
    const pass = newPass.trim();

    if (!name || !pass) {
      setCreateErr("Please fill both fields.");
      return;
    }

    const result = await api.createProfile(name, pass);
    if (result.error) {
      setCreateErr(result.error);
      return;
    }

    setShowNewProfile(false);
    setNewName("");
    setNewPass("");
    const updated = await api.listProfiles();
    setProfiles(updated);
    setActive(name);
    setUnlocked(false);
  }

  /** ---------- UNLOCK PROFILE ---------- **/
  async function handleUnlock(e) {
    e.preventDefault();
    setUnlockErr("");
    const prof = profiles.find((p) => p.name === active);
    if (!prof) return;
    if (passInput === prof.password) {
      setUnlocked(true);
    } else {
      setUnlockErr("Incorrect password.");
    }
  }

  /** ---------- ADD ENTRY ---------- **/
  async function handleAddEntry(e) {
    e.preventDefault();
    if (!entryTitle || !entryDate || !entryBody) return;

    const entry = {
      title: entryTitle,
      date: entryDate,
      body: entryBody,
    };

    const res = await api.addEntry(active, passInput, entry);
    if (res.error) {
      alert(res.error);
      return;
    }

    setShowNewEntry(false);
    setEntryTitle("");
    setEntryDate("");
    setEntryBody("");
    const updated = await api.listEntries(active);
    setEntries(updated);
  }

  function openEntry(entry) {
    setViewing(entry);
    setShowView(true);
  }

  return (
    <div className="diary-page">
      <h1 className="diary-title">Diary</h1>

      <div className="diary-topbar">
        <div className="diary-tabs">
          {profiles.map((p) => (
            <button
              key={p.name}
              className={`diary-tab ${active === p.name ? "is-active" : ""}`}
              onClick={() => setActive(p.name)}
              type="button"
            >
              {p.name}
            </button>
          ))}
        </div>

        <div className="diary-actions">
          <button className="btn" onClick={() => setShowNewProfile(true)}>
            + New Profile
          </button>
          <button
            className="btn"
            onClick={() => setShowNewEntry(true)}
            disabled={!active || !unlocked}
          >
            + New Entry
          </button>
        </div>
      </div>

      {!active && (
        <p style={{ marginTop: 10 }}>Create a profile to start writing diaries.</p>
      )}

      {active && !unlocked && (
        <div className="unlock-card">
          <div style={{ flex: 1 }}>
            <div className="unlock-title">Unlock “{active}”</div>
            <form onSubmit={handleUnlock}>
              <input
                className="input"
                type="password"
                placeholder="Enter password"
                value={passInput}
                onChange={(e) => setPassInput(e.target.value)}
              />
              {!!unlockErr && (
                <div style={{ color: "#d93025", marginTop: 6, fontWeight: 600 }}>
                  {unlockErr}
                </div>
              )}
            </form>
          </div>
          <button className="btn" onClick={handleUnlock}>
            Unlock
          </button>
        </div>
      )}

      {active && unlocked && (
        <div className="diary-grid">
          {entries.map((en) => (
            <div key={en.id || en.title} className="entry-card" onClick={() => openEntry(en)}>
              <div className="entry-title">{en.title}</div>
              <div className="entry-date">{en.date}</div>
            </div>
          ))}
          {!entries.length && (
            <div style={{ opacity: 0.75 }}>No entries yet. Click “+ New Entry”.</div>
          )}
        </div>
      )}

      {/* New Profile Modal */}
      {showNewProfile && (
        <div className="modal-backdrop" onClick={() => setShowNewProfile(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Create Profile</h3>
            <form onSubmit={handleCreateProfile}>
              <input
                className="input"
                placeholder="Profile name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <input
                className="input"
                type="password"
                placeholder="Password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
              />
              {!!createErr && (
                <div style={{ color: "#d93025", marginTop: 8 }}>{createErr}</div>
              )}
              <div className="modal-actions">
                <button className="btn" type="submit">
                  Create
                </button>
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={() => setShowNewProfile(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Entry Modal */}
      {showNewEntry && (
        <div className="modal-backdrop" onClick={() => setShowNewEntry(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>New Entry</h3>
            <form onSubmit={handleAddEntry}>
              <input
                className="input"
                placeholder="Title"
                value={entryTitle}
                onChange={(e) => setEntryTitle(e.target.value)}
              />
              <input
                className="input"
                placeholder="Date (e.g. 2025-11-08)"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
              />
              <textarea
                className="textarea"
                rows={8}
                placeholder="Write about your day…"
                value={entryBody}
                onChange={(e) => setEntryBody(e.target.value)}
              />
              <div className="modal-actions">
                <button className="btn" type="submit">
                  Save
                </button>
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={() => setShowNewEntry(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Entry Modal */}
      {showView && viewing && (
        <div className="modal-backdrop" onClick={() => setShowView(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="entry-view-title">{viewing.title}</div>
            <div className="entry-view-date">{viewing.date}</div>
            <div className="entry-view-body">{viewing.body}</div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowView(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
