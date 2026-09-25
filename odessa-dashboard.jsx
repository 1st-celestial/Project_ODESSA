import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, LineChart, Line
} from "recharts";

const COLORS = {
  navy: "#071525",
  navyMid: "#0D2137",
  navyLight: "#132C45",
  teal: "#1AC8B4",
  tealDim: "#0E8F7F",
  blue: "#3B82F6",
  amber: "#F59E0B",
  red: "#EF4444",
  green: "#10B981",
  text: "#CBD5E1",
  textDim: "#64748B",
  white: "#F0F6FF",
};

const financialData = [
  { year: "Y1 2025", revenue: 3000, costs: 14000, net: -11000, customers: 2 },
  { year: "Y2 2026", revenue: 36000, costs: 28000, net: 8000, customers: 10 },
  { year: "Y3 2027", revenue: 120000, costs: 72000, net: 48000, customers: 32 },
  { year: "Y4 2028", revenue: 300000, costs: 145000, net: 155000, customers: 75 },
  { year: "Y5 2029", revenue: 600000, costs: 290000, net: 310000, customers: 150 },
];

const mrrData = [
  { year: "Y1", starter: 600, pro: 0, enterprise: 0 },
  { year: "Y2", starter: 1800, pro: 900, enterprise: 300 },
  { year: "Y3", starter: 4200, pro: 3600, enterprise: 2200 },
  { year: "Y4", starter: 7500, pro: 9000, enterprise: 8500 },
  { year: "Y5", starter: 12000, pro: 18000, enterprise: 20000 },
];

const phases = [
  {
    phase: "Phase 0",
    title: "Foundation",
    duration: "Months 1–3",
    status: "now",
    color: COLORS.teal,
    tasks: [
      "Complete backend with Node.js + PostgreSQL",
      "Replace Firebase with production auth (JWT + RBAC)",
      "Deploy MVP to a VPS (Railway, Render, or DigitalOcean)",
      "Build basic CI/CD pipeline",
    ],
    tools: ["Node.js / NestJS", "PostgreSQL + Redis", "Railway / Render", "GitHub Actions"],
  },
  {
    phase: "Phase 1",
    title: "Beta Launch",
    duration: "Months 4–7",
    status: "soon",
    color: COLORS.blue,
    tasks: [
      "Onboard 2–5 pilot organizations (free or discounted)",
      "Implement ticket lifecycle + role dashboards",
      "Add email notifications & audit logs",
      "Begin AI ticket routing (OpenAI / Claude API)",
    ],
    tools: ["OpenAI API / Claude API", "Resend (email)", "Sentry (monitoring)", "Posthog (analytics)"],
  },
  {
    phase: "Phase 2",
    title: "Commercial Launch",
    duration: "Months 8–14",
    status: "future",
    color: COLORS.amber,
    tasks: [
      "Go paid — implement Stripe billing",
      "Mobile-responsive or React Native companion app",
      "Multi-language support (French/English)",
      "SOC2-lite compliance for enterprise sales",
    ],
    tools: ["Stripe", "React Native / Expo", "i18next", "Datadog"],
  },
  {
    phase: "Phase 3",
    title: "Scale",
    duration: "Months 15–24",
    status: "future",
    color: COLORS.green,
    tasks: [
      "Hire first employee (sales or backend dev)",
      "Enterprise contracts with port authorities / oil & gas",
      "Custom integrations (SAP, Oracle) via API",
      "Raise pre-seed funding ($150k–$500k)",
    ],
    tools: ["Zapier / Make.com", "HubSpot CRM", "Pitch deck + investor outreach"],
  },
];

const missingItems = [
  { icon: "💰", title: "Pricing Model", severity: "high", note: "No pricing defined. Start with $149/mo (Starter), $399/mo (Pro), $999/mo (Enterprise). B2B SaaS needs clear tiers." },
  { icon: "📊", title: "Competitive Analysis", severity: "high", note: "Competitors exist: ServiceNow, Freshdesk, Zoho Desk. Your edge is francophone Africa + industrial niche. Spell this out." },
  { icon: "🔒", title: "Data Privacy / Compliance", severity: "high", note: "Industrial clients (oil & gas, ports) will ask about GDPR, data residency, and security. You need a compliance roadmap early." },
  { icon: "🧪", title: "Validation", severity: "medium", note: "Have you talked to 10+ potential customers? Build nothing more until you have 3 people who say 'I'd pay for this today.'" },
  { icon: "📱", title: "Mobile Strategy", severity: "medium", note: "Industrial workers on the floor don't use laptops. A mobile-first or PWA approach is critical for your target sectors." },
  { icon: "🌍", title: "Go-to-Market Strategy", severity: "medium", note: "Who is your first 10 customers? LinkedIn outreach to ops managers in Dakar, Lagos, Abidjan? Define this clearly." },
  { icon: "📄", title: "Offline Mode", severity: "low", note: "Ports and industrial sites often have poor internet. Offline-capable features could be a strong differentiator." },
];

const aiRoadmap = [
  { stage: "MVP AI", label: "AI Ticket Triage", desc: "Auto-classify & route incoming tickets to right department using OpenAI/Claude. 1-2 weeks to implement.", effort: "Low", impact: "High" },
  { stage: "V2 AI", label: "Smart Response Suggestions", desc: "AI drafts initial responses for supervisors to approve. Reduces resolution time by ~40%.", effort: "Medium", impact: "High" },
  { stage: "V3 AI", label: "Anomaly Detection", desc: "Detect patterns — e.g. recurring issues from the same client, predictive maintenance alerts.", effort: "High", impact: "High" },
  { stage: "V4 AI", label: "Natural Language Reporting", desc: "Managers ask 'How many tickets were resolved this week?' in plain French/English and get instant answers.", effort: "High", impact: "Medium" },
];

const brandFeedback = [
  { area: "Logo", score: 8, note: "Strong geometric mark. The pinwheel/star communicates 'connected operations'. Works well in dark mode. Consider a simplified 1-color version for embossing/print." },
  { area: "Color Palette", score: 7, note: "Navy + teal is clean and professional. Add a warm accent (amber or gold) for alerts/CTAs to avoid the palette feeling cold to non-technical clients." },
  { area: "Typography", score: 5, note: "Not defined in the doc. This is urgent — typography is 60% of brand perception. Recommend: Syne (display) + DM Sans (body) for a modern industrial feel." },
  { area: "Tone of Voice", score: 4, note: "Unclear. For francophone Africa enterprise: be direct, credible, bilingual. Avoid startup jargon. Speak like an operations manager, not a tech bro." },
  { area: "Motion / Video", score: 3, note: "Not yet developed. Priority: 60-second explainer video showing a ticket being logged → routed → resolved. This alone will convert enterprise clients." },
  { area: "Content Strategy", score: 3, note: "Zero social presence visible. Recommend: LinkedIn + YouTube targeting ops managers. Post 2x/week: short problem-solution clips, 'day in the life of a port supervisor'." },
];

const formatCurrency = (val) => {
  if (Math.abs(val) >= 1000) return `$${(val / 1000).toFixed(0)}k`;
  return `$${val}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: COLORS.navyMid, border: `1px solid ${COLORS.teal}30`, borderRadius: 8, padding: "10px 14px" }}>
        <p style={{ color: COLORS.teal, fontWeight: 700, marginBottom: 4 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, margin: "2px 0", fontSize: 13 }}>
            {p.name}: {typeof p.value === "number" && p.name !== "customers" ? formatCurrency(p.value) : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function OdessaDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedPhase, setExpandedPhase] = useState(null);

  const tabs = [
    { id: "overview", label: "📋 Assessment" },
    { id: "timeline", label: "🗓 Build Roadmap" },
    { id: "financials", label: "📈 Financials" },
    { id: "ai", label: "🤖 AI Strategy" },
    { id: "brand", label: "🎨 Brand & Marketing" },
  ];

  return (
    <div style={{
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      background: COLORS.navy,
      color: COLORS.text,
      minHeight: "100vh",
      padding: "0 0 60px 0",
    }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${COLORS.navyMid} 0%, ${COLORS.navy} 100%)`,
        borderBottom: `1px solid ${COLORS.teal}25`,
        padding: "28px 32px 0",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 6 }}>
          <div style={{
            width: 38, height: 38, background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.blue})`,
            borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 900, color: COLORS.navy,
          }}>O</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.white, letterSpacing: "-0.5px" }}>PROJECT ODESSA</div>
            <div style={{ fontSize: 12, color: COLORS.tealDim, letterSpacing: "1px", textTransform: "uppercase" }}>Founder Intelligence Brief</div>
          </div>
          <div style={{ marginLeft: "auto", background: `${COLORS.teal}20`, border: `1px solid ${COLORS.teal}40`, borderRadius: 20, padding: "4px 12px", fontSize: 12, color: COLORS.teal }}>
            Pre-Seed Stage
          </div>
        </div>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, marginTop: 20, overflowX: "auto" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              background: "none", border: "none", cursor: "pointer",
              padding: "10px 18px", fontSize: 13, fontWeight: activeTab === t.id ? 700 : 500,
              color: activeTab === t.id ? COLORS.teal : COLORS.textDim,
              borderBottom: activeTab === t.id ? `2px solid ${COLORS.teal}` : "2px solid transparent",
              transition: "all 0.2s", whiteSpace: "nowrap",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "28px 32px", maxWidth: 960, margin: "0 auto" }}>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <div>
            <h2 style={{ color: COLORS.white, fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Honest Assessment</h2>
            <p style={{ color: COLORS.textDim, fontSize: 14, marginBottom: 24 }}>What's good, what's risky, and what you're missing.</p>

            {/* Verdict card */}
            <div style={{ background: `linear-gradient(135deg, ${COLORS.teal}15, ${COLORS.blue}10)`, border: `1px solid ${COLORS.teal}40`, borderRadius: 12, padding: "20px 24px", marginBottom: 28 }}>
              <div style={{ fontSize: 13, color: COLORS.teal, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>Overall Verdict</div>
              <p style={{ fontSize: 15, lineHeight: 1.7, color: COLORS.white, margin: 0 }}>
                <strong style={{ color: COLORS.teal }}>The idea is solid and the market is real.</strong> Francophone Africa's industrial sector is genuinely underserved by existing SaaS tools — most are English-first, priced for Western SMEs, and not built for operational environments like ports or oil sites. Your niche is your biggest asset. The risk is that you're still very early technically, and the gap between "cool frontend prototype" and "enterprise-ready platform" is enormous. This is a 2–3 year serious build, not a side project.
              </p>
            </div>

            {/* Strengths & Risks grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
              {[
                { title: "✅ Strengths", color: COLORS.green, items: [
                  "Niche market with low competition (francophone Africa industrial)",
                  "Real pain point — fragmented ops workflows are universal",
                  "AI integration is a genuine differentiator vs legacy tools",
                  "Role-based architecture is right for B2B enterprise",
                  "Founder has both engineering and domain instincts",
                ]},
                { title: "⚠️ Real Risks", color: COLORS.amber, items: [
                  "Solo founder building a complex B2B product — burnout risk is high",
                  "Enterprise sales cycles are 6–18 months long",
                  "No backend yet = no real product yet",
                  "Target customers may not have budget for new SaaS tools",
                  "No validation from paying customers yet",
                ]},
              ].map((col, i) => (
                <div key={i} style={{ background: COLORS.navyMid, borderRadius: 12, padding: "20px", border: `1px solid ${col.color}30` }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: col.color, marginBottom: 14 }}>{col.title}</div>
                  {col.items.map((item, j) => (
                    <div key={j} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: col.color, marginTop: 6, flexShrink: 0 }}></div>
                      <span style={{ fontSize: 13, lineHeight: 1.6, color: COLORS.text }}>{item}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Missing Items */}
            <h3 style={{ color: COLORS.white, fontSize: 16, fontWeight: 700, marginBottom: 14 }}>🔍 What's Missing From the Plan</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {missingItems.map((item, i) => (
                <div key={i} style={{
                  background: COLORS.navyMid, borderRadius: 10, padding: "14px 18px",
                  border: `1px solid ${item.severity === "high" ? COLORS.red : item.severity === "medium" ? COLORS.amber : COLORS.textDim}30`,
                  display: "flex", gap: 14, alignItems: "flex-start"
                }}>
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, color: COLORS.white, fontSize: 14 }}>{item.title}</span>
                      <span style={{
                        fontSize: 10, padding: "2px 8px", borderRadius: 10, fontWeight: 700, textTransform: "uppercase",
                        background: item.severity === "high" ? `${COLORS.red}20` : item.severity === "medium" ? `${COLORS.amber}20` : `${COLORS.textDim}20`,
                        color: item.severity === "high" ? COLORS.red : item.severity === "medium" ? COLORS.amber : COLORS.textDim,
                      }}>{item.severity}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: COLORS.textDim, lineHeight: 1.6 }}>{item.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TIMELINE TAB ── */}
        {activeTab === "timeline" && (
          <div>
            <h2 style={{ color: COLORS.white, fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Realistic Build Roadmap</h2>
            <p style={{ color: COLORS.textDim, fontSize: 14, marginBottom: 8 }}>Based on a solo founder working part-time to full-time. Click each phase to expand.</p>
            <div style={{ background: `${COLORS.amber}15`, border: `1px solid ${COLORS.amber}40`, borderRadius: 10, padding: "12px 16px", marginBottom: 24, fontSize: 13, color: COLORS.amber }}>
              ⏱ <strong>Total honest timeline to enterprise-ready product: 18–24 months.</strong> Anyone saying 6 months is selling you something.
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {phases.map((p, i) => (
                <div key={i} style={{
                  background: COLORS.navyMid, borderRadius: 12,
                  border: `1px solid ${expandedPhase === i ? p.color : p.color + "30"}`,
                  overflow: "hidden", transition: "all 0.2s",
                }}>
                  <div
                    onClick={() => setExpandedPhase(expandedPhase === i ? null : i)}
                    style={{ padding: "18px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 16 }}
                  >
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: `${p.color}20`, border: `2px solid ${p.color}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ color: p.color, fontWeight: 900, fontSize: 13 }}>{p.phase.split(" ")[1]}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, color: COLORS.white, fontSize: 15 }}>{p.title}</div>
                      <div style={{ fontSize: 12, color: COLORS.textDim }}>{p.duration}</div>
                    </div>
                    {p.status === "now" && <span style={{ background: `${COLORS.teal}20`, color: COLORS.teal, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 10 }}>YOU ARE HERE</span>}
                    <span style={{ color: COLORS.textDim, fontSize: 18 }}>{expandedPhase === i ? "▲" : "▼"}</span>
                  </div>
                  {expandedPhase === i && (
                    <div style={{ padding: "0 20px 20px", borderTop: `1px solid ${p.color}20` }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 16 }}>
                        <div>
                          <div style={{ fontSize: 12, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>Key Tasks</div>
                          {p.tasks.map((t, j) => (
                            <div key={j} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                              <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${p.color}`, flexShrink: 0, marginTop: 1 }}></div>
                              <span style={{ fontSize: 13, lineHeight: 1.5, color: COLORS.text }}>{t}</span>
                            </div>
                          ))}
                        </div>
                        <div>
                          <div style={{ fontSize: 12, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>Tools to Use</div>
                          {p.tools.map((t, j) => (
                            <div key={j} style={{ background: `${p.color}10`, border: `1px solid ${p.color}30`, borderRadius: 6, padding: "6px 12px", marginBottom: 6, fontSize: 13, color: p.color }}>{t}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginTop: 24, background: COLORS.navyMid, borderRadius: 12, padding: "20px", border: `1px solid ${COLORS.blue}30` }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.blue, marginBottom: 12 }}>📚 Learning Roadmap (for you as a founder)</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {[
                  { topic: "NestJS + PostgreSQL", priority: "Immediate" },
                  { topic: "JWT & RBAC Auth", priority: "Immediate" },
                  { topic: "Docker + Deployment", priority: "Month 2" },
                  { topic: "Stripe Billing", priority: "Month 5" },
                  { topic: "LLM API Integration", priority: "Month 4" },
                  { topic: "Enterprise Sales basics", priority: "Month 6" },
                ].map((l, i) => (
                  <div key={i} style={{ background: `${COLORS.blue}10`, borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.white }}>{l.topic}</div>
                    <div style={{ fontSize: 11, color: COLORS.blue, marginTop: 2 }}>{l.priority}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── FINANCIALS TAB ── */}
        {activeTab === "financials" && (
          <div>
            <h2 style={{ color: COLORS.white, fontSize: 22, fontWeight: 800, marginBottom: 4 }}>3–5 Year Financial Projections</h2>
            <p style={{ color: COLORS.textDim, fontSize: 14, marginBottom: 8 }}>Conservative scenario. Based on B2B SaaS pricing & organic growth in francophone Africa.</p>
            <div style={{ background: `${COLORS.teal}10`, border: `1px solid ${COLORS.teal}30`, borderRadius: 10, padding: "12px 16px", marginBottom: 24, fontSize: 13, color: COLORS.textDim }}>
              💡 <strong style={{ color: COLORS.teal }}>Pricing assumption:</strong> Starter $149/mo · Pro $399/mo · Enterprise $999/mo. Avg blended ~$350/mo per org.
            </div>

            {/* KPI row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 28 }}>
              {financialData.map((d, i) => (
                <div key={i} style={{ background: COLORS.navyMid, borderRadius: 10, padding: "14px", border: `1px solid ${d.net >= 0 ? COLORS.teal : COLORS.red}30` }}>
                  <div style={{ fontSize: 11, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>{d.year}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: d.net >= 0 ? COLORS.green : COLORS.red }}>{formatCurrency(d.net)}</div>
                  <div style={{ fontSize: 11, color: COLORS.textDim, marginTop: 2 }}>Net · {d.customers} orgs</div>
                </div>
              ))}
            </div>

            {/* Revenue vs Cost Chart */}
            <div style={{ background: COLORS.navyMid, borderRadius: 12, padding: "20px", marginBottom: 20, border: `1px solid ${COLORS.teal}20` }}>
              <div style={{ fontWeight: 700, color: COLORS.white, marginBottom: 16 }}>Revenue vs Costs</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={financialData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke={`${COLORS.text}10`} />
                  <XAxis dataKey="year" tick={{ fill: COLORS.textDim, fontSize: 12 }} />
                  <YAxis tickFormatter={formatCurrency} tick={{ fill: COLORS.textDim, fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: COLORS.textDim, fontSize: 12 }} />
                  <Bar dataKey="revenue" name="Revenue" fill={COLORS.teal} radius={[4,4,0,0]} />
                  <Bar dataKey="costs" name="Costs" fill={COLORS.blue} radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* MRR Breakdown */}
            <div style={{ background: COLORS.navyMid, borderRadius: 12, padding: "20px", marginBottom: 20, border: `1px solid ${COLORS.blue}20` }}>
              <div style={{ fontWeight: 700, color: COLORS.white, marginBottom: 16 }}>MRR Breakdown by Tier</div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={mrrData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={`${COLORS.text}10`} />
                  <XAxis dataKey="year" tick={{ fill: COLORS.textDim, fontSize: 12 }} />
                  <YAxis tickFormatter={v => `$${v}`} tick={{ fill: COLORS.textDim, fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: COLORS.textDim, fontSize: 12 }} />
                  <Area type="monotone" dataKey="starter" name="Starter" stackId="1" stroke={COLORS.tealDim} fill={`${COLORS.tealDim}60`} />
                  <Area type="monotone" dataKey="pro" name="Pro" stackId="1" stroke={COLORS.blue} fill={`${COLORS.blue}50`} />
                  <Area type="monotone" dataKey="enterprise" name="Enterprise" stackId="1" stroke={COLORS.amber} fill={`${COLORS.amber}50`} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Assumptions table */}
            <div style={{ background: COLORS.navyMid, borderRadius: 12, padding: "20px", border: `1px solid ${COLORS.textDim}20` }}>
              <div style={{ fontWeight: 700, color: COLORS.white, marginBottom: 14 }}>Key Assumptions</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 13 }}>
                {[
                  ["Annual customer growth", "3× Y1→Y2, 3× Y2→Y3, 2.3× Y3→Y4, 2× Y4→Y5"],
                  ["Average churn rate", "8–12% annually (typical B2B SaaS)"],
                  ["Avg revenue per org", "$350/month ($4,200/year)"],
                  ["Year 1 cost drivers", "Cloud infra, dev tools, your time value"],
                  ["Year 2–3 cost drivers", "Part-time contractor, marketing spend"],
                  ["Year 4–5 cost drivers", "2–3 full-time hires, office, enterprise sales"],
                ].map(([k,v], i) => (
                  <div key={i} style={{ background: `${COLORS.navy}80`, borderRadius: 8, padding: "10px 14px" }}>
                    <div style={{ color: COLORS.textDim, fontSize: 11, marginBottom: 2 }}>{k}</div>
                    <div style={{ color: COLORS.text, fontWeight: 600 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── AI TAB ── */}
        {activeTab === "ai" && (
          <div>
            <h2 style={{ color: COLORS.white, fontSize: 22, fontWeight: 800, marginBottom: 4 }}>AI Integration Strategy</h2>
            <p style={{ color: COLORS.textDim, fontSize: 14, marginBottom: 24 }}>How to build AI into Odessa in stages — starting simple, growing sophisticated.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 28 }}>
              {aiRoadmap.map((item, i) => (
                <div key={i} style={{ background: COLORS.navyMid, borderRadius: 12, padding: "18px 20px", border: `1px solid ${COLORS.teal}20`, display: "flex", gap: 18, alignItems: "flex-start" }}>
                  <div style={{ width: 42, height: 42, borderRadius: 8, background: `${COLORS.teal}20`, border: `1px solid ${COLORS.teal}50`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ color: COLORS.teal, fontWeight: 800, fontSize: 12 }}>{i + 1}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 800, color: COLORS.white, fontSize: 15 }}>{item.label}</span>
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: `${COLORS.blue}20`, color: COLORS.blue }}>{item.stage}</span>
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: item.effort === "Low" ? `${COLORS.green}20` : item.effort === "Medium" ? `${COLORS.amber}20` : `${COLORS.red}20`, color: item.effort === "Low" ? COLORS.green : item.effort === "Medium" ? COLORS.amber : COLORS.red }}>Effort: {item.effort}</span>
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: `${COLORS.teal}20`, color: COLORS.teal }}>Impact: {item.impact}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: COLORS.textDim, lineHeight: 1.6 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ background: COLORS.navyMid, borderRadius: 12, padding: "18px", border: `1px solid ${COLORS.green}30` }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: COLORS.green, marginBottom: 12 }}>✅ Recommended AI APIs</div>
                {[
                  ["OpenAI GPT-4o", "Best for text classification & routing"],
                  ["Claude API (Anthropic)", "Best for nuanced language tasks + French"],
                  ["Whisper API", "Voice-to-ticket for field workers"],
                  ["LangChain / LlamaIndex", "Orchestrate multi-step AI workflows"],
                ].map(([name, desc], i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <div style={{ fontWeight: 700, color: COLORS.white, fontSize: 13 }}>{name}</div>
                    <div style={{ fontSize: 12, color: COLORS.textDim }}>{desc}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: COLORS.navyMid, borderRadius: 12, padding: "18px", border: `1px solid ${COLORS.amber}30` }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: COLORS.amber, marginBottom: 12 }}>⚠️ AI Pitfalls to Avoid</div>
                {[
                  "Don't build AI before your core product works",
                  "Never let AI make final decisions on critical ops tasks",
                  "Always have a human-in-the-loop for enterprise clients",
                  "French language AI quality varies — test thoroughly",
                  "Don't send sensitive client data to external APIs without contracts",
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
                    <span style={{ color: COLORS.amber, marginTop: 1 }}>⚠</span>
                    <span style={{ fontSize: 12, color: COLORS.textDim, lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── BRAND TAB ── */}
        {activeTab === "brand" && (
          <div>
            <h2 style={{ color: COLORS.white, fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Brand & Marketing Feedback</h2>
            <p style={{ color: COLORS.textDim, fontSize: 14, marginBottom: 24 }}>Honest scores and actionable recommendations for each brand area.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
              {brandFeedback.map((item, i) => (
                <div key={i} style={{ background: COLORS.navyMid, borderRadius: 12, padding: "18px 20px", border: `1px solid ${COLORS.teal}15` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
                    <span style={{ fontWeight: 800, color: COLORS.white, fontSize: 14, width: 130 }}>{item.area}</span>
                    <div style={{ display: "flex", gap: 3 }}>
                      {[1,2,3,4,5,6,7,8,9,10].map(n => (
                        <div key={n} style={{ width: 16, height: 8, borderRadius: 2, background: n <= item.score ? (item.score >= 7 ? COLORS.teal : item.score >= 5 ? COLORS.amber : COLORS.red) : `${COLORS.textDim}30` }}></div>
                      ))}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 800, color: item.score >= 7 ? COLORS.teal : item.score >= 5 ? COLORS.amber : COLORS.red }}>{item.score}/10</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: COLORS.textDim, lineHeight: 1.6 }}>{item.note}</p>
                </div>
              ))}
            </div>

            <div style={{ background: COLORS.navyMid, borderRadius: 12, padding: "20px", border: `1px solid ${COLORS.teal}30` }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.teal, marginBottom: 14 }}>🚀 Your First 90-Day Content Plan</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                {[
                  { period: "Month 1", focus: "Build in public", actions: ["Post your build journey on LinkedIn weekly", "Share before/after of UI screens", "Write 1 article: 'Why African ports need better software'"] },
                  { period: "Month 2", focus: "Video content", actions: ["Film a 90-second product demo (even rough)", "Record a 'problem' video: show the pain Odessa solves", "Post on LinkedIn + YouTube shorts"] },
                  { period: "Month 3", focus: "Community & outreach", actions: ["Find 5 ops managers in your target market on LinkedIn", "Offer free pilot in exchange for feedback", "Document everything for a case study"] },
                ].map((m, i) => (
                  <div key={i} style={{ background: `${COLORS.navy}80`, borderRadius: 10, padding: "14px" }}>
                    <div style={{ fontWeight: 800, color: COLORS.white, fontSize: 13 }}>{m.period}</div>
                    <div style={{ fontSize: 11, color: COLORS.teal, marginBottom: 8 }}>{m.focus}</div>
                    {m.actions.map((a, j) => (
                      <div key={j} style={{ display: "flex", gap: 6, marginBottom: 6, alignItems: "flex-start" }}>
                        <span style={{ color: COLORS.teal, fontSize: 12 }}>→</span>
                        <span style={{ fontSize: 12, color: COLORS.textDim, lineHeight: 1.5 }}>{a}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 16, background: `${COLORS.teal}10`, borderRadius: 12, padding: "16px 20px", border: `1px solid ${COLORS.teal}30`, fontSize: 13, color: COLORS.text, lineHeight: 1.7 }}>
              <strong style={{ color: COLORS.teal }}>On motion graphics & video:</strong> You don't need a production studio. Use <strong>Rive.app</strong> for interactive animations, <strong>CapCut</strong> or <strong>DaVinci Resolve</strong> for video editing, and <strong>Spline</strong> for 3D web elements. For a product explainer, record your screen with Loom + voiceover in French. Authenticity beats polish at this stage — enterprise clients want to see the product, not the budget.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
