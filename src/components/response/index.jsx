import React, { useState } from "react";
import { PieRes } from "../../components/pieChart/index.jsx";
import { BarRes } from "../../components/barChart/index.jsx";
import "./response.css";
import ArrowBackSharpIcon from "@mui/icons-material/ArrowBackSharp";
import { IndResponses } from "./individualRes.jsx";

export function Response({ resArr, forRes, currForm, viewForm }) {
  let dateDataObj = {};
  let [summary, setSummary] = useState(true);
  let [ind, setInd] = useState(false);

  currForm.data.forEach((ques) => {
    if (ques.type == "radio" || ques.type == "checkbox") {
      let obj = forRes[ques.Qstatement];
      for (let opt in obj) {
        obj[opt] = 0;
      }
      if (ques.prevQues) {
        ques.prevQues.forEach((prevQues) => {
          let obj = forRes[prevQues];
          for (let opt in obj) {
            obj[opt] = 0;
          }
        });
      }
    } else forRes[ques.Qstatement].splice(0);
  });

  resArr.forEach((res) => {
    res.data().responseData.forEach((ques) => {
      if (ques.type == "radio" || ques.type == "checkbox") {
        ques.answer.forEach((ans) => {
          if (typeof forRes[ques.question.Qstatement][ans] == "number") {
            forRes[ques.question.Qstatement][ans] += 1;
          }
        });
      } else if (ques.type == "date") {
        forRes[ques.question.Qstatement].push(ques.answer);
        if (dateDataObj[ques.answer.slice(0, 4)])
          dateDataObj[ques.answer.slice(0, 4)] = [
            ...dateDataObj[ques.answer.slice(0, 4)],
            ques.answer.slice(5),
          ];
        else dateDataObj[ques.answer.slice(0, 4)] = [ques.answer.slice(5)];
      } else forRes[ques.question.Qstatement].push(ques.answer);
    });
  });
  let years = Object.keys(dateDataObj);
  return (
    <div className="resDiv">
      <div
        className="backBtn"
        onClick={() => {
          viewForm();
        }}
      >
        <ArrowBackSharpIcon />
      </div>
      <div className="responsesNum">Total Responses : {resArr.length}</div>
      <div className="resOptCon">
        <div
          onClick={() => {
            setSummary(true);
            setInd(false);
          }}
          className="resOpt"
          style={summary ? { backgroundColor: "white" } : { color: "white" }}
        >
          Summary
        </div>
        <div
          onClick={() => {
            setInd(true);
            setSummary(false);
          }}
          className="resOpt"
          style={ind ? { backgroundColor: "white" } : { color: "white" }}
        >
          Individual Responses
        </div>
      </div>
      {summary ? (
        currForm.data.map((ques) => {
          if (ques.type == "radio" || ques.type == "checkbox") {
            return (
              <>
                <div className="resQuestion">
                  <h2>{ques.Qstatement}</h2>
                  <hr />
                  {ques.prevQues
                    ? ques.prevQues.forEach((prevQues) => {
                        if (ques.Qstatement !== prevQues) {
                          if (!Array.isArray(forRes[prevQues])) {
                            let obj = forRes[ques.Qstatement];
                            for (let opt in forRes[prevQues]) {
                              if (typeof obj[opt] == "number")
                                obj[opt] += forRes[prevQues][opt];
                              else if (forRes[prevQues][opt] > 0)
                                obj[opt] = forRes[prevQues][opt];
                              else {
                              }
                            }
                          }
                        }
                      })
                    : null}

                  {ques.type == "checkbox" ? (
                    <BarRes
                      question={ques.prevQues ? null : ques}
                      dataObj={forRes[ques.Qstatement]}
                    />
                  ) : (
                    <PieRes
                      question={ques.prevQues ? null : ques}
                      question={ques}
                      dataObj={forRes[ques.Qstatement]}
                    />
                  )}
                </div>
              </>
            );
          } else if (ques.type == "time" || ques.type == "Short Paragraph") {
            return (
              <>
                <div className="resQuestion">
                  <h3>{ques.Qstatement}</h3>
                  <hr />
                  {ques.prevQues
                    ? ques.prevQues.forEach((prevQues) => {
                        if (Array.isArray(forRes[prevQues])) {
                          forRes[ques.Qstatement].push(...forRes[prevQues]);
                        }
                      })
                    : null}
                  <div>
                    {forRes[ques.Qstatement].map((str) => {
                      return <p className="shortAns">{str}</p>;
                    })}
                  </div>
                </div>
              </>
            );
          } else
            return (
              <>
                <div className="resQuestion">
                  <h3>{ques.Qstatement}</h3>
                  <hr />
                  <div>yyyy | mm-dd</div>
                  <div>
                    {years.map((year) => {
                      return (
                        <div className="dateCon">
                          <p style={{ display: "inline-block" }}>{year} | </p>
                          {dateDataObj[year].map((date) => {
                            return <small className="dates">{date}</small>;
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            );
        })
      ) : (
        <IndResponses responses={resArr} currForm={currForm} />
      )}
    </div>
  );
}
