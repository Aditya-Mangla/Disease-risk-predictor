/* =====================================================
   AUTH CHECK
===================================================== */

const loggedIn =
    localStorage.getItem(
        "diseaseRiskLoggedIn"
    ) === "true";


if (!loggedIn) {

    window.location.href =
        "login.html";

}


/* =====================================================
   USER
===================================================== */

let user = null;


try {

    user =
        JSON.parse(
            localStorage.getItem(
                "diseaseRiskUser"
            )
        );

} catch {

    user = null;

}


if (!user) {

    window.location.href =
        "login.html";

}


/* =====================================================
   USER INFO
===================================================== */

document.getElementById(
    "welcomeText"
).textContent =
    `Welcome back, ${user.name}!`;


document.getElementById(
    "profileName"
).textContent =
    user.name;


document.getElementById(
    "profileEmail"
).textContent =
    user.email;


/* =====================================================
   HISTORY KEY
===================================================== */

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


/* =====================================================
   STATISTICS
===================================================== */

document.getElementById(
    "totalAssessments"
).textContent =
    history.length;


if (history.length > 0) {

    const latest =
        history[0];


    document.getElementById(
        "latestDisease"
    ).textContent =
        latest.disease || "-";


    document.getElementById(
        "latestRisk"
    ).textContent =

        latest.riskPercentage !== null &&
        latest.riskPercentage !== undefined

        ? `${latest.riskPercentage}%`

        : latest.riskLevel || "-";

}


/* =====================================================
   HISTORY
===================================================== */

const historyContainer =
    document.getElementById(
        "historyContainer"
    );


if (history.length === 0) {

    historyContainer.innerHTML = `

        <div class="empty-history">

            <i class="fa-solid fa-clipboard"
               style="font-size:35px;margin-bottom:15px;">
            </i>

            <h3>
                No Assessments Yet
            </h3>

            <p style="margin-top:8px;">
                Complete your first health assessment
                to see your history here.
            </p>

        </div>

    `;

} else {

    historyContainer.innerHTML =
        history.map(
            item => `

                <div class="history-card">

                    <div>

                        <small>
                            DISEASE
                        </small>

                        <strong>
                            ${escapeHTML(
                                item.disease || "-"
                            )}
                        </strong>

                    </div>


                    <div>

                        <small>
                            RISK
                        </small>

                        <strong class="history-risk">

                            ${
                                item.riskPercentage !== null &&
                                item.riskPercentage !== undefined

                                ? escapeHTML(
                                    String(
                                        item.riskPercentage
                                    )
                                  ) + "%"

                                : escapeHTML(
                                    String(
                                        item.riskLevel || "-"
                                    )
                                  )
                            }

                        </strong>

                    </div>


                    <div>

                        <small>
                            RISK LEVEL
                        </small>

                        <strong>
                            ${escapeHTML(
                                item.riskLevel || "-"
                            )}
                        </strong>

                    </div>


                    <div>

                        <small>
                            DATE
                        </small>

                        <strong>
                            ${escapeHTML(
                                item.date || "-"
                            )}
                        </strong>

                    </div>

                </div>

            `
        ).join("");

}


/* =====================================================
   LOGOUT
===================================================== */

document.getElementById(
    "dashboardLogout"
).addEventListener(
    "click",
    () => {

        localStorage.removeItem(
            "diseaseRiskLoggedIn"
        );

        window.location.href =
            "index.html";

    }
);


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(value) {

    return String(value)

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");

}