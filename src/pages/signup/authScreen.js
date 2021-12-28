import { react, useState } from "react";
import { createUser, SignInUser } from "../../backend/user";
import { db, auth } from "../../backend/firebaseConfig";
import { Link, useSearchParams } from "react-router-dom";
import { useErrorHandler } from "../../components/ErrorHandler/index.jsx";
import { OfflineModal } from "../../components/offline/index";
import ReactLoading from "react-loading";
import "./authScreen.css";

export function SignUp() {
  let [email, setEmail] = useState("");
  let [online, setOnline] = useState(true);
  let [loading, setLoading] = useState(false);
  let [password, setPassword] = useState("");
  let [name, setName] = useState("");
  let [searchParam] = useSearchParams();
  let formId = searchParam.get("formId");
  let id = searchParam.get("id");
  let setError = useErrorHandler();

  async function handleSubmit(e, email, password) {
    try {
      e.preventDefault();
      if (navigator.onLine) {
        setLoading(true);

        await createUser(email, password, name);
        await auth.currentUser.sendEmailVerification({
          url: "http://localhost:3000/myForms",
          handleCodeInApp: false,
        });
        setLoading(false);
      } else setOnline(false);
    } catch (error) {
      setLoading(false);
      setError(error);
    }
  }

  function handleEChange(e) {
    let value = e.target.value;
    setEmail(value);
  }

  function handleNChange(e) {
    let value = e.target.value;
    setName(value);
  }

  function handlePChange(e) {
    let value = e.target.value;
    setPassword(value);
  }

  return (
    <>
      {!online ? (
        <OfflineModal
          errorMessage={"Please Check Your Connection You Are Offline!"}
        />
      ) : (
        <form
          onSubmit={(e) => {
            handleSubmit(e, email, password);
          }}
          className="authForm"
        >
          <h2>Sign Up</h2>
          <hr />
          <h3>Name</h3>
          <input
            type="text"
            required={true}
            value={name}
            onChange={handleNChange}
          />

          <h3>Email</h3>
          <input
            type="email"
            required={true}
            value={email}
            onChange={handleEChange}
          />

          <h3>Password</h3>
          <input
            required={true}
            id="userPassword"
            type="password"
            value={password}
            onChange={handlePChange}
          />
          <br />
          <button className="btn" type={loading ? null : "submit"}>
            {loading ? (
              <ReactLoading
                style={{ margin: "auto", height: "24px", width: "24px" }}
                type="spin"
                color="#000000"
              />
            ) : (
              <div>Sign Up</div>
            )}
          </button>
          {loading ? null : id ? (
            <Link to={`/auth/signin?formId=${formId}&id=${id}`}>
              Already Have An Account? SignIn.
            </Link>
          ) : (
            <Link to="/auth/signin">Already Have An Account? SignIn.</Link>
          )}
        </form>
      )}
    </>
  );
}
