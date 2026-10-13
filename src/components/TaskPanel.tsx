/* ============================================================================
   TASK PANEL — "Bugünkü tapşırıqlar" (CRUD, yalnız localStorage ilə)
   ----------------------------------------------------------------------------
   Əməliyyatlar:  əlavə et • tamamla • redaktə et • sil • aktiv seç • təmizlə
   Bütün dəyişikliklər valideyndəki `setTasks` vasitəsilə localStorage-a yazılır.
   ========================================================================== */

import { useState, type Dispatch, type SetStateAction } from "react";
import { uid } from "../lib/storage";
import type { Task } from "../types";
import { Icon } from "./Icon";

interface Props {
  tasks: Task[];
  setTasks: Dispatch<SetStateAction<Task[]>>;
  /** Hazırda üzərində işlədiyimiz tapşırığın id-si */
  activeId: string | null;
  setActiveId: (id: string | null) => void;
}

export function TaskPanel({ tasks, setTasks, activeId, setActiveId }: Props) {
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const remaining = tasks.filter((t) => !t.done).length;

  /* ------------------------------ ƏLAVƏ ET ------------------------------ */
  function addTask(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return; // boş tapşırıq əlavə etmirik
    const task: Task = {
      id: uid(),
      text,
      done: false,
      pomodoros: 0,
      createdAt: Date.now(),
    };
    setTasks((prev) => [task, ...prev]);
    // İlk tapşırıqsa, avtomatik aktiv seç
    if (!activeId) setActiveId(task.id);
    setDraft("");
  }

  /* ------------------------------ TAMAMLA ------------------------------ */
  function toggleDone(id: string) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  }

  /* ------------------------------- SİL -------------------------------- */
  function removeTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (activeId === id) setActiveId(null);
  }

  /* ---------------------------- REDAKTƏ ET ---------------------------- */
  function startEdit(t: Task) {
    setEditingId(t.id);
    setEditText(t.text);
  }

  function commitEdit() {
    const text = editText.trim();
    if (text && editingId) {
      setTasks((prev) =>
        prev.map((t) => (t.id === editingId ? { ...t, text } : t)),
      );
    }
    setEditingId(null);
  }

  /* --------------------------- TƏMİZLƏ --------------------------- */
  function clearDone() {
    setTasks((prev) => prev.filter((t) => !t.done));
  }

  const doneCount = tasks.length - remaining;

  return (
    <section className="card">
      <div className="card__head">
        <h2 className="card__title">
          <Icon name="list" size={18} />
          Bugünkü tapşırıqlar
        </h2>
        <span className="card__badge">{remaining} qaldı</span>
      </div>

      {/* Yeni tapşırıq forması */}
      <form className="task-form" onSubmit={addTask}>
        <input
          className="task-input"
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Nə üzərində işləyirsən?"
          maxLength={80}
          aria-label="Yeni tapşırıq"
        />
        <button className="btn btn--primary" type="submit" style={{ padding: "12px 18px" }}>
          <Icon name="plus" size={17} />
        </button>
      </form>

      {/* Siyahı */}
      {tasks.length === 0 ? (
        <p className="empty">
          <span className="empty__emoji">🐱</span>
          Hələ tapşırıq yoxdur.
          <br />
          Yuxarıdan birini əlavə et və başlayaq!
        </p>
      ) : (
        <ul className="task-list">
          {tasks.map((t) => {
            const isActive = t.id === activeId && !t.done;
            const isEditing = t.id === editingId;
            return (
              <li
                key={t.id}
                className={`task-item${isActive ? " is-active" : ""}${
                  t.done ? " is-done" : ""
                }`}
              >
                {/* Tamamlama düyməsi */}
                <button
                  type="button"
                  className={`task-check${t.done ? " is-done" : ""}`}
                  onClick={() => toggleDone(t.id)}
                  aria-label={t.done ? "Geri al" : "Tamamla"}
                >
                  {t.done && <Icon name="check" size={13} weight="bold" />}
                </button>

                <div className="task-body">
                  {isEditing ? (
                    <input
                      className="task-input"
                      style={{ padding: "4px 10px", fontSize: 13.5 }}
                      value={editText}
                      autoFocus
                      onChange={(e) => setEditText(e.target.value)}
                      onBlur={commitEdit}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitEdit();
                        if (e.key === "Escape") setEditingId(null);
                      }}
                    />
                  ) : (
                    <button
                      type="button"
                      className="task-text"
                      style={{ textAlign: "left", background: "none" }}
                      onClick={() => setActiveId(isActive ? null : t.id)}
                      title="Aktiv tapşırıq kimi seç"
                    >
                      {t.text}
                    </button>
                  )}

                  <span className="task-meta">
                    {t.pomodoros > 0 && (
                      <>
                        <Icon name="timer" size={11} weight="bold" />
                        {t.pomodoros} pomodoro
                      </>
                    )}
                    {isActive && <span>• hazırda bu</span>}
                  </span>
                </div>

                {/* Redaktə / sil */}
                <div className="task-actions">
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => startEdit(t)}
                    aria-label="Redaktə et"
                  >
                    <Icon name="pencil" size={15} />
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => removeTask(t.id)}
                    aria-label="Sil"
                  >
                    <Icon name="trash" size={15} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Tamamlanmışları təmizlə */}
      {doneCount > 0 && (
        <div className="row-between" style={{ marginTop: 12 }}>
          <span className="muted">{doneCount} tamamlandı</span>
          <button type="button" className="btn btn--ghost" style={{ padding: "7px 14px", fontSize: 12.5 }} onClick={clearDone}>
            <Icon name="trash" size={14} />
            Təmizlə
          </button>
        </div>
      )}
    </section>
  );
}
