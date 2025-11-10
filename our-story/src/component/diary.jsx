// src/component/diary.jsx
import { useEffect, useMemo, useState } from "react";
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
  async deleteProfile(name, password) {
    const res = await fetch("/api/profiles", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password }),
    });
    return res.json(); // { ok } or { error }
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
    return res.json(); // { ok } or { error }
  },
  async deleteEntry(profile, password, id) {
    const res = await fetch(`/api/diary/${encodeURIComponent(profile)}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, id }),
    });
    return res.json(); // { ok } or { error }
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

  // View / Edit entry modals
  const [showView, setShowView] = useState(false);
  const [viewing, setViewing] = useState(null);

  const [showEdit, setShowEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editBody, setEditBody] = useState("");
  const [updating, setUpdating] = useState(false);

  // Delete entry confirm
  const [showDeleteEntry, setShowDeleteEntry] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deletingEntry, setDeletingEntry] = useState(false);

  // Delete profile confirm
  const [showDeleteProfile, setShowDeleteProfile] = useState(false);
  const [deleteProfilePass, setDeleteProfilePass] = useState("");
  const [deleteProfileErr, setDeleteProfileErr] = useState("");
  const [deletingProfile, setDeletingProfile] = useState(false);

  // Unlock
  const [passInput, setPassInput] = useState("");
  const [unlockErr, setUnlockErr] = useState("");
  const [unlocking, setUnlocking] = useState(false);

  // Detect mobile for special viewer layout
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth <= 640 : false
  );
  useEffect(() => {
    function onResize() {
      setIsMobile(window.innerWidth <= 640);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

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

  /* ---------- open view ---------- */
  function openEntry(entry) {
    setViewing(entry);
    setShowView(true);
  }

  /* ---------- open edit from view ---------- */
  function openEditFromView() {
    if (!viewing) return;
    setShowView(false);
    setEditId(viewing.id);
    setEditTitle(viewing.title);
    setEditDate(viewing.date);
    setEditBody(viewing.body || "");
    setShowEdit(true);
  }

  /* ---------- save edit ---------- */
  async function handleSaveEdit(e) {
    e.preventDefault();
    if (updating) return;
    if (!editTitle.trim() || !editDate.trim()) return;

    setUpdating(true);
    try {
      const resp = await api.editEntry(active, passInput, editId, {
        title: editTitle.trim(),
        date: editDate.trim(),
        body: editBody,
      });
      if (resp.error) {
        alert(resp.error || "Failed to update entry.");
        return;
      }
      setShowEdit(false);
      setEditId(null);
      const refreshed = await api.listEntries(active, passInput);
      if (!refreshed.error) setEntries(refreshed.entries || []);
    } catch (err) {
      alert(err.message || "Failed to update entry.");
    } finally {
      setUpdating(false);
    }
  }

  /* ---------- delete entry ---------- */
  async function confirmDeleteEntry(id) {
    setDeleteId(id);
    setShowView(false);
    setShowDeleteEntry(true);
  }

  async function handleDeleteEntry() {
    if (deletingEntry) return;
    setDeletingEntry(true);
    try {
      const resp = await api.deleteEntry(active, passInput, deleteId);
      if (resp.error) {
        alert(resp.error || "Failed to delete entry.");
        return;
      }
      setShowDeleteEntry(false);
      setDeleteId(null);
      const refreshed = await api.listEntries(active, passInput);
      if (!refreshed.error) setEntries(refreshed.entries || []);
    } catch (err) {
      alert(err.message || "Failed to delete entry.");
    } finally {
      setDeletingEntry(false);
    }
  }

  /* ---------- delete profile ---------- */
  function openDeleteProfile() {
    setDeleteProfilePass("");
    setDeleteProfileErr("");
    setShowDeleteProfile(true);
  }

  async function handleDeleteProfile(e) {
    e.preventDefault();
    if (deletingProfile) return;
    setDeleteProfileErr("");

    if (!active || !deleteProfilePass.trim()) {
      setDeleteProfileErr("Enter your profile password to confirm.");
      return;
    }

    setDeletingProfile(true);
    try {
      const resp = await api.deleteProfile(active, deleteProfilePass.trim());
      if (resp.error) {
        setDeleteProfileErr(resp.error);
        return;
      }
      // remove from list & reset UI
      const updated = (profiles || []).filter((p) => (p.name || p) !== active);
      setProfiles(updated);
      setActive("");
      setUnlocked(false);
      setEntries([]);
      setShowDeleteProfile(false);
    } catch (err) {
      setDeleteProfileErr(err.message || "Failed to delete profile.");
    } finally {
      setDeletingProfile(false);
    }
  }

  // Memoized “empty” hint
  const noEntriesHint = useMemo(
    () => <div style={{ opacity: 0.75 }}>No entries yet. Tap “+ New Entry”.</div>,
    []
  );

  return (
    <div className="diary-page">
      <h1 className="diary-title">Diary</h1>

      <div className="diary-topbar">
        <div className="diary-tabs">
          {profiles.map((p) => {
            const nm = p.name || p;
            return (
              <button
                key={nm}
                className={`diary-tab ${active === nm ? "is-active" : ""}`}
                onClick={() => setActive(nm)}
                type="button"
              >
                {nm}
              </button>
            );
          })}
        </div>

        <div className="diary-actions">
          {active && unlocked && (
            <button
              className="btn btn-ghost"
              style={{ borderColor: "rgba(220,0,0,.2)", color: "#c62828" }}
              onClick={openDeleteProfile}
              title="Delete this profile"
            >
              Delete Profile
            </button>
          )}
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
          {!entries.length && noEntriesHint}
        </div>
      )}

      {/* New Profile Modal */}
      {showNewProfile && (
        <div className="modal-backdrop" /* no outside close */>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Profile</h3>
              <button
                className="icon-btn"
                type="button"
                onClick={() => setShowNewProfile(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form className="form" onSubmit={handleCreateProfile}>
              <div className="field">
                <label htmlFor="newProfileName">Profile name</label>
                <input
                  id="newProfileName"
                  className="input"
                  placeholder="e.g. Belal"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="field">
                <label htmlFor="newProfilePass">Password</label>
                <input
                  id="newProfilePass"
                  className="input"
                  type="password"
                  placeholder="Choose a password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                />
                <div className="help">
                  This password will be required to view this profile’s diary.
                </div>
              </div>

              {!!createErr && (
                <div style={{ color: "#d93025", fontWeight: 700 }}>{createErr}</div>
              )}

              <div className="modal-actions">
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={() => setShowNewProfile(false)}
                  disabled={creating}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" type="submit" disabled={creating}>
                  {creating ? "Creating…" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Entry Modal */}
      {showNewEntry && (
        <div className="modal-backdrop" /* no outside close */>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>New Entry</h3>
              <button
                className="icon-btn"
                type="button"
                onClick={() => setShowNewEntry(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form className="form" onSubmit={handleAddEntry}>
              <div className="form-row">
                <div className="field">
                  <label htmlFor="entryTitle">Title</label>
                  <input
                    id="entryTitle"
                    className="input"
                    placeholder="Title"
                    value={entryTitle}
                    onChange={(e) => setEntryTitle(e.target.value)}
                  />
                </div>

                <div className="field">
                  <label htmlFor="entryDate">Date</label>
                  <input
                    id="entryDate"
                    className="input"
                    type="date"
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="entryBody">Entry</label>
                <textarea
                  id="entryBody"
                  className="textarea"
                  placeholder="Write about your day…"
                  rows={10}
                  value={entryBody}
                  onChange={(e) => setEntryBody(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={() => setShowNewEntry(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" type="submit" disabled={saving}>
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Entry Modal (Desktop modal / Mobile full-screen) */}
      {showView && viewing && (
        <div className="modal-backdrop" /* no outside close */>
          <div
            className={`modal modal--viewer ${isMobile ? "modal--mobile" : ""}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile: fixed header with close */}
            {isMobile ? (
              <>
                <div className="modal-header mobile-header">
                  <h3 className="mobile-ellipsis">{viewing.title}</h3>
                  <button
                    className="icon-btn"
                    type="button"
                    onClick={() => setShowView(false)}
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>
                <div className="viewer-body">
                  <div className="entry-view-date">{viewing.date}</div>
                  <div className="entry-view-body">{viewing.body}</div>
                </div>

                {/* Floating Edit button (mobile only) */}
                <button className="viewer-fab" onClick={openEditFromView} aria-label="Edit entry">
                  Edit
                </button>
              </>
            ) : (
              <>
                {/* Desktop: standard header + actions */}
                <div className="modal-header">
                  <h3>{viewing.title}</h3>
                  <button
                    className="icon-btn"
                    type="button"
                    onClick={() => setShowView(false)}
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>
                <div className="entry-view-date">{viewing.date}</div>
                <div className="entry-view-body">{viewing.body}</div>
                <div className="modal-actions">
                  <button className="btn btn-primary" onClick={openEditFromView}>
                    Edit
                  </button>
                  <button
                    className="btn btn-ghost"
                    style={{ borderColor: "rgba(220,0,0,.2)", color: "#c62828" }}
                    onClick={() => confirmDeleteEntry(viewing.id)}
                  >
                    Delete
                  </button>
                  <button className="btn btn-ghost" onClick={() => setShowView(false)}>
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Edit Entry Modal */}
      {showEdit && (
        <div className="modal-backdrop" /* no outside close */>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Entry</h3>
              <button
                className="icon-btn"
                type="button"
                onClick={() => setShowEdit(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form className="form" onSubmit={handleSaveEdit}>
              <div className="form-row">
                <div className="field">
                  <label htmlFor="editTitle">Title</label>
                  <input
                    id="editTitle"
                    className="input"
                    placeholder="Title"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="editDate">Date</label>
                  <input
                    id="editDate"
                    className="input"
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="editBody">Entry</label>
                <textarea
                  id="editBody"
                  className="textarea"
                  rows={10}
                  placeholder="Write about your day…"
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={() => setShowEdit(false)}
                  disabled={updating}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" type="submit" disabled={updating}>
                  {updating ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Entry Confirm */}
      {showDeleteEntry && (
        <div className="modal-backdrop" /* no outside close */>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Entry?</h3>
              <button
                className="icon-btn"
                type="button"
                onClick={() => setShowDeleteEntry(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <p>This action can’t be undone.</p>
            <div className="modal-actions">
              <button
                className="btn btn-ghost"
                onClick={() => setShowDeleteEntry(false)}
                disabled={deletingEntry}
              >
                Cancel
              </button>
              <button
                className="btn"
                style={{ background: "#c62828" }}
                onClick={handleDeleteEntry}
                disabled={deletingEntry}
              >
                {deletingEntry ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Profile Confirm */}
      {showDeleteProfile && (
        <div className="modal-backdrop" /* no outside close */>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Profile “{active}”?</h3>
              <button
                className="icon-btn"
                type="button"
                onClick={() => setShowDeleteProfile(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <p>This will remove the profile and all of its diary entries.</p>
            <form className="form" onSubmit={handleDeleteProfile}>
              <div className="field">
                <label htmlFor="deleteProfilePass">Password</label>
                <input
                  id="deleteProfilePass"
                  className="input"
                  type="password"
                  placeholder="Enter profile password to confirm"
                  value={deleteProfilePass}
                  onChange={(e) => setDeleteProfilePass(e.target.value)}
                />
              </div>

              {!!deleteProfileErr && (
                <div style={{ color: "#d93025", marginTop: 8 }}>{deleteProfileErr}</div>
              )}

              <div className="modal-actions">
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={() => setShowDeleteProfile(false)}
                  disabled={deletingProfile}
                >
                  Cancel
                </button>
                <button
                  className="btn"
                  style={{ background: "#c62828" }}
                  type="submit"
                  disabled={deletingProfile}
                >
                  {deletingProfile ? "Deleting…" : "Delete Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
