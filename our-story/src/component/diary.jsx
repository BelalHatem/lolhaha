import { useEffect, useMemo, useState } from "react";
import "../styling/diary.css";

/* ---------------------------
   LocalStorage helpers
---------------------------- */
const LS_PROFILES = "diary_profiles";
const LS_ENTRIES_PREFIX = "diary_entries_"; // + profileId

function loadProfiles() {
  try {
    return JSON.parse(localStorage.getItem(LS_PROFILES) || "[]");
  } catch {
    return [];
  }
}
function saveProfiles(profiles) {
  localStorage.setItem(LS_PROFILES, JSON.stringify(profiles));
}
function entriesKey(profileId) {
  return `${LS_ENTRIES_PREFIX}${profileId}`;
}
function loadEntries(profileId) {
  try {
    return JSON.parse(localStorage.getItem(entriesKey(profileId)) || "[]");
  } catch {
    return [];
  }
}
function saveEntries(profileId, entries) {
  localStorage.setItem(entriesKey(profileId), JSON.stringify(entries));
}

/* id helper */
const uid = () => Math.random().toString(36).slice(2, 10);

/* ---------------------------
   Diary Component
---------------------------- */
export default function Diary() {
  const [profiles, setProfiles] = useState(loadProfiles);
  const [activeProfileId, setActiveProfileId] = useState(null);
  const [unlockedProfileIds, setUnlockedProfileIds] = useState(() => new Set()); // session-only
  const [entries, setEntries] = useState([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [pendingProfileId, setPendingProfileId] = useState(null);
  const [entryDraft, setEntryDraft] = useState(null); // {id?, title, date, body}

  /* persist profiles */
  useEffect(() => saveProfiles(profiles), [profiles]);

  /* load entries when active profile changes */
  useEffect(() => {
    if (activeProfileId) setEntries(loadEntries(activeProfileId));
    else setEntries([]);
  }, [activeProfileId]);

  const activeProfile = useMemo(
    () => profiles.find((p) => p.id === activeProfileId) || null,
    [profiles, activeProfileId]
  );

  const isUnlocked = activeProfile && unlockedProfileIds.has(activeProfile.id);

  /* ---------------------------
     Profile CRUD & Unlock
  ---------------------------- */
  function openCreateProfile() {
    setShowProfileModal(true);
  }
  function createProfile(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = (form.get("name") || "").toString().trim();
    const passcode = (form.get("passcode") || "").toString();
    if (!name || !passcode) return;
    const newProfile = { id: uid(), name, passcode }; // NOTE: stored as plaintext for simplicity (local-only).
    const next = [...profiles, newProfile];
    setProfiles(next);
    setShowProfileModal(false);
    // immediately select it and require unlock (consistency)
    requestUnlock(newProfile.id);
  }

  function requestUnlock(profileId) {
    setPendingProfileId(profileId);
    setShowUnlockModal(true);
  }
  function submitUnlock(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const pass = (form.get("pass") || "").toString();
    const prof = profiles.find((p) => p.id === pendingProfileId);
    if (!prof) return;
    if (pass === prof.passcode) {
      const next = new Set(unlockedProfileIds);
      next.add(prof.id);
      setUnlockedProfileIds(next);
      setActiveProfileId(prof.id);
      setShowUnlockModal(false);
      setPendingProfileId(null);
    } else {
      alert("Wrong passcode.");
    }
  }

  function removeProfile(profileId) {
    if (!confirm("Delete this profile and all its diary entries?")) return;
    localStorage.removeItem(entriesKey(profileId));
    const next = profiles.filter((p) => p.id !== profileId);
    setProfiles(next);
    if (activeProfileId === profileId) {
      setActiveProfileId(null);
    }
    const nextUnlocked = new Set(unlockedProfileIds);
    nextUnlocked.delete(profileId);
    setUnlockedProfileIds(nextUnlocked);
  }

  /* ---------------------------
     Entries
  ---------------------------- */
  function openNewEntry() {
    if (!isUnlocked) return;
    const todayISO = new Date().toISOString().slice(0, 10);
    setEntryDraft({ id: null, title: "", date: todayISO, body: "" });
    setShowEntryModal(true);
  }
  function openEditEntry(entry) {
    if (!isUnlocked) return;
    setEntryDraft({ ...entry });
    setShowEntryModal(true);
  }
  function saveEntry(e) {
    e.preventDefault();
    if (!isUnlocked) return;
    const form = new FormData(e.currentTarget);
    const payload = {
      id: entryDraft.id || uid(),
      title: (form.get("title") || "").toString().trim(),
      date: (form.get("date") || "").toString(),
      body: (form.get("body") || "").toString(),
      updatedAt: Date.now(),
      createdAt: entryDraft.createdAt || Date.now(),
    };
    let next;
    if (entryDraft.id) {
      next = entries.map((en) => (en.id === entryDraft.id ? payload : en));
    } else {
      next = [payload, ...entries];
    }
    setEntries(next);
    saveEntries(activeProfileId, next);
    setShowEntryModal(false);
  }
  function deleteEntry(entryId) {
    if (!confirm("Delete this entry?")) return;
    const next = entries.filter((e) => e.id !== entryId);
    setEntries(next);
    saveEntries(activeProfileId, next);
  }

  /* ---------------------------
     Render
  ---------------------------- */
  return (
    <div className="diary-page">
      <header className="diary-header">
        <h1>Diary</h1>

        <div className="diary-actions">
          <button className="btn" onClick={openCreateProfile}>＋ New Profile</button>
          <button className="btn" onClick={openNewEntry} disabled={!isUnlocked}>
            ＋ New Entry
          </button>
        </div>
      </header>

      {/* Profile Tabs */}
      <div className="profile-tabs">
        {profiles.length === 0 && (
          <div className="empty-hint">Create a profile to get started.</div>
        )}

        {profiles.map((p) => {
          const selected = p.id === activeProfileId;
          const unlocked = unlockedProfileIds.has(p.id);
          return (
            <div
              key={p.id}
              className={`tab ${selected ? "selected" : ""} ${unlocked ? "unlocked" : ""}`}
              onClick={() => (unlocked ? setActiveProfileId(p.id) : requestUnlock(p.id))}
              title={unlocked ? "Unlocked" : "Locked (click to unlock)"}
            >
              <span className="tab-name">{p.name}</span>
              <button
                className="tab-remove"
                onClick={(e) => {
                  e.stopPropagation();
                  removeProfile(p.id);
                }}
                title="Delete profile"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>

      {/* Gate if not unlocked */}
      {!activeProfile && profiles.length > 0 && (
        <p className="gate-hint">Select a profile (and unlock it) to view or add entries.</p>
      )}
      {activeProfile && !isUnlocked && (
        <p className="gate-hint">
          “{activeProfile.name}” is locked — click the tab to enter the passcode.
        </p>
      )}

      {/* Entries grid */}
      {isUnlocked && (
        <section className="entries-grid">
          {entries.length === 0 ? (
            <div className="empty-hint">No entries yet. Use “＋ New Entry”.</div>
          ) : (
            entries.map((en) => (
              <article className="entry-card" key={en.id} onClick={() => openEditEntry(en)}>
                <div className="entry-title">{en.title || "Untitled"}</div>
                <div className="entry-date">{en.date}</div>
                <button
                  className="entry-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteEntry(en.id);
                  }}
                  title="Delete entry"
                >
                  🗑
                </button>
              </article>
            ))
          )}
        </section>
      )}

      {/* --------- Modals --------- */}
      {/* Create Profile */}
      {showProfileModal && (
        <div className="modal-backdrop" onClick={() => setShowProfileModal(false)}>
          <form className="modal" onSubmit={createProfile} onClick={(e) => e.stopPropagation()}>
            <h3>Create Profile</h3>
            <label>
              Name
              <input name="name" placeholder="e.g., Belal" required />
            </label>
            <label>
              Passcode
              <input name="passcode" placeholder="4–20 characters" type="password" required />
            </label>
            <div className="modal-actions">
              <button type="button" className="btn ghost" onClick={() => setShowProfileModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn">Create</button>
            </div>
            <p className="tiny-note">
              Stored locally in your browser (for this device). For serious privacy, use a long unique passcode.
            </p>
          </form>
        </div>
      )}

      {/* Unlock Profile */}
      {showUnlockModal && (
        <div className="modal-backdrop" onClick={() => setShowUnlockModal(false)}>
          <form className="modal" onSubmit={submitUnlock} onClick={(e) => e.stopPropagation()}>
            <h3>Enter Passcode</h3>
            <input name="pass" type="password" autoFocus placeholder="Passcode" required />
            <div className="modal-actions">
              <button type="button" className="btn ghost" onClick={() => setShowUnlockModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn">Unlock</button>
            </div>
          </form>
        </div>
      )}

      {/* Create/Edit Entry */}
      {showEntryModal && (
        <div className="modal-backdrop" onClick={() => setShowEntryModal(false)}>
          <form className="modal wide" onSubmit={saveEntry} onClick={(e) => e.stopPropagation()}>
            <h3>{entryDraft?.id ? "Edit Entry" : "New Entry"}</h3>

            <div className="two-col">
              <label>
                Date
                <input type="date" name="date" defaultValue={entryDraft?.date} required />
              </label>
              <label>
                Title
                <input name="title" placeholder="Title" defaultValue={entryDraft?.title} />
              </label>
            </div>

            <label>
              Your day
              <textarea
                name="body"
                rows={12}
                placeholder="Write about your day…"
                defaultValue={entryDraft?.body}
              />
            </label>

            <div className="modal-actions">
              <button type="button" className="btn ghost" onClick={() => setShowEntryModal(false)}>
                Close
              </button>
              <button type="submit" className="btn">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
