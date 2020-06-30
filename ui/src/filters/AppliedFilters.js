import React from "react";
import Chip from "@material-ui/core/Chip";

function AppliedFilters({ activeFilters }) {
  return (
    <div className="AppliedFilters">
      {Object.keys(activeFilters).map((name) => (
        <Chip
          key={`${activeFilters[name]}:${name}`}
          label={`${activeFilters[name]}:${name}`}
          // onDelete={handleDelete}
          color="primary"
          variant="outlined"
        />
      ))}
    </div>
  );
}

export default AppliedFilters;
