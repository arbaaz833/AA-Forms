import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./home.module.css";
import logoDark from "../../svgs/logo dark 2.png";
import responses from "../../svgs/responses.PNG";
import createForm from "../../svgs/create form.PNG";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

export function Home() {
  let nav = useNavigate();
  return (
    <>
      <nav
        style={{
          position: "absolute",
          justifyContent: "flex-end",
          paddingRight: "0",
        }}
        className={styles.navBar}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
          }}
        >
          <div
            onClick={() => {
              nav("/auth/signin");
            }}
            className={styles.resBtn}
          >
            Sign In
          </div>
          <div
            onClick={() => {
              nav("/auth/signup");
            }}
            className={styles.resBtn}
          >
            Sign Up
          </div>
        </div>
      </nav>
      <div
        style={{
          marginTop: "3.5rem",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ flexDirection: "column" }} className={styles.card}>
          <h2 className={styles.homeText}>
            WELCOME TO <span style={{ color: "goldenrod" }}> AA FORMS</span>.
          </h2>
          <div style={{ width: "70%" }}>
            <h2 style={{ textAlign: "center" }} className={styles.homeText}>
              Create forms in minutes with simplest interface, Analyze responses
              data with pie charts and bar charts and conclude result with{" "}
              <span style={{ color: "goldenrod" }}> AA FORMS</span>.
            </h2>
          </div>
        </div>

        <div className={styles.card}>
          <img className={styles.cardImg} src={createForm} />
          <div style={{ width: "20%" }}>
            <h2 className={styles.homeText}>
              <FiberManualRecordIcon style={{ color: "goldenrod" }} /> Create
              forms with dynamic form generator and also edit existing forms
              without hustle.
            </h2>
          </div>
        </div>

        <div className={styles.card}>
          <div style={{ width: "20%" }}>
            <h2 className={styles.homeText}>
              <FiberManualRecordIcon style={{ color: "goldenrod" }} /> Get an
              analysis of responses data in a glimpse by visualizing data with
              the help of charts or check the individual responses.
            </h2>
          </div>
          <img className={styles.cardImg} src={responses} />
        </div>
      </div>
    </>
  );
}
