import react, { useEffect, useState, useRef } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { auth } from "../../backend/firebaseConfig";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import SecurityIcon from "@mui/icons-material/Security";
import PasswordIcon from "@mui/icons-material/Password";
import "./navBar.css";

function OutsideAlerter({ setExpand, expand, children }) {
  const wrapperRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setExpand(!expand);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  return <div ref={wrapperRef}>{children}</div>;
}

export function UserLayout() {
  let [expand, setExpand] = useState(false);
  let [privacy, setPrivacy] = useState(false);
  let nav = useNavigate();

  useEffect(() => {
    if (window.location.pathname == "/") nav("myForms");
  }, []);

  return (
    <>
      <nav className="navBar">
        {auth.currentUser ? (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexGrow: 0.9,
              }}
            >
              <h3
                style={{
                  color: "goldenrod",
                  fontWeight: "bold",
                }}
              >
                AA FORMS
              </h3>
            </div>

            <div className="accBtnCon">
              <button
                className="accBtn"
                onClick={() => {
                  setExpand(!expand);
                  setPrivacy(false);
                }}
              >
                <AccountCircleIcon
                  style={{ color: "white" }}
                  fontSize="large"
                />
              </button>

              {expand ? (
                <OutsideAlerter setExpand={setExpand} expand={expand}>
                  <div className="child">
                    {privacy ? (
                      <div className="child priOptCon">
                        <div className="accOpt">
                          Change Password
                          <PasswordIcon />
                        </div>
                      </div>
                    ) : null}
                    <div className="userInfo">
                      {auth.currentUser.displayName}
                    </div>
                    <div
                      style={{
                        color: "grey",
                        paddingBottom: "5px",
                      }}
                      className="userInfo"
                    >
                      {auth.currentUser.email}
                    </div>
                    <div
                      onClick={() => {
                        setPrivacy(!privacy);
                      }}
                      className="accOpt"
                    >
                      Account Privacy
                      <SecurityIcon />
                    </div>
                    <div
                      onClick={() => {
                        auth.signOut();
                      }}
                      className="accOpt"
                    >
                      Logout
                      <LogoutIcon />
                    </div>
                  </div>
                </OutsideAlerter>
              ) : null}
            </div>
          </>
        ) : null}
      </nav>
      <Outlet />
    </>
  );
}
