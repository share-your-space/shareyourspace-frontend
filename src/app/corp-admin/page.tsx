"use client";

import React from "react";

const CorpAdminDashboardPage = () => {
  return (
    <div>
      <h2 className="text-xl font-semibold">Welcome to your Dashboard</h2>
      <p className="mt-2">
        Please select a space from the dropdown above to view its details and manage its tenants and workstations.
      </p>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        You can also manage your company profile and invite other administrators.
      </p>
    </div>
  );
};

export default CorpAdminDashboardPage;
