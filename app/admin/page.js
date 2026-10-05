"use client";
import { useEffect, useState } from "react";

const CATEGORIES = ["fruit", "liquid", "addon"];
const ANIM_TYPES = ["chunk", "powder", "sprinkle", "drizzle"];

const BLANK = {
  name: "",
  tagline: "",
  price: 10,
  category: "fruit",
  quantityOptions: [10, 20, 30],
  unit: "g",
  animationType: "chunk",
  colorHex: "#e8632c",
  icon: "🍓",
  nutrition: { protein: 0, vitaminC: 0, fiber: 0, zinc: 0 },
  inStock: true,
};

// NOTE: this page has no auth guard yet — before going live, wrap it with a
// simple password check (compare against process.env.ADMIN_PASSWORD) or put
// it behind Next.js middleware.
export default function AdminPage() {
  const [items, setItems] = useState([]);
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [editingId, setEditingId] = useState(null);

  function load() {
    fetch("/api/ingredients?all=true").then((r) => r.json()).then(setItems);
    fetch("/api/settings").then((r) => r.json()).then(setSettings);
  }
  useEffect(load, []);

  async function saveItem(e) {
    e.preventDefault();
    if (editingId) {
      await fetch(`/api/ingredients/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/ingredients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setForm(BLANK);
    setEditingId(null);
    load();
  }

  async function removeItem(id) {
    if (!confirm("Delete this ingredient?")) return;
    await fetch(`/api/ingredients/${id}`, { method: "DELETE" });
    load();
  }

  async function toggleStock(item) {
    await fetch(`/api/ingredients/${item._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inStock: !item.inStock }),
    });
    load();
  }

  async function saveSettings(e) {
    e.preventDefault();
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    alert("Settings saved");
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24, fontFamily: "sans-serif", color: "#f4f2ec" }}>
      <h1>Blendr Admin</h1>

      {/* --- Thickness / cup settings --- */}
      {settings && (
        <form onSubmit={saveSettings} style={{ background: "#1c1f26", padding: 16, borderRadius: 12, marginBottom: 30 }}>
          <h2>Blend rules</h2>
          <label>
            Thickness ratio (grams of fruit required per ml of cup):{" "}
            <input
              type="number" step="0.01"
              value={settings.thicknessRatio}
              onChange={(e) => setSettings({ ...settings, thicknessRatio: parseFloat(e.target.value) })}
            />
          </label>
          <p style={{ fontSize: 13, color: "#9b9a94" }}>
            Example: 0.15 means a 250ml cup requires 38g of fruit minimum before checkout is allowed. Raise this if smoothies are coming out watery.
          </p>
          <label>
            Max add-ons per order:{" "}
            <input
              type="number"
              value={settings.maxAddons}
              onChange={(e) => setSettings({ ...settings, maxAddons: parseInt(e.target.value) })}
            />
          </label>
          <h3>Cups</h3>
          {settings.cups.map((c, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
              <input value={c.name} onChange={(e) => updateCup(i, "name", e.target.value)} placeholder="Name" />
              <input type="number" value={c.ml} onChange={(e) => updateCup(i, "ml", parseInt(e.target.value))} placeholder="ml" />
              <input type="number" value={c.price} onChange={(e) => updateCup(i, "price", parseInt(e.target.value))} placeholder="Upcharge ₹" />
            </div>
          ))}
          <button type="submit">Save settings</button>
        </form>
      )}

      {/* --- Ingredient form --- */}
      <form onSubmit={saveItem} style={{ background: "#1c1f26", padding: 16, borderRadius: 12, marginBottom: 30, display: "grid", gap: 8, maxWidth: 420 }}>
        <h2>{editingId ? "Edit ingredient" : "Add ingredient"}</h2>
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="Tagline" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
        <input placeholder="Icon (emoji)" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
        <input type="number" placeholder="Price ₹" value={form.price} onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) })} />
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={form.animationType} onChange={(e) => setForm({ ...form, animationType: e.target.value })}>
          {ANIM_TYPES.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <input placeholder="Color hex" value={form.colorHex} onChange={(e) => setForm({ ...form, colorHex: e.target.value })} />
        <input
          placeholder="Quantity options, comma separated (e.g. 10,20,30)"
          value={form.quantityOptions.join(",")}
          onChange={(e) => setForm({ ...form, quantityOptions: e.target.value.split(",").map((n) => parseInt(n.trim())).filter(Boolean) })}
        />
        <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
          <option value="g">g</option>
          <option value="ml">ml</option>
          <option value="unit">unit</option>
        </select>
        <fieldset style={{ border: "1px solid #333", borderRadius: 8, padding: 8 }}>
          <legend>Nutrition (per serving)</legend>
          {["protein", "vitaminC", "fiber", "zinc"].map((k) => (
            <label key={k} style={{ marginRight: 10 }}>
              {k}:{" "}
              <input
                type="number" style={{ width: 60 }}
                value={form.nutrition[k]}
                onChange={(e) => setForm({ ...form, nutrition: { ...form.nutrition, [k]: parseFloat(e.target.value) } })}
              />
            </label>
          ))}
        </fieldset>
        <button type="submit">{editingId ? "Save changes" : "Add ingredient"}</button>
        {editingId && <button type="button" onClick={() => { setForm(BLANK); setEditingId(null); }}>Cancel edit</button>}
      </form>

      {/* --- Ingredient list --- */}
      {CATEGORIES.map((cat) => (
        <div key={cat} style={{ marginBottom: 24 }}>
          <h2 style={{ textTransform: "capitalize" }}>{cat}s</h2>
          <table width="100%" cellPadding="6" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #333" }}>
                <th>Icon</th><th>Name</th><th>Price</th><th>In stock</th><th>Animation</th><th></th>
              </tr>
            </thead>
            <tbody>
              {items.filter((i) => i.category === cat).map((i) => (
                <tr key={i._id} style={{ borderBottom: "1px solid #222" }}>
                  <td>{i.icon}</td>
                  <td>{i.name}</td>
                  <td>₹{i.price}</td>
                  <td>
                    <input type="checkbox" checked={i.inStock} onChange={() => toggleStock(i)} />
                  </td>
                  <td>{i.animationType}</td>
                  <td>
                    <button onClick={() => { setForm(i); setEditingId(i._id); }}>Edit</button>{" "}
                    <button onClick={() => removeItem(i._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );

  function updateCup(i, key, value) {
    const cups = [...settings.cups];
    cups[i] = { ...cups[i], [key]: value };
    setSettings({ ...settings, cups });
  }
}
