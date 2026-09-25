import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";

export default function Navbar() {
  const preloaderRef = useRef(null);
  const odessaWrapRef = useRef(null);
  const odessaInnerRef = useRef(null);
  const svgRef = useRef(null);
  const wordRef = useRef(null);
  const handlersRef = useRef({});
  const timeoutsRef = useRef([]);

  useEffect(() => {
    const timeouts = [];
    const setManagedTimeout = (fn, ms) => {
      const id = window.setTimeout(fn, ms);
      timeouts.push(id);
      return id;
    };
    const clearAllTimeouts = () => {
      timeouts.forEach((id) => clearTimeout(id));
      timeouts.length = 0;
    };

    // ========== 🌀 FIXED: async startOdessaAnimation ==========
    async function startOdessaAnimation() {
      // Wait 1 frame so styles & fills are computed before reading them
      await new Promise(requestAnimationFrame);

      const wrap = odessaWrapRef.current;
      const inner = odessaInnerRef.current;
      const svg = svgRef.current;
      const word = wordRef.current;
      if (!wrap || !inner || !svg || !word) return;

      const STAGGER = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--stagger")) || 30;
      const BASE = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--build-duration")) || 300;
      const MOVE_DURATION = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--move-duration")) || 850;
      const MOVE_DELAY = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--reveal-delay")) || 1000;

      const paths = Array.from(svg.querySelectorAll("path"));
      const shapes = paths.filter((el) => {
        try {
          const bb = el.getBBox ? el.getBBox() : { width: 0, height: 0 };
          return (bb.width > 0 || bb.height > 0) && getComputedStyle(el).display !== "none";
        } catch {
          return true;
        }
      });

      const shapeInfo = shapes.map((el) => {
        const attrFill = el.getAttribute("fill");
        let orig = attrFill && attrFill !== "none" ? attrFill : null;
        if (!orig) {
          const csFill = getComputedStyle(el).fill;
          orig = csFill && csFill !== "none" ? csFill : "transparent";
        }
        el.dataset.origFill = orig;
        el.style.stroke = getComputedStyle(document.documentElement).getPropertyValue("--stroke") || "#000";
        el.style.strokeWidth = getComputedStyle(document.documentElement).getPropertyValue("--stroke-width") || 0.9;
        el.style.strokeLinecap = "round";
        el.style.strokeLinejoin = "round";
        el.style.vectorEffect = "non-scaling-stroke";
        el.style.fill = "transparent";

        let len = 120;
        try {
          if (typeof el.getTotalLength === "function") len = Math.round(el.getTotalLength());
        } catch {}
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

        shapeInfo.forEach((s) => {
          s.el.style.transition = "none";
          s.el.style.strokeDashoffset = s.len;
          s.el.style.fill = "transparent";
        });

        shapeInfo.forEach((s, i) => {
          const delay = 80 + i * STAGGER;
          const dur = Math.max(120, Math.round(BASE * Math.min(1.4, s.len / 120)));
          setManagedTimeout(() => {
            s.el.style.transition = `stroke-dashoffset ${dur}ms cubic-bezier(.2,.9,.2,1), fill ${Math.round(
              dur * 0.85
            )}ms ease`;
            requestAnimationFrame(() => {
              s.el.style.strokeDashoffset = "0";
              s.el.style.fill = s.el.dataset.origFill || "transparent";
            });
          }, delay);
        });

        const revealStart = totalDrawingTime + MOVE_DELAY;
        setManagedTimeout(() => {
          word.classList.add("visible");
          wrap.classList.add("moved");
          setManagedTimeout(() => {
            animating = false;
          }, MOVE_DURATION + 100);
        }, revealStart);
      }

      // run once immediately after page load
      setManagedTimeout(playAnimationAndReveal, 200);
    }
    // =========================================================

    // Page load
    function onPageLoad() {
      const preloader = preloaderRef.current;
      if (preloader) {
        setManagedTimeout(() => {
          preloader.classList.add("hide");
          startOdessaAnimation(); // run animation once
        }, 500);
      } else {
        startOdessaAnimation();
      }
    }

    if (document.readyState === "complete") onPageLoad();
    else {
      window.addEventListener("load", onPageLoad);
      handlersRef.current.pageLoad = onPageLoad;
    }

    // === Hover replay ===
    function setupLogoReplay() {
      const svg = svgRef.current;
      if (!svg) return;
      const paths = Array.from(svg.querySelectorAll("path"));
      let replaying = false;

      function replayAnimationTwice() {
        if (replaying) return;
        replaying = true;
        let replayCount = 0;

        function runOnce() {
          paths.forEach((p) => {
            let len = 120;
            try {
              len = Math.round(p.getTotalLength());
            } catch {}
            p.style.transition = "none";
            p.style.strokeDasharray = len;
            p.style.strokeDashoffset = len;
            p.style.fill = "transparent";
          });

          void svg.offsetWidth;

          paths.forEach((p, i) => {
            let len = 120;
            try {
              len = Math.round(p.getTotalLength());
            } catch {}
            const dur = Math.max(120, Math.round(380 * Math.min(1.4, len / 120)));
            const delay = i * 40;
            setManagedTimeout(() => {
              p.style.transition = `stroke-dashoffset ${dur}ms cubic-bezier(.2,.9,.2,1), fill ${Math.round(
                dur * 0.85
              )}ms ease`;
              p.style.strokeDashoffset = "0";
              p.style.fill = p.dataset.origFill || p.getAttribute("fill") || "#00e5b4";
            }, delay);
          });
        }

        function loopTwice() {
          if (replayCount < 1) {
            runOnce();
            replayCount++;
            setManagedTimeout(loopTwice, 1200);
          } else {
            replaying = false;
          }
        }

        loopTwice();
      }

      svg.addEventListener("mouseenter", replayAnimationTwice);
      svg.addEventListener("focus", replayAnimationTwice);
      handlersRef.current.svgMouseEnter = replayAnimationTwice;
      handlersRef.current.svgFocus = replayAnimationTwice;
    }

    setupLogoReplay();

    // Cleanup
    return () => {
      clearAllTimeouts();
      if (handlersRef.current.pageLoad) window.removeEventListener("load", handlersRef.current.pageLoad);
      const svg = svgRef.current;
      if (svg && handlersRef.current.svgMouseEnter)
        svg.removeEventListener("mouseenter", handlersRef.current.svgMouseEnter);
      if (svg && handlersRef.current.svgFocus)
        svg.removeEventListener("focus", handlersRef.current.svgFocus);
    };
  }, []);

  return (
    <>
    {/* === PRELOADER === */}
      <div id="preloader" ref={preloaderRef}>
        <div className="loader">
          <img src="assets/asvg.svg" alt="Loading..." id="logo-loader" />
        </div>
      </div>
       
    <nav className="ddd">
      <Link to="/" style={{ textDecoration: "none" }}>
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
    </nav>
    </>
  );
}

