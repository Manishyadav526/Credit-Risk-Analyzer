/* =========================================================
   CREDIT RISK ANALYZER
   Homepage JavaScript
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       PAGE LOAD ANIMATION
    ====================================================== */

    document.body.classList.add("page-loaded");


    /* =====================================================
       NAVBAR SCROLL EFFECT
    ====================================================== */

    const navbar = document.querySelector(".navbar");

    if (navbar) {

        const handleScroll = () => {

            if (window.scrollY > 20) {

                navbar.style.background =
                    "rgba(7, 13, 19, 0.92)";

                navbar.style.borderBottomColor =
                    "rgba(148, 163, 184, 0.15)";

            } else {

                navbar.style.background =
                    "rgba(7, 13, 19, 0.78)";

                navbar.style.borderBottomColor =
                    "rgba(148, 163, 184, 0.10)";
            }
        };

        window.addEventListener(
            "scroll",
            handleScroll,
            { passive: true }
        );

        handleScroll();
    }


    /* =====================================================
       ACTIVE MODEL CTA
    ====================================================== */

    const activeModelLinks =
        document.querySelectorAll(
            ".nav-test-btn, .active-model-btn, .active-model-cta"
        );


    activeModelLinks.forEach((link) => {

        link.addEventListener("click", (event) => {

            /*
             * Small click feedback.
             * Navigation itself is handled normally by the
             * browser.
             */

            link.classList.add("clicked");

            setTimeout(() => {
                link.classList.remove("clicked");
            }, 250);

        });

    });


    /* =====================================================
       MODEL CARD HOVER EFFECT
    ====================================================== */

    const modelCards =
        document.querySelectorAll(".model-card");


    modelCards.forEach((card) => {

        card.addEventListener("mousemove", (event) => {

            /*
             * Keep the effect very subtle so the cards
             * remain professional.
             */

            const rect =
                card.getBoundingClientRect();

            const x =
                event.clientX - rect.left;

            const y =
                event.clientY - rect.top;

            const centerX =
                rect.width / 2;

            const centerY =
                rect.height / 2;

            const rotateX =
                ((y - centerY) / centerY) * -1.5;

            const rotateY =
                ((x - centerX) / centerX) * 1.5;


            card.style.transform =
                `translateY(-7px)
                 perspective(900px)
                 rotateX(${rotateX}deg)
                 rotateY(${rotateY}deg)`;
        });


        card.addEventListener("mouseleave", () => {

            card.style.transform =
                "";
        });

    });


    /* =====================================================
       ACTIVE MODEL CARD GLOW
    ====================================================== */

    const activeCard =
        document.querySelector(".active-model-card");


    if (activeCard) {

        activeCard.addEventListener(
            "mousemove",
            (event) => {

                const rect =
                    activeCard.getBoundingClientRect();

                const x =
                    ((event.clientX - rect.left) / rect.width) *
                    100;

                const y =
                    ((event.clientY - rect.top) / rect.height) *
                    100;


                activeCard.style.background =
                    `radial-gradient(
                        circle at ${x}% ${y}%,
                        rgba(94, 230, 176, 0.10),
                        transparent 35%
                    ),
                    linear-gradient(
                        145deg,
                        rgba(17, 38, 38, 0.98),
                        rgba(10, 25, 28, 0.98)
                    )`;
            }
        );


        activeCard.addEventListener(
            "mouseleave",
            () => {

                activeCard.style.background =
                    "";
            }
        );

    }


    /* =====================================================
       INTERSECTION OBSERVER
       ====================================================== */

    const animatedElements =
        document.querySelectorAll(
            ".process-card, .active-model-section"
        );


    if ("IntersectionObserver" in window) {

        const observer =
            new IntersectionObserver(
                (entries, obs) => {

                    entries.forEach((entry) => {

                        if (!entry.isIntersecting) {
                            return;
                        }

                        entry.target.classList.add(
                            "is-visible"
                        );

                        obs.unobserve(entry.target);
                    });

                },
                {
                    threshold: 0.12
                }
            );


        animatedElements.forEach((element) => {

            element.style.opacity = "0";

            element.style.transform =
                "translateY(22px)";

            element.style.transition =
                "opacity 0.7s ease, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)";

            observer.observe(element);
        });


        /*
         * CSS transition is applied through JS here so
         * the initial HTML remains clean.
         */

        document.addEventListener(
            "DOMContentLoaded",
            () => { }
        );

    } else {

        animatedElements.forEach((element) => {

            element.style.opacity = "1";

            element.style.transform =
                "translateY(0)";
        });
    }


    /* =====================================================
       OBSERVER VISIBILITY HANDLER
    ====================================================== */

    const visibleStyle =
        document.createElement("style");

    visibleStyle.textContent = `
        .is-visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;

    document.head.appendChild(visibleStyle);


    /* =====================================================
       ACCURACY NUMBER ANIMATION
    ====================================================== */

    const accuracyValues =
        document.querySelectorAll(
            ".accuracy strong"
        );


    const animateAccuracy =
        (element) => {

            const finalText =
                element.textContent.trim();

            /*
             * Extract numerical value.
             *
             * Examples:
             * 81%
             * 92%
             * 94.03%
             */

            const finalValue =
                parseFloat(
                    finalText.replace("%", "")
                );


            if (Number.isNaN(finalValue)) {
                return;
            }


            const hasDecimal =
                finalText.includes(".");


            const duration = 900;

            const startTime =
                performance.now();


            const update =
                (currentTime) => {

                    const elapsed =
                        currentTime - startTime;

                    const progress =
                        Math.min(
                            elapsed / duration,
                            1
                        );


                    /*
                     * Ease-out animation.
                     */

                    const eased =
                        1 - Math.pow(
                            1 - progress,
                            3
                        );


                    const currentValue =
                        finalValue * eased;


                    element.textContent =
                        hasDecimal
                            ? `${currentValue.toFixed(2)}%`
                            : `${Math.round(currentValue)}%`;


                    if (progress < 1) {

                        requestAnimationFrame(
                            update
                        );

                    } else {

                        element.textContent =
                            finalText;
                    }
                };


            requestAnimationFrame(update);
        };


    /* =====================================================
       ACCURACY OBSERVER
    ====================================================== */

    if ("IntersectionObserver" in window) {

        const accuracyObserver =
            new IntersectionObserver(
                (entries, observer) => {

                    entries.forEach((entry) => {

                        if (!entry.isIntersecting) {
                            return;
                        }

                        animateAccuracy(
                            entry.target
                        );

                        observer.unobserve(
                            entry.target
                        );
                    });

                },
                {
                    threshold: 0.7
                }
            );


        accuracyValues.forEach((element) => {

            accuracyObserver.observe(element);
        });

    } else {

        accuracyValues.forEach(
            animateAccuracy
        );
    }


    /* =====================================================
       ACTIVE MODEL SECTION HIGHLIGHT
    ====================================================== */

    const activeSection =
        document.querySelector(
            ".active-model-section"
        );


    if (activeSection) {

        activeSection.addEventListener(
            "mousemove",
            (event) => {

                const rect =
                    activeSection.getBoundingClientRect();

                const x =
                    event.clientX - rect.left;

                const y =
                    event.clientY - rect.top;


                activeSection.style.setProperty(
                    "--mouse-x",
                    `${x}px`
                );

                activeSection.style.setProperty(
                    "--mouse-y",
                    `${y}px`
                );
            }
        );
    }


    /* =====================================================
       BUTTON RIPPLE EFFECT
    ====================================================== */

    const buttons =
        document.querySelectorAll(
            ".nav-test-btn, .active-model-btn, .active-model-cta"
        );


    buttons.forEach((button) => {

        button.addEventListener(
            "click",
            (event) => {

                const rect =
                    button.getBoundingClientRect();

                const ripple =
                    document.createElement("span");


                const size =
                    Math.max(
                        rect.width,
                        rect.height
                    );


                ripple.style.width =
                    `${size}px`;

                ripple.style.height =
                    `${size}px`;

                ripple.style.position =
                    "absolute";

                ripple.style.left =
                    `${event.clientX - rect.left - size / 2}px`;

                ripple.style.top =
                    `${event.clientY - rect.top - size / 2}px`;

                ripple.style.borderRadius =
                    "50%";

                ripple.style.background =
                    "rgba(255,255,255,0.18)";

                ripple.style.transform =
                    "scale(0)";

                ripple.style.pointerEvents =
                    "none";

                ripple.style.animation =
                    "buttonRipple 0.55s ease-out";


                /*
                 * The button needs relative positioning
                 * for the ripple.
                 */

                const previousPosition =
                    getComputedStyle(button).position;

                if (previousPosition === "static") {
                    button.style.position =
                        "relative";
                }

                button.style.overflow =
                    "hidden";


                button.appendChild(ripple);


                setTimeout(() => {

                    ripple.remove();

                }, 600);
            }
        );
    });


    /* =====================================================
       RIPPLE KEYFRAME
    ====================================================== */

    const rippleStyle =
        document.createElement("style");

    rippleStyle.textContent = `
        @keyframes buttonRipple {
            to {
                transform: scale(2.5);
                opacity: 0;
            }
        }

        .clicked {
            transform: translateY(1px) !important;
        }
    `;

    document.head.appendChild(rippleStyle);


    /* =====================================================
       GITHUB LINK
    ====================================================== */

    const githubLink =
        document.querySelector(
            '.footer-links a[href*="github.com"]'
        );


    if (githubLink) {

        githubLink.addEventListener(
            "click",
            () => {

                console.log(
                    "Credit Risk Analyzer — GitHub:",
                    githubLink.href
                );

            }
        );
    }


    /* =====================================================
       CONSOLE INFO
    ====================================================== */

    console.log(
        "%cCredit Risk Analyzer",
        "color:#5ee6b0;font-size:18px;font-weight:700;"
    );

    console.log(
        "Active Model: Isotonic XGBoost"
    );

    console.log(
        "Test Accuracy: 94.03%"
    );

    console.log(
        "Only the Isotonic XGBoost model is deployed for predictions."
    );

});