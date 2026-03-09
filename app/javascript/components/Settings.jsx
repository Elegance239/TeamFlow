import React, { useState } from "react";

export default function Settings() {
  const [user, setUser] = useState({
    // Mock Data (Eventually this comes from GET /users/:id)
    name: "Chris Wong",
    role: "Developer",
    skills: ["React", "JavaScript", "CSS", "UI Design"],
  });
  return (
    <div className="settings-container">
      <h1>Account Settings</h1>

      {/* Profile Info */}
      <section className="profile-section">
        <h3>Profile Picture</h3>
        <div className="avatar-placeholder"></div>
        <button onClick={() => alert("Upload Logic coming soon!")}>
          Change Picture
        </button>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Role:</strong> {user.role}</p>
      </section>

      {/* Skill Tags */}
      <section className="skills-section">
        <h3>My Skills</h3>
        <div className="tag-container">
          {user.skills.map((skill, index) => (
            <span key={index} className="skill-tag">
              {skill}
            </span>
          ))}
        </div>
      </section>

      {/* Logout */}
      <section className="danger-zone" style={{ marginTop: '20px' }}>
        <button
          className="logout-button"
          onClick={() => alert("Logging out...")}
        >
          Log Out
        </button>
      </section>
    </div>
  );
}
