import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { auth, db } from "../../backend/firebaseConfig";
import {
  Delete,
  AddCircle,
  Clear,
} from "../../../node_modules/@mui/icons-material";
import "./createForm.css";
import { addForm } from "../../backend/addForm";
import { ErrorOutline, CheckCircleSharp } from "@mui/icons-material";

import { useSearchParams, useNavigate } from "react-router-dom";
import ReactLoading from "react-loading";
import Switch from "@mui/material/Switch";
import { OfflineModal } from "../../components/offline/index";
import { useErrorHandler } from "../../components/ErrorHandler";
import ArrowBackSharpIcon from "@mui/icons-material/ArrowBackSharp";

function SuccessModal({ message }) {
  return (
    <div className="shadow">
      <div className="formError">
        <h3>
          {message}
          <CheckCircleSharp />
        </h3>
      </div>
    </div>
  );
}

export const CreateForm = () => {
  let [reqSignin, setReqSignin] = useState(false);
  let [online, setOnline] = useState(true);
  let nav = useNavigate();
  let [searchParams] = useSearchParams();
  let [prevForm, setPrevForm] = useState();
  let [questions, setQuestions] = useState([
    {
      id: uuidv4(),
      Qstatement: "",
      type: "radio",
      options: [{ id: uuidv4(), text: "" }],
    },
  ]);
  let [name, setName] = useState("Untitled Form");
  let [succ, Setsucc] = useState(false);
  let [submitting, setSubmit] = useState();
  let [loadingForm, setLoadingForm] = useState(
    searchParams.get("eId") ? true : false
  );
  let submitError = "";
  const setError = useErrorHandler();

  useEffect(() => {
    async function LoadForm() {
      try {
        if (navigator.onLine) {
          if (searchParams.get("eId")) {
            let form = await db
              .collection("users")
              .doc(auth.currentUser.uid)
              .collection("forms")
              .doc(searchParams.get("eId"))
              .get();
            let formData = form.data().FormData;
            console.log("form: ", form);
            console.log(formData);
            if (form.data().signin) setReqSignin(true);
            setQuestions(formData);
            setPrevForm(form.data());
            setLoadingForm(false);
            setName(form.data().formName);
          }
        } else {
          setOnline(false);
          setLoadingForm(false);
        }
      } catch (error) {
        console.log(error);

        setError(error);
      }
    }
    LoadForm();
  }, []);

  async function onSubmit(e) {
    try {
      setSubmit("progress");
      console.log("here");
      e.preventDefault();
      let forRes = {};
      questions.forEach((ques, index) => {
        if (ques.type == "radio" || ques.type == "checkbox") {
          forRes[ques.Qstatement] = {};
          ques.options.forEach(
            (opt) => (forRes[ques.Qstatement][opt.text] = 0)
          );
        } else {
          forRes[ques.Qstatement] = [];
        }
      });
      if (searchParams.get("eId")) {
        for (let ques in forRes) {
          if (prevForm.forRes[ques]) {
            if (
              Object.keys(prevForm.forRes[ques]).length >
              Object.keys(forRes[ques]).length
            ) {
              forRes[ques] = { ...forRes[ques], ...prevForm.forRes[ques] };
            }
          }
        }
      }
      let data = {
        formName: name,
        FormData: questions,
        forRes: searchParams.get("eId")
          ? { ...prevForm.forRes, ...forRes }
          : forRes,
        signin: reqSignin ? true : false,
      };
      if (navigator.onLine) {
        if (searchParams.get("eId")) {
          await db
            .collection("users")
            .doc(auth.currentUser.uid)
            .collection("forms")
            .doc(searchParams.get("eId"))
            .set(data);
        } else await addForm(auth.currentUser.uid, data);
        setSubmit(undefined);
        Setsucc(true);
        setTimeout(() => {
          Setsucc(false);
        }, 2000);
      } else {
        setOnline(false);
        setSubmit(undefined);
      }
    } catch (error) {
      setSubmit(undefined);
      console.log("error: ", error);
      setError(`An error occurred: ${error}`, 2000);
    }
  }

  function handleChange(e, questionNum, optNum) {
    console.log("inChange");
    let prevQuestions = [...questions];
    let updatedQues = prevQuestions.map((ques, index) => {
      if (index + 1 == questionNum) {
        if (optNum + 1) {
          let updatedOpt = ques.options.map((option, optindex) => {
            if (optindex == optNum) {
              option.text = e.target.value;
              return option;
            } else return option;
          });
          ques.options = updatedOpt;
          return ques;
        } else {
          if (searchParams.get("eId")) {
            if (ques.prevQues) {
              console.log("updating prev ques");
              if (
                !ques.prevQues.includes(prevForm.FormData[index].Qstatement)
              ) {
                ques.prevQues.push(prevForm.FormData[index].Qstatement);
              }
              ques.Qstatement = e.target.value;
            } else {
              ques.prevQues = [];
              ques.prevQues.push(prevForm.FormData[index].Qstatement);
              ques.Qstatement = e.target.value;
            }
          } else {
            ques.Qstatement = e.target.value;
            console.log("updating");
          }
          return ques;
        }
      } else {
        return ques;
      }
    });
    setQuestions(updatedQues);
  }

  function handleOPtChange(e, questionNum) {
    let value = e.target.value;
    let prevQuestions = [...questions];

    let updatedQues = prevQuestions.map((ques, index) => {
      if (index + 1 === questionNum) {
        if (value === "date" || value === "time") {
          delete ques.options;
          ques.type = value;
        } else if (value === "Short Paragraph") {
          delete ques.options;
          ques.type = value;
        } else if (value === "checkbox" || value === "radio") {
          ques.options = [{ id: uuidv4(), text: "" }];
          if (value === "checkbox") {
            ques.type = "checkbox";
          } else {
            ques.type = "radio";
          }
        } else {
          ques.type = value;
        }
      }
      return ques;
    });
    setQuestions(updatedQues);
  }

  function addQuestion(e) {
    e.preventDefault();
    setQuestions([
      ...questions,
      {
        id: uuidv4(),
        Qstatement: "",
        type: "radio",
        options: [{ id: uuidv4(), text: "" }],
      },
    ]);
  }

  function deleteQuestion(e, questionNum) {
    e.preventDefault();
    setQuestions((questions) => {
      return questions.filter((ques, index) => {
        if (index + 1 !== questionNum) {
          return ques;
        }
      });
    });
  }

  function deleteOpt(e, questionNum, index) {
    e.preventDefault();
    let prevQuestions = [...questions];

    let updatedQues = prevQuestions.map((ques, Qindex) => {
      if (Qindex + 1 == questionNum) {
        let updatedopt = ques.options.filter((opt, optNum) => {
          if (optNum !== index) return opt;
        });
        ques.options = updatedopt;
        return ques;
      } else return ques;
    });

    setQuestions(updatedQues);
  }

  function addOpt(e, questionNum) {
    e.preventDefault();
    let prevQuestions = [...questions];
    let updatedQues = prevQuestions.map((ques, index) => {
      if (index + 1 == questionNum) {
        let updatedopt = [...ques.options, { id: uuidv4(), text: "" }];
        ques.options = updatedopt;
        return ques;
      } else return ques;
    });

    setQuestions(updatedQues);
  }

  function changeHeight(e) {
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  }

  function nameChange(e) {
    setName(e.target.value);
  }

  return (
    <>
      {succ ? <SuccessModal message="Form Submitted" /> : null}
      {!online ? (
        <OfflineModal
          errorMessage={"Please Check Your Connection You Are Offline!"}
        />
      ) : loadingForm ? (
        <ReactLoading
          className="pageLoading"
          height="128px"
          width="128px"
          type="bubbles"
          color="#ffffff"
        />
      ) : (
        <>
          <div
            style={{ position: "fixed", top: "4rem", left: "2rem" }}
            className="backBtn"
            onClick={() => {
              nav("/myForms");
            }}
          >
            <ArrowBackSharpIcon />
          </div>
          <form onSubmit={onSubmit} className="dynForm">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <textarea
                required={true}
                onInput={(e) => {
                  changeHeight(e);
                }}
                value={name}
                onChange={nameChange}
              ></textarea>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    color: "white",
                    fontWeight: "lighter",
                    fontSize: "1rem",
                  }}
                >
                  Require Signin
                </span>
                <Switch
                  onChange={() => {
                    setReqSignin(!reqSignin);
                  }}
                  defaultChecked={reqSignin ? true : false}
                  color="warning"
                  style={{ color: "#ffffff" }}
                />
              </div>
            </div>

            {questions.map((ques, index) => {
              return (
                <CustomizedQues
                  questionsArr={questions}
                  key={ques.id}
                  changeHeight={changeHeight}
                  handleChange={handleChange}
                  Qstatement={ques.Qstatement}
                  addOpt={addOpt}
                  deleteOpt={deleteOpt}
                  deleteQuestion={deleteQuestion}
                  questionNum={index + 1}
                  type={ques.type}
                  options={ques.options}
                  handleOPtChange={handleOPtChange}
                />
              );
            })}
            <div className="actionButtons">
              <button className="addQues" onClick={addQuestion}>
                Add Question
              </button>
            </div>
            <div className="submitDiv">
              {submitting == undefined ? (
                <button type="submit" className="submitBtn">
                  Save
                </button>
              ) : (
                <button style={{ textAlign: "center" }} className="submitBtn">
                  <ReactLoading
                    type="spin"
                    color="#000000"
                    height="16px"
                    width="16px"
                    className="buttonLoading"
                  />
                </button>
              )}
            </div>
          </form>
        </>
      )}
    </>
  );
};

function CustomizedQues({
  questionsArr,
  changeHeight,
  handleChange,
  Qstatement,
  addOpt,
  deleteQuestion,
  questionNum,
  type,
  options,
  handleOPtChange,
  deleteOpt,
}) {
  return (
    <div className="question">
      <div className="questionField">
        <textarea
          required={true}
          onInput={(e) => {
            changeHeight(e);
          }}
          value={Qstatement}
          onChange={(e) => {
            handleChange(e, questionNum);
          }}
          placeholder={`Question ${questionNum}`}
        ></textarea>
        <select
          value={type}
          onChange={(e) => {
            handleOPtChange(e, questionNum);
          }}
          name="question type"
        >
          <option value="radio">Multiple Choice Question</option>
          <option value="checkbox">checkbox</option>
          <option value="date">date</option>
          <option value="time">time</option>
          <option value="Short Paragraph">Short Paragraph</option>
        </select>
        {questionsArr.length !== 1 ? (
          <button
            className="iconBtn"
            onClick={(e) => {
              deleteQuestion(e, questionNum);
            }}
          >
            <Clear fontSize="small" />
          </button>
        ) : (
          <div className="iconBtn"></div>
        )}
      </div>

      {type == "radio" || type == "checkbox" ? (
        options.map((opt, index) => {
          return (
            <div className="option" key={opt.id}>
              <textarea
                onInput={(e) => {
                  changeHeight(e);
                }}
                onChange={(e) => {
                  handleChange(e, questionNum, index);
                }}
                value={opt.text}
                required={true}
                type="text"
                placeholder={`option ${index + 1}`}
              ></textarea>
              {options.length != 1 ? (
                <button
                  className="iconBtn"
                  onClick={(e) => {
                    deleteOpt(e, questionNum, index);
                  }}
                >
                  <Delete fontSize="small" />
                </button>
              ) : null}
              <button
                className="iconBtn"
                onClick={(e) => {
                  addOpt(e, questionNum);
                }}
              >
                <AddCircle fontSize="small" />
              </button>
            </div>
          );
        })
      ) : type == "date" || type == "time" ? (
        <input readOnly={true} type="text" value={type} />
      ) : (
        <input readOnly={true} type="text" value={type} />
      )}
    </div>
  );
}
