import { useState, useMemo, useEffect } from "react";

const DEFAULT_INCOME = [
  { id: 1, name: "Primary Income", amount: 5000, active: true, type: "recurring" },
  { id: 2, name: "Secondary Income", amount: 4000, active: false, type: "recurring", note: "Toggle on/off to model scenarios" },
  { id: 3, name: "Unemployment Benefits", amount: 3000, active: false, type: "recurring", note: "Activate if needed" },
  { id: 4, name: "Annual Bonus", amount: 2000, active: false, type: "onetime", note: "Periodic one-time income" },
];

const DEFAULT_ESSENTIAL = [
  // Housing
  { id: 1, name: "Mortgage/Rent", amount: 2000, category: "Housing" },
  { id: 2, name: "Utilities (water/sewer)", amount: 150, category: "Housing" },
  { id: 3, name: "Electricity", amount: 120, category: "Housing" },
  { id: 4, name: "Internet", amount: 60, category: "Housing" },
  { id: 5, name: "Home Warranty/Insurance", amount: 50, category: "Housing" },
  // Transportation
  { id: 6, name: "Car Payment", amount: 400, category: "Transportation" },
  { id: 7, name: "Car Insurance", amount: 150, category: "Transportation" },
  { id: 8, name: "Commute Costs", amount: 80, category: "Transportation" },
  { id: 9, name: "Gas", amount: 100, category: "Transportation" },
  // Family
  { id: 10, name: "Childcare/Tuition", amount: 800, category: "Family" },
  { id: 11, name: "Phone", amount: 75, category: "Family" },
  // Food
  { id: 12, name: "Groceries", amount: 600, category: "Food" },
  // Health
  { id: 13, name: "Health/Wellness", amount: 100, category: "Health" },
  // Education
  { id: 14, name: "Educational Subscriptions", amount: 20, category: "Education" },
];

const DEFAULT_DISCRETIONARY = [
  { id: 1, name: "Dining Out", amount: 400, category: "Food & Drink" },
  { id: 2, name: "Shopping", amount: 300, category: "Shopping" },
  { id: 3, name: "Entertainment", amount: 150, category: "Entertainment" },
  { id: 4, name: "Streaming Services", amount: 25, category: "Subscriptions" },
  { id: 5, name: "Other Subscriptions", amount: 30, category: "Subscriptions" },
  { id: 6, name: "Student Loan (optional)", amount: 0, category: "Debt", note: "Pay when surplus available" },
];

const DEFAULT_PLANNED = [
  { id: 1, name: "Vacation", amount: 2000, note: "Planned trip" },
  { id: 2, name: "Tuition Payment", amount: 1500, note: "Education expense" },
  { id: 3, name: "Bonus Income", amount: 2000, note: "Est. income boost" },
  { id: 4, name: "Emergency Fund", amount: 5000, note: "Buffer if needed" },
];

const ESSENTIAL_CATEGORIES = ["Housing", "Transportation", "Family", "Food", "Health", "Education"];
const DISC_CATEGORIES = ["Food & Drink", "Shopping", "Entertainment", "Subscriptions", "Debt", "Other"];

const CAT_COLORS = {
  Housing: "#e8b86d", Transportation: "#7eb8c9", Family: "#b89fe8",
  Food: "#a8c97f", Health: "#e88f8f", Education: "#8fb89e",
  "Food & Drink": "#c9a87e", Shopping: "#e8c08f", Entertainment: "#7eb8c9",
  Subscriptions: "#b0b0c8", Debt: "#e88f8f", Other: "#909090",
};

function fmt(n) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function Modal({ onClose, children }) {
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#1e2435", border: "1px solid #2e3650", borderRadius: 16,
        padding: 28, width: "100%", maxWidth: 440
      }}>{children}</div>
    </div>
  );
}

function ItemRow({ item, onEdit, onDelete, color }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", background: "#1a2038",
      border: "1px solid #2a3048", borderRadius: 10, padding: "12px 16px",
      marginBottom: 8, gap: 12
    }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: color || "#8a8f9e", flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, color: "#e8e4d8" }}>{item.name}</div>
        {item.note && <div style={{ fontSize: 11, color: "#8a8f9e", marginTop: 2 }}>{item.note}</div>}
      </div>
      <div style={{ fontSize: 17, color: "#e88f8f", fontWeight: 300, marginRight: 12 }}>{fmt(item.amount)}</div>
      <button onClick={() => onEdit(item)} style={{ background: "transparent", border: "1px solid #2e3650", borderRadius: 6, color: "#8a8f9e", cursor: "pointer", fontSize: 12, padding: "4px 10px" }}>Edit</button>
      <button onClick={() => onDelete(item.id)} style={{ background: "transparent", border: "none", color: "#e88f8f", cursor: "pointer", fontSize: 18, padding: "2px 6px" }}>×</button>
    </div>
  );
}

export default function BudgetTracker() {
  // Initialize from localStorage or defaults
  const [tab, setTab] = useState(() => localStorage.getItem("budget_tab") || "overview");
  const [income, setIncome] = useState(() => {
    const saved = localStorage.getItem("budget_income");
    return saved ? JSON.parse(saved) : DEFAULT_INCOME;
  });
  const [essential, setEssential] = useState(() => {
    const saved = localStorage.getItem("budget_essential");
    return saved ? JSON.parse(saved) : DEFAULT_ESSENTIAL;
  });
  const [discretionary, setDiscretionary] = useState(() => {
    const saved = localStorage.getItem("budget_discretionary");
    return saved ? JSON.parse(saved) : DEFAULT_DISCRETIONARY;
  });
  const [planned, setPlanned] = useState(() => {
    const saved = localStorage.getItem("budget_planned");
    return saved ? JSON.parse(saved) : DEFAULT_PLANNED;
  });
  const [savings, setSavings] = useState(() => {
    const saved = localStorage.getItem("budget_savings");
    return saved ? parseFloat(saved) : 5000;
  });
  const [modal, setModal] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({});

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem("budget_tab", tab);
  }, [tab]);

  useEffect(() => {
    localStorage.setItem("budget_income", JSON.stringify(income));
  }, [income]);

  useEffect(() => {
    localStorage.setItem("budget_essential", JSON.stringify(essential));
  }, [essential]);

  useEffect(() => {
    localStorage.setItem("budget_discretionary", JSON.stringify(discretionary));
  }, [discretionary]);

  useEffect(() => {
    localStorage.setItem("budget_planned", JSON.stringify(planned));
  }, [planned]);

  useEffect(() => {
    localStorage.setItem("budget_savings", savings.toString());
  }, [savings]);

  const activeIncome = useMemo(() => income.filter(i => i.active && i.type === "recurring").reduce((s, i) => s + i.amount, 0), [income]);
  const totalEssential = useMemo(() => essential.reduce((s, e) => s + e.amount, 0), [essential]);
  const totalDiscretionary = useMemo(() => discretionary.reduce((s, d) => s + d.amount, 0), [discretionary]);
  const totalExpenses = totalEssential + totalDiscretionary;
  const surplus = activeIncome - totalExpenses;

  const essentialByCategory = useMemo(() => {
    const map = {};
    essential.forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [essential]);

  const discByCategory = useMemo(() => {
    const map = {};
    discretionary.forEach(d => { map[d.category] = (map[d.category] || 0) + d.amount; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [discretionary]);

  function openModal(type, item = null, categories = []) {
    setModal({ type, categories });
    setEditTarget(item?.id || null);
    setForm(item ? { ...item } : { name: "", amount: "", note: "", category: categories[0] || "Other", active: true, type: "recurring" });
  }

  function save() {
    const amount = parseFloat(form.amount) || 0;
    const updated = { ...form, amount };
    if (modal.type === "income") {
      if (editTarget) setIncome(p => p.map(i => i.id === editTarget ? updated : i));
      else setIncome(p => [...p, { ...updated, id: Date.now() }]);
    } else if (modal.type === "essential") {
      if (editTarget) setEssential(p => p.map(i => i.id === editTarget ? updated : i));
      else setEssential(p => [...p, { ...updated, id: Date.now() }]);
    } else if (modal.type === "discretionary") {
      if (editTarget) setDiscretionary(p => p.map(i => i.id === editTarget ? updated : i));
      else setDiscretionary(p => [...p, { ...updated, id: Date.now() }]);
    } else if (modal.type === "planned") {
      if (editTarget) setPlanned(p => p.map(i => i.id === editTarget ? updated : i));
      else setPlanned(p => [...p, { ...updated, id: Date.now() }]);
    }
    setModal(null);
  }

  function del(type, id) {
    if (type === "income") setIncome(p => p.filter(i => i.id !== id));
    else if (type === "essential") setEssential(p => p.filter(i => i.id !== id));
    else if (type === "discretionary") setDiscretionary(p => p.filter(i => i.id !== id));
    else if (type === "planned") setPlanned(p => p.filter(i => i.id !== id));
  }

  function toggleIncome(id) { setIncome(p => p.map(i => i.id === id ? { ...i, active: !i.active } : i)); }

  function resetToDefaults() {
    if (confirm("Reset all data to defaults? This will clear all your changes.")) {
      localStorage.clear();
      window.location.reload();
    }
  }

  const inp = { width: "100%", background: "#131825", border: "1px solid #2e3650", borderRadius: 8, color: "#e8e4d8", padding: "10px 12px", fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 12 };
  const lbl = { fontSize: 11, color: "#8a8f9e", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4, display: "block" };
  const btnP = { background: "#e8b86d", color: "#131825", border: "none", borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontWeight: 700, fontSize: 13 };
  const btnS = { background: "transparent", color: "#8a8f9e", border: "1px solid #2e3650", borderRadius: 8, padding: "10px 18px", cursor: "pointer", fontSize: 13, marginRight: 8 };
  const tabs = ["overview", "income", "essential", "discretionary", "planned"];

  const runwayMonths = surplus < 0 ? (savings / Math.abs(surplus)).toFixed(1) : null;

  return (
    <div style={{ minHeight: "100vh", background: "#131825", color: "#e8e4d8", fontFamily: "'Georgia', serif" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1a2038, #1e2a45)", borderBottom: "1px solid #2e3650", padding: "28px 32px 0" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 4 }}>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 400, letterSpacing: "-0.02em" }}>Household Budget Tracker</h1>
            <button onClick={resetToDefaults} style={{
              marginLeft: "auto", background: "transparent", border: "1px solid #2e3650",
              color: "#8a8f9e", cursor: "pointer", fontSize: 11, padding: "5px 12px",
              borderRadius: 6, letterSpacing: "0.05em"
            }}>Reset to Defaults</button>
          </div>
          <p style={{ margin: "4px 0 20px", fontSize: 13, color: "#8a8f9e" }}>
            Track income, expenses, and financial runway with localStorage persistence
          </p>
          <div style={{ display: "flex", gap: 0 }}>
            {tabs.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                background: "transparent", border: "none", padding: "10px 18px", cursor: "pointer",
                fontSize: 12, letterSpacing: "0.07em", textTransform: "uppercase",
                color: tab === t ? "#e8b86d" : "#8a8f9e",
                borderBottom: tab === t ? "2px solid #e8b86d" : "2px solid transparent",
              }}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: 32 }}>

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <div>
            {/* Top cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
              {[
                { label: "Monthly Income", value: fmt(activeIncome), color: "#a8c97f", sub: "active recurring" },
                { label: "Essential", value: fmt(totalEssential), color: "#e8b86d", sub: "must pay" },
                { label: "Discretionary", value: fmt(totalDiscretionary), color: "#7eb8c9", sub: "lifestyle" },
                { label: surplus >= 0 ? "Surplus" : "Shortfall", value: fmt(Math.abs(surplus)), color: surplus >= 0 ? "#a8c97f" : "#e88f8f", sub: surplus >= 0 ? "available each month" : "drawing down savings" },
              ].map(c => (
                <div key={c.label} style={{ background: "#1e2435", border: "1px solid #2e3650", borderRadius: 14, padding: "18px 20px" }}>
                  <div style={{ fontSize: 10, color: "#8a8f9e", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>{c.label}</div>
                  <div style={{ fontSize: 24, color: c.color, fontWeight: 300, marginBottom: 4 }}>{c.value}</div>
                  <div style={{ fontSize: 11, color: "#8a8f9e" }}>{c.sub}</div>
                </div>
              ))}
            </div>

            {/* Essential vs Discretionary bars */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
              {[
                { title: "Essential Spending", items: essentialByCategory, total: totalEssential },
                { title: "Discretionary Spending", items: discByCategory, total: totalDiscretionary },
              ].map(panel => (
                <div key={panel.title} style={{ background: "#1e2435", border: "1px solid #2e3650", borderRadius: 14, padding: 22 }}>
                  <div style={{ fontSize: 11, color: "#8a8f9e", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 18 }}>{panel.title}</div>
                  {panel.items.map(([cat, amt]) => (
                    <div key={cat} style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 13 }}>{cat}</span>
                        <span style={{ fontSize: 13, color: CAT_COLORS[cat] || "#8a8f9e" }}>{fmt(amt)}</span>
                      </div>
                      <div style={{ height: 4, background: "#2e3650", borderRadius: 2 }}>
                        <div style={{ height: "100%", borderRadius: 2, background: CAT_COLORS[cat] || "#8a8f9e", width: `${(amt / panel.total) * 100}%`, transition: "width 0.4s" }} />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Savings & runway */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div style={{ background: "#1e2435", border: "1px solid #2e3650", borderRadius: 14, padding: 22 }}>
                <div style={{ fontSize: 11, color: "#8a8f9e", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>Cash Savings</div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ fontSize: 32, color: "#8fb89e", fontWeight: 300, flex: 1 }}>{fmt(savings)}</div>
                  <input type="number" value={savings} onChange={e => setSavings(parseFloat(e.target.value) || 0)}
                    style={{ ...inp, width: 120, marginBottom: 0, textAlign: "right" }} />
                </div>
              </div>
              <div style={{ background: "#1e2435", border: "1px solid #2e3650", borderRadius: 14, padding: 22 }}>
                <div style={{ fontSize: 11, color: "#8a8f9e", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>
                  {surplus >= 0 ? "Monthly Position" : "Savings Runway"}
                </div>
                {surplus >= 0
                  ? <div><div style={{ fontSize: 28, color: "#a8c97f", fontWeight: 300 }}>✓ Surplus</div><div style={{ fontSize: 13, color: "#8a8f9e", marginTop: 6 }}>Adding {fmt(surplus)}/mo to savings</div></div>
                  : <div><div style={{ fontSize: 46, color: "#e8b86d", fontWeight: 300, lineHeight: 1 }}>{runwayMonths}<span style={{ fontSize: 18 }}>mo</span></div><div style={{ fontSize: 12, color: "#8a8f9e", marginTop: 6 }}>until savings depleted at {fmt(Math.abs(surplus))}/mo shortfall</div></div>
                }
              </div>
            </div>
          </div>
        )}

        {/* ── INCOME ── */}
        {tab === "income" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: "#8a8f9e" }}>Toggle sources on/off to model scenarios</div>
              <button onClick={() => openModal("income", null, [])} style={btnP}>+ Add Source</button>
            </div>
            <div style={{ fontSize: 11, color: "#8a8f9e", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Recurring Income</div>
            {income.filter(i => i.type === "recurring").map(item => (
              <div key={item.id} style={{
                background: "#1e2435", border: "1px solid #2e3650", borderRadius: 12, padding: "16px 20px",
                marginBottom: 10, display: "flex", alignItems: "center", gap: 14, opacity: item.active ? 1 : 0.45
              }}>
                <div onClick={() => toggleIncome(item.id)} style={{
                  width: 36, height: 20, borderRadius: 10, cursor: "pointer", flexShrink: 0,
                  background: item.active ? "#a8c97f" : "#2e3650", position: "relative", transition: "background 0.2s"
                }}>
                  <div style={{ position: "absolute", top: 3, left: item.active ? 19 : 3, width: 14, height: 14, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14 }}>{item.name}</div>
                  {item.note && <div style={{ fontSize: 11, color: "#8a8f9e", marginTop: 2 }}>{item.note}</div>}
                </div>
                <div style={{ fontSize: 20, color: "#a8c97f", fontWeight: 300 }}>{fmt(item.amount)}/mo</div>
                <button onClick={() => openModal("income", item, [])} style={{ ...btnS, marginRight: 0, padding: "5px 12px" }}>Edit</button>
                <button onClick={() => del("income", item.id)} style={{ background: "transparent", border: "none", color: "#e88f8f", cursor: "pointer", fontSize: 18 }}>×</button>
              </div>
            ))}

            <div style={{ fontSize: 11, color: "#8a8f9e", letterSpacing: "0.08em", textTransform: "uppercase", margin: "24px 0 12px" }}>One-Time / Bonuses</div>
            {income.filter(i => i.type === "onetime").map(item => (
              <div key={item.id} style={{
                background: "#1e2435", border: "1px solid #2e3650", borderRadius: 12, padding: "16px 20px",
                marginBottom: 10, display: "flex", alignItems: "center", gap: 14, opacity: item.active ? 1 : 0.45
              }}>
                <div onClick={() => toggleIncome(item.id)} style={{
                  width: 36, height: 20, borderRadius: 10, cursor: "pointer", flexShrink: 0,
                  background: item.active ? "#b89fe8" : "#2e3650", position: "relative", transition: "background 0.2s"
                }}>
                  <div style={{ position: "absolute", top: 3, left: item.active ? 19 : 3, width: 14, height: 14, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14 }}>{item.name}</div>
                  {item.note && <div style={{ fontSize: 11, color: "#8a8f9e", marginTop: 2 }}>{item.note}</div>}
                </div>
                <div style={{ fontSize: 20, color: "#b89fe8", fontWeight: 300 }}>{fmt(item.amount)}</div>
                <button onClick={() => openModal("income", item, [])} style={{ ...btnS, marginRight: 0, padding: "5px 12px" }}>Edit</button>
                <button onClick={() => del("income", item.id)} style={{ background: "transparent", border: "none", color: "#e88f8f", cursor: "pointer", fontSize: 18 }}>×</button>
              </div>
            ))}

            <div style={{ background: "#1a2038", border: "1px solid #2e3650", borderRadius: 12, padding: "14px 20px", display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              <span style={{ color: "#8a8f9e", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>Active Recurring Total</span>
              <span style={{ fontSize: 20, color: "#a8c97f", fontWeight: 300 }}>{fmt(activeIncome)}/mo</span>
            </div>
          </div>
        )}

        {/* ── ESSENTIAL ── */}
        {tab === "essential" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: "#8a8f9e" }}>Fixed costs — have to pay these</div>
              <button onClick={() => openModal("essential", null, ESSENTIAL_CATEGORIES)} style={btnP}>+ Add Expense</button>
            </div>
            {ESSENTIAL_CATEGORIES.filter(cat => essential.some(e => e.category === cat)).map(cat => (
              <div key={cat} style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: CAT_COLORS[cat] }} />
                  <span style={{ fontSize: 11, color: "#8a8f9e", letterSpacing: "0.08em", textTransform: "uppercase" }}>{cat}</span>
                  <span style={{ fontSize: 11, color: CAT_COLORS[cat] }}>
                    {fmt(essential.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0))}
                  </span>
                </div>
                {essential.filter(e => e.category === cat).map(item => (
                  <ItemRow key={item.id} item={item} color={CAT_COLORS[cat]} onEdit={i => openModal("essential", i, ESSENTIAL_CATEGORIES)} onDelete={id => del("essential", id)} />
                ))}
              </div>
            ))}
            <div style={{ background: "#1a2038", border: "1px solid #2e3650", borderRadius: 12, padding: "14px 20px", display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#8a8f9e", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>Essential Total</span>
              <span style={{ fontSize: 20, color: "#e8b86d", fontWeight: 300 }}>{fmt(totalEssential)}/mo</span>
            </div>
          </div>
        )}

        {/* ── DISCRETIONARY ── */}
        {tab === "discretionary" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: "#8a8f9e" }}>Lifestyle spending — controllable if needed</div>
              <button onClick={() => openModal("discretionary", null, DISC_CATEGORIES)} style={btnP}>+ Add Expense</button>
            </div>
            {DISC_CATEGORIES.filter(cat => discretionary.some(d => d.category === cat)).map(cat => (
              <div key={cat} style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: CAT_COLORS[cat] || "#8a8f9e" }} />
                  <span style={{ fontSize: 11, color: "#8a8f9e", letterSpacing: "0.08em", textTransform: "uppercase" }}>{cat}</span>
                  <span style={{ fontSize: 11, color: CAT_COLORS[cat] || "#8a8f9e" }}>
                    {fmt(discretionary.filter(d => d.category === cat).reduce((s, d) => s + d.amount, 0))}
                  </span>
                </div>
                {discretionary.filter(d => d.category === cat).map(item => (
                  <ItemRow key={item.id} item={item} color={CAT_COLORS[cat]} onEdit={i => openModal("discretionary", i, DISC_CATEGORIES)} onDelete={id => del("discretionary", id)} />
                ))}
              </div>
            ))}
            <div style={{ background: "#1a2038", border: "1px solid #2e3650", borderRadius: 12, padding: "14px 20px", display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#8a8f9e", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>Discretionary Total</span>
              <span style={{ fontSize: 20, color: "#7eb8c9", fontWeight: 300 }}>{fmt(totalDiscretionary)}/mo</span>
            </div>
          </div>
        )}

        {/* ── PLANNED ── */}
        {tab === "planned" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontSize: 13, color: "#8a8f9e" }}>One-time expenses and income events</div>
              <button onClick={() => openModal("planned", null, [])} style={btnP}>+ Add Item</button>
            </div>
            <div style={{ fontSize: 12, color: "#8a8f9e", marginBottom: 20, fontStyle: "italic" }}>These don't affect the monthly budget — they're tracked separately as known future events.</div>

            <div style={{ fontSize: 11, color: "#e88f8f", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Planned Expenses</div>
            {planned.filter(p => p.amount > 0 && !p.note?.includes("income") && !p.note?.includes("boost") && !p.note?.includes("Buffer")).map(item => (
              <div key={item.id} style={{
                background: "#1e2435", border: "1px solid #2e3650", borderRadius: 12,
                padding: "14px 18px", marginBottom: 10, display: "flex", alignItems: "center", gap: 12
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14 }}>{item.name}</div>
                  {item.note && <div style={{ fontSize: 11, color: "#8a8f9e", marginTop: 2 }}>{item.note}</div>}
                </div>
                <div style={{ fontSize: 18, color: "#e88f8f", fontWeight: 300, marginRight: 12 }}>{fmt(item.amount)}</div>
                <button onClick={() => openModal("planned", item, [])} style={{ ...btnS, marginRight: 8, padding: "4px 10px", fontSize: 12 }}>Edit</button>
                <button onClick={() => del("planned", item.id)} style={{ background: "transparent", border: "none", color: "#e88f8f", cursor: "pointer", fontSize: 18 }}>×</button>
              </div>
            ))}

            <div style={{ fontSize: 11, color: "#a8c97f", letterSpacing: "0.08em", textTransform: "uppercase", margin: "24px 0 12px" }}>Planned Income / Buffers</div>
            {planned.filter(p => p.note?.includes("boost") || p.note?.includes("Buffer")).map(item => (
              <div key={item.id} style={{
                background: "#1e2435", border: "1px solid #2e3650", borderRadius: 12,
                padding: "14px 18px", marginBottom: 10, display: "flex", alignItems: "center", gap: 12
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14 }}>{item.name}</div>
                  {item.note && <div style={{ fontSize: 11, color: "#8a8f9e", marginTop: 2 }}>{item.note}</div>}
                </div>
                <div style={{ fontSize: 18, color: "#a8c97f", fontWeight: 300, marginRight: 12 }}>{fmt(item.amount)}</div>
                <button onClick={() => openModal("planned", item, [])} style={{ ...btnS, marginRight: 8, padding: "4px 10px", fontSize: 12 }}>Edit</button>
                <button onClick={() => del("planned", item.id)} style={{ background: "transparent", border: "none", color: "#e88f8f", cursor: "pointer", fontSize: 18 }}>×</button>
              </div>
            ))}

            <div style={{ background: "#1a2038", border: "1px solid #2e3650", borderRadius: 12, padding: "14px 20px", marginTop: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: "#8a8f9e", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>Net Planned (income minus expenses)</span>
                <span style={{ fontSize: 18, fontWeight: 300, color: (() => { const net = planned.filter(p => p.note?.includes("boost") || p.note?.includes("Buffer")).reduce((s, p) => s + p.amount, 0) - planned.filter(p => !p.note?.includes("boost") && !p.note?.includes("Buffer")).reduce((s, p) => s + p.amount, 0); return net >= 0 ? "#a8c97f" : "#e88f8f"; })() }}>
                  {(() => { const exp = planned.filter(p => !p.note?.includes("boost") && !p.note?.includes("Buffer")).reduce((s, p) => s + p.amount, 0); const inc = planned.filter(p => p.note?.includes("boost") || p.note?.includes("Buffer")).reduce((s, p) => s + p.amount, 0); const net = inc - exp; return `${net >= 0 ? "+" : ""}${fmt(net)}`; })()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL */}
      {modal && (
        <Modal onClose={() => setModal(null)}>
          <div style={{ fontSize: 16, marginBottom: 20, color: "#e8e4d8" }}>
            {editTarget ? "Edit" : "Add"} {modal.type.charAt(0).toUpperCase() + modal.type.slice(1)}
          </div>
          <label style={lbl}>Name</label>
          <input style={inp} value={form.name || ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Netflix" />
          <label style={lbl}>Amount ($)</label>
          <input style={inp} type="number" value={form.amount || ""} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" />
          {modal.categories?.length > 0 && (
            <>
              <label style={lbl}>Category</label>
              <select style={{ ...inp }} value={form.category || modal.categories[0]} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {modal.categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </>
          )}
          {modal.type === "income" && (
            <>
              <label style={lbl}>Type</label>
              <select style={{ ...inp }} value={form.type || "recurring"} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="recurring">Recurring (monthly)</option>
                <option value="onetime">One-time / Bonus</option>
              </select>
            </>
          )}
          <label style={lbl}>Note (optional)</label>
          <input style={inp} value={form.note || ""} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="Any context..." />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
            <button style={btnS} onClick={() => setModal(null)}>Cancel</button>
            <button style={btnP} onClick={save}>Save</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
