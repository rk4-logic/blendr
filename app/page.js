"use client";
import { useEffect, useState, useRef } from "react";

const STEP_LABELS = ["Cup", "Fruits", "Liquid", "Add-ons", "Review", "Preparing"];

export default function Home() {
  const [step, setStep] = useState(0);
  const [settings, setSettings] = useState(null);
  const [fruitList, setFruitList] = useState([]);
  const [liquidList, setLiquidList] = useState([]);
  const [addonList, setAddonList] = useState([]);

  const [cupIdx, setCupIdx] = useState(null);
  const [fruits, setFruits] = useState({}); // { ingredientId: grams }
  const [liquidId, setLiquidId] = useState(null);
  const [liquidMl, setLiquidMl] = useState(null);
  const [addons, setAddons] = useState([]); // [ingredientId]
  const [order, setOrder] = useState(null);

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then(setSettings);
    fetch("/api/ingredients?category=fruit").then((r) => r.json()).then(setFruitList);
    fetch("/api/ingredients?category=liquid").then((r) => r.json()).then(setLiquidList);
    fetch("/api/ingredients?category=addon").then((r) => r.json()).then(setAddonList);
  }, []);

  if (!settings) return <div style={{ padding: 40, color: "#9b9a94" }}>Loading menu…</div>;

  const cup = cupIdx !== null ? settings.cups[cupIdx] : null;
  const liquid = liquidList.find((l) => l._id === liquidId);
  const totalGrams = Object.values(fruits).reduce((a, b) => a + b, 0);
  const requiredGrams = cup ? Math.round(cup.ml * settings.thicknessRatio) : 0;
  const okThickness = cup && totalGrams >= requiredGrams;

  const fruitCost = Object.entries(fruits).reduce((s, [id, g]) => {
    const f = fruitList.find((x) => x._id === id);
    return s + (f ? f.price : 0);
  }, 0);
  const addonCost = addons.reduce((s, id) => {
    const a = addonList.find((x) => x._id === id);
    return s + (a ? a.price : 0);
  }, 0);
  const total = (cup?.price || 0) + fruitCost + (liquid?.price || 0) + addonCost;

  async function placeOrder() {
    const payload = {
      cup: { name: cup.name, ml: cup.ml, price: cup.price },
      fruits: Object.entries(fruits).map(([id, g]) => {
        const f = fruitList.find((x) => x._id === id);
        return { name: f.name, grams: g, price: f.price };
      }),
      liquid: { name: liquid.name, ml: liquidMl, price: liquid.price },
      addons: addons.map((id) => {
        const a = addonList.find((x) => x._id === id);
        return { name: a.name, price: a.price };
      }),
      total,
    };
    setStep(5); // move to prep animation immediately for a snappy feel
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const created = await res.json();
    setOrder(created);
  }

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "20px 18px 110px" }}>
      <div style={{ fontWeight: 800, fontSize: 22, marginBottom: 12 }}>
        Blendr<span style={{ color: "var(--accent)" }}>.</span>
      </div>
      {step < 5 && (
        <div className="step-track" style={{ marginBottom: 18 }}>
          {STEP_LABELS.slice(0, 5).map((_, i) => (
            <i key={i} className={i <= step ? "on" : ""} />
          ))}
        </div>
      )}

      {step === 0 && (
        <CupStep cups={settings.cups} cupIdx={cupIdx} setCupIdx={setCupIdx} onNext={() => setStep(1)} />
      )}
      {step === 1 && (
        <FruitStep
          fruitList={fruitList}
          fruits={fruits}
          setFruits={setFruits}
          totalGrams={totalGrams}
          requiredGrams={requiredGrams}
          okThickness={okThickness}
          onBack={() => setStep(0)}
          onNext={() => setStep(2)}
        />
      )}
      {step === 2 && (
        <LiquidStep
          liquidList={liquidList}
          liquidId={liquidId}
          setLiquidId={setLiquidId}
          liquidMl={liquidMl}
          setLiquidMl={setLiquidMl}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      )}
      {step === 3 && (
        <AddonStep
          addonList={addonList}
          addons={addons}
          setAddons={setAddons}
          max={settings.maxAddons}
          onBack={() => setStep(2)}
          onNext={() => setStep(4)}
        />
      )}
      {step === 4 && (
        <ReviewStep
          cup={cup}
          fruits={fruits}
          fruitList={fruitList}
          liquid={liquid}
          liquidMl={liquidMl}
          addons={addons}
          addonList={addonList}
          total={total}
          onBack={() => setStep(3)}
          onConfirm={placeOrder}
        />
      )}
      {step === 5 && (
        <PrepStep
          cup={cup}
          fruits={fruits}
          fruitList={fruitList}
          liquid={liquid}
          liquidMl={liquidMl}
          addons={addons}
          addonList={addonList}
          order={order}
          onDone={() => setStep(6)}
        />
      )}
      {step === 6 && <DoneStep order={order} onReset={() => window.location.reload()} />}
    </div>
  );
}

/* ---------- Live blend-glass widget: shown while building, fills as you pick ---------- */
function LiveGlass({ cup, fruits, fruitList, liquid, liquidMl, addons, addonList }) {
  const fruitLayers = Object.entries(fruits).map(([id, g]) => {
    const f = fruitList.find((x) => x._id === id);
    return { color: f?.colorHex || "#e8632c", weight: g };
  });
  const liquidWeight = liquid ? liquidMl || 60 : 0;
  const totalWeight = fruitLayers.reduce((s, l) => s + l.weight, 0) + liquidWeight || 1;
  let acc = 0;
  const layers = [...fruitLayers, ...(liquid ? [{ color: "#f4f2ec33", weight: liquidWeight }] : [])];

  return (
    <div className="glass-widget">
      {layers.map((l, i) => {
        const heightPct = (l.weight / totalWeight) * 78;
        const bottom = acc;
        acc += heightPct;
        return (
          <div
            key={i}
            className="glass-layer"
            style={{ height: `${bottom + heightPct}%`, background: l.color, zIndex: i }}
          />
        );
      })}
    </div>
  );
}

/* ---------- Step 1: Cup ---------- */
function CupStep({ cups, cupIdx, setCupIdx, onNext }) {
  return (
    <div>
      <h1>Choose your cup</h1>
      <p style={{ color: "var(--sub)" }}>Bigger cup, more room to build flavor.</p>
      <div className="rail">
        {cups.map((c, i) => (
          <div key={i} className={`chip-card ${cupIdx === i ? "selected" : ""}`} onClick={() => setCupIdx(i)}>
            <div className="glass-widget" style={{ width: 50, height: 66, margin: "0 auto" }} />
            <div style={{ fontWeight: 700, textAlign: "center" }}>{c.name}</div>
            <div style={{ color: "var(--sub)", fontSize: 13, textAlign: "center" }}>
              {c.ml}ml {c.price ? `· +₹${c.price}` : ""}
            </div>
          </div>
        ))}
      </div>
      <div className="footer-bar">
        <button className="btn btn-primary" disabled={cupIdx === null} onClick={onNext} style={{ width: "100%" }}>
          Continue
        </button>
      </div>
    </div>
  );
}

/* ---------- Step 2: Fruits ---------- */
function FruitStep({ fruitList, fruits, setFruits, totalGrams, requiredGrams, okThickness, onBack, onNext }) {
  function toggle(f) {
    setFruits((prev) => {
      const next = { ...prev };
      if (next[f._id] !== undefined) delete next[f._id];
      else next[f._id] = f.quantityOptions?.[0] || 10;
      return next;
    });
  }
  function setQty(id, delta, options) {
    setFruits((prev) => {
      const cur = prev[id];
      const idx = options.indexOf(cur);
      const nextIdx = Math.min(options.length - 1, Math.max(0, idx + delta));
      return { ...prev, [id]: options[nextIdx] };
    });
  }
  return (
    <div>
      <h1>Pick your fruits</h1>
      <p style={{ color: "var(--sub)", marginBottom: 6 }}>
        {okThickness ? "Consistency looks great ✓" : `Add a bit more — ${requiredGrams}g needed for a good thick blend`}
      </p>
      <div className="thickness-track" style={{ marginBottom: 16 }}>
        <div className="thickness-fill" style={{ width: `${Math.min(100, (totalGrams / requiredGrams) * 100 || 0)}%` }} />
      </div>
      <div className="rail" style={{ flexWrap: "wrap", overflow: "visible" }}>
        {fruitList.map((f) => {
          const selected = fruits[f._id] !== undefined;
          return (
            <div key={f._id} className={`chip-card ${selected ? "selected" : ""}`} onClick={() => !selected && toggle(f)}>
              <div className="chip-ico" style={{ background: f.colorHex + "33" }}>{f.icon}</div>
              <div style={{ fontWeight: 700 }}>{f.name}</div>
              <div style={{ color: "var(--sub)", fontSize: 12 }}>{f.tagline}</div>
              <div style={{ color: "var(--accent)", fontWeight: 700, fontSize: 13 }}>₹{f.price}</div>
              {selected && (
                <div className="qty-stepper" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => setQty(f._id, -1, f.quantityOptions)}>−</button>
                  <span>{fruits[f._id]}g</span>
                  <button onClick={() => setQty(f._id, 1, f.quantityOptions)}>+</button>
                  <span style={{ marginLeft: "auto", cursor: "pointer", color: "var(--sub)" }} onClick={() => toggle(f)}>✕</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="footer-bar">
        <button className="btn btn-ghost" onClick={onBack}>Back</button>
        <button className="btn btn-primary" disabled={!okThickness} onClick={onNext} style={{ flex: 1 }}>
          Continue
        </button>
      </div>
    </div>
  );
}

/* ---------- Step 3: Liquid ---------- */
function LiquidStep({ liquidList, liquidId, setLiquidId, liquidMl, setLiquidMl, onBack, onNext }) {
  return (
    <div>
      <h1>Select a liquid base</h1>
      <div className="rail" style={{ flexWrap: "wrap", overflow: "visible" }}>
        {liquidList.map((l) => {
          const selected = liquidId === l._id;
          return (
            <div
              key={l._id}
              className={`chip-card ${selected ? "selected" : ""}`}
              onClick={() => {
                setLiquidId(l._id);
                setLiquidMl(l.quantityOptions?.[0] || 50);
              }}
            >
              <div className="chip-ico" style={{ background: l.colorHex + "33" }}>{l.icon}</div>
              <div style={{ fontWeight: 700 }}>{l.name}</div>
              <div style={{ color: "var(--sub)", fontSize: 12 }}>{l.tagline}</div>
              <div style={{ color: "var(--accent)", fontWeight: 700, fontSize: 13 }}>₹{l.price}</div>
              {selected && (
                <div style={{ display: "flex", gap: 6 }} onClick={(e) => e.stopPropagation()}>
                  {l.quantityOptions.map((m) => (
                    <div
                      key={m}
                      onClick={() => setLiquidMl(m)}
                      style={{
                        padding: "4px 10px",
                        borderRadius: 12,
                        fontSize: 12,
                        cursor: "pointer",
                        background: liquidMl === m ? "var(--accent)" : "rgba(255,255,255,.08)",
                        color: liquidMl === m ? "#1a1006" : "var(--ink)",
                      }}
                    >
                      {m}ml
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="footer-bar">
        <button className="btn btn-ghost" onClick={onBack}>Back</button>
        <button className="btn btn-primary" disabled={!liquidId || !liquidMl} onClick={onNext} style={{ flex: 1 }}>
          Continue
        </button>
      </div>
    </div>
  );
}

/* ---------- Step 4: Add-ons ---------- */
function AddonStep({ addonList, addons, setAddons, max, onBack, onNext }) {
  function toggle(id) {
    setAddons((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= max) return prev;
      return [...prev, id];
    });
  }
  return (
    <div>
      <h1>Boost it up</h1>
      <p style={{ color: "var(--sub)" }}>{addons.length}/{max} selected — protein, vitamins & more</p>
      <div className="rail" style={{ flexWrap: "wrap", overflow: "visible" }}>
        {addonList.map((a) => {
          const selected = addons.includes(a._id);
          return (
            <div key={a._id} className={`chip-card ${selected ? "selected" : ""}`} onClick={() => toggle(a._id)}>
              <div className="chip-ico" style={{ background: a.colorHex + "33" }}>{a.icon}</div>
              <div style={{ fontWeight: 700 }}>{a.name}</div>
              <div style={{ color: "var(--sub)", fontSize: 12 }}>{a.tagline}</div>
              <div style={{ color: "var(--accent)", fontWeight: 700, fontSize: 13 }}>₹{a.price}</div>
            </div>
          );
        })}
      </div>
      <div className="footer-bar">
        <button className="btn btn-ghost" onClick={onBack}>Back</button>
        <button className="btn btn-primary" onClick={onNext} style={{ flex: 1 }}>Review</button>
      </div>
    </div>
  );
}

/* ---------- Step 5: Review ---------- */
function ReviewStep({ cup, fruits, fruitList, liquid, liquidMl, addons, addonList, total, onBack, onConfirm }) {
  return (
    <div>
      <h1>Review your blend</h1>
      <div style={{ background: "var(--glass)", border: "1px solid var(--glass-border)", borderRadius: 18, padding: 16 }}>
        <Row label="Cup" value={`${cup.name} (${cup.ml}ml)`} />
        {Object.entries(fruits).map(([id, g]) => {
          const f = fruitList.find((x) => x._id === id);
          return <Row key={id} label="Fruit" value={`${f.name} (${g}g)`} />;
        })}
        <Row label="Liquid" value={`${liquid.name} (${liquidMl}ml)`} />
        {addons.map((id) => {
          const a = addonList.find((x) => x._id === id);
          return <Row key={id} label="Add-on" value={a.name} />;
        })}
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 18, paddingTop: 12 }}>
          <span>Total</span><span>₹{total}</span>
        </div>
      </div>
      <div className="footer-bar">
        <button className="btn btn-ghost" onClick={onBack}>Back</button>
        <button className="btn btn-primary" onClick={onConfirm} style={{ flex: 1 }}>Confirm & Prepare</button>
      </div>
    </div>
  );
}
function Row({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--glass-border)", fontSize: 14 }}>
      <span style={{ color: "var(--sub)" }}>{label}</span>
      <b>{value}</b>
    </div>
  );
}

/* ---------- Step 6: Prep animation - each ingredient animates per its own category ---------- */
function PrepStep({ cup, fruits, fruitList, liquid, liquidMl, addons, addonList, order, onDone }) {
  const stageRef = useRef(null);
  const [fillPct, setFillPct] = useState(0);
  const [log, setLog] = useState([]);
  const DURATION = 15; // seconds — stretch to real blend time (e.g. 180) in production

  const items = [
    ...Object.entries(fruits).map(([id, g]) => {
      const f = fruitList.find((x) => x._id === id);
      return { ...f, grams: g };
    }),
    { ...liquid, animationType: liquid?.animationType || "drizzle" },
    ...addons.map((id) => addonList.find((x) => x._id === id)),
  ].filter(Boolean);

  useEffect(() => {
    let elapsed = 0;
    const stepGap = DURATION / (items.length + 1);
    let nextIdx = 0;
    const interval = setInterval(() => {
      elapsed += 1;
      setFillPct(Math.min(100, (elapsed / DURATION) * 100));
      if (elapsed >= stepGap * (nextIdx + 1) && nextIdx < items.length) {
        const item = items[nextIdx];
        spawnParticles(item);
        setLog((l) => [...l, item.name]);
        nextIdx += 1;
      }
      if (elapsed >= DURATION) {
        clearInterval(interval);
        setTimeout(onDone, 500);
      }
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, []);

  function spawnParticles(item) {
    const stage = stageRef.current;
    if (!stage) return;
    const count = item.animationType === "chunk" ? 5 : item.animationType === "drizzle" ? 1 : 8;
    for (let i = 0; i < count; i++) {
      const p = document.createElement("div");
      p.className = `particle ${item.animationType}`;
      p.style.left = 30 + Math.random() * 40 + "%";
      p.style.top = "0px";
      p.style.animationDelay = i * 0.08 + "s";
      if (item.animationType === "drizzle") {
        p.style.background = item.colorHex || "var(--accent)";
        p.style.left = "50%";
      } else {
        p.textContent = item.icon || "•";
      }
      stage.appendChild(p);
      setTimeout(() => p.remove(), 1500);
    }
  }

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Preparing your smoothie</h1>
      <p style={{ color: "var(--sub)" }}>Blending it fresh in your {cup.name.toLowerCase()} cup…</p>
      <div ref={stageRef} style={{ position: "relative", width: 120, height: 160, margin: "20px auto" }}>
        <div className="glass-widget" style={{ width: "100%", height: "100%" }}>
          <div className="glass-layer" style={{ height: `${fillPct}%`, background: "linear-gradient(180deg, var(--accent2), var(--accent))" }} />
        </div>
      </div>
      <div style={{ fontWeight: 800, fontSize: 24 }}>{Math.round((100 - fillPct) / 100 * DURATION)}s</div>
      <div className="thickness-track" style={{ margin: "14px 0" }}>
        <div className="thickness-fill" style={{ width: `${fillPct}%` }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
        {log.map((name, i) => (
          <div key={i} style={{ background: "var(--glass)", borderRadius: 10, padding: "6px 12px", fontSize: 13 }}>
            Adding {name}…
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Step 7: Done ---------- */
function DoneStep({ order, onReset }) {
  return (
    <div style={{ textAlign: "center", paddingTop: 30 }}>
      <div style={{ fontSize: 48 }}>✅</div>
      <h1>Order placed!</h1>
      <p style={{ color: "var(--sub)" }}>Your smoothie is ready for pickup.</p>
      <div style={{ fontFamily: "monospace", background: "var(--glass)", borderRadius: 10, padding: "10px 16px", display: "inline-block", margin: "14px 0" }}>
        {order?.orderId || "…"}
      </div>
      <div className="footer-bar">
        <button className="btn btn-primary" onClick={onReset} style={{ width: "100%" }}>Order another</button>
      </div>
    </div>
  );
}
