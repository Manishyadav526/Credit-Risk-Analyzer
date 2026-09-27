/* =========================================================
   CREDIT RISK ANALYZER
   Prediction Page JavaScript
   ========================================================= */


/* =========================================================
   API CONFIG
   ========================================================= */

const API_URL = "/predict";


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const predictionForm = document.getElementById("prediction-form");
const predictButton = document.getElementById("predict-btn");

const resultEmpty = document.getElementById("result-empty");
const resultContent = document.getElementById("result-content");

const resultModeBadge = document.getElementById("result-mode-badge");

const riskResult = document.getElementById("risk-result");
const riskStatus = document.getElementById("risk-status");

const probabilityNumber =
    document.getElementById("probability-number");

const probabilityValueLabel =
    document.getElementById("probability-value-label");

const probabilityFill =
    document.getElementById("probability-fill");

const thresholdMarker =
    document.getElementById("threshold-marker");

const thresholdLabel =
    document.getElementById("threshold-label");

const factProbability =
    document.getElementById("fact-probability");

const factThreshold =
    document.getElementById("fact-threshold");

const factMode =
    document.getElementById("fact-mode");

const riskExplanation =
    document.getElementById("risk-explanation");

const loanAmountInput =
    document.getElementById("loan_amnt");

const incomeInput =
    document.getElementById("person_income");

const loanPercentIncomeInput =
    document.getElementById("loan_percent_income");

const thresholdCards =
    document.querySelectorAll(".threshold-card");

const thresholdInputs =
    document.querySelectorAll(
        'input[name="threshold_mode"]'
    );


/* =========================================================
   THRESHOLD VALUES
   ========================================================= */

const THRESHOLDS = {
    soft: 0.39,
    hard: 0.19
};


/* =========================================================
   PAGE LOAD
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    updateLoanPercentIncome();

    setupThresholdSelection();

    setupInputAnimations();

});


/* =========================================================
   LOAN PERCENT INCOME
   ========================================================= */

function updateLoanPercentIncome() {

    if (
        !loanAmountInput ||
        !incomeInput ||
        !loanPercentIncomeInput
    ) {
        return;
    }

    const loanAmount =
        parseFloat(loanAmountInput.value);

    const income =
        parseFloat(incomeInput.value);

    if (
        Number.isFinite(loanAmount) &&
        Number.isFinite(income) &&
        income > 0
    ) {

        const ratio =
            loanAmount / income;

        loanPercentIncomeInput.value =
            ratio.toFixed(2);

    } else {

        loanPercentIncomeInput.value = "";

    }

}


if (loanAmountInput) {
    loanAmountInput.addEventListener(
        "input",
        updateLoanPercentIncome
    );
}


if (incomeInput) {
    incomeInput.addEventListener(
        "input",
        updateLoanPercentIncome
    );
}


/* =========================================================
   THRESHOLD SELECTION
   ========================================================= */

function setupThresholdSelection() {

    thresholdCards.forEach(card => {

        card.addEventListener("click", () => {

            const input =
                card.querySelector(
                    'input[name="threshold_mode"]'
                );

            if (!input) {
                return;
            }

            input.checked = true;

            updateThresholdUI(input.value);

        });

    });


    thresholdInputs.forEach(input => {

        input.addEventListener("change", () => {

            updateThresholdUI(input.value);

        });

    });


    /*
       Default selection = Soft
    */

    const selected =
        document.querySelector(
            'input[name="threshold_mode"]:checked'
        );

    if (selected) {

        updateThresholdUI(
            selected.value
        );

    }

}


/* =========================================================
   UPDATE THRESHOLD UI
   ========================================================= */

function updateThresholdUI(mode) {

    thresholdCards.forEach(card => {

        const input =
            card.querySelector(
                'input[name="threshold_mode"]'
            );

        if (!input) {
            return;
        }

        if (input.value === mode) {

            card.classList.add("selected");

        } else {

            card.classList.remove("selected");

        }

    });

}


/* =========================================================
   FORM SUBMIT
   ========================================================= */

if (predictionForm) {

    predictionForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            await predictCreditRisk();

        }
    );

}


/* =========================================================
   MAIN PREDICTION FUNCTION
   ========================================================= */

async function predictCreditRisk() {

    try {

        setLoadingState(true);

        updateLoanPercentIncome();

        const thresholdInput =
            document.querySelector(
                'input[name="threshold_mode"]:checked'
            );

        if (!thresholdInput) {

            throw new Error(
                "Please select a threshold mode."
            );

        }


        const thresholdMode =
            thresholdInput.value;


        /* -----------------------------------------
           Collect form values
        ----------------------------------------- */

        const personAge =
            Number(
                document.getElementById(
                    "person_age"
                ).value
            );

        const personIncome =
            Number(
                document.getElementById(
                    "person_income"
                ).value
            );

        const personHomeOwnership =
            document.getElementById(
                "person_home_ownership"
            ).value;

        const personEmpLength =
            Number(
                document.getElementById(
                    "person_emp_length"
                ).value
            );

        const loanIntent =
            document.getElementById(
                "loan_intent"
            ).value;

        const loanGrade =
            document.getElementById(
                "loan_grade"
            ).value;

        const loanAmount =
            Number(
                document.getElementById(
                    "loan_amnt"
                ).value
            );

        const loanInterestRate =
            Number(
                document.getElementById(
                    "loan_int_rate"
                ).value
            );

        const loanPercentIncome =
            Number(
                loanPercentIncomeInput.value
            );

        const previousDefault =
            document.getElementById(
                "cb_person_default_on_file"
            ).value;

        const creditHistoryLength =
            Number(
                document.getElementById(
                    "cb_person_cred_hist_length"
                ).value
            );


        /* -----------------------------------------
           API payload
        ----------------------------------------- */

        const payload = {

            person_age: personAge,

            person_income: personIncome,

            person_home_ownership:
                personHomeOwnership,

            person_emp_length:
                personEmpLength,

            loan_intent:
                loanIntent,

            loan_grade:
                loanGrade,

            loan_amnt:
                loanAmount,

            loan_int_rate:
                loanInterestRate,

            loan_percent_income:
                loanPercentIncome,

            cb_person_default_on_file:
                previousDefault,

            cb_person_cred_hist_length:
                creditHistoryLength,

            threshold_mode:
                thresholdMode

        };


        console.log(
            "Prediction payload:",
            payload
        );


        /* -----------------------------------------
           API request
        ----------------------------------------- */

        const response =
            await fetch(API_URL, {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(payload)

            });


        if (!response.ok) {

            let errorMessage =
                `API Error: ${response.status}`;

            try {

                const errorData =
                    await response.json();

                if (
                    errorData.detail
                ) {

                    errorMessage =
                        Array.isArray(
                            errorData.detail
                        )
                            ? errorData.detail
                                .map(
                                    item =>
                                        item.msg
                                )
                                .join(", ")
                            : errorData.detail;

                }

            } catch (error) {

                console.warn(
                    "Could not parse API error.",
                    error
                );

            }

            throw new Error(
                errorMessage
            );

        }


        const result =
            await response.json();


        console.log(
            "API response:",
            result
        );


        /* -----------------------------------------
           Display result
        ----------------------------------------- */

        displayPredictionResult(result);

    } catch (error) {

        console.error(
            "Prediction failed:",
            error
        );

        showPredictionError(
            error.message
        );

    } finally {

        setLoadingState(false);

    }

}


/* =========================================================
   DISPLAY PREDICTION RESULT
   ========================================================= */

function displayPredictionResult(result) {

    /*
       IMPORTANT:
       API returns probability like:

       0.0807

       This means 8.07%.

       We DO NOT directly call:
       toFixed(1)

       because that would produce:
       0.1%

       Instead:

       0.0807 × 100 = 8.07
    */


    let probability =
        Number(
            result.default_probability
        );


    /*
       Safety check
    */

    if (!Number.isFinite(probability)) {

        console.error(
            "Invalid probability received:",
            result.default_probability
        );

        probability = 0;

    }


    /*
       Keep probability between
       0 and 1.
    */

    probability =
        Math.min(
            1,
            Math.max(
                0,
                probability
            )
        );


    /*
       Convert probability to percentage.
       
       Example:
       0.0807 → 8.07 → 8.1%
    */

    const probabilityPercent =
        probability * 100;


    const formattedProbability =
        `${probabilityPercent.toFixed(1)}%`;


    /*
       Threshold
    */

    let threshold =
        Number(
            result.threshold_used
        );


    if (!Number.isFinite(threshold)) {

        threshold =
            THRESHOLDS[
            result.threshold_mode
            ] ?? 0.39;

    }


    threshold =
        Math.min(
            1,
            Math.max(
                0,
                threshold
            )
        );


    const thresholdPercent =
        threshold * 100;


    const formattedThreshold =
        `${thresholdPercent.toFixed(0)}%`;


    /*
       Prediction

       Backend is the source of truth.
    */

    const prediction =
        Number(
            result.default_prediction
        );


    const isHighRisk =
        prediction === 1;


    /* =====================================================
       SHOW RESULT CARD
       ===================================================== */

    if (resultEmpty) {

        resultEmpty.hidden = true;

    }


    if (resultContent) {

        resultContent.hidden = false;

    }


    /* =====================================================
       RISK STATUS
       ===================================================== */

    if (riskResult) {

        riskResult.classList.remove(
            "high-risk"
        );

        if (isHighRisk) {

            riskResult.classList.add(
                "high-risk"
            );

        }

    }


    if (riskStatus) {

        riskStatus.textContent =
            isHighRisk
                ? "HIGH RISK"
                : "LOW RISK";

    }


    /* =====================================================
       PROBABILITY — MAIN
       ===================================================== */

    if (probabilityNumber) {

        probabilityNumber.textContent =
            formattedProbability;

    }


    /* =====================================================
       PROBABILITY — LABEL
       ===================================================== */

    if (probabilityValueLabel) {

        probabilityValueLabel.textContent =
            formattedProbability;

    }


    /* =====================================================
       PROBABILITY — BAR
       ===================================================== */

    if (probabilityFill) {

        /*
           IMPORTANT:
           CSS width uses percentage.

           probability = 0.0807
           width = 8.07%
        */

        probabilityFill.style.width =
            `${probabilityPercent}%`;


        probabilityFill.classList.remove(
            "high-risk"
        );


        if (isHighRisk) {

            probabilityFill.classList.add(
                "high-risk"
            );

        }

    }


    /* =====================================================
       THRESHOLD MARKER
       ===================================================== */

    if (thresholdMarker) {

        thresholdMarker.style.left =
            `${thresholdPercent}%`;

    }


    if (thresholdLabel) {

        thresholdLabel.textContent =
            `Threshold ${formattedThreshold}`;

    }


    /* =====================================================
       RESULT FACTS
       ===================================================== */

    if (factProbability) {

        factProbability.textContent =
            formattedProbability;

    }


    if (factThreshold) {

        factThreshold.textContent =
            formattedThreshold;

    }


    if (factMode) {

        factMode.textContent =
            formatThresholdMode(
                result.threshold_mode
            );

    }


    /* =====================================================
       EXPLANATION
       ===================================================== */

    if (riskExplanation) {

        riskExplanation.classList.remove(
            "high-risk"
        );


        if (isHighRisk) {

            riskExplanation.classList.add(
                "high-risk"
            );


            riskExplanation.textContent =
                `The estimated probability of loan default is ${formattedProbability}, which is above the selected ${formatThresholdMode(result.threshold_mode).toLowerCase()} threshold of ${formattedThreshold}. The application is therefore classified as High Risk.`;

        } else {

            riskExplanation.textContent =
                `The estimated probability of loan default is ${formattedProbability}, which is below the selected ${formatThresholdMode(result.threshold_mode).toLowerCase()} threshold of ${formattedThreshold}. The application is therefore classified as Low Risk.`;

        }

    }


    /* =====================================================
       MODE BADGE
       ===================================================== */

    if (resultModeBadge) {

        resultModeBadge.textContent =
            `${formatThresholdMode(result.threshold_mode)} MODE`;

    }


    /*
       Scroll result into view on smaller screens.
    */

    if (
        window.innerWidth <= 1050 &&
        resultContent
    ) {

        setTimeout(() => {

            resultContent.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }, 150);

    }

}


/* =========================================================
   FORMAT THRESHOLD MODE
   ========================================================= */

function formatThresholdMode(mode) {

    if (!mode) {
        return "Soft";
    }

    return (
        mode.charAt(0).toUpperCase() +
        mode.slice(1).toLowerCase()
    );

}


/* =========================================================
   LOADING STATE
   ========================================================= */

function setLoadingState(isLoading) {

    if (!predictButton) {
        return;
    }


    if (isLoading) {

        predictButton.disabled = true;

        predictButton.classList.add(
            "loading"
        );

    } else {

        predictButton.disabled = false;

        predictButton.classList.remove(
            "loading"
        );

    }

}


/* =========================================================
   ERROR DISPLAY
   ========================================================= */

function showPredictionError(message) {

    if (resultEmpty) {

        resultEmpty.hidden = false;

    }


    if (resultContent) {

        resultContent.hidden = true;

    }


    if (resultEmpty) {

        const heading =
            resultEmpty.querySelector("h2");

        const paragraph =
            resultEmpty.querySelector("p");


        if (heading) {

            heading.textContent =
                "Prediction Failed";

        }


        if (paragraph) {

            paragraph.textContent =
                message ||
                "Something went wrong while connecting to the prediction API.";

        }


        resultEmpty.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }

}


/* =========================================================
   INPUT FOCUS ANIMATION
   ========================================================= */

function setupInputAnimations() {

    const inputs =
        document.querySelectorAll(
            ".input-wrapper input, .input-wrapper select"
        );


    inputs.forEach(input => {

        input.addEventListener(
            "focus",
            () => {

                input
                    .closest(".input-group")
                    ?.classList.add(
                        "input-active"
                    );

            }
        );


        input.addEventListener(
            "blur",
            () => {

                input
                    .closest(".input-group")
                    ?.classList.remove(
                        "input-active"
                    );

            }
        );

    });

}


/* =========================================================
   INITIAL RESULT STATE
   ========================================================= */

if (resultContent) {

    resultContent.hidden = true;

}


if (resultEmpty) {

    resultEmpty.hidden = false;

}


/* =========================================================
   DEBUG INFORMATION
   ========================================================= */

console.info(
    "Credit Risk Analyzer loaded."
);

console.info(
    "Active Model: Isotonic XGBoost"
);

console.info(
    "Soft Threshold: 0.39"
);

console.info(
    "Hard Threshold: 0.19"
);