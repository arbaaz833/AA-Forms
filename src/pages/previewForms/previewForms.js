//import styles from  "../../pages/renderForm/renderForm.module.css"
import styles from "./previewForms.module.css";
import ShareIcon from "@mui/icons-material/Share";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowForwardSharpIcon from "@mui/icons-material/ArrowForwardSharp";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";

function PopulateForm({ question, qIndex, resData }) {
  if (question.type == "radio" || question.type == "checkbox") {
    return (
      <div className={styles.question} key={qIndex} id={question.id}>
        <h2>{question.Qstatement}</h2>
        <hr />
        {question.options.map((opt, index) => {
          return (
            <label key={index} htmlFor={opt.text}>
              <input
                id={opt.text}
                name={question.Qstatement}
                readOnly={true}
                type={question.type}
                checked={
                  !resData
                    ? false
                    : resData[qIndex].answer.includes(opt.text)
                    ? true
                    : false
                }
                value={opt.text}
              />
              {opt.text}
            </label>
          );
        })}
      </div>
    );
  } else if (question.type == "date" || question.type == "time") {
    return (
      <div className={styles.question} key={qIndex} id={question.id}>
        <h2>{question.Qstatement}</h2>

        <input
          value={!resData ? question.type : resData[qIndex].answer}
          readOnly={true}
        />
      </div>
    );
  } else if (question.type == "Short Paragraph") {
    return (
      <div className={styles.question} key={qIndex} id={question.id}>
        <h2>{question.Qstatement}</h2>

        <textarea
          readOnly={true}
          value={!resData ? "" : resData[qIndex].answer}
        />
      </div>
    );
  }
}

export function PreviewForm({
  name,
  data = null,
  resData = null,
  setLink = null,
  setDeleteM = null,
  id = null,
  index = null,
  viewResponses = null,
}) {
  let nav = useNavigate();
  console.log(index);
  console.log(id);

  return (
    <>
      <form
        style={
          resData
            ? { marginLeft: "0px", marginTop: "0px", width: "auto" }
            : null
        }
        className={styles.previewForm}
      >
        <div className={styles.formBtnCon}>
          <div
            onClick={() => {
              nav("/createform");
            }}
            className={styles.createFormBtn}
          >
            <AddIcon />
          </div>
        </div>
        <div style={{ position: "sticky", top: 88 }}>
          {setLink ? (
            <div className={styles.sideOpts}>
              <div
                onClick={() => {
                  setLink(id);
                }}
                className="shareIcon"
              >
                <ShareIcon />
              </div>
              <div
                onClick={() => {
                  setDeleteM({ display: true, formId: id, index: index });
                }}
                className="shareIcon"
              >
                <DeleteIcon />
              </div>
              <div
                onClick={() => {
                  nav(`/createform?eId=${id}`);
                }}
                className="shareIcon"
              >
                <EditIcon />
              </div>
            </div>
          ) : null}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignContent: "center",
          }}
        >
          <h2 className={styles.formName}>{name}</h2>
          {setLink ? (
            <div
              onClick={() => {
                viewResponses();
              }}
              className={styles.resBtn}
            >
              Responses
              <ArrowForwardSharpIcon />
            </div>
          ) : null}
        </div>

        {data
          ? data.map((question, index) => {
              return (
                <PopulateForm
                  key={index}
                  resData={resData ? resData.responseData : null}
                  question={question}
                  qIndex={index}
                />
              );
            })
          : resData.responseData.map((res, index) => {
              return (
                <PopulateForm
                  key={index}
                  resData={resData ? resData.responseData : null}
                  question={res.question}
                  qIndex={index}
                />
              );
            })}
        {resData ? (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              color: "white",
            }}
          >
            <i>{resData.userEmail}</i>{" "}
          </div>
        ) : null}
        {resData ? (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              color: "white",
            }}
          >
            <i style={{ paddingRight: "5px" }}>
              {resData.submittedOn.toDate().toDateString()}
            </i>{" "}
            <i>{resData.submittedOn.toDate().toLocaleTimeString()}</i>
          </div>
        ) : null}
      </form>
    </>
  );
}
