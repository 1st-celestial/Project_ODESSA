import React, { useEffect, useRef } from "react";
import "./Features.css";
import feather from "feather-icons";
import gsap from "gsap";
import { Link } from "react-router-dom";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  { id: "f1", icon: "plus-circle", title: "Create Tickets", text: "Effortlessly log new requests or issues in seconds. Capture the right details — priority, description, attachments, and assignee — all in one neat place." },
  { id: "f2", icon: "file-text", title: "Track Progress", text: "Stay in control of every ongoing ticket with real-time visibility and quick insights into what's pending or completed." },
  { id: "f3", icon: "users", title: "Team Collaboration", text: "Bring your team together in one connected space. Comment, mention teammates, and share files instantly. Everthing moves in sync and decisions happen faster." },
  { id: "f4", icon: "bar-chart-2", title: "Reports & Analytics", text: "Turn activity into insight with detailed visual reports. Identify trends and measure performance. Spot bottlenecks early and make informed improvements with confidence." },
  { id: "f5", icon: "slack", title: "Integrations", text: "Integrate Slack, Email, and developer tools into your workspace for seamless work management. Streamline updates, discussions, and automated alerts." },
  { id: "f6", icon: "shield", title: "Security & Roles", text: "Assign permissions precisely using role-based access. Keep your operations safe with full transparency esnuring your data stays secure, private, and always in the right hands." },
];

export default function Features() {
  const railRef = useRef(null);
  const pinWrapRef = useRef(null);
  const cardsRef = useRef([]);
  const ctaRef = useRef(null);

  useEffect(() => {
    // render icons (must run after elements are in DOM)
    feather.replace();

    // initialize horizontal pin (desktop) and reveal animations
    function init() {
      initHorizontalPin();
      initCardReveals();
      initCTA();
      ScrollTrigger.refresh();
    }

    function initHorizontalPin() {
      const rail = railRef.current;
      const pinWrap = pinWrapRef.current;
      if (!rail || !pinWrap) return;

      const cards = Array.from(rail.children || []);
      if (cards.length === 0) return;

      // kill previous triggers
      ScrollTrigger.getAll().forEach((t) => t.kill());
      gsap.set(rail, { clearProps: "x" });

     if (window.innerWidth >= 1024) {
  const totalWidth = rail.scrollWidth;
  const viewportW = Math.min(
    document.documentElement.clientWidth,
    parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--max-width")) || document.documentElement.clientWidth
  );
  const scrollDistance = Math.max(0, totalWidth - viewportW + 99);

  const tallestCard = Math.max(...cards.map((c) => c.offsetHeight || 0));

  // compute navbar height if present (fallback to 100)
  const navbar = document.querySelector(".navbar, nav, .brand"); 
  const navbarHeight = (navbar && navbar.offsetHeight) ? navbar.offsetHeight : 160;

  // desired height: lower multiplier and padding to avoid huge white gap
  const desiredHeight = Math.max(window.innerHeight * 0.5, tallestCard + 40);
  pinWrap.style.minHeight = `${desiredHeight}px`;

  
  // adjust preStartOffset to tune how early (in px)
  const preStartOffset = Math.min( Math.max(Math.round(navbarHeight * 0.9), 200), 400 ); // between ~60 and 160 px
  const startStr = `top-=${preStartOffset} top`;

  const tl = gsap.timeline({
    scrollTrigger: {
      id: "featuresPin",
      trigger: pinWrap,
      start: startStr,
      end: `+=${scrollDistance + window.innerHeight * 0.25}`,
      scrub: 0.8,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onRefresh(self) {
        // keep pinWrap height in sync if layout reflows
        const tallest = Math.max(...cards.map((c) => c.offsetHeight || 0));
        pinWrap.style.minHeight = `${Math.max(window.innerHeight * 0.6, tallest + 50)}px`;
      }
    }
  });

  tl.to(rail, { x: `-${scrollDistance}px`, ease: "none" });
} else {
  // small screens: reset transforms and pin height
  pinWrap.style.minHeight = "";
  gsap.set(rail, { clearProps: "transform" });
}
  }



    function initCardReveals() {
      // kill existing reveal triggers
      ScrollTrigger.getAll().forEach((t) => {
        if (t.vars && t.vars.id && t.vars.id.startsWith("reveal-")) t.kill();
      });

      const cards = cardsRef.current.filter(Boolean);
      cards.forEach((card, i) => {
        gsap.fromTo(card, { y: 60, opacity: 0 }, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          delay: i * 0.06,
          scrollTrigger: {
            id: `reveal-${i}`,
            trigger: card,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        });
      });
    }

    function initCTA() {
      const cta = ctaRef.current;
      if (!cta) return;
      gsap.fromTo(cta, { y: 80, opacity: 0 }, {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: cta,
          start: "top 90%",
          toggleActions: "play none none reverse",
        },
      });
    }

    // init once on mount
    init();

    // refresh/init on resize (debounced)
    let t;
    const onResize = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        init();
        ScrollTrigger.refresh();
      }, 120);
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("load", () => {
      init();
      ScrollTrigger.refresh();
    });

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="features-section">
      <div className="site-inner container">
        <h2 className="section-title">Powerful Features</h2>

        <div id="featuresPinWrap" ref={pinWrapRef} className="features-pinwrap">
          <div id="featuresRail" ref={railRef} className="features-rail">
            {FEATURES.map((f, i) => (
              <article
                key={f.id}
                className="feature-card"
                ref={(el) => (cardsRef.current[i] = el)}
                tabIndex={0}
                aria-labelledby={f.id}
              >
                <div className="feature-icon"><i data-feather={f.icon}></i></div>
                <div className="feature-text">
                  <h3 id={f.id}>{f.title}</h3>
                  <p>{f.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
        
        {/* CTA */}
        <div className="cta-section" ref={ctaRef}>
          <div className="cta-inner">
            <h3 className="cta-title">Ready to get started?</h3>
            <p className="cta-text">Join hundreds of teams using Odessa to streamline collaboration and project tracking.</p>
            <Link to="/login" style={{ textDecoration: "none", color: "inherit"}} className="cta-btn">Get Started</Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">Odessa</div>
          <ul className="footer-links">
            <li><Link to="/" style={{ textDecoration: "none", color: "inherit" }} >Home</Link></li>
            <li>Features</li>
            <li>Pricing</li>
            <li><Link to="/login" style={{ textDecoration: "none", color: "inherit" }} >Get Started</Link></li>
            
          </ul>
          <p className="footer-copy">© {new Date().getFullYear()}© <span id="year"></span> Odessa — created with curiosity by Celestial • built with React</p>
        </div>
      </footer>
      </section>
  );
}
