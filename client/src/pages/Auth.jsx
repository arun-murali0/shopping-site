import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { auth, google, db } from "../firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";

function Auth({ user, setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const google_signin = () => {
    signInWithPopup(auth, google)
      .then((res) => {
        // console.log(res);
        toast.success("login successful");
        navigate("/");
      })
      .catch((err) => alert(err));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then((res) => {
        const userUid = res.user.uid;
        const userDocRef = doc(db, "users", userUid);

        getDoc(userDocRef)
          .then((docSnapshot) => {
            if (docSnapshot.exists()) {
              const userData = docSnapshot.data();
              console.log(userData);
              let user = {
                displayName: `${userData?.firstName} ${userData?.lastName}`,
                photoURL: `${userData?.photoURL}`,
              };
              setUser(user);
              window.localStorage.setItem("user", userData.email);
              toast.success("Login successful");
              navigate("/");
            } else {
              toast.error("User data not found");
            }
          })
          .catch((error) => {
            toast.error("Error fetching user data");
            console.error(error);
          });
      })
      .catch((err) => {
        toast.error("Login failed");
      });
  };

  return (
    <section className="py-5">
      <div className="container">
        <h2 className="text-center">SignIn</h2>
        <div className="row justify-content-center">
          <div className="card col-md-6">
            <form>
              <div className="mb-3">
                <label for="email" className="form-label">
                  Email:
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  placeholder="Enter your email"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label for="password" className="form-label">
                  Password:
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  placeholder="Enter your password"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <span>
                <div>
                  <button
                    style={{ width: "100%" }}
                    type="submit"
                    className="btn btn-primary"
                    onClick={handleSubmit}
                  >
                    Login
                  </button>
                </div>
                <div>
                  <button
                    type="reset"
                    style={{ width: "100%", marginTop: "10px" }}
                    className="btn btn-secondary"
                  >
                    cancel
                  </button>
                </div>
              </span>
            </form>
            {/* <div className="mt-3 text-center">or</div> */}
            {/* <button onClick={google_signin} className="btn btn-primary ">
              Google
            </button> */}
            <span className="text-center" style={{ margin: "20px" }}>
              New user?
              <Link to={"/login"} style={{ color: "blue" }}>
                SignUp
              </Link>
            </span>
            <div style={{ textAlign: "center", fontWeight: "500" }}>
              <p>Email:arun@gmail.com</p>
              <p>password:123456</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Auth;
