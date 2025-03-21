import React, { useState } from "react";
import "./TabNavigation.scss";

// These components will be imported once they're created
// import AccountSetting from "../../pages/AccountSetting/AccountSetting";
// import BlogWriting from "../../pages/BlogWriting/BlogWriting";
// import GuideReview from "../../pages/GuideReview/GuideReview";

export const TabNavigation = () => {
  const [activeTab, setActiveTab] = useState("Account Settings");

  const tabs = [ "Guide Review", "Blog Writing", "Account Settings"];

  return (
    <div>
      {/* Tab Navigation */}
      <div className="tab-container">
        {tabs.map((tab) => (
          <div
            key={tab}
            className={`tab-item ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            {activeTab === tab && <div className="underline"></div>}
          </div>
        ))}
      </div>

      {/* Content based on active tab */}
      <div className="tab-content">
        {activeTab === "Guide Review" && <div>Guide Review Coming Soon</div>}
        {activeTab === "Blog Writing" && <div>Blog Writing Coming Soon</div>}
        {activeTab === "Account Settings" && <div>Account Settings Coming Soon</div>}
      </div>
    </div>
  );
};

export default TabNavigation;
