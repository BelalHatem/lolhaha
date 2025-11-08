// src/component/diary.jsx
import { useEffect, useState } from "react";
import "../styling/diary.css";

export default function Diary() {
  const [profiles, setProfiles] = useState([]);
  const [active, setActive] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [entries, setEntries] = useState([]);

  // Create Profile modal
  const [showNewProfile, setShowNewProfile] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPass, setNewPass] = useState("");
  const [createErr, setCreateErr] = useState("");
  const [creating, setCreating] = useState(false);

  // New Entry modal
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [entryTitle, setEntryTitle] = useState("");
  const [entryDate, setEntryDate] = useState("");
  const [entryBody, setEntryBody] = useState("");
  const [savingEntry, setSavingEntry] = useState(false);

  // View Entry modal
  const [showView, setShowView] = useState(false);
  const [viewing, setViewing] = useState(null);

  // Unlock strip
  const [passInput, setPassInput] = useState("");
  const [unlockErr, setUnlockErr] = useState("");
  const [unlocking, setUnlocking] = useState(false);

  /** ---------- API ---------- **/
  const api = {
    async listProfiles() {
      const res = await fetch("/api/profiles");
      if (!res.ok) throw new Error("Failed to list profiles");
      const data = await res.json();
      return data.profiles || [];
    },

    async createProfile(name, password) {
      const res = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });
      const data = await res.json().catch(() => ({}));
      return { ok: res.ok, ...data };
    },

    async listEntries(profile, password) {
      const url = password
        ? `/api/diary/${encodeURIComponent(profile)}?password=${encodeURIComponent(
            password
          )}`
        : `/api/diary/${encodeURIComponent(profile)}`;
      const res = await fetch(url);
      const data = await res.json().catch(() => []);
      return data || [];
    },

    async addEntry(profile, password, entry) {
      const res = await fetch(`/api/diary/${encodeURIComponent(profile)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, ...entry }),
      });
      const data = await res.json().catch(() => ({}));
      return { ok: res.ok, ...data };
    },
  };

  /** ---------- Load Profiles on mount ---------- **/
  useEffect(() => {
    api.listProfiles().then(setProfiles).catch(console.error);
  }, []);

  /** ---------- Reset unlock when switching profiles ---------- **/
  useEffect(() => {
    if (!active) return;
    setUnlocked(false);
    setPassInput("");
    setUnlockErr("");
    setEntries([]); // entries require unlock
  }, [active]);

  /** ---------- Create Profile ---------- **/
  async function handleCreateProfile(e) {
    e.preventDefault();
    setCreateErr("");
    if (!newName.trim() || !newPass.trim()) {
      setCreateErr("Please enter a profile name and password.");
      return;
    }
    try {
      setCreating(true);
      const result = await api.createProfile(newName.trim(), newPass);
      if (!result.ok) {
        setCreateErr(result.error || "Failed to create profile.");
        return;
      }
      // Refresh and activate
      const all = await api.listProfiles();
      setProfiles(all);
      setActive(newName.trim());
      setUnlocked(false);
      // reset modal
      setShowNewProfile(false);
      setNewName("");
      setNewPass("");
    } catch (err) {
      setCreateErr(err.message || "Network error.");
    } finally {
      setCreating(false);
    }
  }

  /** ---------- Unlock Profile ---------- **/
  async function handleUnlock(e) {
    e.preventDefault();
    setUnlockErr("");
    if (!active || !passInput) {
      setUnlockErr("Enter a password.");
      return;
    }
    try {
      setUnlocking(true);
      // attempt to fetch entries with password
      const list = await api.listEntries(active, passInput);
      // If backend rejects, it should be an object with error; if success it's array
      if (Array.isArray(list)) {
        setEntries(list);
        setUnlocked(true);
      } else if (list && list.error) {
        setUnlockErr(list.error || "Incorrect password.");
        setUnlocked(false);
      } else {
        // fallback: if not array, consider error
        setUnlockErr("Incorrect password.");
        setUnlocked(false);
      }
    } catch (err) {
      setUnlockErr(err.message || "Failed to unlock.");
      setUnlocked(false);
    } finally {
      setUnlocking(false);
    }
  }

  /** ---------- Add Entry ---------- **/
  async function handleAddEntry(e) {
    e.preventDefault();
    if (!entryTitle.trim() || !entryDate.trim() || !entryBody.trim()) return;
    try {
      setSavingEntry(true);
      const res = await api.addEntry(active, passInput, {
        title: entryTitle.trim(),
        date: entryDate.trim(),
        body: entryBody,
      });
      if (!res.ok) {
        alert(res.error || "Failed to save entry.");
        return;
      }
      setShowNewEntry(false);
      setEntryTitle("");
      setEntryDate("");
      setEntryBody("");
      const updated = await api.listEntries(active, passInput);
      setEntries(Array.isArray(updated) ? updated : []);
    } finally {
      setSavingEntry(false);
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
          <button className="btn" type="button" onClick={() => setShowNewProfile(true)}>
            + New Profile
          </button>
          <button
            className="btn"
            type="button"
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
          <button className="btn" type="button" onClick={handleUnlock} disabled={unlocking || !passInput}>
            {unlocking ? "Unlocking..." : "Unlock"}
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

      {/* Create Profile Modal */}
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
                autoFocus
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
                <button
                  className="btn"
                  type="submit"
                  disabled={creating || !newName.trim() || !newPass.trim()}
                >
                  {creating ? "Creating..." : "Create"}
                </button>
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={() => {
                    setShowNewProfile(false);
                    setNewName("");
                    setNewPass("");
                    setCreateErr("");
                  }}
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
                autoFocus
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
                <button className="btn" type="submit" disabled={savingEntry}>
                  {savingEntry ? "Saving..." : "Save"}
                </button>
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={() => {
                    setShowNewEntry(false);
                    setEntryTitle("");
                    setEntryDate("");
                    setEntryBody("");
                  }}
                  disabled={savingEntry}
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
              <button className="btn btn-ghost" type="button" onClick={() => setShowView(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
