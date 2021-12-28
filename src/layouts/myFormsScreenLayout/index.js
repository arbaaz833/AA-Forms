import React, { useEffect, useState } from "react";
import { auth, db } from "../../backend/firebaseConfig";
import "./myFormScreen.css";
import { PreviewForm } from "../../pages/previewForms/previewForms";
import ShareIcon from "@mui/icons-material/Share";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ReactLoading from "react-loading";
import { useErrorHandler } from "../../components/ErrorHandler";
import { Response } from "../../components/response/index.jsx";
import { OfflineModal } from "../../components/offline/index";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useNavigate } from "react-router";

function DeleteModal({ hideDeleteModal, deleteForm }) {
  let [deleting, setDeleting] = useState(false);

  return (
    <div className="shadow">
      <div className="formError">
        {deleting ? (
          <ReactLoading
            type="bubbles"
            height="100px"
            width="100px"
            color="#000000"
          />
        ) : (
          <>
            <div
              onClick={() => {
                hideDeleteModal();
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
            <h3>Alert! Deleting A Form Will Delete Its All Responses Also.</h3>
            <h4>Do You Want To Delete This Form?</h4>
            <div>
              <button
                style={{ display: "inline-block" }}
                className="existBtn"
                onClick={() => {
                  deleteForm();
                  setDeleting(true);
                }}
              >
                YES
              </button>
              <button
                style={{ display: "inline-block" }}
                className="existBtn"
                onClick={() => {
                  hideDeleteModal();
                }}
              >
                NO
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function LinkModal({ link, hidelink }) {
  let [copied, setCopied] = useState(false);
  async function copyText() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="shadow">
      <form className="formError ">
        <div
          onClick={() => {
            hidelink();
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
        <label style={{ width: "100%" }} htmlFor="link">
          Shareable Link To This Form:
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <input
              className="linkInput"
              id="link"
              type="text"
              value={link}
              readOnly={true}
            />
            <div
              style={{ cursor: "pointer" }}
              onClick={() => {
                copyText();
              }}
            >
              <ContentCopyIcon />
            </div>
          </div>
        </label>
        {copied ? <div>Text copied!</div> : null}
      </form>
    </div>
  );
}

export default function MyFormsLayout() {
  let nav = useNavigate();
  let [loadingForm, setLoadingForm] = useState(true);
  let [online, setOnline] = useState(true);
  let [linkDiv, showLinkDiv] = useState(false);
  let [link, setLinkvalue] = useState(undefined);
  let [loadingres, setLoading] = useState(false);
  let [currform, setCurrForm] = useState({});
  let [formsList, setFormsList] = useState([]);
  let [deleteM, setDeleteM] = useState({ display: false, formId: undefined });
  let [formPreview, setFormPreview] = useState({});
  let setError = useErrorHandler();
  let [response, setResponse] = useState({ res: [], display: false, data: {} });

  function hideDeleteModal() {
    setDeleteM({ display: false, formId: undefined });
  }

  async function deleteForm() {
    try {
      let id = deleteM.formId;
      if (navigator.onLine) {
        let resToDel = await db
          .collection("responses")
          .where("formId", "==", id)
          .get();

        if (!resToDel.empty) {
          resToDel.docs.forEach(async function (form) {
            await db.collection("responses").doc(form.id).delete();
          });
        }
        await db
          .collection("users")
          .doc(auth.currentUser.uid)
          .collection("forms")
          .doc(id)
          .delete();
        console.log("deleteindex", deleteM.index);
        let updatedFormsList = formsList.filter((form, index) => {
          if (index != deleteM.index) {
            console.log(index);
            return form;
          }
        });

        if (updatedFormsList.length == 0) {
          setCurrForm(undefined);
          setFormsList([]);
          setFormPreview({ ...formPreview, display: false });
        } else setFormsList([...updatedFormsList]);
      } else setOnline(false);
      setDeleteM({ display: false, formId: undefined });
    } catch (error) {
      console.log(error);
      setError(error.message);
    }
  }

  useEffect(() => {
    console.log(formsList);
    if (currform) setCurrForm(formsList[0]);
  }, [formsList]);

  useEffect(() => {
    if (currform) viewForm();
  }, [currform]);

  function closeLinkDiv() {
    showLinkDiv(false);
  }

  function setLink(id) {
    let link = "";
    let string = "https://aa-survey-form.web.app/renderForm?formId=";
    if (!currform.signin) {
      link = string + id + "&id=" + `${auth.currentUser.uid}` + "&rsi=f";
    } else link = string + id + "&id=" + `${auth.currentUser.uid}`;
    console.log(currform.data.signin);
    setLinkvalue(link);
    showLinkDiv(true);
  }

  function updateForm(form) {
    if (form == currform) {
      viewForm();
    } else {
      setResponse({ ...response, display: false });
      setCurrForm(form);
    }
  }

  function viewForm() {
    if (formsList.length) {
      let formView = (
        <PreviewForm
          name={currform.name}
          data={currform.data}
          setLink={setLink}
          setDeleteM={setDeleteM}
          id={currform.id}
          index={currform.index}
          viewResponses={viewResponses}
        />
      );
      setFormPreview({ screen: formView, display: true });
      setResponse({ ...response, display: false });
    } else if (!loadingForm) {
      setFormPreview({
        screen: (
          <h1 style={{ margin: "0vw 25vw", color: "white" }}>
            You Donot have Any Forms yet.
          </h1>
        ),
        display: true,
      });
    }
  }

  async function viewResponses() {
    try {
      if (currform == undefined || loadingForm) {
      } else {
        if (navigator.onLine) {
          setLoading(true);
          let dbRes = await db
            .collection("responses")
            .where("formId", "==", currform.id)
            .get();
          setLoading(false);
          let resArr = dbRes.docs;

          let forRes = currform.forRes;
          let lenght = resArr.length;
          setResponse({
            res: resArr,
            display: lenght == 0 ? false : true,
            data: { resArr, forRes },
          });
          setFormPreview({ ...formPreview, display: false });
        } else setOnline(false);
      }
    } catch (error) {
      setError(error.message);
    }
  }

  useEffect(() => {
    async function getFroms() {
      try {
        if (navigator.onLine) {
          let dbForms = await db
            .collection("users")
            .doc(auth.currentUser.uid)
            .collection("forms")
            .get();
          let formObj = [];
          if (dbForms.empty) {
            setLoadingForm(false);
            setCurrForm(undefined);
            setFormsList([]);
          } else {
            setLoadingForm(false);
            dbForms.docs.forEach((form, index) => {
              formObj.push({
                name: form.data().formName,
                id: form.id,
                data: form.data().FormData,
                forRes: form.data().forRes,
                signin: form.data().signin,
                index: index,
              });
            });

            setFormsList([...formObj]);
            setCurrForm(formObj[0]);
          }
        } else setOnline(false);
      } catch (error) {
        console.log(error);
        setError(error.message);
      }
    }
    getFroms();
  }, []);

  return (
    <>
      {!online ? (
        <OfflineModal
          errorMessage={"Please Check Your Connection You Are Offline!"}
        />
      ) : null}

      {linkDiv ? <LinkModal link={link} hidelink={closeLinkDiv} /> : null}
      {deleteM.display ? (
        <DeleteModal
          hideDeleteModal={hideDeleteModal}
          deleteForm={deleteForm}
        />
      ) : null}
      {!online ? null : (
        <aside className="sideBar">
          <h3>Select A Form</h3>
          {loadingForm ? (
            <ReactLoading type="bubbles" color="#000000" />
          ) : formsList.length == 0 ? (
            <button
              onClick={() => {
                nav("/createform");
              }}
              className="addFormBtn"
            >
              Create Your Form <AddIcon style={{ display: "block" }} />
            </button>
          ) : (
            formsList.map((form) => {
              return (
                <div
                  style={
                    currform == form ? { backgroundColor: "#ffc044" } : null
                  }
                  key={form.id}
                  onClick={() => {
                    updateForm(form);
                  }}
                  className="formList"
                >
                  {form.name}
                </div>
              );
            })
          )}
        </aside>
      )}

      {!online ? null : loadingres == true ? (
        <ReactLoading
          className="pageLoading"
          height="128px"
          width="128px"
          type="bubbles"
          color="#ffffff"
        />
      ) : formPreview.display ? (
        formPreview.screen
      ) : loadingForm ? (
        <ReactLoading
          className="pageLoading"
          height="128px"
          width="128px"
          type="bubbles"
          color="#ffffff"
        />
      ) : formsList.length == 0 ? (
        <div className="resForm">No Forms To Show.</div>
      ) : response.display == false ? (
        <div className="resForm">There are no responses to this form yet.</div>
      ) : (
        <Response
          resArr={response.data.resArr}
          forRes={response.data.forRes}
          currForm={currform}
          viewForm={viewForm}
        />
      )}
    </>
  );
}
