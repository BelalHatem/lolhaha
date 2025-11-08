// src/component/diary.jsx
import { useEffect, useState } from "react";
import "../styling/diary.css";

/* ---------------- API ---------------- */
const api = {
  async listProfiles() {
    const res = await fetch("/api/profiles");
    const data = await res.json();
    return data.profiles || [];
  },
  async createProfile(name, password) {
    const res = await fetch("/api/profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password }),
    });
    return res.json();
  },
  async listEntries(profile, password) {
    const qs = new URLSearchParams({ password }).toString();
    const res = await fetch(`/api/diary/${encodeURIComponent(profile)}?${qs}`);
    return res.json(); // { entries } or { error }
  },
  async addEntry(profile, password, entry) {
    const res = await fetch(`/api/diary/${encodeURIComponent(profile)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, ...entry }),
    });
    return res.json();
  },
  async editEntry(profile, password, id, updates) {
    const res = await fetch(`/api/diary/${encodeURIComponent(profile)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, id, updates }),
    });
    return res.json();
  },
};

export default function Diary() {
  const [profiles, setProfiles] = useState([]);
  const [active, setActive] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [entries, setEntries] = useState([]);

  // Create profile modal
  const [showNewProfile, setShowNewProfile] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPass, setNewPass] = useState("");
  const [createErr, setCreateErr] = useState("");
  const [creating, setCreating] = useState(false);

  // New entry modal
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [entryTitle, setEntryTitle] = useState("");
  const [entryDate, setEntryDate] = useState("");
  const [entryBody, setEntryBody] = useState("");
  const [saving, setSaving] = useState(false);

  // View entry modal
  const [showView, setShowView] = useState(false);
  const [viewing, setViewing] = useState(null);

  // Unlock
  const [passInput, setPassInput] = useState("");
  const [unlockErr, setUnlockErr] = useState("");
  const [unlocking, setUnlocking] = useState(false);

  /* ---------- load profiles ---------- */
  useEffect(() => {
    api.listProfiles().then(setProfiles).catch(console.error);
  }, []);

  /* ---------- on profile change ---------- */
  useEffect(() => {
    if (!active) return;
    setUnlocked(false);
    setPassInput("");
    setUnlockErr("");
    setEntries([]);
  }, [active]);

  /* ---------- create profile ---------- */
  async function handleCreateProfile(e) {
    e.preventDefault();
    if (creating) return;

    setCreateErr("");
    const name = newName.trim();
    const pass = newPass.trim();
    if (!name || !pass) {
      setCreateErr("Please fill both fields.");
      return;
    }

    setCreating(true);
    try {
      const result = await api.createProfile(name, pass);
      if (result.error) {
        setCreateErr(result.error);
        return;
      }
      const updated = await api.listProfiles();
      setProfiles(updated);
      setActive(name);
      setShowNewProfile(false);
      setNewName("");
      setNewPass("");
    } catch (err) {
      setCreateErr(err.message || "Failed to create profile.");
    } finally {
      setCreating(false);
    }
  }

  /* ---------- unlock (server-verified) ---------- */
  async function handleUnlock(e) {
    e.preventDefault();
    if (!active || unlocking) return;

    setUnlockErr("");
    setUnlocking(true);
    try {
      // Ask the server; if password is wrong, you'll get { error }
      const r = await api.listEntries(active, passInput);
      if (r.error) {
        setUnlocked(false);
        setEntries([]);
        setUnlockErr(r.error || "Incorrect password.");
        return;
      }
      setUnlocked(true);
      setEntries(r.entries || []);
    } catch (err) {
      setUnlockErr(err.message || "Failed to unlock.");
    } finally {
      setUnlocking(false);
    }
  }

  /* ---------- add entry ---------- */
  async function handleAddEntry(e) {
    e.preventDefault();
    if (saving) return;
    if (!entryTitle.trim() || !entryDate.trim() || !entryBody.trim()) return;

    setSaving(true);
    try {
      const resp = await api.addEntry(active, passInput, {
        title: entryTitle.trim(),
        date: entryDate.trim(),
        body: entryBody,
      });
      if (resp.error) {
        alert(resp.error || "Failed to save entry.");
        return;
      }
      setShowNewEntry(false);
      setEntryTitle("");
      setEntryDate("");
      setEntryBody("");

      const refreshed = await api.listEntries(active, passInput);
      if (!refreshed.error) setEntries(refreshed.entries || []);
    } catch (err) {
      alert(err.message || "Failed to save entry.");
    } finally {
      setSaving(false);
    }
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
              key={p.name || p} // supports {name} or plain string
              className={`diary-tab ${active === (p.name || p) ? "is-active" : ""}`}
              onClick={() => setActive(p.name || p)}
              type="button"
            >
              {p.name || p}
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

      {!active && <p style={{ marginTop: 10 }}>Create a profile to start writing diaries.</p>}

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
          <button className="btn" onClick={handleUnlock} disabled={unlocking}>
            {unlocking ? "Unlocking…" : "Unlock"}
          </button>
        </div>
      )}

      {active && unlocked && (
        <div className="diary-grid">
          {entries.map((en) => (
            <div
              key={en.id || `${en.title}-${en.date}`}
              className="entry-card"
              onClick={() => openEntry(en)}
            >
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
                <button className="btn" type="submit" disabled={creating}>
                  {creating ? "Creating…" : "Create"}
                </button>
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={() => setShowNewProfile(false)}
                  disabled={creating}
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
                <button className="btn" type="submit" disabled={saving}>
                  {saving ? "Saving…" : "Save"}
                </button>
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={() => setShowNewEntry(false)}
                  disabled={saving}
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
