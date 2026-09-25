import "../styles/landing.css";
import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import lottie from "lottie-web";
import Features from "../components/features";

function LandingPage() {
  // Refs for DOM nodes previously queried by id/class
  const preloaderRef = useRef(null);
  const odessaWrapRef = useRef(null);
  const odessaInnerRef = useRef(null);
  const svgRef = useRef(null);
  const wordRef = useRef(null);
  const hamburgerRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const visualRef = useRef(null); // wave svg container (#visual)
  const ticketRef = useRef(null);

  // store timeouts so we can clear on unmount
  const timeoutsRef = useRef([]);
  // store handlers we add to be able to remove
  const handlersRef = useRef({});

  useEffect(() => {
    function setManagedTimeout(fn, ms) {
      const id = window.setTimeout(fn, ms);
      timeoutsRef.current.push(id);
      return id;
    }

    // Helper to clear all timeouts
    function clearAllTimeouts() {
      timeoutsRef.current.forEach((id) => clearTimeout(id));
      timeoutsRef.current = [];
    }

    /* ===========================
       1) Preloader + page load handling
       ============================ */
    function onPageLoad() {
      const preloader = preloaderRef.current;
      if (!preloader) return;

      // hide preloader after 1s and start logo animation
      setManagedTimeout(() => {
        preloader.classList.add("hide");
        // give a small delay to let CSS fade take effect if present
        startOdessaAnimation();
        // schedule headline/button reveals (keeps original timing)
        scheduleHeadlineAndButtonsReveal();
      }, 1000);
    }

    // If page already loaded, run immediately; else add listener
    if (document.readyState === "complete") {
      onPageLoad();
    } else {
      window.addEventListener("load", onPageLoad);
      handlersRef.current.pageLoad = onPageLoad;
    }

    /* ===========================
       2) Odessa logo drawing animation
       ============================ */
    function startOdessaAnimation() {
      const wrap = odessaWrapRef.current;
      const inner = odessaInnerRef.current;
      const svg = svgRef.current;
      const word = wordRef.current;
      if (!wrap || !inner || !svg || !word) return;

      const STAGGER = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--stagger"
        )
      ) || 30;
      const BASE = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--build-duration"
        )
      ) || 330;
      const MOVE_DURATION = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--move-duration"
        )
      ) || 850;
      const MOVE_DELAY = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--reveal-delay"
        )
      ) || 1000;

      const paths = Array.from(svg.querySelectorAll("path"));
      const shapes = paths.filter((el) => {
        try {
          const bb = el.getBBox ? el.getBBox() : { width: 0, height: 0 };
          return (
            (bb.width > 0 || bb.height > 0) &&
            getComputedStyle(el).display !== "none"
          );
        } catch {
          return true;
        }
      });

      const shapeInfo = shapes.map((el) => {
        const orig = el.getAttribute("fill") || getComputedStyle(el).fill || "none";
        el.dataset.origFill = orig;
        // set up stroke/fill baseline
        el.style.stroke =
          getComputedStyle(document.documentElement).getPropertyValue(
            "--stroke"
          ) || "#000";
        el.style.strokeWidth =
          getComputedStyle(document.documentElement).getPropertyValue(
            "--stroke-width"
          ) || 0.9;
        el.style.strokeLinecap = "round";
        el.style.strokeLinejoin = "round";
        el.style.vectorEffect = "non-scaling-stroke";
        el.style.fill = "transparent";

        let len = 120;
        try {
          if (typeof el.getTotalLength === "function")
            len = Math.round(el.getTotalLength());
        } catch { }
        el.style.transition = "none";
        el.style.strokeDasharray = len;
        el.style.strokeDashoffset = len;
        el.style.opacity = "1";
        return { el, len };
      });

      const totalDrawingTime = 80 + Math.max(0, shapeInfo.length - 1) * STAGGER + BASE;
      let animating = false;

      function playAnimationAndReveal() {
        if (animating) return;
        animating = true;

        // Reset before drawing
        shapeInfo.forEach((s) => {
          s.el.style.transition = "none";
          s.el.style.strokeDashoffset = s.len;
          s.el.style.fill = "transparent";
        });

        // Staggered draw
        shapeInfo.forEach((s, i) => {
          const delay = 80 + i * STAGGER;
          const dur = Math.max(
            120,
            Math.round(BASE * Math.min(1.4, s.len / 120))
          );
          setManagedTimeout(() => {
            s.el.style.transition = `stroke-dashoffset ${dur}ms cubic-bezier(.2,.9,.2,1), fill ${Math.round(
              dur * 0.85
            )}ms ease`;
            requestAnimationFrame(() => {
              s.el.style.strokeDashoffset = "0";
              s.el.style.fill = s.el.dataset.origFill;
            });
          }, delay);
        });

        const revealStart = totalDrawingTime + MOVE_DELAY;
        setManagedTimeout(() => {
          word.classList.add("visible");
          wrap.classList.add("moved");
          // after move finishes, allow replays again (managed inside replay handler)
          setManagedTimeout(() => {
            animating = false;
          }, MOVE_DURATION + 100);
        }, revealStart);
      }

      // start it after a small delay to mimic original behaviour
      setManagedTimeout(playAnimationAndReveal, 420);
    }

    /* ===========================
       3) Logo replay on hover/focus (attach to svg)
       ============================ */
    function setupLogoReplay() {
      const wrap = odessaWrapRef.current;
      const svg = svgRef.current;
      if (!wrap || !svg) return;

      const paths = Array.from(svg.querySelectorAll("path"));
      let replaying = false;
      let replayCount = 0;

      function replayAnimationTwice() {
        if (replaying) return;
        replaying = true;
        replayCount = 0;

        function runOnce() {
          paths.forEach((p) => {
            let len = 120;
            try {
              len = Math.round(p.getTotalLength());
            } catch { }
            p.style.transition = "none";
            p.style.strokeDasharray = len;
            p.style.strokeDashoffset = len;
            p.style.fill = "transparent";
          });

          // force reflow
          void svg.offsetWidth;

          paths.forEach((p, i) => {
            let len = 120;
            try {
              len = Math.round(p.getTotalLength());
            } catch { }
            const dur = Math.max(
              120,
              Math.round(380 * Math.min(1.4, len / 120))
            );
            const delay = i * 40;
            setManagedTimeout(() => {
              p.style.transition = `stroke-dashoffset ${dur}ms cubic-bezier(.2,.9,.2,1), fill ${Math.round(
                dur * 0.85
              )}ms ease`;
              p.style.strokeDashoffset = "0";
              p.style.fill =
                p.dataset.origFill || p.getAttribute("fill") || "#00e5b4";
            }, delay);
          });
        }

        function loopTwice() {
          if (replayCount < 1) {
            runOnce();
            replayCount++;
            setManagedTimeout(loopTwice, 1100);
          } else {
            replaying = false;
          }
        }

        loopTwice();
      }

      svg.addEventListener("mouseenter", replayAnimationTwice);
      svg.addEventListener("focus", replayAnimationTwice);

      // store handlers for cleanup
      handlersRef.current.svgMouseEnter = replayAnimationTwice;
      handlersRef.current.svgFocus = replayAnimationTwice;
    }

    /* ===========================
       4) Waves reveal animation (on mount)
       ============================ */
    function runWavesReveal() {
      // use visualRef to scope the search to our visual container
      const visual = visualRef.current;
      const waves = visual
        ? Array.from(visual.querySelectorAll(".wave"))
        : Array.from(document.querySelectorAll(".wave"));

      waves.forEach((wave, i) => {
        setManagedTimeout(() => {
          wave.classList.add("loaded");
        }, i * 350);
      });
    }

    /* ===========================
       5) Lottie hamburger menu
       ============================ */
    let lottieAnim = null;
    function setupHamburgerMenu() {
      const hamburgerContainer = hamburgerRef.current;
      const mobileMenu = mobileMenuRef.current;
      if (!hamburgerContainer || !mobileMenu) return;

      lottieAnim = lottie.loadAnimation({
        container: hamburgerContainer,
        renderer: "svg",
        loop: false,
        autoplay: false,
        path: "/assets/menu.json",
      });

      lottieAnim.setSpeed(2);

      let menuOpen = false;

      const openMenu = () => {
        lottieAnim.setDirection(1);
        lottieAnim.play();
        mobileMenu.classList.add("show");
        mobileMenu.setAttribute("aria-hidden", "false");
        menuOpen = true;
      };

      const closeMenu = () => {
        lottieAnim.setDirection(-1);
        lottieAnim.play();
        mobileMenu.classList.remove("show");
        mobileMenu.setAttribute("aria-hidden", "true");
        menuOpen = false;
      };

      const toggleMenu = () => (menuOpen ? closeMenu() : openMenu());

      const onHamburgerClick = (e) => {
        toggleMenu();
      };

      const onHamburgerKey = (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggleMenu();
        }
      };

      const onDocClick = (e) => {
        if (!menuOpen) return;
        const target = e.target;
        if (!mobileMenu.contains(target) && !hamburgerContainer.contains(target)) {
          closeMenu();
        }
      };

      const onDocKeyDown = (e) => {
        if (e.key === "Escape" && menuOpen) closeMenu();
      };

      hamburgerContainer.addEventListener("click", onHamburgerClick);
      hamburgerContainer.addEventListener("keydown", onHamburgerKey);
      document.addEventListener("click", onDocClick);
      document.addEventListener("keydown", onDocKeyDown);

      // store handlers for cleanup
      handlersRef.current.hamburgerClick = onHamburgerClick;
      handlersRef.current.hamburgerKey = onHamburgerKey;
      handlersRef.current.docClick = onDocClick;
      handlersRef.current.docKeyDown = onDocKeyDown;
    }

    /* ===========================
       6) Headline & button reveals after logo
       (kept same timing as original: logoDelay 2100)
       ============================ */
    function scheduleHeadlineAndButtonsReveal() {
      const logoDelay = 1310;
      setManagedTimeout(() => {
        const head = document.querySelector(".head");
        const para = document.querySelector(".subhead");
        const signup = document.querySelector(".signup");
        const login = document.querySelector(".login-btz");

        if (!head || !para || !signup || !login) return;

        head.style.animation = "slideInLeft 0.8s ease-out forwards";
        setManagedTimeout(() => {
          para.style.animation = "slideInUp 0.6s ease-out forwards";
        }, 900);
        setManagedTimeout(() => {
          signup.style.animation = "fadeIn 0.6s ease forwards";
          login.style.animation = "fadeIn 0.6s ease forwards";
        }, 1450);
      }, logoDelay);
    }

    /* ===========================
       7) Ticket body fade-up (after mount)
       ============================ */
    function runTicketFadeUp() {
      const ticket = ticketRef.current || document.getElementById("ticket-body");
      if (!ticket) return;
      ticket.style.opacity = 0;
      ticket.style.transform = "translateY(28px)";
      setManagedTimeout(() => {
        ticket.style.opacity = 1;
        ticket.style.transform = "translateY(0)";
      }, 3200);
    }

    // initialize replay, waves, hamburger and ticket animations
    setupLogoReplay();
    runWavesReveal();
    setupHamburgerMenu();
    runTicketFadeUp();

    // cleanup on unmount
    return () => {
      // clear timeouts
      clearAllTimeouts();

      // remove window load listener if attached
      if (handlersRef.current.pageLoad) {
        window.removeEventListener("load", handlersRef.current.pageLoad);
      }

      // remove svg handlers
      const svg = svgRef.current;
      if (svg && handlersRef.current.svgMouseEnter) {
        svg.removeEventListener("mouseenter", handlersRef.current.svgMouseEnter);
      }
      if (svg && handlersRef.current.svgFocus) {
        svg.removeEventListener("focus", handlersRef.current.svgFocus);
      }

      // remove hamburger / document handlers
      const hamburgerContainer = hamburgerRef.current;
      if (hamburgerContainer && handlersRef.current.hamburgerClick)
        hamburgerContainer.removeEventListener(
          "click",
          handlersRef.current.hamburgerClick
        );
      if (hamburgerContainer && handlersRef.current.hamburgerKey)
        hamburgerContainer.removeEventListener(
          "keydown",
          handlersRef.current.hamburgerKey
        );
      if (handlersRef.current.docClick)
        document.removeEventListener("click", handlersRef.current.docClick);
      if (handlersRef.current.docKeyDown)
        document.removeEventListener("keydown", handlersRef.current.docKeyDown);

      // destroy lottie animation
      if (lottieAnim && typeof lottieAnim.destroy === "function") {
        try {
          lottieAnim.destroy();
        } catch { }
      }
    };
  }, []);

  return (
    <>
      {/* === PRELOADER === */}
      <div id="preloader" ref={preloaderRef}>
        <div className="loader">
          <img src="/assets/asvg.svg" alt="Loading..." id="logo-loader" />
        </div>
      </div>

      <nav>
        {/* Left: logo + word */}
          <Link to="/" style={{textDecoration: "none"}} >
          <div className="brand">
            <div
              className="logo-wrap"
              id="odessaWrap"
              ref={odessaWrapRef}
              tabIndex={0}
              aria-label="ODESSA logo"
            >
              <div className="logo-inner" id="odessaInner" ref={odessaInnerRef}>
                {/* Keep your SVG logo (abbreviated for clarity) */}
                <svg
                  id="odssaSVG"
                  ref={svgRef}
                  viewBox="0 0 210 297"
                  xmlns="http://www.w3.org/2000/svg"
                  role="img"
                  aria-hidden="true"
                >
                  {/* ... full SVG content */}
                  <g id="layer1">
                    <g
                      id="g31"
                      transform="matrix(0.53949346,0,0,0.53111475,50.778814,64.455021)"
                    >
                      <g id="g9" transform="translate(-0.31203889,-51.609475)">
                        <path
                          id="path2"
                          style={{
                            opacity: 0.778947,
                            fill: "#2a51ff",
                            fillOpacity: 1,
                            stroke: "none",
                          }}
                          d="M 100.76491,30.272571 74.727738,75.278092 48.833195,120.0366 h -0.06305 l 0.03152,0.0553 -0.111104,0.19224 h 0.221692 l 25.775688,44.82724 25.725559,44.73939 0.0915,-51.71829 0.0909,-51.70951 -0.19172,-0.11059 0.19223,-0.1111 v -0.063 l 0.0548,0.0315 32.91582,-18.965254 -6.84506,-11.879895 z" />
                        <path
                          id="path3"
                          style={{
                            opacity: 0.778947,
                            fill: "#00e5b4",
                            fillOpacity: 1,
                            stroke: "none",
                          }}
                          d="m 190.50672,54.507267 -45.05152,25.957072 -44.8045,25.814961 -0.0548,-0.0315 v 0.0636 l -0.19276,0.1111 0.19224,0.11059 -0.0915,51.70951 -0.0904,51.60822 25.93847,-44.74353 25.9333,-44.73628 -0.11059,-0.19172 h 0.22221 l 0.031,-0.0548 0.032,0.0548 37.98838,0.0336 0.0119,-13.71079 z M 100.41299,210.0895 v 0.003 l 5.2e-4,-5.1e-4 5.2e-4,-5.2e-4 5.1e-4,-5.2e-4 h 5.2e-4 c 6.9e-4,-2.9e-4 0.002,-7.1e-4 0.003,-0.001 v -5.2e-4 z" />
                      </g>

                      {/* duplicates/rotated groups kept as in your file */}
                      <g id="g11" transform="rotate(60,144.94534,183.54836)">
                        <path
                          id="path10"
                          style={{
                            opacity: 0.778947,
                            fill: "#2a51ff",
                            fillOpacity: 1,
                            stroke: "none",
                          }}
                          d="M 100.76491,30.272571 74.727738,75.278092 48.833195,120.0366 h -0.06305 l 0.03152,0.0553 -0.111104,0.19224 h 0.221692 l 25.775688,44.82724 25.725559,44.73939 0.0915,-51.71829 0.0909,-51.70951 -0.19172,-0.11059 0.19223,-0.1111 v -0.063 l 0.0548,0.0315 32.91582,-18.965254 -6.84506,-11.879895 z" />
                        <path
                          id="path11"
                          style={{
                            opacity: 0.778947,
                            fill: "#00e5b4",
                            fillOpacity: 1,
                            stroke: "none",
                          }}
                          d="m 190.50672,54.507267 -45.05152,25.957072 -44.8045,25.814961 -0.0548,-0.0315 v 0.0636 l -0.19276,0.1111 0.19224,0.11059 -0.0915,51.70951 -0.0904,51.60822 25.93847,-44.74353 25.9333,-44.73628 -0.11059,-0.19172 h 0.22221 l 0.031,-0.0548 0.032,0.0548 37.98838,0.0336 0.0119,-13.71079 z M 100.41299,210.0895 v 0.003 l 5.2e-4,-5.1e-4 5.2e-4,-5.2e-4 5.1e-4,-5.2e-4 h 5.2e-4 c 6.9e-4,-2.9e-4 0.002,-7.1e-4 0.003,-0.001 v -5.2e-4 z" />
                      </g>
                      <g id="g24" transform="rotate(120,115.14859,183.72853)">
                        <path
                          id="path23"
                          style={{
                            opacity: 0.778947,
                            fill: "#2a51ff",
                            fillOpacity: 1,
                            stroke: "none",
                          }}
                          d="M 100.76491,30.272571 74.727738,75.278092 48.833195,120.0366 h -0.06305 l 0.03152,0.0553 -0.111104,0.19224 h 0.221692 l 25.775688,44.82724 25.725559,44.73939 0.0915,-51.71829 0.0909,-51.70951 -0.19172,-0.11059 0.19223,-0.1111 v -0.063 l 0.0548,0.0315 32.91582,-18.965254 -6.84506,-11.879895 z" />
                        <path
                          id="path24"
                          style={{
                            opacity: 0.778947,
                            fill: "#00e5b4",
                            fillOpacity: 1,
                            stroke: "none",
                          }}
                          d="m 190.50672,54.507267 -45.05152,25.957072 -44.8045,25.814961 -0.0548,-0.0315 v 0.0636 l -0.19276,0.1111 0.19224,0.11059 -0.0915,51.70951 -0.0904,51.60822 25.93847,-44.74353 25.9333,-44.73628 -0.11059,-0.19172 h 0.22221 l 0.031,-0.0548 0.032,0.0548 37.98838,0.0336 0.0119,-13.71079 z M 100.41299,210.0895 v 0.003 l 5.2e-4,-5.1e-4 5.2e-4,-5.2e-4 5.1e-4,-5.2e-4 h 5.2e-4 c 6.9e-4,-2.9e-4 0.002,-7.1e-4 0.003,-0.001 v -5.2e-4 z" />
                      </g>

                      <g id="g26" transform="rotate(180,100.25022,183.81861)">
                        <path
                          id="path25"
                          style={{
                            opacity: 0.778947,
                            fill: "#2a51ff",
                            fillOpacity: 1,
                            stroke: "none",
                          }}
                          d="M 100.76491,30.272571 74.727738,75.278092 48.833195,120.0366 h -0.06305 l 0.03152,0.0553 -0.111104,0.19224 h 0.221692 l 25.775688,44.82724 25.725559,44.73939 0.0915,-51.71829 0.0909,-51.70951 -0.19172,-0.11059 0.19223,-0.1111 v -0.063 l 0.0548,0.0315 32.91582,-18.965254 -6.84506,-11.879895 z" />
                        <path
                          id="path26"
                          style={{
                            opacity: 0.778947,
                            fill: "#00e5b4",
                            fillOpacity: 1,
                            stroke: "none",
                          }}
                          d="m 190.50672,54.507267 -45.05152,25.957072 -44.8045,25.814961 -0.0548,-0.0315 v 0.0636 l -0.19276,0.1111 0.19224,0.11059 -0.0915,51.70951 -0.0904,51.60822 25.93847,-44.74353 25.9333,-44.73628 -0.11059,-0.19172 h 0.22221 l 0.031,-0.0548 0.032,0.0548 37.98838,0.0336 0.0119,-13.71079 z M 100.41299,210.0895 v 0.003 l 5.2e-4,-5.1e-4 5.2e-4,-5.2e-4 5.1e-4,-5.2e-4 h 5.2e-4 c 6.9e-4,-2.9e-4 0.002,-7.1e-4 0.003,-0.001 v -5.2e-4 z" />
                      </g>

                      <g id="g28" transform="rotate(-120,85.351849,183.90868)">
                        <path
                          id="path27"
                          style={{
                            opacity: 0.778947,
                            fill: "#2a51ff",
                            fillOpacity: 1,
                            stroke: "none",
                          }}
                          d="M 100.76491,30.272571 74.727738,75.278092 48.833195,120.0366 h -0.06305 l 0.03152,0.0553 -0.111104,0.19224 h 0.221692 l 25.775688,44.82724 25.725559,44.73939 0.0915,-51.71829 0.0909,-51.70951 -0.19172,-0.11059 0.19223,-0.1111 v -0.063 l 0.0548,0.0315 32.91582,-18.965254 -6.84506,-11.879895 z" />
                        <path
                          id="path28"
                          style={{
                            opacity: 0.778947,
                            fill: "#00e5b4",
                            fillOpacity: 1,
                            stroke: "none",
                          }}
                          d="m 190.50672,54.507267 -45.05152,25.957072 -44.8045,25.814961 -0.0548,-0.0315 v 0.0636 l -0.19276,0.1111 0.19224,0.11059 -0.0915,51.70951 -0.0904,51.60822 25.93847,-44.74353 25.9333,-44.73628 -0.11059,-0.19172 h 0.22221 l 0.031,-0.0548 0.032,0.0548 37.98838,0.0336 0.0119,-13.71079 z M 100.41299,210.0895 v 0.003 l 5.2e-4,-5.1e-4 5.2e-4,-5.2e-4 5.1e-4,-5.2e-4 h 5.2e-4 c 6.9e-4,-2.9e-4 0.002,-7.1e-4 0.003,-0.001 v -5.2e-4 z" />
                      </g>

                      <g id="g30" transform="rotate(-60,55.555105,184.08884)">
                        <path
                          id="path29"
                          style={{
                            opacity: 0.778947,
                            fill: "#2a51ff",
                            fillOpacity: 1,
                            stroke: "none",
                          }}
                          d="M 100.76491,30.272571 74.727738,75.278092 48.833195,120.0366 h -0.06305 l 0.03152,0.0553 -0.111104,0.19224 h 0.221692 l 25.775688,44.82724 25.725559,44.73939 0.0915,-51.71829 0.0909,-51.70951 -0.19172,-0.11059 0.19223,-0.1111 v -0.063 l 0.0548,0.0315 32.91582,-18.965254 -6.84506,-11.879895 z" />
                        <path
                          id="path30"
                          style={{
                            opacity: 0.778947,
                            fill: "#00e5b4",
                            fillOpacity: 1,
                            stroke: "none",
                          }}
                          d="m 190.50672,54.507267 -45.05152,25.957072 -44.8045,25.814961 -0.0548,-0.0315 v 0.0636 l -0.19276,0.1111 0.19224,0.11059 -0.0915,51.70951 -0.0904,51.60822 25.93847,-44.74353 25.9333,-44.73628 -0.11059,-0.19172 h 0.22221 l 0.031,-0.0548 0.032,0.0548 37.98838,0.0336 0.0119,-13.71079 z M 100.41299,210.0895 v 0.003 l 5.2e-4,-5.1e-4 5.2e-4,-5.2e-4 5.1e-4,-5.2e-4 h 5.2e-4 c 6.9e-4,-2.9e-4 0.002,-7.1e-4 0.003,-0.001 v -5.2e-4 z" />
                      </g>
                    </g>
                  </g>
                </svg>
              </div>
            </div>
            <h1 className="words" id="brand-heading" ref={wordRef}>
              ODESSA
            </h1>
          </div>
        </Link>

        {/* Right: navigation links */}
        <div className="nav-links">
          <Link to="/" className="active">Home</Link>
          <a href="#">Features</a>
          <a href="#">Pricing</a>
          <Link to="/login" className="login-btn vv">Login</Link>
        </div>

        <div className="margin hamburger">
          {/* Lottie animation will mount here */}
          <div
            className="hamburger"
            id="hamburger"
            ref={hamburgerRef}
            aria-label="Menu toggle"
            role="button"
            tabIndex={0}
          ></div>

          {/* Mobile Menu */}
          <div className="mobile-menu" id="mobileMenu" ref={mobileMenuRef}>
             <Link to="/" className="active">Home</Link>
            <a href="#">Features</a>
            <a href="#">Pricing</a>
            <Link to="/login" className="login-btn vv">Login</Link>
          </div>
        </div>
      </nav>

      <section className="bcg">
        <div className="wave-bg">
          <svg
            id="visual"
            ref={visualRef}
            viewBox="0 0 900 600"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            <path
              className="wave"
              d="M0 182L21.5 186.5C43 191 86 200 128.8 230.8C171.7 261.7 214.3 314.3 257.2 337.3C300 360.3 343 353.7 385.8 342.5C428.7 331.3 471.3 315.7 514.2 305.7C557 295.7 600 291.3 642.8 311.7C685.7 332 728.3 377 771.2 387.8C814 398.7 857 375.3 878.5 363.7L900 352L900 601L0 601Z"
              fill="#caedffc7" />
            <path
              className="wave"
              d="M0 334L21.5 351.2C43 368.3 86 402.7 128.8 421.2C171.7 439.7 214.3 442.3 257.2 419.5C300 396.7 343 348.3 385.8 331.3C428.7 314.3 471.3 328.7 514.2 338C557 347.3 600 351.7 642.8 342.5C685.7 333.3 728.3 310.7 771.2 322.2C814 333.7 857 379.3 878.5 402.2L900 425L900 601L0 601Z"
              fill="#BEE8FF" />
            <path
              className="wave"
              d="M0 532L21.5 525.7C43 519.3 86 506.7 128.8 491.8C171.7 477 214.3 460 257.2 452.3C300 444.7 343 446.3 385.8 454.3C428.7 462.3 471.3 476.7 514.2 472.2C557 467.7 600 444.3 642.8 450.3C685.7 456.3 728.3 491.7 771.2 494C814 496.3 857 465.7 878.5 450.3L900 435L900 601L0 601Z"
              fill="#AFD0FF" />
          </svg>
        </div>

        <div className="writeup">
          <h1 className="head">
            Manage Tickets <br />
            Like a <span style={{ color: "#2a51ffda" }}>Pro</span>
          </h1>
          <p className="subhead">
            Streamline your workflow with our powerful ticket management system.
            <br />
            Create, track, and resolve issues effortlessly.
          </p>
          <button className="signup">
          <Link to="/login"  style={{ textDecoration: "none", color: "inherit" }}>Sign up</Link>
          </button>
          <button className="login-btz">
           <Link to="/login"  style={{ textDecoration: "none", color: "inherit" }}>Login</Link>
          </button>
        </div>

        <div className="illustrations">
          {/* Blob */}
          <div className="blob">
            <svg
              viewBox="0 0 900 600"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="xMidYMid meet"
              aria-hidden="true"
            >
              <g transform="translate(409.3 277.2)">
                <path
                  d="M173 -158.7C223 -123 261.5 -61.5 255.7 -5.8C250 50 199.9 99.9 149.9 149.6C99.9 199.3 50 248.6 2.9 245.7C-44.2 242.9 -88.4 187.7 -120.1 138.1C-151.7 88.4 -170.9 44.2 -174.3 -3.5C-177.8 -51.1 -165.6 -102.3 -134 -138C-102.3 -173.6 -51.1 -193.8 5.2 -199C61.5 -204.2 123 -194.4 173 -158.7"
                  fill="#ffffff" />
                <path
                  d="M173 -158.7C223 -123 261.5 -61.5 255.7 -5.8C250 50 199.9 99.9 149.9 149.6C99.9 199.3 50 248.6 2.9 245.7C-44.2 242.9 -88.4 187.7 -120.1 138.1C-151.7 88.4 -170.9 44.2 -174.3 -3.5C-177.8 -51.1 -165.6 -102.3 -134 -138C-102.3 -173.6 -51.1 -193.8 5.2 -199C61.5 -204.2 123 -194.4 173 -158.7"
                  fill="none"
                  stroke="rgba(10,166,217,0.08)"
                  strokeWidth="28" />
              </g>
            </svg>
          </div>

          {/* Ticket */}
          <div className="ticket">
            <svg
              viewBox="0 0 128 128"
              xmlns="http://www.w3.org/2000/svg"
              id="ticket-body"
              ref={ticketRef}
            >
              <defs>
                <linearGradient
                  id="blue-gradient"
                  x1="64"
                  y1="127"
                  x2="64"
                  y2="1"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0" stopColor="#0066CC" />
                  <stop offset="1" stopColor="#96C8EA" />
                </linearGradient>
                <linearGradient
                  id="gold-gradient"
                  x1="64"
                  y1="58"
                  x2="64"
                  y2="13"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0" stopColor="#FFEBA1" />
                  <stop offset="0.5" stopColor="#FFF8E3" />
                  <stop offset="1" stopColor="#FFFFFF" />
                </linearGradient>
              </defs>
              <path
                d="M18 127V9.13A8.13 8.13 0 0 1 26.13 1h75.74A8.13 8.13 0 0 1 110 9.13V127Z"
                fill="url(#blue-gradient)" />
              <rect
                x="29"
                y="13"
                width="70"
                height="45"
                rx="3"
                ry="3"
                fill="url(#gold-gradient)"
                stroke="#E5D395"
                strokeWidth="0.5" />
              <rect x="36" y="76" width="8" height="8" fill="#324A7B" />
              <rect x="84" y="76" width="8" height="8" fill="#324A7B" />
              <path d="M84 76v37H70a6 6 0 1 0-12 0H44V76Z" fill="#FFFFFF" />
              <rect x="44" y="76" width="40" height="3" fill="#FFFFFF" />
              <path
                d="M101.87 0H26.13A9.15 9.15 0 0 0 17 9.13V127a1 1 0 0 0 1 1h92a1 1 0 0 0 1-1V9.13A9.15 9.15 0 0 0 101.87 0ZM109 126H19V9.13A7.14 7.14 0 0 1 26.13 2h75.74A7.14 7.14 0 0 1 109 9.13Z"
                fill="#324A7B" />
              <path
                d="M99 12H29a1 1 0 0 0-1 1v45a1 1 0 0 0 1 1h70a1 1 0 0 0 1-1V13a1 1 0 0 0-1-1ZM98 57H30V14h68Z"
                fill="#324A7B" />
              <path
                d="M92 75H36a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h7v28a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1 5 5 0 1 1 10 0 1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V85h7a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1Zm-55 8v-6h6v6Zm46 29H70.93a7 7 0 0 0-13.86 0H45V77h38Zm8-29h-6v-6h6Z"
                fill="#324A7B" />
              <circle cx="49" cy="88" r="1" fill="#324A7B" />
              <circle cx="55" cy="88" r="1" fill="#324A7B" />
              <circle cx="61" cy="88" r="1" fill="#324A7B" />
              <circle cx="67" cy="88" r="1" fill="#324A7B" />
              <circle cx="73" cy="88" r="1" fill="#324A7B" />
              <circle cx="79" cy="88" r="1" fill="#324A7B" />
              <path
                d="M27 55 6 33l3-4 17 12L55 12l4 4z"
                fill="#00E5B4"
                transform="matrix(0.75 0.06 -0.06 0.69 41.8 9.8)" />
            </svg>
          </div>
        </div>
      </section>
      <Features />
    </>
  );
}

export default LandingPage;
