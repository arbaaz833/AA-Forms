import React from "react";

export function NotFound() {
  return (
    <div className="formError">
      <h1 style={{ fontSize: "5rem", fontWeight: "bolder", margin: "5px" }}>
        404
      </h1>
      <p style={{ margin: "0px" }}>NOT FOUND</p>
      <p>The Resource Requested Could Not Be Found.</p>
    </div>
  );
}
