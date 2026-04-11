import React from "react";

export default function Sidebar({ onNavigate }) {
  return (
    <div className="sidebar-container">
      <h2>Sidebar</h2>
      <h3>Admin Panel</h3>
      <button>
        Create Task
      </button>
      
      <nav className="sidebar-nav">
        <button onClick={() => onNavigate('calendar')}>Show Calendar</button>
        <button onClick={() => onNavigate('settings')}>Show Settings</button>
        <button onClick={() => onNavigate('signin')}>Show SignIn Page</button>
      </nav>
    </div>
  )
}