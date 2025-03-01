import React, { useState } from "react";
import "./TabNavigation.scss";

import AccountSetting from "../../pages/TabNavigationPages/AccountSetting/AccountSetting";
import BlogWriting from "../../pages/TabNavigationPages/BlogWriting/BlogWriting";
import GuideReview from "../../pages/TabNavigationPages/GuideReview/GuideReview";

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
        {activeTab === "Guide Review" && <GuideReview/>}
        {activeTab === "Blog Writing" && <BlogWriting/>}
        {activeTab === "Account Settings" && <AccountSetting />}
      </div>
    </div>
  );
};

export default TabNavigation;
