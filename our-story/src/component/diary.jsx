import { useEffect, useState } from "react";
import "../styling/diary.css";

/* ---------------- API ---------------- */
const api = {
  async listProfiles() {
    const res = await fetch("/api/profiles");
    return res.json();
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
    return res.json();
  },
  async listEntries(profile, password) {
    const res = await fetch(`/api/diary/${encodeURIComponent(profile)}?password=${encodeURIComponent(password)}`);
    return res.json();
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
  async deleteEntry(profile, password, id) {
    const res = await fetch(`/api/diary/${encodeURIComponent(profile)}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, id }),
    });
    return res.json();
  },
};

export default function Diary() {
  const [profiles, setProfiles] = useState([]);
  const [active, setActive] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [entries, setEntries] = useState([]);

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

  const [showEdit, setShowEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editBody, setEditBody] = useState("");

  const [showDeleteProfile, setShowDeleteProfile] = useState(false);
  const [deleteProfilePass, setDeleteProfilePass] = useState("");
  const [deleteProfileErr, setDeleteProfileErr] = useState("");

  const [showDeleteEntry, setShowDeleteEntry] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [passInput, setPassInput] = useState("");
  const [unlockErr, setUnlockErr] = useState("");

  /* LOAD PROFILES */
  useEffect(() => {
    api.listProfiles().then((r) => setProfiles(r.profiles || []));
  }, []);

  /* CHANGE PROFILE */
  useEffect(() => {
    if (!active) return;
    setUnlocked(false);
    setPassInput("");
    setUnlockErr("");
    setEntries([]);
  }, [active]);

  /* CREATE PROFILE */
  async function handleCreateProfile(e) {
    e.preventDefault();
    if (!newName.trim() || !newPass.trim()) {
      setCreateErr("Please fill both fields.");
      return;
    }
    const res = await api.createProfile(newName.trim(), newPass.trim());
    if (res.error) setCreateErr(res.error);
    else {
      setProfiles(await api.listProfiles().then((r) => r.profiles));
      setActive(newName.trim());
      setShowNewProfile(false);
      setNewName("");
      setNewPass("");
    }
  }

  /* UNLOCK PROFILE */
  async function handleUnlock(e) {
    e.preventDefault();
    const r = await api.listEntries(active, passInput);
    if (r.error) {
      setUnlockErr(r.error);
      return;
    }
    setUnlocked(true);
    setEntries(r.entries || []);
  }

  /* SAVE ENTRY */
  async function handleAddEntry(e) {
    e.preventDefault();
    const res = await api.addEntry(active, passInput, {
      title: entryTitle,
      date: entryDate,
      body: entryBody,
    });
    if (!res.error) {
      setShowNewEntry(false);
      setEntryTitle("");
      setEntryDate("");
      setEntryBody("");
      const updated = await api.listEntries(active, passInput);
      setEntries(updated.entries);
    }
  }

  /* OPEN ENTRY */
  function openEntry(en) {
    setViewing(en);
    setShowView(true);
  }

  /* OPEN EDIT */
  function openEditFromView() {
    setShowView(false);
    setShowEdit(true);
    setEditTitle(viewing.title);
    setEditDate(viewing.date);
    setEditBody(viewing.body);
    setEditId(viewing.id);
  }

  /* SAVE EDIT */
  async function handleSaveEdit(e) {
    e.preventDefault();
    await api.editEntry(active, passInput, editId, {
      title: editTitle,
      date: editDate,
      body: editBody,
    });
    setShowEdit(false);
    const updated = await api.listEntries(active, passInput);
    setEntries(updated.entries);
  }

  /* DELETE ENTRY */
  async function handleDeleteEntryConfirm() {
    await api.deleteEntry(active, passInput, deleteId);
    setShowDeleteEntry(false);
    const updated = await api.listEntries(active, passInput);
    setEntries(updated.entries);
  }

  /* DELETE PROFILE */
  async function handleDeleteProfile(e) {
    e.preventDefault();
    const r = await api.deleteProfile(active, deleteProfilePass);
    if (r.error) {
      setDeleteProfileErr(r.error);
      return;
    }
    setShowDeleteProfile(false);
    setActive("");
    setUnlocked(false);
    setProfiles(await api.listProfiles().then((r) => r.profiles));
  }

  return (
    <div className="diary-page">
      <h1 className="diary-title">Diary</h1>

      {/* TOP BAR */}
      <div className="diary-topbar">
        <div className="diary-tabs">
          {profiles.map((p) => (
            <button
              key={p.name}
              className={`diary-tab ${active === p.name ? "is-active" : ""}`}
              onClick={() => setActive(p.name)}
            >
              {p.name}
            </button>
          ))}
        </div>

        <div className="diary-actions">
          {active && unlocked && (
            <button
              className="btn btn-ghost"
              style={{ color: "#c62828", borderColor: "rgba(200,0,0,.2)" }}
              onClick={() => setShowDeleteProfile(true)}
            >
              Delete Profile
            </button>
          )}
          <button className="btn" onClick={() => setShowNewProfile(true)}>+ New Profile</button>
          <button className="btn" onClick={() => setShowNewEntry(true)} disabled={!active || !unlocked}>
            + New Entry
          </button>
        </div>
      </div>

      {/* UNLOCK */}
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
              {unlockErr && <div style={{ color: "#d93025", marginTop: 6 }}>{unlockErr}</div>}
            </form>
          </div>
          <button className="btn" onClick={handleUnlock}>Unlock</button>
        </div>
      )}

      {/* ENTRY GRID */}
      {active && unlocked && (
        <div className="diary-grid">
          {entries.map((en) => (
            <div key={en.id} className="entry-card" onClick={() => openEntry(en)}>
              <div className="entry-title">{en.title}</div>
              <div className="entry-date">{en.date}</div>
            </div>
          ))}
          {!entries.length && <div style={{ opacity: .75 }}>No entries yet.</div>}
        </div>
      )}

      {/* MODALS — FULL CODE INCLUDED */}

      {/* NEW PROFILE */}
      {showNewProfile && (
        <div className="modal-backdrop">
          <div className="modal">
            <button className="icon-btn modal-close" onClick={() => setShowNewProfile(false)}>×</button>
            <div className="modal-header">
              <h3>Create Profile</h3>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreateProfile}>
                <label>Profile Name</label>
                <input className="input" value={newName} onChange={(e) => setNewName(e.target.value)} />

                <label>Password</label>
                <input className="input" type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} />
                {createErr && <div style={{ color: "red", marginTop: 6 }}>{createErr}</div>}
              </form>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowNewProfile(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreateProfile}>Create</button>
            </div>
          </div>
        </div>
      )}

      {/* NEW ENTRY */}
      {showNewEntry && (
        <div className="modal-backdrop">
          <div className="modal">
            <button className="icon-btn modal-close" onClick={() => setShowNewEntry(false)}>×</button>
            <div className="modal-header">
              <h3>New Entry</h3>
            </div>
            <div className="modal-body">
              <form onSubmit={handleAddEntry}>
                <label>Title</label>
                <input className="input" value={entryTitle} onChange={(e) => setEntryTitle(e.target.value)} />

                <label>Date</label>
                <input className="input" type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} />

                <label>Entry</label>
                <textarea className="textarea" value={entryBody} onChange={(e) => setEntryBody(e.target.value)} />
              </form>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowNewEntry(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddEntry}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW ENTRY */}
      {showView && viewing && (
        <div className="modal-backdrop">
          <div className="modal">
            <button className="icon-btn modal-close" onClick={() => setShowView(false)}>×</button>
            <div className="modal-header">
              <h3>{viewing.title}</h3>
            </div>
            <div className="modal-body">
              <div className="entry-view-date">{viewing.date}</div>
              <div className="entry-view-body">{viewing.body}</div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={openEditFromView}>Edit</button>
              <button className="btn btn-ghost" onClick={() => { setDeleteId(viewing.id); setShowView(false); setShowDeleteEntry(true); }}>Delete</button>
              <button className="btn btn-ghost" onClick={() => setShowView(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT ENTRY */}
      {showEdit && (
        <div className="modal-backdrop">
          <div className="modal">
            <button className="icon-btn modal-close" onClick={() => setShowEdit(false)}>×</button>
            <div className="modal-header"><h3>Edit Entry</h3></div>
            <div className="modal-body">
              <form onSubmit={handleSaveEdit}>
                <label>Title</label>
                <input className="input" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                <label>Date</label>
                <input className="input" type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
                <label>Entry</label>
                <textarea className="textarea" value={editBody} onChange={(e) => setEditBody(e.target.value)} />
              </form>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowEdit(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveEdit}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE ENTRY CONFIRM */}
      {showDeleteEntry && (
        <div className="modal-backdrop">
          <div className="modal">
            <button className="icon-btn modal-close" onClick={() => setShowDeleteEntry(false)}>×</button>
            <div className="modal-header"><h3>Delete Entry?</h3></div>
            <div className="modal-body">
              <p>This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowDeleteEntry(false)}>Cancel</button>
              <button className="btn" style={{ background: "#c62828" }} onClick={handleDeleteEntryConfirm}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE PROFILE CONFIRM */}
      {showDeleteProfile && (
        <div className="modal-backdrop">
          <div className="modal">
            <button className="icon-btn modal-close" onClick={() => setShowDeleteProfile(false)}>×</button>
            <div className="modal-header"><h3>Delete Profile?</h3></div>
            <div className="modal-body">
              <p>This will delete all entries for this profile.</p>
              <input className="input" type="password" placeholder="Enter password to confirm"
                value={deleteProfilePass} onChange={(e) => setDeleteProfilePass(e.target.value)} />
              {deleteProfileErr && <div style={{ color: "red", marginTop: 6 }}>{deleteProfileErr}</div>}
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowDeleteProfile(false)}>Cancel</button>
              <button className="btn" style={{ background: "#c62828" }} onClick={handleDeleteProfile}>Delete Profile</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
