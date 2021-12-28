import React, { useEffect, useState } from "react";
import { PreviewForm } from "../../pages/previewForms/previewForms";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import "./response.css";

export function IndResponses({ responses, currForm }) {
  let [resList, setResList] = useState([]);
  let [currRes, setCurrRes] = useState(responses[0].data());
  let [resNum, setResNum] = useState();

  useEffect(() => {
    let tempResList = [];
    responses.forEach((res) => {
      tempResList.push(res.data());
    });

    setResList(tempResList);
    setResNum(1);
  }, []);

  return (
    <>
      <div className="arrowsCon">
        <button
          className="iconBtn"
          onClick={
            resNum == 1
              ? null
              : () => {
                  setCurrRes(resList[resNum - 2]);
                  setResNum(resNum - 1);
                }
          }
        >
          <ArrowBackIosIcon style={{ color: "white" }} />
        </button>
        <div
          style={{
            color: "white",
            display: "inline-block",
            paddingRight: "6px",
          }}
        >
          {resNum} OF {resList.length}{" "}
        </div>
        <button
          className="iconBtn"
          onClick={
            resNum == resList.length
              ? null
              : () => {
                  setCurrRes(resList[resNum]);
                  setResNum(resNum + 1);
                }
          }
        >
          <ArrowForwardIosIcon style={{ color: "white" }} />
        </button>
      </div>
      <hr />
      <div>
        <PreviewForm name={currForm.name} resData={currRes} />
      </div>
    </>
  );
}
