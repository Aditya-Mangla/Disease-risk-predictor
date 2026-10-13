import React, { useState } from "react";
import { Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import {
  isLoggedIn,
  getCurrentUser,
  logout,
  registerUser,
  loginUser,
} from "./auth";
import { DISEASE_API_URL, sendBackendRequest, extractResult } from "./api";

const symptoms = [
  "chest_pain",
  "breathlessness",
  "sweating",
  "fast_heart_rate",
  "fatigue",
  "dizziness",
  "increased_appetite",
  "obesity",
  "irritability",
  "polyuria",
  "watering_from_eyes",
  "chills",
  "continuous_sneezing",
  "joint_pain",
  "stomach_pain",
  "muscle_wasting",
  "weight_gain",
  "weight_loss",
  "lethargy",
  "irregular_sugar_level",
  "high_fever",
  "dehydration",
  "nausea",
  "malaise",
  "blurred_and_distorted_vision",
  "runny_nose",
  "muscle_weakness",
  "unsteadiness",
  "bladder_discomfort",
  "muscle_pain",
  "family_history",
  "vomiting",
  "anxiety",
  "restlessness",
  "cough",
  "sunken_eyes",
  "sweating",
  "diarrhoea",
  "loss_of_appetite",
  "throat_irritation",
  "redness_of_eyes",
  "congestion",
  "weakness_in_limbs",
  "visual_disturbances",
];
const perPage = 12,
  totalPages = Math.ceil(symptoms.length / perPage);

function Protected({ children }) {
  return isLoggedIn() ? children : <Navigate to="/login" replace />;
}
function Logo() {
  return (
    <div className="logo">
      <div className="logo-icon">
        <i className="fa-solid fa-shield-heart" />
      </div>
      <span>
        Disease <strong>Risk</strong>
      </span>
    </div>
  );
}

function Home() {
  const nav = useNavigate();
  const [assessment, setAssessment] = useState(false);
  const user = isLoggedIn();
  const start = () => (user ? setAssessment(true) : nav("/login"));
  return (
    <>
      <header className="navbar">
        <Logo />
        <nav className="nav-links">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#how-it-works">How It Works</a>
          {!user ? (
            <div id="authButtons">
              <Link to="/login" className="login-link">
                Login
              </Link>
              <Link to="/register" className="register-btn">
                Register
              </Link>
            </div>
          ) : (
            <div id="userMenu" className="user-menu">
              <button onClick={() => nav("/dashboard")}>
                <i className="fa-solid fa-user" /> Dashboard
              </button>
              <button
                onClick={async () => {
                  await logout();
                  window.location.reload();
                }}
              >
                Logout
              </button>
            </div>
          )}
        </nav>
      </header>
      <main id="home">
        <section className="hero">
          <div className="hero-content">
            <div className="hero-badge">
              <i className="fa-solid fa-shield-heart" />
              AI-Powered Health Assessment
            </div>
            <h1>
              Understand Your <span>Health Risk</span>
            </h1>
            <p>
              Check your symptoms and get an AI-powered disease prediction.
              Registered users can also check their estimated health risk.
            </p>
            <button className="primary-btn" onClick={start}>
              Start Health Assessment <i className="fa-solid fa-arrow-right" />
            </button>
          </div>
          <div className="hero-illustration">
            <div className="hero-circle" />
            <div className="hero-shield">
              <i className="fa-solid fa-shield-heart" />
            </div>
            <div className="floating-card card-one">
              <i className="fa-solid fa-heart-pulse" />
              <span>Health Check</span>
            </div>
            <div className="floating-card card-two">
              <i className="fa-solid fa-check" />
              <span>AI Analysis</span>
            </div>
          </div>
        </section>
        <section className="info-section" id="about">
          <div className="section-heading">
            <span>ABOUT</span>
            <h2>
              Your Health, <strong>Our Priority</strong>
            </h2>
            <p>
              Disease Risk helps you understand possible health conditions based
              on the symptoms you provide.
            </p>
          </div>
          <div className="feature-grid">
            <Feature icon="brain" title="AI Prediction">
              Analyze your symptoms and receive a predicted disease from the
              backend AI model.
            </Feature>
            <Feature icon="lock" title="Secure Access">
              Disease risk information is available only to registered and
              logged-in users.
            </Feature>
            <Feature icon="clock-rotate-left" title="Assessment History">
              Logged-in users can view their previous disease predictions and
              risk assessments.
            </Feature>
          </div>
        </section>
        <section className="how-section" id="how-it-works">
          <div className="section-heading">
            <span>PROCESS</span>
            <h2>
              How It <strong>Works</strong>
            </h2>
          </div>
          <div className="steps-grid">
            <Step n="1" t="Enter Symptoms">
              Answer questions about your current symptoms.
            </Step>
            <Step n="2" t="Get Prediction">
              Our backend analyzes your symptoms and predicts a possible
              disease.
            </Step>
            <Step n="3" t="Check Your Risk">
              Registered users can request their estimated disease risk.
            </Step>
            <Step n="4" t="View History">
              Your previous assessments are available from your dashboard.
            </Step>
          </div>
        </section>
      </main>
      {assessment && <Assessment onClose={() => setAssessment(false)} />}
      <footer>
        <p>© 2026 Disease Risk. All rights reserved.</p>
      </footer>
    </>
  );
}
function Feature({ icon, title, children }) {
  return (
    <div className="feature-card">
      <div className="feature-icon">
        <i className={`fa-solid fa-${icon}`} />
      </div>
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}
function Step({ n, t, children }) {
  return (
    <div className="process-card">
      <div className="process-number">{n}</div>
      <h3>{t}</h3>
      <p>{children}</p>
    </div>
  );
}

function Assessment({ onClose }) {
  const nav = useNavigate();
  const [page, setPage] = useState(1);
  const [answers, setAnswers] = useState(() =>
    Array(symptoms.length).fill(null),
  );
  const [message, setMessage] = useState("");
  const [state, setState] = useState("form");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const start = (page - 1) * perPage,
    end = Math.min(start + perPage, symptoms.length),
    complete = answers.slice(start, end).every((v) => v !== null);
  const choose = (i, v) =>
    setAnswers((a) => {
      const n = [...a];
      n[i] = v;
      return n;
    });
  async function finish() {
    if (!complete) {
      setMessage("Please answer all symptoms before continuing.");
      return;
    }
    if (!isLoggedIn()) {
      nav("/login");
      return;
    }
    const payload = {
      symptoms: Object.fromEntries(symptoms.map((s, i) => [s, answers[i]])),
      answers,
      symptomNames: symptoms,
      user: getCurrentUser(),
    };
    setState("loading");
    try {
      const data = await sendBackendRequest(DISEASE_API_URL, payload);
      const parsed = extractResult(data);
      if (!parsed) throw new Error("Backend returned no result.");
      const historyKey =
        "diseaseRiskHistory_" +
        (getCurrentUser()?.email || getCurrentUser()?.username || "user");
      let history = [];
      try {
        history = JSON.parse(localStorage.getItem(historyKey)) || [];
      } catch {}
      history.unshift({
        disease: parsed.disease || "-",
        riskPercentage: parsed.percentage ?? null,
        riskLevel: parsed.level || "-",
        date: new Date().toLocaleString(),
      });
      localStorage.setItem(historyKey, JSON.stringify(history));
      setResult(parsed);
      setState("result");
    } catch (e) {
      setError(e.message || "No response was received from the backend.");
      setState("error");
    }
  }
  if (state === "loading")
    return (
      <StateOverlay>
        <Loading message="Finding your possible disease..." />
      </StateOverlay>
    );
  if (state === "error")
    return (
      <StateOverlay>
        <ErrorPage
          message={error}
          onRetry={() => setState("form")}
          onHome={onClose}
        />
      </StateOverlay>
    );
  if (state === "result")
    return (
      <StateOverlay>
        <BackendResult
          result={result}
          onHome={onClose}
          onDashboard={() => nav("/dashboard")}
        />
      </StateOverlay>
    );
  return (
    <div className="assessment-overlay">
      <div className="assessment-modal">
        <div className="assessment-header">
          <div>
            <span className="assessment-label">HEALTH ASSESSMENT</span>
            <h2>Tell Us About Your Symptoms</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="assessment-progress">
          <div className="progress-info">
            <span>
              Page {page} of {totalPages}
            </span>
            <span>
              Questions {start + 1}-{end}
            </span>
          </div>
          <div className="progress-track">
            <div style={{ width: `${(page / totalPages) * 100}%` }} />
          </div>
        </div>
        <div className="assessment-message">{message}</div>
        <div className="symptom-list">
          {symptoms.slice(start, end).map((s, k) => {
            const i = start + k;
            return (
              <div className="symptom-card" key={`${s}-${i}`}>
                <div className="symptom-question">
                  {i + 1}. Do you have {s}?
                </div>
                <div className="answer-buttons">
                  <button
                    className={`answer-btn yes ${answers[i] === true ? "selected" : ""}`}
                    onClick={() => choose(i, true)}
                  >
                    Yes
                  </button>
                  <button
                    className={`answer-btn no ${answers[i] === false ? "selected" : ""}`}
                    onClick={() => choose(i, false)}
                  >
                    No
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="assessment-navigation">
          <button
            className="secondary-btn"
            disabled={page === 1}
            onClick={() => {
              setPage((p) => p - 1);
              setMessage("");
            }}
          >
            <i className="fa-solid fa-arrow-left" /> Back
          </button>
          <span>
            {page} / {totalPages}
          </span>
          {page < totalPages ? (
            <button
              className="primary-small-btn"
              onClick={() =>
                complete
                  ? (setPage((p) => p + 1), setMessage(""))
                  : setMessage("Please answer all symptoms on this page.")
              }
            >
              Next <i className="fa-solid fa-arrow-right" />
            </button>
          ) : (
            <button className="primary-small-btn" onClick={finish}>
              Check My Disease <i className="fa-solid fa-stethoscope" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
function StateOverlay({ children }) {
  return <div className="app-state-overlay">{children}</div>;
}
function Loading({ message }) {
  return (
    <div>
      <header className="loading-navbar">
        <Logo />
      </header>
      <main className="loading-main">
        <section className="loading-card">
          <div className="loading-illustration">
            <div className="loading-bg" />
            <div className="loading-shield">+</div>
            <div className="loading-clipboard">
              <div className="loading-clip" />
              <div className="loading-title" />
              <div className="loading-line" />
              <div className="loading-line short" />
              <div className="loading-check">
                ✓<span />
              </div>
              <div className="loading-check">
                ✓<span />
              </div>
              <div className="loading-check">
                ✓<span />
              </div>
            </div>
            <div className="loading-heart">
              <i className="fa-solid fa-heart-pulse" />
            </div>
          </div>
          <div className="loader" />
          <h1>
            Analyzing Your <span>Health Data</span>
          </h1>
          <p className="loading-description">
            {message}
            <br />
            Please wait while we process your information.
          </p>
          <div className="loading-progress">
            <div className="loading-progress-line" />
            <div className="loading-step">
              <div className="loading-step-circle completed">✓</div>
              <p>Checking health data</p>
            </div>
            <div className="loading-step">
              <div className="loading-step-circle current">2</div>
              <p>Analyzing prediction</p>
            </div>
            <div className="loading-step">
              <div className="loading-step-circle">3</div>
              <p>Preparing results</p>
            </div>
          </div>
          <div className="loading-security">
            <i className="fa-solid fa-shield" />
            <div>
              <h3>Your information is secure</h3>
              <p>Your information is processed securely and privately.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
function BackendResult({ result, onHome, onDashboard }) {
  return (
    <div className="result-page">
      <div className="final-result-card">
        <div className="result-icon">
          <i className="fa-solid fa-stethoscope" />
        </div>
        <span className="result-label">BACKEND RESPONSE</span>
        <h1>{result.disease ? "Possible Disease" : "Assessment Result"}</h1>
        {result.disease && (
          <div className="final-disease">{result.disease}</div>
        )}
        {result.percentage !== null && result.percentage !== undefined && (
          <div className="risk-circle">
            <div>
              <strong>{result.percentage}%</strong>
              <span>Estimated Risk</span>
            </div>
          </div>
        )}
        {result.level && <div className="risk-level">{result.level}</div>}
        {!result.disease && !result.percentage && !result.level && (
          <pre style={{ textAlign: "left", whiteSpace: "pre-wrap" }}>
            {JSON.stringify(result.raw, null, 2)}
          </pre>
        )}
        <p className="result-description">
          This result was returned by your backend based on the information
          provided during the assessment.
        </p>
        <div className="final-buttons">
          <button className="result-primary-btn" onClick={onDashboard}>
            <i className="fa-solid fa-chart-pie" /> View Dashboard
          </button>
          <button className="result-secondary-btn" onClick={onHome}>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
function ErrorPage({ message, onRetry, onHome }) {
  return (
    <main className="error-main">
      <section className="error-card">
        <div className="error-illustration">
          <div className="error-shield">!</div>
          <div className="error-clipboard">
            <div className="error-clip" />
            <div className="error-long" />
            <div className="error-row">
              ×<span />
            </div>
            <div className="error-row">
              ×<span />
            </div>
            <div className="error-row">
              ×<span />
            </div>
          </div>
          <div className="error-heart">
            <i className="fa-solid fa-heart-pulse" />
          </div>
        </div>
        <h1>
          Something Went <span>Wrong</span>
        </h1>
        <p className="error-description">{message}</p>
        <div className="error-info">
          <div className="error-info-icon">!</div>
          <div>
            <h3>Backend response unavailable</h3>
            <p>
              The assessment could not be completed because the backend did not
              return a valid response.
            </p>
          </div>
        </div>
        <div className="error-buttons">
          <button className="error-try" onClick={onRetry}>
            Try Again
          </button>
          <button className="error-home" onClick={onHome}>
            Back to Home
          </button>
        </div>
      </section>
    </main>
  );
}

function AuthLayout({ children }) {
  const nav = useNavigate();
  return (
    <>
      <header className="navbar">
        <Link to="/" className="logo">
          <span className="logo-icon">
            <i className="fa-solid fa-shield-heart" />
          </span>
          <span>
            Disease <strong>Risk</strong>
          </span>
        </Link>
        <nav>
          <Link to="/">Home</Link>
          <a href="#">About</a>
          <button className="back-home" onClick={() => nav("/")}>
            <i className="fa-solid fa-arrow-left" /> Back to Home
          </button>
        </nav>
      </header>
      {children}
      <footer>© 2026 Disease Risk. All rights reserved.</footer>
    </>
  );
}
function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    try {
      await loginUser(email, password);
      nav("/");
    } catch (error) {
      setErr(error.message || "Invalid email or password. Please check your details or create an account.");
    }
  };
  return (
    <AuthLayout>
      <main className="auth-page">
        <AuthInfo
          title={
            <>
              Understand Your <span>Health Risk</span>
            </>
          }
          desc="AI-powered risk assessment that helps you take control of your health and live a better life."
        />
        <section className="auth-card">
          <div className="form-header">
            <h2>Welcome Back! 👋</h2>
            <p>
              Login to access your personalized health dashboard, assessment
              history, and risk insights.
            </p>
          </div>
          <form onSubmit={submit}>
            <Field
              label="Email"
              icon="envelope"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="Enter your email"
            />
            <Field
              label="Password"
              icon="lock"
              type={show ? "text" : "password"}
              value={password}
              onChange={setPassword}
              placeholder="Enter your password"
              toggle={() => setShow(!show)}
              show={show}
            />
            {err && (
              <p style={{ color: "#dc2626", fontSize: 12, marginBottom: 10 }}>
                {err}
              </p>
            )}
            <div className="forgot-password">
              <a href="#">Forgot Password?</a>
            </div>
            <button type="submit" className="primary-button">
              <i className="fa-solid fa-lock" /> Login
            </button>
            <div className="divider">
              <span>or</span>
            </div>
            <button type="button" className="google-button">
              <span className="google-icon">G</span> Continue with Google
            </button>
            <div className="login-notice">
              <div className="notice-icon">
                <i className="fa-solid fa-shield-heart" />
              </div>
              <div>
                <strong>Login to check your risk</strong>
                <p>
                  Create your health profile to unlock your personalized risk
                  assessment.
                </p>
              </div>
            </div>
            <p className="switch-page">
              Don't have an account?{" "}
              <Link to="/register">Create an Account</Link>
            </p>
          </form>
        </section>
      </main>
    </AuthLayout>
  );
}
function Register() {
  const nav = useNavigate();
  const [name, setName] = useState(""),
    [email, setEmail] = useState(""),
    [mobileNumber, setMobileNumber] = useState(""),
    [password, setPassword] = useState(""),
    [confirm, setConfirm] = useState(""),
    [show, setShow] = useState(false),
    [err, setErr] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !mobileNumber.trim()) {
      setErr("Full name, email, and mobile number are required.");
      return;
    }
    if (password !== confirm) {
      setErr("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setErr("Password must contain at least 8 characters.");
      return;
    }
    try {
      await registerUser({ name, email, mobileNumber, password });
      nav("/");
    } catch (error) {
      setErr(error.message || "Registration failed. Please try again.");
    }
  };
  return (
    <AuthLayout>
      <main className="auth-page">
        <AuthInfo
          title={
            <>
              Start Your Journey <span>to Better Health</span>
            </>
          }
          desc="Create an account to save your assessments, view your history, and monitor your risk insights."
          register
        />
        <section className="auth-card register-card">
          <div className="form-header">
            <h2>Create Your Account</h2>
            <p>
              Create an account to save your assessments and unlock personalized
              risk insights.
            </p>
          </div>
          <form onSubmit={submit}>
            <Field
              label="Full Name"
              icon="user"
              value={name}
              onChange={setName}
              placeholder="Enter your full name"
            />
            <Field
              label="Email"
              icon="envelope"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="Enter your email"
            />
            <Field
              label="Mobile Number"
              icon="phone"
              type="tel"
              value={mobileNumber}
              onChange={setMobileNumber}
              placeholder="Enter your mobile number"
            />
            <Field
              label="Password"
              icon="lock"
              type={show ? "text" : "password"}
              value={password}
              onChange={setPassword}
              placeholder="Create a password"
              toggle={() => setShow(!show)}
              show={show}
            />
            <Field
              label="Confirm Password"
              icon="lock"
              type={show ? "text" : "password"}
              value={confirm}
              onChange={setConfirm}
              placeholder="Confirm your password"
            />
            {err && (
              <p style={{ color: "#dc2626", fontSize: 12, marginBottom: 10 }}>
                {err}
              </p>
            )}
            <label className="terms">
              <input type="checkbox" required />
              <span>
                I agree to the <a href="#">Terms of Service</a> and{" "}
                <a href="#">Privacy Policy</a>
              </span>
            </label>
            <button type="submit" className="primary-button">
              <i className="fa-solid fa-user-plus" /> Create Account
            </button>
            <div className="divider">
              <span>or</span>
            </div>
            <button type="button" className="google-button">
              <span className="google-icon">G</span> Sign up with Google
            </button>
            <p className="switch-page">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </form>
        </section>
      </main>
    </AuthLayout>
  );
}
function Field({
  label,
  icon,
  type = "text",
  value,
  onChange,
  placeholder,
  toggle,
  show,
}) {
  return (
    <div className="input-group">
      <label>{label}</label>
      <div className="input-wrapper">
        <i
          className={`fa-${icon === "envelope" || icon === "user" ? "regular" : "solid"} fa-${icon}`}
        />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required
        />
        {toggle && (
          <button type="button" className="password-toggle" onClick={toggle}>
            <i className={`fa-regular fa-eye${show ? "" : "-slash"}`} />
          </button>
        )}
      </div>
    </div>
  );
}
function AuthInfo({ title, desc, register }) {
  return (
    <section className="auth-info">
      <div className="medical-image">
        <div className="shield">
          <i className="fa-solid fa-plus" />
        </div>
        <div className="report">
          <div className="report-header" />
          <div className="report-line" />
          <div className="report-line short" />
          <div className="check-row">
            <i className="fa-solid fa-check" />
            <span />
          </div>
          <div className="check-row">
            <i className="fa-solid fa-check" />
            <span />
          </div>
          <div className="check-row">
            <i className="fa-solid fa-check" />
            <span />
          </div>
        </div>
        <div className="heart">
          <i className="fa-solid fa-heart-pulse" />
        </div>
      </div>
      <h1>{title}</h1>
      <p className="info-description">{desc}</p>
      <InfoFeature
        icon={register ? "file-medical" : "chart-column"}
        title={register ? "Save Assessments" : "Accurate Risk Prediction"}
        text={
          register
            ? "Store your health assessments securely."
            : "Advanced AI analyzes your data for meaningful insights."
        }
      />
      <InfoFeature
        icon={register ? "chart-line" : "lock"}
        title={register ? "Track Your Risk" : "Secure & Confidential"}
        text={
          register
            ? "Monitor your risk trends over time."
            : "Your health information is protected and secure."
        }
      />
      <InfoFeature
        icon={register ? "user-shield" : "clock"}
        title={register ? "Personalized Insights" : "Track Your Progress"}
        text={
          register
            ? "Get useful insights based on your assessments."
            : "View your assessment history and monitor your risk."
        }
      />
      <div className="priority-box">
        <div className="priority-icon">
          <i className="fa-solid fa-shield-heart" />
        </div>
        <div>
          <h4>Your Health, Our Priority</h4>
          <p>
            We are committed to providing secure, reliable, and meaningful
            health insights.
          </p>
        </div>
      </div>
    </section>
  );
}
function InfoFeature({ icon, title, text }) {
  return (
    <div className="feature">
      <div className="feature-icon">
        <i className={`fa-solid fa-${icon}`} />
      </div>
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </div>
  );
}

function Dashboard() {
  const nav = useNavigate();
  const user = getCurrentUser();
  const key = "diseaseRiskHistory_" + (user?.email || user?.username || "user");
  let history = [];
  try {
    history = JSON.parse(localStorage.getItem(key)) || [];
  } catch {}
  const latest = history[0];
  return (
    <>
      <header className="dashboard-navbar">
        <Logo />
        <nav>
          <Link to="/">Home</Link>
          <button
            onClick={async () => {
              await logout();
              nav("/");
            }}
          >
            Logout
          </button>
        </nav>
      </header>
      <main className="dashboard-container">
        <section className="welcome-section">
          <div>
            <span>DASHBOARD</span>
            <h1>Welcome back, {user?.fullName || user?.name || "User"}!</h1>
            <p>
              View your health assessment history and previous risk results.
            </p>
          </div>
          <button className="new-assessment-btn" onClick={() => nav("/")}>
            <i className="fa-solid fa-plus" /> New Assessment
          </button>
        </section>
        <section className="stats-grid">
          <Stat
            icon="clipboard-check"
            label="Total Assessments"
            value={history.length}
          />
          <Stat
            icon="virus"
            label="Latest Disease"
            value={latest?.disease || "-"}
          />
          <Stat
            icon="heart-pulse"
            label="Latest Risk"
            value={
              latest?.riskPercentage != null
                ? `${latest.riskPercentage}%`
                : latest?.riskLevel || "-"
            }
          />
        </section>
        <section className="profile-card">
          <div className="profile-avatar">
            <i className="fa-solid fa-user" />
          </div>
          <div>
            <h2>{user?.fullName || user?.name || "User"}</h2>
            <p>{user?.email || "user@email.com"}</p>
          </div>
        </section>
        <section className="history-section">
          <div className="section-title">
            <div>
              <span>HISTORY</span>
              <h2>Your Assessments</h2>
            </div>
          </div>
          <div className="history-container">
            {history.length === 0 ? (
              <div className="empty-history">
                <i
                  className="fa-solid fa-clipboard"
                  style={{ fontSize: 35, marginBottom: 15 }}
                />
                <h3>No Assessments Yet</h3>
                <p style={{ marginTop: 8 }}>
                  Complete your first health assessment to see your history
                  here.
                </p>
              </div>
            ) : (
              history.map((item, i) => (
                <div className="history-card" key={i}>
                  <div>
                    <small>DISEASE</small>
                    <strong>{item.disease || "-"}</strong>
                  </div>
                  <div>
                    <small>RISK</small>
                    <strong className="history-risk">
                      {item.riskPercentage != null
                        ? `${item.riskPercentage}%`
                        : item.riskLevel || "-"}
                    </strong>
                  </div>
                  <div>
                    <small>RISK LEVEL</small>
                    <strong>{item.riskLevel || "-"}</strong>
                  </div>
                  <div>
                    <small>DATE</small>
                    <strong>{item.date || "-"}</strong>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </>
  );
}
function Stat({ icon, label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">
        <i className={`fa-solid fa-${icon}`} />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <Protected>
            <Dashboard />
          </Protected>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
