import React, { useState, useMemo, Suspense } from "react";
import { Grid as DataGrid } from "@githubocto/flat-ui";
import { Tabs } from "@mui/material";
import { Tab } from "@mui/material";
import { AsPrimitive } from "./AsPrimitive";
import ErrorBoundary from "./ErrorBoundary";
import { OrgunitMap } from "./OrgunitMap";

export function Results({ results, initialSelectedTab, label, position }) {
  const [selectedTab, setSelectedTab] = useState(initialSelectedTab || 1);

  if (!Array.isArray(results)) {
    return (
      <div>
        <ErrorBoundary>
          <pre>
            <AsPrimitive value={results} />
          </pre>
        </ErrorBoundary>
      </div>
    );
  }

  const handleChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <div
      style={{
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }
    }>
     { initialSelectedTab == undefined && <Tabs
        value={selectedTab}
        onChange={handleChange}
        aria-label="simple tabs example"
      >
        <Tab label="Table" value={1} />
        <Tab label="Map" value={2} />
      </Tabs>}
      {selectedTab == 2 && <OrgunitMap results={results} showLayers={true} />}
      {selectedTab == 1 && results && (
        <div   style={{ flex: '1 1 0%' }}>
            <DataGrid data={results} />
        </div>
      )}
    </div>
  );
}
