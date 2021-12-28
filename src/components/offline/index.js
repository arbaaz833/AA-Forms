import React from "react";
import WifiOffIcon from "@mui/icons-material/WifiOff";
import ReplayIcon from "@mui/icons-material/Replay";

export function OfflineModal({ errorMessage }) {
  return (
    <div className="shadow">
      <div
        className="formError"
        style={{ cursor: "pointer" }}
        onClick={() => {
          window.location.reload();
        }}
      >
        <WifiOffIcon />
        <p>{errorMessage}</p>
        <div
          style={{
            padding: "10px",
            backgroundColor: "lightgray",
            borderRadius: "5px",
          }}
        >
          <ReplayIcon fontSize="large" />
        </div>
      </div>
    </div>
  );
}
