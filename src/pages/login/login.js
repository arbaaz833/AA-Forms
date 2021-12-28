import { react, useState } from "react";
import { SignInUser } from "../../backend/user";
import { Link, useParams, useSearchParams } from "react-router-dom";
import ReactLoading from "react-loading";
import { OfflineModal } from "../../components/offline/index";
import { useErrorHandler } from "../../components/ErrorHandler/index.jsx";

export function SignIn() {
  let [email, setEmail] = useState("");
  let [online, setOnline] = useState(true);
  let [password, setPassword] = useState("");
  let [loading, setLoading] = useState(false);
  let [searchParam] = useSearchParams();
  let formId = searchParam.get("formId");
  let id = searchParam.get("id");
  let setError = useErrorHandler();

  async function handleSubmit(e, email, password) {
    try {
      e.preventDefault();
      if (navigator.onLine) {
        setLoading(true);
        await SignInUser(email, password);
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
          <h2>Sign In</h2>
          <hr />
          <h3>Email</h3>
          <input type="email" value={email} onChange={handleEChange} />

          <h3>Password</h3>
          <input
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
              <div>Sign In</div>
            )}
          </button>

          {loading ? null : id ? (
            <Link to={`/auth/signup?formId=${formId}&id=${id}`}>
              Create an Account
            </Link>
          ) : (
            <Link to="/auth/signup">Create an Account</Link>
          )}
        </form>
      )}
    </>
  );
}
