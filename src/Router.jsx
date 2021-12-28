import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import { RenderForm } from "./pages/renderForm/renderForm";
import { UserLayout } from "./layouts/UserLayout";
import AuthLayout from "./layouts/AuthLayout";
import ReactLoading from "react-loading";
import { auth } from "./backend/firebaseConfig";
import { SignUp } from "./pages/signup/authScreen";
import { SignIn } from "./pages/login/login";
import { CreateForm } from "./pages/createForm/createForm";
import MyFormsLayout from "./layouts/myFormsScreenLayout/index";
import { Home } from "./pages/home/index.jsx";
import { NotFound } from "../src/components/notFound/index";
import { EmailCheck } from "./components/emailVerify/index";
import ErrorHandler, { ErrorContext } from "./components/ErrorHandler";

//only-authenticated, only-unauthenticated
function RouteWrapper({ authState, children }) {
  const [isAuthed, setIsAuthed] = useState();
  let [searchParams] = useSearchParams();
  let navigate = useNavigate();

  useEffect(() => {
    auth.onAuthStateChanged(
      (user) => {
        console.log(user);
        if (user) {
          setIsAuthed(true);
        } else setIsAuthed(false);
      },
      (error) => {
        console.log(error);
      }
    );
  }, []);

  if (isAuthed === undefined)
    return (
      <ReactLoading
        className="pageLoading"
        height="100px"
        width="100px"
        type="spin"
        color="#ffffff"
      />
    );

  switch (authState) {
    case "only-authenticated":
      if (!isAuthed) {
        if (searchParams.get("formId") && searchParams.get("rsi") == "f") {
          return children;
        } else if (searchParams.get("formId")) {
          navigate(
            `/auth/signin?formId=${searchParams.get(
              "formId"
            )}&id=${searchParams.get("id")}`
          );
          return null;
        } else {
          window.location.pathname = "/auth/home";
          return null;
        }
      } else if (!auth.currentUser.emailVerified) navigate("/verifyEmail");
      else return children;
    case "only-unauthenticated":
      if (isAuthed) {
        if (searchParams.get("formId")) {
          navigate(
            `/renderForm?formId=${searchParams.get(
              "formId"
            )}&id=${searchParams.get("id")}`
          );
          return null;
        } else {
          if (auth.currentUser.emailVerified) navigate("/myForms");
          else navigate("/verifyEmail");
          return null;
        }
      } else return children;
  }
}

export default function Router() {
  const [error, setError] = useState("");

  return (
    <ErrorContext.Provider value={{ error, setError }}>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <RouteWrapper authState="only-authenticated">
                <UserLayout />
              </RouteWrapper>
            }
          >
            <Route path="renderForm" element={<RenderForm />} />
            <Route path="myForms" element={<MyFormsLayout />} />
            <Route path="createform" element={<CreateForm />} />
          </Route>

          <Route
            path="/auth"
            element={
              <RouteWrapper authState="only-unauthenticated">
                <AuthLayout />
              </RouteWrapper>
            }
          >
            <Route path="signin" element={<SignIn />} />
            <Route path="signup" element={<SignUp />} />
            <Route path="home" element={<Home />} />
          </Route>
          <Route path="verifyEmail" element={<EmailCheck />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <ErrorHandler />
    </ErrorContext.Provider>
  );
}
