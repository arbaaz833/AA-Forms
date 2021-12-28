import React, { useEffect, useState } from "react";
import styles from "./renderForm.module.css";
import { useSearchParams, useNavigate } from "react-router-dom";
import { auth, db, fb } from "../../backend/firebaseConfig";
import { ErrorOutline, CheckCircleSharp } from "@mui/icons-material";
import ReactLoading from "react-loading";
import CloseIcon from "@mui/icons-material/Close";
import { OfflineModal } from "../../components/offline/index";
import { useErrorHandler } from "../../components/ErrorHandler";

function ExistModal({ hideExist, ow }) {
  let nav = useNavigate();
  return (
    <div className={styles.shadow}>
      <div className={styles.formError}>
        <div
          onClick={() => {
            hideExist();
          }}
          style={{
            padding: "10px",
            cursor: "pointer",
            position: "absolute",
            top: "0",
            right: "0",
          }}
        >
          <CloseIcon />
        </div>
        <h3>You Have Submitted This Form Before</h3>
        <h4>Do You Want To Overwrite the Previous Response:</h4>
        <div>
          <button
            className={styles.existBtn}
            onClick={() => {
              ow();
            }}
          >
            Yes
          </button>
          <button
            className={styles.existBtn}
            onClick={() => {
              nav("/myForms");
            }}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}

function SuccessModal({ message }) {
  return (
    <div className={styles.shadow}>
      <div className={styles.formError}>
        <h3>
          {message}
          <CheckCircleSharp />
        </h3>
      </div>
    </div>
  );
}

function ErrorModal({ message }) {
  return (
    <div className={styles.shadow}>
      <div className={styles.formError}>
        <h3>{message}</h3>
      </div>
    </div>
  );
}

function PopulateForm({ question, index, changeHeight }) {
  if (question.type == "radio" || question.type == "checkbox") {
    return (
      <div className={styles.question} key={index} id={question.id}>
        <h3>{question.Qstatement}</h3>

        {question.options.map((opt, index) => {
          return (
            <label key={index} htmlFor={opt.text}>
              <input
                id={opt.text}
                name={question.Qstatement}
                type={question.type}
                value={opt.text}
                required={question.type != "checkbox" ? true : false}
              />
              {opt.text}
            </label>
          );
        })}
      </div>
    );
  } else if (question.type == "date" || question.type == "time") {
    return (
      <div className={styles.question} key={index} id={question.id}>
        <h3>{question.Qstatement}</h3>
        <input type={question.type} required={true} />
      </div>
    );
  } else if (question.type == "Short Paragraph") {
    return (
      <div className={styles.question} key={index} id={question.id}>
        <h3>{question.Qstatement}</h3>
        <textarea
          onInput={(e) => {
            changeHeight(e);
          }}
          required={true}
        />
      </div>
    );
  }
}

export function RenderForm() {
  let navigate = useNavigate();
  let [settingChanged, setSettingChanged] = useState(false);
  let [newRes, setNewRes] = useState(false);
  let [searchParams] = useSearchParams();
  let [submitting, setSubmit] = useState();
  let uid = searchParams.get("id");
  let formId = searchParams.get("formId");
  let signin = searchParams.get("rsi");
  let [exist, setExist] = useState(false);
  let [loading, setLoading] = useState(true);
  let [idStatus, setIdStatus] = useState(formId);
  let [data, setData] = useState({ formName: "", formData: [] });
  let [submitted, setSubmitted] = useState(false);
  let [overwrite, setOverwrite] = useState(false);
  let [exDocId, setDocId] = useState("");
  let [online, setOnline] = useState(true);
  let setError = useErrorHandler();

  useEffect(() => {
    async function getForm() {
      try {
        if (navigator.onLine) {
          if (!signin) {
            let resExist = await db
              .collection("responses")
              .where("formId", "==", formId)
              .where("submittedBy", "==", auth.currentUser.uid)
              .get();
            if (!resExist.empty) {
              setDocId(resExist.docs[0].id);
              setExist(true);
            }
          }

          if (idStatus) {
            setLoading(true);
            let form = await db
              .collection("users")
              .doc(uid)
              .collection("forms")
              .doc(formId)
              .get();
            let formName = form.data().formName;
            let formData = form.data().FormData;
            setData({ formName, formData });
            setLoading(false);
          }
        } else setOnline(false);
      } catch (error) {
        console.log(error);
        setError(error.message);
      }
    }
    getForm();
  }, []);

  function hideExist() {
    setExist(false);
  }

  function ow() {
    console.log("overwrited");
    setOverwrite(true);
    setExist(false);
  }

  function changeHeight(e) {
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  }

  async function handleSubmit(e) {
    try {
      console.log("submit");
      e.preventDefault();
      let res = [];
      let form = e.target;
      let questionDivs = form.getElementsByTagName("DIV");
      data.formData.forEach((ques, index) => {
        if (ques.type == "radio" || ques.type == "checkbox") {
          let answer = [];
          let checked = false;
          let options = questionDivs[index].getElementsByTagName("INPUT");
          for (let i = 0; i < options.length; i++) {
            if (options[i].checked) {
              checked = true;
              answer.push(options[i].value);
            }
          }
          if (!checked) throw "please completely fill the form";
          res.push({ question: ques, answer: answer, type: ques.type });
          //res[ques.Qstatement]=answer;
        } else if (
          ques.type == "date" ||
          ques.type == "time" ||
          ques.type == "Short Paragraph"
        ) {
          let answer;
          answer = questionDivs[index].children[1].value;
          res.push({ question: ques, answer: answer, type: ques.type });
          //res[ques.Qstatement]=answer;
        }
      });

      let resToDb = {
        responseData: res,
        formId: formId,
        formBy: uid,
        submittedBy: signin ? "Anonymous User" : auth.currentUser.uid,
        submittedOn: fb.firestore.FieldValue.serverTimestamp(),
        userEmail: signin ? "Anonymous User" : auth.currentUser.email,
      };
      console.log(resToDb);
      if (navigator.onLine) {
        setSubmit(true);
        if (overwrite) {
          await db
            .collection("responses")
            .doc(exDocId)
            .set({ ...resToDb });
        } else {
          await db.collection("responses").add(resToDb);
        }

        console.log(resToDb);
        setSubmit(undefined);
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          if (signin) setNewRes(true);
          else navigate("/myForms");
        }, 2000);
      } else setOnline(false);
    } catch (error) {
      setSubmit(undefined);
      if (error.message == "Missing or insufficient permissions.") {
        setSettingChanged(true);
        setTimeout(() => {
          navigate(`/auth/signin?formId=${formId}&id=${uid}`);
        }, 4000);
      }
      console.log(error);
      setError(error.message);
    }
  }

  return (
    <>
      {settingChanged ? (
        <ErrorModal
          message={
            "This Form Settings Has Been Changed By Its User.You Have To SignIn Before Submitting This Form."
          }
        />
      ) : null}
      {exist ? <ExistModal hideExist={hideExist} ow={ow} /> : null}
      {submitted ? <SuccessModal message="Form Submitted" /> : null}
      {!online ? (
        <OfflineModal
          errorMessage={"Please Check Your Connection You Are Offline!"}
        />
      ) : newRes ? (
        <div
          style={{
            backgroundColor: "white",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
          className={styles.renderedForm}
        >
          <h2>Your Response Submitted Successfully</h2>
          <h3>Want To Submit Another Response</h3>
          <button
            className={styles.btn}
            onClick={() => {
              setNewRes(false);
              navigate(
                `/renderForm?formId=${searchParams.get(
                  "formId"
                )}&id=${searchParams.get("id")}&rsi=${searchParams.get("rsi")}`
              );
            }}
          >
            YES
          </button>
          <button
            className={styles.btn}
            onClick={() => {
              setNewRes(false);
              navigate("/myForms");
            }}
          >
            NO
          </button>
        </div>
      ) : !idStatus ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "absolute",
            width: "100vw",
            top: "30vh",
          }}
        >
          <h1 className={styles.url}>INVALID URL TO SUBMIT RESPONSE.</h1>
        </div>
      ) : loading ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            zIndex: 100,
            justifyContent: "center",
            position: "absolute",
            width: "100vw",
            top: "30vh",
          }}
        >
          <ReactLoading type="bubbles" color="#ffffff" />
        </div>
      ) : (
        <form className={styles.renderedForm} onSubmit={handleSubmit}>
          <h2 className={styles.formName}>{data.formName}</h2>
          {data.formData.map((question, index) => {
            return (
              <PopulateForm
                key={index}
                changeHeight={changeHeight}
                question={question}
                index={index}
              />
            );
          })}
          <div className={styles.submitDiv}>
            {submitting == undefined ? (
              <button type="submit" className={styles.submitBtn}>
                Submit Response
              </button>
            ) : (
              <button
                style={{ textAlign: "center" }}
                className={styles.submitBtn}
              >
                <ReactLoading
                  type="spin"
                  color="#000000"
                  height="16px"
                  width="16px"
                  className={styles.buttonLoading}
                />
              </button>
            )}
          </div>
          {/* </div> */}
        </form>
      )}
    </>
  );
}
