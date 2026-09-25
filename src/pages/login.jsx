import "../styles/login.css";
import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";
import feather from "feather-icons";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";

export default function Login() {
  const [isActive, setIsActive] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const navigate = useNavigate();
  const toggleRef = useRef(null);
  const illustrationLeft = useRef(null);
  const illustrationRight = useRef(null);

  // Toast
  const showToast = (message, duration = 3000) => {
    setToast(message);
    setTimeout(() => setToast(""), duration);
  };

  useEffect(() => {
    feather.replace();
    gsap.from(".containe", { opacity: 0, duration: 1, y: 20, ease: "power2.out" });
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isActive) {
      gsap.to(illustrationLeft.current, { opacity: 0, duration: 0.5 });
      gsap.to(illustrationRight.current, { opacity: 1, duration: 0.8, delay: 0.3 });
    } else {
      gsap.to(illustrationRight.current, { opacity: 0, duration: 0.5 });
      gsap.to(illustrationLeft.current, { opacity: 1, duration: 0.8, delay: 0.3 });
    }
  }, [isActive]);

  const handleInputChange = (type, field, value) => {
    const newErrors = { ...errors };
    if (field === "email" && !value.includes("@")) newErrors.email = "Must include '@'";
    else if (field === "password" && value.length < 6)
      newErrors.password = "Min 6 characters required";
    else delete newErrors[field];
    setErrors(newErrors);
  };

  // === FIREBASE LOGIC ===
  const handleSignup = async () => {
    const form = document.forms["signup"];
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value.trim();

    if (!termsAccepted) return showToast("Please accept Terms & Conditions first");
    if (!email || !password || !name) return showToast("Please fill all fields");

    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(user);
      showToast("Verification email sent. Check your inbox!");
      form.reset();
      setIsActive(false);
    } catch (err) {
  console.error("Auth Error:", err.code);

  const cleanMessage = err.code.includes("auth/invalid-credential")
    ? "Invalid details. Please try again."
    : err.code.includes("auth/email-already-in-use")
    ? "This email is already registered."
    : err.code.includes("auth/invalid-email")
    ? "Invalid email format."
    : err.code.includes("auth/weak-password")
    ? "Password is too weak. Try a stronger one."
    : err.code.includes("auth/user-not-found")
    ? "Account not found. Please sign up first."
    : err.code.includes("auth/missing-password")
    ? "Please enter your password."
    : "Something went wrong. Try again.";

  showToast(cleanMessage);
}
  };

  const handleLogin = async () => {
    const form = document.forms["signin"];
    const email = form.email.value.trim();
    const password = form.password.value.trim();

    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      if (user.emailVerified) {
        showToast("Login successful!");
        navigate("/dashboard");
      } else {
        showToast("Please verify your email before logging in.");
        await signOut(auth);
      }
    } catch (err) {
  console.error("Auth Error:", err.code);

  const cleanMessage = err.code.includes("auth/invalid-credential")
    ? "Invalid details. Please try again."
    : err.code.includes("auth/email-already-in-use")
    ? "This email is already registered."
    : err.code.includes("auth/invalid-email")
    ? "Invalid email format."
    : err.code.includes("auth/weak-password")
    ? "Password is too weak. Try a stronger one."
    : err.code.includes("auth/user-not-found")
    ? "Account not found. Please sign up first."
    : err.code.includes("auth/missing-password")
    ? "Please enter your password."
    : "Something went wrong. Try again.";

  showToast(cleanMessage);
}
  };

  const handleForgotPassword = async () => {
    const form = document.forms["forgot"];
    const email = form.email.value.trim();
    if (!email) return showToast("Enter your email address");

    try {
      await sendPasswordResetEmail(auth, email);
      showToast("Password reset email sent! Check your inbox.");
      setIsForgotPassword(false);
    } catch (err) {
  console.error("Auth Error:", err.code);

  const cleanMessage = err.code.includes("auth/invalid-credential")
    ? "Invalid details. Please try again."
    : err.code.includes("auth/email-already-in-use")
    ? "This email is already registered."
    : err.code.includes("auth/invalid-email")
    ? "Invalid email format."
    : err.code.includes("auth/weak-password")
    ? "Password is too weak. Try a stronger one."
    : err.code.includes("auth/user-not-found")
    ? "Account not found. Please sign up first."
    : err.code.includes("auth/missing-password")
    ? "Please enter your password."
    : "Something went wrong. Try again.";

  showToast(cleanMessage);
}
  };

  return (
    <div className="login-page">
      <div className={`containe ${isActive ? "active" : ""}`} ref={toggleRef}>
        {toast && <div className="toast">{toast}</div>}

        {/* === Forgot Password === */}
        {isForgotPassword ? (
          <div className="form-container sign-in">
            <form name="forgot" onSubmit={(e) => e.preventDefault()}>
              <h1>Forgot Password</h1>
              <span>Enter your registered email to reset password</span>
              <input type="email" name="email" placeholder="Email" />
              <button onClick={handleForgotPassword}>Send Reset Link</button>
              <p className="mobile-switch">
                <button
                  type="button"
                  className="switch-btn"
                  onClick={() => setIsForgotPassword(false)}
                >
                  Back to Login
                </button>
              </p>
            </form>
          </div>
        ) : (
          <>
            {/* === Sign Up === */}
            <div className="form-container sign-up">
              <form name="signup" onSubmit={(e) => e.preventDefault()}>
                <h1>Create Account</h1>
                <span>or use your email for registration</span>

                <input type="text" name="name" placeholder="Name" />
                <input type="email" name="email" placeholder="Email"  onChange={(e) => handleInputChange("signup", "email", e.target.value)}
                />{errors.email && <p className="error">{errors.email}</p>}

                <input type="password" name="password" placeholder="Password" onChange={(e) => handleInputChange("signup", "password", e.target.value)}
                />{errors.password && <p className="error">{errors.password}</p>}

                <label className="terms">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={() => setTermsAccepted(!termsAccepted)}
                  />{" "}
                  I agree to the{" "}
                  <a href="/terms" target="_blank" rel="noopener noreferrer">
                    Terms & Conditions
                  </a>
                </label>

                <button onClick={handleSignup}>Sign Up</button>

                {isMobile && (
                  <p className="mobile-switch">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setIsActive(false)}
                      className="switch-btn"
                    >
                      Sign In
                    </button>
                  </p>
                )}
              </form>
            </div>

            {/* === Sign In === */}
            <div className="form-container sign-in">
              <form name="signin" onSubmit={(e) => e.preventDefault()}>
                <h1>Sign In</h1>
                <span>or use your email password</span>

                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  onChange={(e) => handleInputChange("signin", "email", e.target.value)}
                />
                {errors.email && <p className="error">{errors.email}</p>}

                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  onChange={(e) => handleInputChange("signin", "password", e.target.value)}
                />
                {errors.password && <p className="error">{errors.password}</p>}

                <button onClick={handleLogin}>Sign In</button>

                <p className="mobile-switch">
                  <button
                    type="button"
                    className="switch-btn"
                    onClick={() => setIsForgotPassword(true)}
                  >
                    Forgot Password?
                  </button>
                </p>

                {isMobile && (
                  <p className="mobile-switch">
                    Don’t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setIsActive(true)}
                      className="switch-btn"
                    >
                      Sign Up
                    </button>
                  </p>
                )}
              </form>
            </div>
          </>
        )}

        {/* === Toggle Panels === */}
        {!isForgotPassword && (
          <div className="toggle-container">
            <div className="toggle">
              <div className="toggle-panel toggle-left">
                <h1>Welcome Back!</h1>
                <p>Enter your credentials to continue.</p>
                <button className="hidden" onClick={() => setIsActive(false)}>
                  Sign In
                </button>
                <div ref={illustrationLeft} className="illustration">
                  <img src="./assets/login.svg" alt="login" width="120" />
                </div>
              </div>

              <div className="toggle-panel toggle-right">
                <h1>Hello, Friend!</h1>
                <p>Don’t have an account? Register with your details.</p>
                <button className="hidden" onClick={() => setIsActive(true)}>
                  Sign Up
                </button>
                <div
                  ref={illustrationRight}
                  className="illustration"
                  style={{ opacity: 0 }}
                >
                  <img src="./assets/signup.svg" alt="signup" width="120" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
