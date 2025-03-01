import React, { useState } from "react";
import "./BlogWriting.scss";

export const BlogWriting = () => {
  const [postText, setPostText] = useState("");

  const handleChange = (e) => setPostText(e.target.value);

  const handleSubmit = () => {
    console.log("Post submitted:", postText);
    setPostText("");
  };

  return (
    <div className="post-container">

      {/* Input Section */}
      <div className="input-section">
        <input
          type="text"
          placeholder="Write a post about your travels!"
          value={postText}
          onChange={handleChange}
          className="post-input"
        />
      </div>

      {/* Actions Section */}
      <div className="actions-container">
        <div className="post-actions">
          <button className="action-btn">📄 File</button>
          <button className="action-btn">🖼️ Image</button>
          <button className="action-btn">📍 Location </button>
        </div>

        <button className="send-btn" onClick={handleSubmit}>
          Post
        </button>
      </div>

    </div>

  );
};

export default BlogWriting;
