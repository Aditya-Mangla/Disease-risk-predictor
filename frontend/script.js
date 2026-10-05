/* =====================================================
   CONFIGURATION
===================================================== */

/*
   These are PLACEHOLDER backend URLs.

   Later, when you create your Python backend,
   replace them with your actual URLs.
*/

// These endpoints are REQUIRED. The frontend never invents a prediction.
const DISEASE_API_URL =
    "http://127.0.0.1:5000/predict-disease";

const RISK_API_URL =
    "http://127.0.0.1:5000/predict-risk";


const BACKEND_TIMEOUT = 15000;

// Backend-only mode: there is NO demo/fallback prediction in this project.
// A disease/risk result is shown only when the real backend returns it.
const BACKEND_ONLY = true;


/* =====================================================
   SYMPTOMS
===================================================== */

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
    "visual_disturbances"
];


const symptomsPerPage = 12;

const totalPages =
    Math.ceil(symptoms.length / symptomsPerPage);


/* =====================================================
   STATE
===================================================== */

let currentPage = 1;

let healthAnswers =
    new Array(symptoms.length).fill(null);

let lastAssessmentPayload = null;

let predictedDisease = null;

let isCheckingRisk = false;


/* =====================================================
   DOM
===================================================== */

const assessmentOverlay =
    document.getElementById("assessmentOverlay");

const symptomList =
    document.getElementById("symptomList");

const assessmentMessage =
    document.getElementById("assessmentMessage");

const questionRange =
    document.getElementById("questionRange");

const pageText =
    document.getElementById("pageText");

const progressBar =
    document.getElementById("progressBar");

const backButton =
    document.getElementById("backButton");

const nextButton =
    document.getElementById("nextButton");

const finishButton =
    document.getElementById("finishButton");

const smallPageIndicator =
    document.getElementById("smallPageIndicator");

const closeAssessment =
    document.getElementById("closeAssessment");

const startAssessmentBtn =
    document.getElementById("startAssessmentBtn");

const appStateOverlay =
    document.getElementById("appStateOverlay");

const appStateContent =
    document.getElementById("appStateContent");


/* =====================================================
   LOGIN SYSTEM
===================================================== */

function isLoggedIn() {

    return localStorage.getItem("diseaseRiskLoggedIn")
        === "true";
}


function getCurrentUser() {

    try {

        return JSON.parse(
            localStorage.getItem("diseaseRiskUser")
        ) || null;

    } catch {

        return null;

    }
}


/* =====================================================
   AUTH UI
===================================================== */

function updateAuthUI() {

    const authButtons =
        document.getElementById("authButtons");

    const userMenu =
        document.getElementById("userMenu");

    if (!authButtons || !userMenu) return;


    if (isLoggedIn()) {

        authButtons.classList.add("hidden");

        userMenu.classList.remove("hidden");

    } else {

        authButtons.classList.remove("hidden");

        userMenu.classList.add("hidden");

    }
}


/* =====================================================
   LOGOUT
===================================================== */

const logoutBtn =
    document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener("click", () => {

        localStorage.removeItem(
            "diseaseRiskLoggedIn"
        );

        localStorage.removeItem(
            "diseaseRiskUser"
        );

        window.location.reload();

    });

}


/* =====================================================
   DASHBOARD
===================================================== */

const dashboardBtn =
    document.getElementById("dashboardBtn");

if (dashboardBtn) {

    dashboardBtn.addEventListener("click", () => {

        window.location.href =
            "dashboard.html";

    });

}


/* =====================================================
   OPEN ASSESSMENT
===================================================== */

startAssessmentBtn.addEventListener(
    "click",
    openAssessment
);


function openAssessment() {

    currentPage = 1;

    healthAnswers =
        new Array(symptoms.length).fill(null);

    assessmentMessage.textContent = "";

    assessmentOverlay.classList.remove(
        "hidden"
    );

    document.body.style.overflow = "hidden";

    renderSymptoms();

}


/* =====================================================
   CLOSE ASSESSMENT
===================================================== */

closeAssessment.addEventListener(
    "click",
    closeAssessmentModal
);


function closeAssessmentModal() {

    assessmentOverlay.classList.add(
        "hidden"
    );

    document.body.style.overflow = "";

}


/* =====================================================
   RENDER SYMPTOMS
===================================================== */

function renderSymptoms() {

    symptomList.innerHTML = "";

    const startIndex =
        (currentPage - 1) *
        symptomsPerPage;

    const endIndex =
        Math.min(
            startIndex + symptomsPerPage,
            symptoms.length
        );


    for (
        let i = startIndex;
        i < endIndex;
        i++
    ) {

        const card =
            document.createElement("div");

        card.className =
            "symptom-card";


        const question =
            document.createElement("div");

        question.className =
            "symptom-question";

        question.textContent =
            `${i + 1}. Do you have ${symptoms[i]}?`;


        const buttons =
            document.createElement("div");

        buttons.className =
            "answer-buttons";


        const yesButton =
            document.createElement("button");

        yesButton.type = "button";

        yesButton.className =
            "answer-btn yes";

        yesButton.textContent = "Yes";


        const noButton =
            document.createElement("button");

        noButton.type = "button";

        noButton.className =
            "answer-btn no";

        noButton.textContent = "No";


        if (healthAnswers[i] === true) {

            yesButton.classList.add(
                "selected"
            );

        }

        if (healthAnswers[i] === false) {

            noButton.classList.add(
                "selected"
            );

        }


        yesButton.addEventListener(
            "click",
            () => {

                healthAnswers[i] = true;

                renderSymptoms();

            }
        );


        noButton.addEventListener(
            "click",
            () => {

                healthAnswers[i] = false;

                renderSymptoms();

            }
        );


        buttons.appendChild(yesButton);

        buttons.appendChild(noButton);

        card.appendChild(question);

        card.appendChild(buttons);

        symptomList.appendChild(card);

    }


    updateProgress();

    updateNavigation();

}


/* =====================================================
   PROGRESS
===================================================== */

function updateProgress() {

    const start =
        (currentPage - 1) *
        symptomsPerPage + 1;

    const end =
        Math.min(
            currentPage * symptomsPerPage,
            symptoms.length
        );


    questionRange.textContent =
        `Questions ${start}-${end}`;


    pageText.textContent =
        `Page ${currentPage} of ${totalPages}`;


    smallPageIndicator.textContent =
        `${currentPage} / ${totalPages}`;


    const progress =
        (currentPage / totalPages) * 100;


    progressBar.style.width =
        `${progress}%`;

}


/* =====================================================
   NAVIGATION
===================================================== */

function currentPageComplete() {

    const start =
        (currentPage - 1) *
        symptomsPerPage;

    const end =
        Math.min(
            start + symptomsPerPage,
            symptoms.length
        );


    for (
        let i = start;
        i < end;
        i++
    ) {

        if (healthAnswers[i] === null) {

            return false;

        }

    }

    return true;
}


function updateNavigation() {

    backButton.disabled =
        currentPage === 1;


    if (currentPage === totalPages) {

        nextButton.classList.add(
            "hidden"
        );

        finishButton.classList.remove(
            "hidden"
        );

    } else {

        nextButton.classList.remove(
            "hidden"
        );

        finishButton.classList.add(
            "hidden"
        );

    }

}


/* =====================================================
   NEXT
===================================================== */

nextButton.addEventListener(
    "click",
    nextPage
);


function nextPage() {

    if (!currentPageComplete()) {

        assessmentMessage.textContent =
            "Please answer all symptoms on this page.";

        return;

    }


    assessmentMessage.textContent = "";

    currentPage++;

    renderSymptoms();

}


/* =====================================================
   BACK
===================================================== */

backButton.addEventListener(
    "click",
    previousPage
);


function previousPage() {

    if (currentPage <= 1) return;

    currentPage--;

    assessmentMessage.textContent = "";

    renderSymptoms();

}


/* =====================================================
   FINISH ASSESSMENT
===================================================== */

finishButton.addEventListener(
    "click",
    finishAssessment
);


async function finishAssessment() {

    if (!currentPageComplete()) {

        assessmentMessage.textContent =
            "Please answer all symptoms before continuing.";

        return;

    }


    const payload = {

        symptoms: symptoms.reduce(
            (object, symptom, index) => {

                object[symptom] =
                    healthAnswers[index];

                return object;

            },
            {}
        ),

        answers: healthAnswers,

        symptomNames: symptoms

    };


    lastAssessmentPayload = payload;


    closeAssessmentModal();


    /*
       REQUEST #1

       Disease prediction
    */

    showAnalyzingPage(
        "Finding your possible disease..."
    );


    try {

        const response =
            await sendBackendRequest(
                DISEASE_API_URL,
                payload
            );


        predictedDisease =
            extractDisease(response);


        if (!predictedDisease) {

            throw new Error(
                "Disease prediction was not returned by the backend."
            );

        }


        /*
           Disease found successfully.
        */

        showDiseaseResult(
            predictedDisease
        );


    } catch (error) {

        showErrorPage(
            "No disease prediction was received from the backend. Make sure your backend is running and the disease API URL is correct."
        );

    }

}


/* =====================================================
   BACKEND REQUEST
===================================================== */

async function sendBackendRequest(
    url,
    payload
) {

    const controller =
        new AbortController();


    const timeout =
        setTimeout(
            () => controller.abort(),
            BACKEND_TIMEOUT
        );


    try {

        const response =
            await fetch(
                url,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(payload),

                    signal:
                        controller.signal
                }
            );


        if (!response.ok) {

            throw new Error(
                `Server returned ${response.status}`
            );

        }


        const contentType = response.headers.get("content-type") || "";

        if (!contentType.toLowerCase().includes("application/json")) {

            throw new Error(
                "Backend did not return JSON. Please check the API endpoint."
            );

        }

        const data = await response.json();

        if (!data || typeof data !== "object") {

            throw new Error(
                "Backend returned an invalid response."
            );

        }

        return data;

    } catch (error) {

        if (
            error.name ===
            "AbortError"
        ) {

            throw new Error(
                "Backend timeout"
            );

        }

        if (error instanceof TypeError) {

            throw new Error(
                "Cannot connect to the backend. Start your backend and check the API URL."
            );

        }

        throw error;

    } finally {

        clearTimeout(timeout);

    }

}


/* =====================================================
   EXTRACT DISEASE
===================================================== */

function extractDisease(data) {

    if (!data) return null;


    return (
        data.disease ||
        data.prediction ||
        data.predicted_disease ||
        data.predictedDisease ||
        data.result ||
        null
    );

}


/* =====================================================
   ANALYZING PAGE
===================================================== */

function showAnalyzingPage(message) {

    appStateOverlay.classList.remove(
        "hidden"
    );


    appStateContent.innerHTML = `

        <header class="loading-navbar">

            <div class="loading-logo">

                <div class="loading-logo-icon">
                    <i class="fa-solid fa-shield-heart"></i>
                </div>

                <span>
                    Disease <strong>Risk</strong>
                </span>

            </div>

        </header>


        <main class="loading-main">

            <section class="loading-card">

                <div class="loading-illustration">

                    <div class="loading-bg"></div>

                    <div class="loading-shield">
                        +
                    </div>

                    <div class="loading-clipboard">

                        <div class="loading-clip"></div>

                        <div class="loading-title"></div>

                        <div class="loading-line"></div>

                        <div class="loading-line short"></div>

                        <div class="loading-check">
                            ✓
                            <span></span>
                        </div>

                        <div class="loading-check">
                            ✓
                            <span></span>
                        </div>

                        <div class="loading-check">
                            ✓
                            <span></span>
                        </div>

                    </div>


                    <div class="loading-heart">

                        <i class="fa-solid fa-heart-pulse"></i>

                    </div>

                </div>


                <div class="loader"></div>


                <h1>
                    Analyzing Your
                    <span>Health Data</span>
                </h1>


                <p class="loading-description">
                    ${message}
                    <br>
                    Please wait while we process your information.
                </p>


                <div class="loading-progress">

                    <div class="loading-progress-line"></div>


                    <div class="loading-step">

                        <div class="loading-step-circle completed">
                            ✓
                        </div>

                        <p>Checking health data</p>

                    </div>


                    <div class="loading-step">

                        <div class="loading-step-circle current">
                            2
                        </div>

                        <p>Analyzing prediction</p>

                    </div>


                    <div class="loading-step">

                        <div class="loading-step-circle">
                            3
                        </div>

                        <p>Preparing results</p>

                    </div>

                </div>


                <div class="loading-security">

                    <i class="fa-solid fa-shield"></i>

                    <div>

                        <h3>
                            Your information is secure
                        </h3>

                        <p>
                            Your information is processed securely
                            and privately.
                        </p>

                    </div>

                </div>

            </section>

        </main>

    `;

}


/* =====================================================
   DISEASE RESULT
===================================================== */

function showDiseaseResult(disease) {

    const loggedIn =
        isLoggedIn();


    appStateContent.innerHTML = `

        <div class="result-page">

            <div class="result-card">

                <div class="result-icon">
                    <i class="fa-solid fa-stethoscope"></i>
                </div>


                <span class="result-label">
                    AI PREDICTION
                </span>


                <h1>
                    Possible Disease
                </h1>


                <div class="disease-name">
                    ${escapeHTML(disease)}
                </div>


                <p class="result-description">

                    Based on the symptoms you provided,
                    our AI model predicted the condition above.

                    <br><br>

                    This prediction is not a medical diagnosis.

                </p>


                ${
                    loggedIn

                    ? `

                        <button
                            class="result-primary-btn"
                            id="checkRiskBtn">

                            <i class="fa-solid fa-chart-line"></i>

                            Check My Disease Risk

                        </button>

                    `

                    : `

                        <div class="login-required-box">

                            <i class="fa-solid fa-lock"></i>

                            <div>

                                <h3>
                                    Risk Check Requires Login
                                </h3>

                                <p>
                                    Register or login to check
                                    your disease risk.
                                </p>

                            </div>

                        </div>


                        <div class="result-buttons">

                            <button
                                class="result-primary-btn"
                                id="loginResultBtn">

                                Login to Check Risk

                            </button>


                            <button
                                class="result-secondary-btn"
                                id="homeResultBtn">

                                Back to Home

                            </button>

                        </div>

                    `
                }

            </div>

        </div>

    `;


    if (loggedIn) {

        document
            .getElementById("checkRiskBtn")
            .addEventListener(
                "click",
                checkDiseaseRisk
            );

    } else {

        document
            .getElementById("loginResultBtn")
            .addEventListener(
                "click",
                () => {

                    window.location.href =
                        "login.html";

                }
            );


        document
            .getElementById("homeResultBtn")
            .addEventListener(
                "click",
                closeStateOverlay
            );

    }

}


/* =====================================================
   REQUEST #2 - RISK
===================================================== */

async function checkDiseaseRisk() {

    if (
        isCheckingRisk ||
        !predictedDisease
    ) return;


    if (!isLoggedIn()) {

        window.location.href =
            "login.html";

        return;

    }


    isCheckingRisk = true;


    const user =
        getCurrentUser();


    const payload = {

        user: user,

        disease:
            predictedDisease,

        symptoms:
            lastAssessmentPayload.symptoms,

        answers:
            lastAssessmentPayload.answers,

        symptomNames:
            lastAssessmentPayload.symptomNames

    };


    /*
       REQUEST #2

       Disease risk prediction
    */

    showAnalyzingPage(
        "Calculating your disease risk..."
    );


    try {

        const response =
            await sendBackendRequest(
                RISK_API_URL,
                payload
            );


        const risk =
            extractRisk(response);


        if (!risk) {

            throw new Error(
                "Risk result not returned."
            );

        }


        saveAssessmentHistory(
            predictedDisease,
            risk
        );


        showFinalResult(
            predictedDisease,
            risk
        );


    } catch (error) {

        showErrorPage(
            "No disease risk result was received from the backend. Make sure your risk API is running and returning JSON."
        );

    } finally {

        isCheckingRisk = false;

    }

}


/* =====================================================
   EXTRACT RISK
===================================================== */

function extractRisk(data) {

    if (!data) return null;


    return {

        percentage:
            data.risk_percentage ??
            data.riskPercentage ??
            data.risk_score ??
            data.riskScore ??
            data.percentage ??
            null,

        level:
            data.risk_level ??
            data.riskLevel ??
            data.level ??
            data.risk ??
            null

    };

}


/* =====================================================
   FINAL RESULT
===================================================== */

function showFinalResult(
    disease,
    risk
) {

    appStateContent.innerHTML = `

        <div class="result-page">

            <div class="final-result-card">

                <div class="result-icon">
                    <i class="fa-solid fa-heart-pulse"></i>
                </div>


                <span class="result-label">
                    YOUR HEALTH RISK
                </span>


                <h1>
                    Risk Assessment
                </h1>


                <div class="final-disease">
                    ${escapeHTML(disease)}
                </div>


                <div class="risk-circle">

                    <div>

                        <strong>
                            ${
                                risk.percentage !== null
                                ? escapeHTML(
                                    String(
                                        risk.percentage
                                    )
                                  ) + "%"
                                : "N/A"
                            }
                        </strong>

                        <span>
                            Estimated Risk
                        </span>

                    </div>

                </div>


                <div class="risk-level">

                    ${
                        risk.level
                        ? escapeHTML(
                            String(
                                risk.level
                            )
                          )
                        : "Risk assessment completed"
                    }

                </div>


                <p class="result-description">

                    This result is an AI-generated
                    risk estimate based on the information
                    provided during your assessment.

                    <br><br>

                    It should not replace professional
                    medical advice.

                </p>


                <div class="final-buttons">

                    <button
                        class="result-primary-btn"
                        id="dashboardResultBtn">

                        <i class="fa-solid fa-chart-pie"></i>

                        View Dashboard

                    </button>


                    <button
                        class="result-secondary-btn"
                        id="closeResultBtn">

                        Back to Home

                    </button>

                </div>

            </div>

        </div>

    `;


    document
        .getElementById("dashboardResultBtn")
        .addEventListener(
            "click",
            () => {

                window.location.href =
                    "dashboard.html";

            }
        );


    document
        .getElementById("closeResultBtn")
        .addEventListener(
            "click",
            closeStateOverlay
        );

}


/* =====================================================
   ERROR PAGE
===================================================== */

function showErrorPage(message) {

    appStateContent.innerHTML = `

        <header class="error-navbar">

            <div class="error-logo">

                <div class="error-logo-icon">

                    <i class="fa-solid fa-shield-heart"></i>

                </div>

                <span>
                    Disease <strong>Risk</strong>
                </span>

            </div>


            <button
                class="error-top-back"
                id="errorTopBack">

                ←
                Back to Home

            </button>

        </header>


        <main class="error-main">

            <section class="error-card">

                <div class="error-illustration">

                    <div class="error-shield">
                        +
                    </div>

                    <div class="error-clipboard">

                        <div class="error-clip"></div>

                        <div class="error-long"></div>

                        <div class="error-row">
                            ✓
                            <span></span>
                        </div>

                        <div class="error-row">
                            ✓
                            <span></span>
                        </div>

                        <div class="error-row">
                            ✓
                            <span></span>
                        </div>

                    </div>

                    <div class="error-heart">
                        ♡
                    </div>

                </div>


                <h1>
                    Something Went
                    <span>Wrong</span>
                </h1>


                <p class="error-description">

                    We couldn't complete your
                    <strong>health-risk assessment</strong>
                    at this time.

                    <br>

                    This might be due to a temporary
                    backend issue.

                </p>


                <div class="error-info">

                    <div class="error-info-icon">
                        i
                    </div>

                    <div>

                        <h3>
                            Error Information
                        </h3>

                        <p>
                            ${escapeHTML(message)}
                            <br>
                            Please try again in a few moments.
                        </p>

                    </div>

                </div>


                <div class="error-buttons">

                    <button
                        class="error-try"
                        id="tryAgainBtn">

                        ↻
                        Try Again

                    </button>


                    <button
                        class="error-home"
                        id="errorHomeBtn">

                        ⌂
                        Back to Home

                    </button>

                </div>

            </section>

        </main>

    `;


    document
        .getElementById("tryAgainBtn")
        .addEventListener(
            "click",
            retryLastRequest
        );


    document
        .getElementById("errorHomeBtn")
        .addEventListener(
            "click",
            closeStateOverlay
        );


    document
        .getElementById("errorTopBack")
        .addEventListener(
            "click",
            closeStateOverlay
        );

}


/* =====================================================
   RETRY
===================================================== */

async function retryLastRequest() {

    if (!lastAssessmentPayload) {

        closeStateOverlay();

        openAssessment();

        return;

    }


    /*
       Retry disease request.
    */

    showAnalyzingPage(
        "Trying again to analyze your symptoms..."
    );


    try {

        const response =
            await sendBackendRequest(
                DISEASE_API_URL,
                lastAssessmentPayload
            );


        predictedDisease =
            extractDisease(response);


        if (!predictedDisease) {

            throw new Error(
                "No disease returned."
            );

        }


        showDiseaseResult(
            predictedDisease
        );


    } catch {

        showErrorPage(
            "The backend is still unavailable."
        );

    }

}


/* =====================================================
   CLOSE STATE
===================================================== */

function closeStateOverlay() {

    appStateOverlay.classList.add(
        "hidden"
    );

    appStateContent.innerHTML = "";

    document.body.style.overflow = "";

}


/* =====================================================
   HISTORY
===================================================== */

function saveAssessmentHistory(
    disease,
    risk
) {

    const user =
        getCurrentUser();


    if (!user) return;


    const historyKey =
        "diseaseRiskHistory_" +
        (
            user.email ||
            user.username ||
            "user"
        );


    let history = [];


    try {

        history =
            JSON.parse(
                localStorage.getItem(
                    historyKey
                )
            ) || [];

    } catch {

        history = [];

    }


    history.unshift({

        id:
            Date.now(),

        disease:
            disease,

        riskPercentage:
            risk.percentage,

        riskLevel:
            risk.level,

        date:
            new Date().toLocaleString(),

        symptoms:
            lastAssessmentPayload
                ? lastAssessmentPayload.symptoms
                : {}

    });


    /*
       Keep latest 20 assessments.
    */

    history =
        history.slice(0, 20);


    localStorage.setItem(
        historyKey,
        JSON.stringify(history)
    );

}


/* =====================================================
   HTML ESCAPE
===================================================== */

function escapeHTML(value) {

    return String(value)

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");

}


/* =====================================================
   STATE PAGE CSS
===================================================== */

const stateStyles =
document.createElement("style");


stateStyles.textContent = `

/* ================= ANALYZING ================= */

.loading-navbar,
.error-navbar {

    height: 68px;

    background: white;

    border-bottom: 1px solid #dcecff;

    display: flex;

    align-items: center;

    justify-content: space-between;

    padding: 0 45px;

}

.loading-logo,
.error-logo {

    display: flex;

    align-items: center;

    gap: 10px;

    font-size: 22px;

    font-weight: 700;

    color: #142d5c;

}

.loading-logo strong,
.error-logo strong {

    color: #2168ed;

}

.loading-logo-icon,
.error-logo-icon {

    width: 38px;

    height: 38px;

    border-radius: 9px;

    background: #2468eb;

    color: white;

    display: flex;

    align-items: center;

    justify-content: center;

}

.loading-main,
.error-main {

    min-height: calc(100vh - 68px);

    display: flex;

    align-items: center;

    justify-content: center;

    padding: 30px 20px;

}

.loading-card {

    width: 840px;

    min-height: 650px;

    background: white;

    border: 1px solid #dce8f6;

    border-radius: 16px;

    box-shadow:
        0 8px 30px rgba(44,91,145,.08);

    padding: 35px 48px;

    text-align: center;

}

.loading-illustration {

    width: 330px;

    height: 200px;

    margin: auto;

    position: relative;

}

.loading-bg {

    position: absolute;

    width: 205px;

    height: 205px;

    left: 63px;

    top: -5px;

    border-radius: 50%;

    background: #f0f7ff;

}

.loading-shield {

    position: absolute;

    left: 73px;

    top: 38px;

    width: 72px;

    height: 95px;

    background: #2770ec;

    clip-path: polygon(
        50% 0%,
        100% 21%,
        100% 60%,
        50% 100%,
        0% 60%,
        0% 21%
    );

    color: white;

    display: flex;

    align-items: center;

    justify-content: center;

    font-size: 40px;

}

.loading-clipboard {

    position: absolute;

    left: 158px;

    top: 20px;

    width: 125px;

    height: 157px;

    background: white;

    border: 2px solid #bdd5fa;

    border-radius: 10px;

    padding: 37px 12px 10px;

}

.loading-clip {

    position: absolute;

    width: 56px;

    height: 19px;

    left: 33px;

    top: -11px;

    background: #2168ed;

    border-radius: 7px;

}

.loading-title {

    width: 48px;

    height: 7px;

    background: #2770ec;

    border-radius: 8px;

    margin-bottom: 10px;

}

.loading-line {

    width: 85px;

    height: 6px;

    background: #dbe8f8;

    border-radius: 8px;

    margin-bottom: 8px;

}

.loading-line.short {

    width: 65px;

}

.loading-check {

    display: flex;

    gap: 7px;

    align-items: center;

    color: white;

    font-size: 9px;

    margin-top: 8px;

}

.loading-check span {

    display: block;

    width: 85px;

    height: 6px;

    border-radius: 8px;

    background: #dbe8f8;

}

.loading-heart {

    position: absolute;

    left: 238px;

    top: 133px;

    width: 49px;

    height: 49px;

    border-radius: 50%;

    background: #f44343;

    border: 4px solid white;

    color: white;

    display: flex;

    align-items: center;

    justify-content: center;

}

.loader {

    width: 78px;

    height: 78px;

    margin: 0 auto 17px;

    border-radius: 50%;

    border: 9px solid #dceaff;

    border-top-color: #2168ed;

    border-right-color: #2168ed;

    animation: spin 1.1s linear infinite;

}

@keyframes spin {

    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }

}

.loading-card h1 {

    font-size: 30px;

    color: #122e5d;

}

.loading-card h1 span {

    color: #2168ed;

}

.loading-description {

    margin-top: 10px;

    color: #6d82a1;

    line-height: 1.6;

}

.loading-progress {

    width: 690px;

    max-width: 100%;

    margin: 28px auto 0;

    position: relative;

    display: flex;

    justify-content: space-between;

}

.loading-progress-line {

    position: absolute;

    top: 16px;

    left: 35px;

    right: 35px;

    height: 3px;

    background: #2770ec;

}

.loading-step {

    width: 180px;

    position: relative;

    z-index: 1;

}

.loading-step-circle {

    width: 32px;

    height: 32px;

    margin: auto auto 9px;

    border-radius: 50%;

    display: flex;

    align-items: center;

    justify-content: center;

    background: #e7eef8;

    color: #7890ae;

}

.loading-step-circle.completed,
.loading-step-circle.current {

    background: #2770ec;

    color: white;

}

.loading-step p {

    font-size: 13px;

    font-weight: 600;

}

.loading-security {

    margin-top: 27px;

    padding: 15px 20px;

    border: 1px solid #d8e8fb;

    background: #f0f7ff;

    border-radius: 9px;

    display: flex;

    align-items: center;

    gap: 16px;

    text-align: left;

}

.loading-security > i {

    color: #2770ec;

    font-size: 30px;

}

.loading-security h3 {

    font-size: 13px;

    margin-bottom: 5px;

}

.loading-security p {

    color: #7186a4;

    font-size: 12px;

}


/* ================= ERROR ================= */

.error-card {

    width: 618px;

    background: white;

    border: 1px solid #dce9f8;

    border-radius: 16px;

    box-shadow:
        0 8px 25px rgba(44,91,145,.08);

    padding: 38px 42px;

    text-align: center;

}

.error-illustration {

    height: 190px;

    width: 290px;

    margin: auto;

    position: relative;

}

.error-shield {

    position: absolute;

    left: 52px;

    top: 42px;

    width: 70px;

    height: 88px;

    background: #2770ec;

    clip-path: polygon(
        50% 0%,
        100% 22%,
        100% 60%,
        50% 100%,
        0% 60%,
        0% 22%
    );

    color: white;

    display: flex;

    align-items: center;

    justify-content: center;

    font-size: 38px;

}

.error-clipboard {

    position: absolute;

    right: 32px;

    top: 16px;

    width: 142px;

    height: 158px;

    background: white;

    border: 2px solid #bcd4fa;

    border-radius: 10px;

    padding: 42px 14px 12px;

}

.error-clip {

    position: absolute;

    width: 62px;

    height: 20px;

    background: #2168ed;

    border-radius: 8px;

    top: -11px;

    left: 38px;

}

.error-long {

    width: 48px;

    height: 7px;

    background: #2770ec;

    border-radius: 8px;

    margin-bottom: 10px;

}

.error-row {

    display: flex;

    align-items: center;

    gap: 9px;

    margin: 10px 0;

    color: white;

    font-size: 10px;

}

.error-row span {

    width: 82px;

    height: 7px;

    background: #dce8f8;

    border-radius: 10px;

}

.error-heart {

    position: absolute;

    right: 16px;

    bottom: 8px;

    width: 58px;

    height: 58px;

    border-radius: 50%;

    background: #3679ec;

    border: 4px solid #e8f1ff;

    color: white;

    display: flex;

    align-items: center;

    justify-content: center;

    font-size: 28px;

}

.error-card h1 {

    font-size: 30px;

    color: #122e5d;

}

.error-card h1 span {

    color: #2168ed;

}

.error-description {

    margin-top: 13px;

    color: #6c82a2;

    font-size: 14px;

    line-height: 1.7;

}

.error-info {

    margin-top: 20px;

    min-height: 86px;

    background: #eef6ff;

    border: 1px solid #d6e7ff;

    border-radius: 11px;

    display: flex;

    text-align: left;

    padding: 15px 18px;

    gap: 15px;

}

.error-info-icon {

    width: 30px;

    height: 30px;

    flex-shrink: 0;

    border-radius: 50%;

    background: #2168ed;

    color: white;

    display: flex;

    align-items: center;

    justify-content: center;

    font-weight: 700;

}

.error-info h3 {

    font-size: 13px;

    color: #123a80;

    margin-bottom: 5px;

}

.error-info p {

    font-size: 12px;

    color: #6c82a2;

    line-height: 1.6;

}

.error-buttons {

    margin-top: 19px;

    display: flex;

    flex-direction: column;

    gap: 12px;

}

.error-try,
.error-home {

    height: 44px;

    border-radius: 9px;

    font-weight: 700;

}

.error-try {

    border: none;

    background: #2168ed;

    color: white;

}

.error-home {

    border: 1.5px solid #4b83f4;

    background: white;

    color: #2168ed;

}

.error-top-back {

    height: 42px;

    padding: 0 17px;

    border: 1.5px solid #4b83f4;

    border-radius: 8px;

    background: white;

    color: #2168ed;

}


/* ================= RESULT ================= */

.result-page {

    min-height: 100vh;

    display: flex;

    align-items: center;

    justify-content: center;

    padding: 40px 20px;

}

.result-card,
.final-result-card {

    width: 650px;

    max-width: 100%;

    background: white;

    border: 1px solid #dce9f8;

    border-radius: 18px;

    padding: 45px;

    text-align: center;

    box-shadow:
        0 10px 35px rgba(44,91,145,.08);

}

.result-icon {

    width: 70px;

    height: 70px;

    margin: auto auto 20px;

    border-radius: 50%;

    background: #eaf3ff;

    color: #2168ed;

    display: flex;

    align-items: center;

    justify-content: center;

    font-size: 28px;

}

.result-label {

    color: #2168ed;

    font-size: 11px;

    font-weight: 800;

    letter-spacing: 2px;

}

.result-card h1,
.final-result-card h1 {

    margin-top: 10px;

    font-size: 32px;

    color: #122e5d;

}

.disease-name,
.final-disease {

    margin: 25px 0;

    padding: 20px;

    background: #f0f7ff;

    border: 1px solid #d8e8fb;

    border-radius: 12px;

    color: #2168ed;

    font-size: 27px;

    font-weight: 800;

}

.result-description {

    color: #7186a4;

    line-height: 1.7;

    font-size: 14px;

}

.result-primary-btn {

    margin-top: 25px;

    width: 100%;

    padding: 14px;

    border: none;

    border-radius: 9px;

    background: #2168ed;

    color: white;

    font-weight: 700;

    font-size: 14px;

}

.result-secondary-btn {

    margin-top: 12px;

    width: 100%;

    padding: 14px;

    border: 1px solid #4b83f4;

    border-radius: 9px;

    background: white;

    color: #2168ed;

    font-weight: 700;

}

.login-required-box {

    margin-top: 25px;

    padding: 16px;

    border-radius: 10px;

    background: #fff8e7;

    border: 1px solid #f1dfaa;

    display: flex;

    gap: 13px;

    text-align: left;

}

.login-required-box > i {

    color: #d79b00;

    font-size: 20px;

}

.login-required-box h3 {

    font-size: 13px;

    margin-bottom: 4px;

}

.login-required-box p {

    color: #7186a4;

    font-size: 12px;

}

.result-buttons {

    margin-top: 5px;

}


/* FINAL RESULT */

.risk-circle {

    width: 190px;

    height: 190px;

    margin: 25px auto;

    border-radius: 50%;

    border: 14px solid #dceaff;

    border-top-color: #2168ed;

    border-right-color: #2168ed;

    display: flex;

    align-items: center;

    justify-content: center;

}

.risk-circle strong {

    display: block;

    font-size: 35px;

    color: #2168ed;

}

.risk-circle span {

    display: block;

    color: #7186a4;

    font-size: 11px;

    margin-top: 5px;

}

.risk-level {

    display: inline-block;

    padding: 9px 20px;

    border-radius: 30px;

    background: #eaf3ff;

    color: #2168ed;

    font-weight: 800;

    font-size: 13px;

}

.final-buttons {

    margin-top: 20px;

}


/* MOBILE */

@media(max-width:700px) {

    .loading-card {

        padding: 25px 18px;

    }

    .loading-progress {

        width: 100%;

    }

    .loading-step {

        width: 100px;

    }

    .loading-step p {

        white-space: normal;

        font-size: 10px;

    }

    .error-card,
    .result-card,
    .final-result-card {

        padding: 25px 18px;

    }

}

`;

document.head.appendChild(stateStyles);


/* =====================================================
   INITIALIZE
===================================================== */

updateAuthUI();