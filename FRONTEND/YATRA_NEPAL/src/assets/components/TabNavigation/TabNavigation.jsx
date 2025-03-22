import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./TabNavigation.scss";
import AccountSetting from "../../pages/AccountSettingPage/AccountSetting/AccountSetting";
import BlogWriting from "../../pages/BlogWriting/BlogWriting";
import GuideReview from "../../pages/GuideReview/GuideReview";

export const TabNavigation = () => {
  // Get the last active tab from sessionStorage or default to "Blog Writing"
  const [activeTab, setActiveTab] = useState(() => {
    return sessionStorage.getItem('activeTab') || "Blog Writing";
  });

  // Save active tab to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  const tabs = ["Guide Review", "Blog Writing", "Account Settings"];

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
        {activeTab === "Guide Review" && <GuideReview />}
        {activeTab === "Blog Writing" && <BlogWriting />}
        {activeTab === "Account Settings" && <AccountSetting />}
      </div>
    </div>
  );
};

export default TabNavigation;
