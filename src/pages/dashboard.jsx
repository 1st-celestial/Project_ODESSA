// src/components/Dashboard.jsx
import React, { useEffect, useState, useRef } from "react";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";


/**
 * Dashboard component (React)
 *
 * Notes:
 * - Keeps original element IDs for compatibility with tests/scripts (ticketModal, ticketsContainer, etc.)
 * - Starts with empty tickets and notifications (no auto-updates).
 * - Call onAuthSuccess(navigate) after login to navigate to /dashboard (example below).
 */

export function onAuthSuccess(navigate, redirect = "/dashboard") {
  // Example helper to call after authentication succeeded.
  // Optionally set session token: localStorage.setItem('ticketapp_session', '...token...');
  navigate(redirect);
}

const teamMembers = {
  "1": { name: "John Doe", avatar: "JD", color: "avatar-1" },
  "2": { name: "Sarah Chen", avatar: "SC", color: "avatar-2" },
  "3": { name: "Mike Rodriguez", avatar: "MR", color: "avatar-3" },
  "4": { name: "Alex Johnson", avatar: "AJ", color: "avatar-4" },
  "5": { name: "Emily Wilson", avatar: "EW", color: "avatar-5" },
};

export default function Dashboard() {
  const navigate = useNavigate();
  // Tickets state - start empty
  const [tickets, setTickets] = useState([]);
  const [notifications, setNotifications] = useState([]);
  // modal controls / current editing
  const [isTicketModalOpen, setTicketModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTicketId, setCurrentTicketId] = useState(null);

  // form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("open");
  const [priority, setPriority] = useState("medium");
  const [assignee, setAssignee] = useState("");
  // validation
  const [titleError, setTitleError] = useState(false);
  const [descriptionError, setDescriptionError] = useState(false);

  // toast
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimerRef = useRef(null);

  // notification panel
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);

  // mobile nav
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // refs for outside-click handling
  const notificationPanelRef = useRef(null);

  // helper - format date
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  };

  // Stats derived:
  const totalCount = tickets.length;
  const openCount = tickets.filter((t) => t.status === "open").length;
  const inProgressCount = tickets.filter((t) => t.status === "in-progress").length;
  const resolvedCount = tickets.filter((t) => t.status === "closed").length;

  // Effects
  useEffect(() => {
    // initial render behavior (no auto populate)
    // optionally you could read from localStorage here; we intentionally start clean
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    // click outside notification panel to close
    function onDocClick(e) {
      if (notificationPanelOpen && notificationPanelRef.current && !notificationPanelRef.current.contains(e.target)) {
        setNotificationPanelOpen(false);
      }
    }
    window.addEventListener("click", onDocClick);
    return () => window.removeEventListener("click", onDocClick);
  }, [notificationPanelOpen]);

  // toast helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setToastVisible(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToastVisible(false);
    }, 3000);
  };

  // modal open/close handlers
  const openCreateModal = () => {
    setIsEditing(false);
    setCurrentTicketId(null);
    setTitle("");
    setDescription("");
    setStatus("open");
    setPriority("medium");
    setAssignee("");
    setTitleError(false);
    setDescriptionError(false);
    setTicketModalOpen(true);
  };

  const openEditModal = (ticketId) => {
    const t = tickets.find((x) => x.id === ticketId);
    if (!t) return;
    setIsEditing(true);
    setCurrentTicketId(ticketId);
    setTitle(t.title);
    setDescription(t.description);
    setStatus(t.status);
    setPriority(t.priority);
    setAssignee(t.assignee || "");
    setTitleError(false);
    setDescriptionError(false);
    setTicketModalOpen(true);
  };

  const closeAllModals = () => {
    setTicketModalOpen(false);
    setDeleteModalOpen(false);
  };

  // validate
  const validate = () => {
    const tErr = !title.trim();
    const dErr = !description.trim();
    setTitleError(tErr);
    setDescriptionError(dErr);
    return !tErr && !dErr;
  };

  // Save ticket (create or update)
  const saveTicket = (e) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    const ticketData = {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      assignee: assignee || "",
      created: new Date().toISOString(),
    };

    if (isEditing && currentTicketId) {
      setTickets((prev) => prev.map((t) => (t.id === currentTicketId ? { ...t, ...ticketData } : t)));
      showToast("Ticket updated successfully!");
    } else {
      const newId = `TK-${String(tickets.length + 1).padStart(3, "0")}`;
      const newTicket = { id: newId, ...ticketData };
      setTickets((prev) => [newTicket, ...prev]);
      showToast("Ticket created successfully!");
    }

    // close
    setTicketModalOpen(false);
  };

  // Delete
  const openDeleteModal = (ticketId) => {
    setCurrentTicketId(ticketId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    setTickets((prev) => prev.filter((t) => t.id !== currentTicketId));
    setDeleteModalOpen(false);
    showToast("Ticket deleted");
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Render helpers
  const renderTicketCard = (ticket) => {
    const assigneeObj = ticket.assignee ? teamMembers[ticket.assignee] : null;
    return (
      <div className="ticket-card" key={ticket.id}>
        <div className="ticket-header">
          <div>
            <div className="ticket-title">{ticket.title}</div>
            <div className="ticket-id">{ticket.id}</div>
          </div>
          <div className={`status-tag status-${ticket.status}`}>{statusLabel(ticket.status)}</div>
        </div>
        <div className="ticket-description">{ticket.description}</div>
        {assigneeObj && (
          <div className="assignee-section">
            <div className={`assignee-avatar ${assigneeObj.color}`}>{assigneeObj.avatar}</div>
            <div className="assignee-name">Assigned to: {assigneeObj.name}</div>
          </div>
        )}
        <div className="ticket-meta">
          <div>Priority: <strong>{ticket.priority}</strong></div>
          <div>{formatDate(ticket.created)}</div>
        </div>
        <div className="ticket-actions">
          <button className="action-btn edit-btn" onClick={() => openEditModal(ticket.id)} aria-label={`Edit ${ticket.id}`}>
            <i className="fas fa-edit" />
          </button>
          <button className="action-btn delete-btn" onClick={() => openDeleteModal(ticket.id)} aria-label={`Delete ${ticket.id}`}>
            <i className="fas fa-trash" />
          </button>
        </div>
      </div>
    );
  };

  function statusLabel(s) {
    if (s === "open") return "Open";
    if (s === "in-progress") return "In Progress";
    if (s === "closed") return "Closed";
    return s;
  }

  return (
    <div className="dashboard-root">
      {/* Header */}
      <header>
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <i className="fas fa-ticket-alt" aria-hidden="true" />
              <span>Odessa</span>
            </div>

            <nav className="nav-menu" aria-label="Main navigation">
              <a href="#" className="nav-link active">Dashboard</a>
              <a href="#" className="nav-link">Tickets</a>
              <a href="#" className="nav-link">Reports</a>
              <a href="#" className="nav-link">Settings</a>
            </nav>

            <div className="user-actions">
              <div className="notification-container">
                <div
                  className="notification-bell"
                  id="notificationBell"
                  aria-label="Notifications"
                  onClick={() => setNotificationPanelOpen((s) => !s)}
                >
                  <i className="fas fa-bell" />
                  <span className="notification-count" id="notificationCount">{notifications.length}</span>
                </div>

                <div
                  ref={notificationPanelRef}
                  id="notificationPanel"
                  className={`notification-panel ${notificationPanelOpen ? "show" : ""}`}
                  aria-hidden={!notificationPanelOpen}
                >
                  <div className="notification-header">
                    <h3 className="notification-title">Notifications</h3>
                    <button className="action-btn" id="clearNotifications" title="Clear notifications" onClick={clearNotifications}>
                      <i className="fas fa-trash" />
                    </button>
                  </div>
                  <div className="notification-list" id="notificationList">
                    {notifications.length === 0 ? (
                      <p style={{ textAlign: "center", color: "var(--text-light)", padding: "20px 0" }}>No new notifications</p>
                    ) : (
                      notifications.map((n, i) => (
                        <div key={i} className="notification-item">
                          <div className="notification-icon"><i className={n.icon} /></div>
                          <div className="notification-content">
                            <div className="notification-message">{n.message}</div>
                            <div className="notification-time">{n.time}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <button className="btn btn-outline" id="newTicketBtn" onClick={openCreateModal}>
                <i className="fas fa-plus" />
                <span className="btn-text">New Ticket</span>
              </button>
              <button className="btn btn-primary" id="logoutBtn" onClick={() => { /* integrate logout flow externally */ alert("Logging out..."); }}>
                <i className="fas fa-sign-out-alt" />
                <span className="btn-text">Logout</span>
              </button>
            </div>

            <button className="mobile-menu-btn" id="mobileMenuBtn" aria-label="Open menu" onClick={() => setMobileNavOpen(true)}>
              <i className="fas fa-bars" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile nav overlay */}
      <div className={`mobile-nav ${mobileNavOpen ? "open" : ""}`} id="mobileNav" aria-hidden={!mobileNavOpen}>
        <div className="mobile-nav-header">
          <div className="logo">
            <i className="fas fa-ticket-alt" />
            <span>Odessa</span>
          </div>
          <button className="close-modal" id="closeMobileNav" aria-label="Close menu" onClick={() => setMobileNavOpen(false)}>
            <i className="fas fa-times" />
          </button>
        </div>
        <div className="mobile-nav-links">
          <a className="mobile-nav-link" href="#">Dashboard</a>
          <a className="mobile-nav-link" href="#">Tickets</a>
          <a className="mobile-nav-link" href="#">Reports</a>
          <a className="mobile-nav-link" href="#">Settings</a>
          <a className="mobile-nav-link" href="#" onClick={openCreateModal}>New Ticket</a>
          <a className="mobile-nav-link" href="#" onClick={() => { alert("Logout"); }}>Logout</a>
        </div>
      </div>

      {/* Main */}
      <main>
        <div className="container">
          <div className="dashboard-header">
            <h1 className="dashboard-title">Ticket Dashboard</h1>
            <button className="btn btn-primary" id="createTicketBtn" onClick={openCreateModal} aria-controls="ticketModal">
              <i className="fas fa-plus" />
              Create New Ticket
            </button>
          </div>

          <div className="stats-container" aria-hidden="false">
            <div className="stat-card">
              <div className="stat-header">
                <div>
                  <div className="stat-value" id="totalTickets">{totalCount}</div>
                  <div className="stat-label">Total Tickets</div>
                </div>
                <div className="stat-icon open"><i className="fas fa-ticket-alt" /></div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div>
                  <div className="stat-value" id="openTickets">{openCount}</div>
                  <div className="stat-label">Open Tickets</div>
                </div>
                <div className="stat-icon open"><i className="fas fa-folder-open" /></div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div>
                  <div className="stat-value" id="inProgressTickets">{inProgressCount}</div>
                  <div className="stat-label">In Progress</div>
                </div>
                <div className="stat-icon in-progress"><i className="fas fa-sync-alt" /></div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div>
                  <div className="stat-value" id="resolvedTickets">{resolvedCount}</div>
                  <div className="stat-label">Resolved</div>
                </div>
                <div className="stat-icon closed"><i className="fas fa-check-circle" /></div>
              </div>
            </div>
          </div>

          <div className="tickets-section">
            <div className="section-header">
              <h2 className="section-title">Recent Tickets</h2>
              <a className="btn btn-outline" id="viewAllBtn" href="#">
                <i className="fas fa-list" />
                View All Tickets
              </a>
            </div>

            <div className="tickets-grid" id="ticketsContainer">
              {tickets.length === 0 ? null : tickets.map((t) => renderTicketCard(t))}
            </div>
          </div>

          {/* Empty state */}
          {tickets.length === 0 && (
            <div className="empty-state" id="emptyState" style={{ display: "block" }}>
              <i className="fas fa-ticket-alt" />
              <h3>No Tickets Yet</h3>
              <p>You haven't created any tickets yet. Start by creating your first ticket to get started with Odessa.</p>
              <button className="btn btn-primary" id="createFirstTicketBtn" onClick={openCreateModal}>
                <i className="fas fa-plus" /> Create Your First Ticket
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Ticket Modal */}
      {isTicketModalOpen && (
        <div className="modal" id="ticketModal" role="dialog" aria-modal="true" aria-hidden={!isTicketModalOpen}>
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title" id="modalTitle">{isEditing ? "Edit Ticket" : "Create New Ticket"}</h2>
              <button className="close-modal" id="closeModal" onClick={closeAllModals}><i className="fas fa-times" /></button>
            </div>

            <form id="ticketForm" onSubmit={saveTicket}>
              <div className="form-group">
                <label htmlFor="ticketTitle" className="form-label">Title</label>
                <input id="ticketTitle" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} />
                {titleError && <div className="form-error" id="titleError">Title is required</div>}
              </div>

              <div className="form-group">
                <label htmlFor="ticketDescription" className="form-label">Description</label>
                <textarea id="ticketDescription" className="form-control" rows="4" value={description} onChange={(e) => setDescription(e.target.value)} />
                {descriptionError && <div className="form-error" id="descriptionError">Description is required</div>}
              </div>

              <div className="form-group">
                <label htmlFor="ticketStatus" className="form-label">Status</label>
                <select id="ticketStatus" className="form-control" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="open">open</option>
                  <option value="in-progress">in_progress</option>
                  <option value="closed">closed</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="ticketPriority" className="form-label">Priority</label>
                <select id="ticketPriority" className="form-control" value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="ticketAssignee" className="form-label">Assign To</label>
                <select id="ticketAssignee" className="form-control" value={assignee} onChange={(e) => setAssignee(e.target.value)}>
                  <option value="">Unassigned</option>
                  {Object.entries(teamMembers).map(([k, m]) => (<option key={k} value={k}>{m.name}</option>))}
                </select>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-outline" id="cancelBtn" onClick={closeAllModals}>Cancel</button>
                <button type="submit" className="btn btn-primary" id="saveTicketBtn">Save Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete modal */}
      {isDeleteModalOpen && (
        <div className="modal" id="deleteModal" role="dialog" aria-modal="true">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Confirm Deletion</h2>
              <button className="close-modal" id="closeDeleteModal" onClick={closeAllModals}><i className="fas fa-times" /></button>
            </div>

            <p>Are you sure you want to delete this ticket? This action cannot be undone.</p>
            <div className="form-actions">
              <button className="btn btn-outline" id="cancelDeleteBtn" onClick={closeAllModals}>Cancel</button>
              <button className="btn btn-primary" id="confirmDeleteBtn" onClick={confirmDelete} style={{ backgroundColor: "#e53935" }}>Delete Ticket</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <div className={`toast ${toastVisible ? "show" : ""}`} id="toast">
        <i className="fas fa-check-circle" />
        <span id="toastMessage">{toastMessage}</span>
      </div>

      {/* Footer */}
      <footer className="py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="logo-avatar bg-gradient-to-br text-white font-bold">O</div>
            <div>
              <div className="font-semibold">ODESSA</div>
              <div className="text-sm text-gray-500">TicketFlow</div>
            </div>
          </div>

          <div className="flex gap-6 items-center">
            <nav className="hidden sm:flex gap-4 text-sm text-gray-600">
              <a href="#" className="hover:text-gray-900">Home</a>
              <a href="#" className="hover:text-gray-900">Features</a>
              <a href="#" className="hover:text-gray-900">Pricing</a>
            </nav>

            <div className="flex gap-3 items-center">
              <a href="#" title="Twitter" className="text-gray-500 icons"><i data-feather="twitter" className="fas fa-twitter" /></a>
              <a href="#" title="Github" className="text-gray-500 icons"><i data-feather="github" className="fas fa-github" /></a>
              <a href="#" title="LinkedIn" className="text-gray-500 icons"><i data-feather="linkedin" className="fas fa-linkedin" /></a>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            © <span id="year">{new Date().getFullYear()}</span> Odessa — created with curiosity by Celestial • built with React
          </div>
        </div>
      </footer>
    </div>
  );
}
