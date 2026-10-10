import { useState, useRef, useEffect, useCallback } from "react";

// ══════════════════════════════════════════════
//  KEYS — Configuration
// ══════════════════════════════════════════════
const LICENSE_KEY = "123456"; 
const ADMIN_PASS  = "123456"; 

// Base default menu if token_data.json is fresh or empty
const DEFAULT_MENU = {
  "☕ Beverages": [
    { id: 1,  name: "Coffee",              price: 60  },
    { id: 2,  name: "Tea",                 price: 30  },
    { id: 3,  name: "Cold Coffee",         price: 90  },
    { id: 4,  name: "Fresh Lime Soda",     price: 70  },
    { id: 5,  name: "Lassi",               price: 80  },
    { id: 6,  name: "Mango Shake",         price: 100 },
  ],
  "🍗 Non-Veg": [
    { id: 7,  name: "Chicken Curry",       price: 220 },
    { id: 8,  name: "Butter Chicken",      price: 260 },
    { id: 9,  name: "Chicken Biryani",     price: 280 },
    { id: 10, name: "Egg Fried Rice",      price: 160 },
    { id: 11, name: "Chicken Tandoori",    price: 300 },
    { id: 12, name: "Fish Fry",            price: 250 },
  ],
  "🍗 Veg": [ 
    { id: 13, name: "Paneer Butter Masala",price: 200 },
    { id: 14, name: "Dal Makhani",         price: 160 },
    { id: 15, name: "Veg Biryani",         price: 200 },
    { id: 16, name: "Aloo Paratha",        price: 80  },
    { id: 17, name: "Veg Fried Rice",      price: 130 },
    { id: 18, name: "Paneer Tikka",        price: 240 },
  ],
  "🍞 Breads & Rice": [
    { id: 19, name: "Naan",                price: 40  },
    { id: 20, name: "Roti",                price: 20  },
    { id: 21, name: "Steamed Rice",        price: 60  },
    { id: 22, name: "Jeera Rice",          price: 80  },
  ],
  "🍨 Desserts": [
    { id: 23, name: "Gulab Jamun",         price: 60  },
    { id: 24, name: "Ice Cream",           price: 80  },
    { id: 25, name: "Kulfi",               price: 70  },
  ],
}; 

const GST_RATE    = 0.05; 
const HOTEL_NAME  = "THE ROYAL KITCHEN"; 
const HOTEL_ADDR  = "123, Main Bazaar Road, Varanasi, UP"; 
const HOTEL_PHONE = "+91 98765 43210"; 
const GSTIN       = "09ABCDE1234F1Z5"; 
const todayKey    = () => new Date().toISOString().slice(0, 10); 

// ══════════════════════════════════════════════
//  FILE DB — Electron IPC Bridge
// ══════════════════════════════════════════════
const FileDB = {
  async load() {
    try {
      if (window.electronAPI && window.electronAPI.loadToken) {
        return await window.electronAPI.loadToken();
      }
      return null;
    } catch (e) {
      console.error("IPC Read failed:", e);
      return null;
    }
  },
  async save(data) {
    try {
      if (window.electronAPI && window.electronAPI.saveToken) {
        await window.electronAPI.saveToken(data);
      }
    } catch (e) { 
      console.error("IPC Write failed:", e); 
    }
  },
}; 

// ══════════════════════════════════════════════
//  LOCK SCREEN
// ══════════════════════════════════════════════
function LockScreen({ onUnlock }) {
  const [key,      setKey]  = useState("");
  const [shake,    setSh]   = useState(false);
  const [attempts, setAt]   = useState(0);
  const [locked,   setLk]   = useState(false);

  const submit = () => {
    if (locked) return;
    if (key.trim().toUpperCase() === LICENSE_KEY.toUpperCase()) { onUnlock(); return; }
    const n = attempts + 1;
    setAt(n); setSh(true); setKey("");
    setTimeout(() => setSh(false), 600);
    if (n >= 5) setLk(true);
  }; 

  return (
    <div style={{ minHeight:"100vh", background:"#080600", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Georgia,serif" }}>
      <div style={{ position:"fixed", inset:0, opacity:0.04, backgroundImage:"repeating-linear-gradient(45deg,#c8860a 0,#c8860a 1px,transparent 0,transparent 50%)", backgroundSize:"20px 20px", pointerEvents:"none" }} />
      <div style={{ background:"linear-gradient(160deg,#1a1000,#0f0800)", border:"1px solid #c8860a44", borderRadius:16, padding:"40px 36px", width:360, boxShadow:"0 0 60px #c8860a22,0 0 120px #00000088", textAlign:"center" }}>
        <div style={{ fontSize:44, marginBottom:8 }}>🔐</div>
        <div style={{ fontSize:20, fontWeight:"bold", color:"#f5c842", letterSpacing:3, marginBottom:4 }}>{HOTEL_NAME}</div>
        <div style={{ fontSize:11, color:"#888", letterSpacing:2, marginBottom:28 }}>BILLING SOFTWARE — LICENSED VERSION</div>
        {locked ? (
          <div style={{ background:"#2a0000", border:"1px solid #660000", borderRadius:8, padding:16, color:"#ff6666", fontSize:13 }}>
            🚫 Too many wrong attempts.<br /><span style={{ fontSize:11, color:"#aa4444" }}>Software locked. Restart to try again.</span>
          </div>
        ) : (
          <>
            <div style={{ fontSize:12, color:"#c8a96e", marginBottom:10, textAlign:"left" }}>Enter License Key to activate:</div>
            <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}`}</style>
            <div style={{ animation:shake?"shake .5s ease":"none" }}>
              <input value={key} onChange={e=>setKey(e.target.value.toUpperCase())} onKeyDown={e=>e.key==="Enter"&&submit()} placeholder="XXXX-XXXX-XXXX" maxLength={20} autoFocus
                style={{ width:"100%", background:"#0f0800", border:`2px solid ${shake?"#ff4444":"#c8860a55"}`, borderRadius:8, padding:"12px 14px", color:"#f5c842", fontSize:16, outline:"none", fontFamily:"'Courier New',monospace", letterSpacing:3, textAlign:"center", marginBottom:14, boxSizing:"border-box" }} />
            </div>
            {attempts>0 && <div style={{ color:"#ff6666", fontSize:11, marginBottom:10 }}>❌ Wrong key. {5-attempts} attempt{5-attempts!==1?"s":""} remaining.</div>}
            <button onClick={submit} style={{ width:"100%", padding:"12px 0", background:"linear-gradient(135deg,#c8860a,#f5c842)", border:"none", borderRadius:8, color:"#000", fontWeight:"bold", fontSize:14, cursor:"pointer", fontFamily:"Georgia,serif", letterSpacing:1, boxShadow:"0 4px 20px #c8860a44" }}>🔓 ACTIVATE SOFTWARE</button>
            <div style={{ fontSize:10, color:"#444", marginTop:16, lineHeight:1.6 }}>This software is licensed. Unauthorized use is prohibited.<br />Contact developer for license key.</div>
          </>
        )}
      </div>
    </div>
  );
} 

// ══════════════════════════════════════════════
//  ADMIN PANEL
// ══════════════════════════════════════════════
function AdminPanel({ onClose, tokenData, currentMenu, onManualReset, onToggleAutoReset, onClearHistory, onAddItem }) {
  const [pass,    setPass] = useState("");
  const [auth,    setAuth] = useState(false);
  const [shake,   setSh]   = useState(false);
  const [tries,   setTr]   = useState(0);
  const [confirm, setCf]   = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null);

  // Form states for adding items
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemCat, setNewItemCat] = useState(Object.keys(currentMenu)[0]);

  const login = () => {
    if (pass.trim().toUpperCase() === ADMIN_PASS.toUpperCase()) { setAuth(true); return; }
    setTr(t=>t+1); setSh(true); setPass("");
    setTimeout(()=>setSh(false), 600);
  }; 

  const handleAddItemSubmit = (e) => {
    e.preventDefault();
    if(!newItemName.trim() || !newItemPrice || isNaN(newItemPrice)) return;
    onAddItem(newItemCat, newItemName.trim(), Math.round(Number(newItemPrice)));
    setNewItemName("");
    setNewItemPrice("");
    alert("✨ Item Successfully Add Ho Gaya!");
  };

  const log   = tokenData.log || [];
  const total = log.reduce((s,d)=>s+(d.count||0), 0);
  const totalSales = log.reduce((s,d)=>s+(d.sales||0), 0);

  const displayLog = [];
  if (tokenData.count > 0 || (tokenData.dailyTokens && tokenData.dailyTokens.length > 0)) {
    displayLog.push({
      date: tokenData.date + " (Today)",
      count: tokenData.count,
      sales: tokenData.sales || 0,
      tokens: tokenData.dailyTokens || []
    });
  }
  displayLog.push(...[...log].reverse()); 

  // 🔥 FEATURE: Download Logic Function
  const downloadTextLog = () => {
    let output = `=========================================\n`;
    output += `       ${HOTEL_NAME} - SALES REPORT       \n`;
    output += `=========================================\n\n`;

    displayLog.forEach((day) => {
      output += `📅 Date: ${day.date}\n`;
      output += `🔢 Total Tokens: ${day.count}\n`;
      output += `💰 Total Revenue: ₹${day.sales}\n`;
      output += `-----------------------------------------\n`;

      if (day.tokens && day.tokens.length > 0) {
        day.tokens.forEach((t) => {
          output += `  [Token #${String(t.token).padStart(3,"0")}] Time: ${t.time} | Bill: #${t.billNo}\n`;
          output += `  Customer: ${t.customerName || "Guest"} | Table: ${t.tableNo} | Payment: ${t.paymentMode}\n`;
          output += `  Items Ordered:\n`;
          t.items.forEach((item) => {
            output += `    - ${item.name} x${item.qty} (₹${item.price * item.qty})\n`;
          });
          output += `  Grand Total: ₹${t.total}\n\n`;
        });
      } else {
        output += `  (Detailed token layout breakdowns missing for this index)\n\n`;
      }
      output += `=========================================\n`;
    });

    // Create file asset block download trigger pipeline
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `RoyalKitchen_Billing_Log_${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"#000000cc", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:"#0f0a02", border:"1px solid #c8860a66", borderRadius:16, width:"min(580px,96vw)", maxHeight:"92vh", overflow:"hidden", display:"flex", flexDirection:"column", boxShadow:"0 0 40px #00000099" }}>

        <div style={{ background:"linear-gradient(135deg,#1c0d00,#2e1400)", padding:"14px 18px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:"1px solid #c8860a44" }}>
          <div style={{ color:"#f5c842", fontWeight:"bold", fontSize:16, letterSpacing:2 }}>🛡 ADMIN PANEL</div>
          <button onClick={ onClose} style={{ background:"#2a1500", border:"none", color:"#c8860a", borderRadius:6, padding:"5px 12px", cursor:"pointer", fontSize:14, fontWeight:"bold" }}>✕ Close</button>
        </div>

        {!auth ? (
          <div style={{ padding:28, textAlign:"center" }}>
            <div style={{ fontSize:36, marginBottom:12 }}>🔑</div>
            <div style={{ color:"#c8a96e", fontSize:13, marginBottom:14 }}>Admin Password darj karen:</div>
            <style>{`@keyframes shake2{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}`}</style>
            <div style={{ animation:shake?"shake2 .5s ease":"none" }}>
              <input type="password" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} placeholder="Admin password" autoFocus
                style={{ width:"100%", background:"#0a0800", border:`2px solid ${shake?"#ff4444":"#c8860a55"}`, borderRadius:8, padding:"11px 14px", color:"#f5c842", fontSize:15, outline:"none", fontFamily:"Georgia,serif", boxSizing:"border-box", marginBottom:14 }} />
            </div>
            {tries>0 && <div style={{ color:"#ff6666", fontSize:12, marginBottom:10 }}>❌ Galat password. {Math.max(0,3-tries)} koshish bachi.</div>}
            <button onClick={login} style={{ width:"100%", padding:"12px 0", background:"linear-gradient(135deg,#c8860a,#f5c842)", border:"none", borderRadius:8, color:"#000", fontWeight:"bold", fontSize:14, cursor:"pointer" }}>🔓 Admin Login</button>
          </div>
        ) : (
          <div style={{ overflowY:"auto", padding:18, display:"flex", flexDirection:"column", gap:14 }}>

            {/* Stats */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
              {[
                { label:"Aaj ke Tokens",   value:`#${String(tokenData.count).padStart(3,"0")}`, color:"#f5c842" },
                { label:"All-Time Tokens", value:total+tokenData.count, color:"#c8a96e" },
                { label:"Auto Reset",      value:tokenData.autoReset?"ON ✅":"OFF ❌", color:tokenData.autoReset?"#4dff91":"#ff7777" },
              ].map(s=>(
                <div key={s.label} style={{ background:"#1a1000", border:"1px solid #2a1f00", borderRadius:10, padding:"12px 8px", textAlign:"center" }}>
                  <div style={{ fontSize:9, color:"#888", letterSpacing:1, marginBottom:4 }}>{s.label}</div>
                  <div style={{ fontSize:16, fontWeight:"bold", color:s.color, fontFamily:"'Courier New',monospace" }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Aaj ki info */}
            <div style={{ background:"#141000", border:"1px solid #2a1f00", borderRadius:10, padding:"12px 16px", display:"flex", justifyContent:"space-between" }}>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:9, color:"#888" }}>Aaj ki Sales</div>
                <div style={{ fontSize:18, fontWeight:"bold", color:"#f5c842" }}>₹{tokenData.sales||0}</div>
              </div>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:9, color:"#888" }}>All-Time Sales</div>
                <div style={{ fontSize:18, fontWeight:"bold", color:"#c8a96e" }}>₹{totalSales+(tokenData.sales||0)}</div>
              </div>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:9, color:"#888" }}>Save Location</div>
                <div style={{ fontSize:10, color:"#888", maxWidth:120, wordBreak:"break-all" }}>AppData/RoyalKitchen/<br/>token_data.json</div>
              </div>
            </div>

            {/* FEATURE: Add Item to Menu Section */}
            <div style={{ background:"#1a1205", border:"1px solid #c8860a44", borderRadius:10, padding:"14px 16px" }}>
              <div style={{ color:"#f5c842", fontWeight:"bold", fontSize:14, marginBottom:10, letterSpacing:1 }}>➕ ADD NEW MENU ITEM</div>
              <form onSubmit={handleAddItemSubmit} style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                <select value={newItemCat} onChange={e => setNewItemCat(e.target.value)}
                  style={{ background:"#0f0e0d", color:"#f5f0e8", border:"1px solid #c8860a55", borderRadius:6, padding:"6px 10px", fontSize:12, outline:"none", fontFamily:"Georgia,serif", flex:1, minWidth:110 }}>
                  {Object.keys(currentMenu).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <input value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder="Item Name (e.g. Masala Tea)" required
                  style={{ background:"#0f0e0d", color:"#f5f0e8", border:"1px solid #c8860a55", borderRadius:6, padding:"6px 10px", fontSize:12, outline:"none", fontFamily:"Georgia,serif", flex:2, minWidth:150 }} />
                <input value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} placeholder="Price" type="number" required
                  style={{ background:"#0f0e0d", color:"#f5f0e8", border:"1px solid #c8860a55", borderRadius:6, padding:"6px 10px", fontSize:12, outline:"none", fontFamily:"Georgia,serif", width:70 }} />
                <button type="submit" style={{ background:"linear-gradient(135deg,#c8860a,#f5c842)", border:"none", borderRadius:6, color:"#000", fontWeight:"bold", fontSize:12, padding:"6px 14px", cursor:"pointer" }}>Add</button>
              </form>
            </div>

            {/* Auto Reset Toggle */}
            <div style={{ background:"#1a1000", border:"1px solid #2a1f00", borderRadius:10, padding:"14px 16px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ color:"#f5c842", fontWeight:"bold", fontSize:14 }}>🔄 Auto Reset</div>
                  <div style={{ color:"#888", fontSize:11, marginTop:3 }}>
                    {tokenData.autoReset ? "Agle din automatically #001 se shuru hoga" : "Reset sirf manually hoga — aap ke button se"}
                  </div>
                </div>
                <div onClick={onToggleAutoReset} style={{ width:52, height:28, borderRadius:20, background:tokenData.autoReset?"#c8860a":"#2a1f00", cursor:"pointer", position:"relative", transition:"background .3s", border:"1px solid #c8860a55", flexShrink:0, marginLeft:12 }}>
                  <div style={{ position:"absolute", top:3, left:tokenData.autoReset?26:3, width:20, height:20, borderRadius:"50%", background:tokenData.autoReset?"#000":"#888", transition:"left .3s" }} />
                </div>
              </div>
            </div>

            {/* Manual Reset */}
            <div style={{ background:"#1a0000", border:"1px solid #550000", borderRadius:10, padding:"14px 16px" }}>
              <div style={{ color:"#ff7777", fontWeight:"bold", fontSize:14, marginBottom:6 }}>🗑 Manual Reset</div>
              <div style={{ color:"#888", fontSize:11, marginBottom:12 }}>Token count ko abhi #001 se shuru karo.</div>
              {!confirm
                ? <button onClick={()=>setCf(true)} style={{ width:"100%", padding:"10px 0", background:"#2a0000", border:"1px solid #660000", borderRadius:8, color:"#ff6666", fontWeight:"bold", fontSize:13, cursor:"pointer" }}>⚠️ Reset Token Count</button>
                : <div style={{ display:"flex", gap:8 }}>
                    <button onClick={()=>setCf(false)} style={{ flex:1, padding:"10px 0", background:"#1a1000", border:"1px solid #2a1f00", borderRadius:8, color:"#c8a96e", fontWeight:"bold", fontSize:13, cursor:"pointer" }}>Cancel</button>
                    <button onClick={()=>{ onManualReset(); setCf(false); }} style={{ flex:1, padding:"10px 0", background:"#660000", border:"none", borderRadius:8, color:"fff", fontWeight:"bold", fontSize:13, cursor:"pointer" }}>✅ Reset Karo</button>
                  </div>
              }
            </div>

            {/* Daily Log — SCROLLING FIXED WITH A DOWNLOAD BUTTON EXTENSION */}
            <div style={{ background:"#1a1000", border:"1px solid #2a1f00", borderRadius:10, padding:"14px 16px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12, flexWrap: "wrap", gap: 6 }}>
                <div style={{ color:"#f5c842", fontWeight:"bold", fontSize:14 }}>📋 Daily Token Log</div>
                
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {/* 🔥 NEW FEATURE DOWNLOAD BUTTON */}
                  <button onClick={downloadTextLog} style={{ background: "linear-gradient(135deg, #2b1d04, #402b06)", border: "1px solid #c8860a77", borderRadius: 6, color: "#f5c842", fontSize: 11, padding: "4px 10px", cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center", gap: 4 }}>
                    📥 Download Log
                  </button>
                  {log.length>0 && <button onClick={onClearHistory} style={{ background:"#2a0000", border:"1px solid #550000", borderRadius:6, color:"#ff7777", fontSize:11, padding:"4px 10px", cursor:"pointer", fontWeight: "bold" }}>Clear History</button>}
                </div>
              </div>
              
              {displayLog.length===0
                ? <div style={{ color:"#555", fontSize:12, textAlign:"center", padding:"12px 0" }}>Koi history nahi mili</div>
                : <div style={{ display:"flex", flexDirection:"column", gap:8, maxHeight:"340px", overflowY:"auto", paddingRight:4 }}>
                    {displayLog.map((d,i)=>{
                      const isExpanded = expandedIndex === i;
                      return (
                        <div key={i} style={{ display:"flex", flexDirection:"column", background:"#0f0a02", borderRadius:6, border:"1px solid #2a1f00", overflow:"hidden", flexShrink: 0 }}>
                          <div 
                            onClick={() => setExpandedIndex(isExpanded ? null : i)}
                            style={{ display:"flex", justifyContent:"space-between", padding:"11px 12px", fontSize:12, cursor:"pointer", background:isExpanded?"#1a1202":"#0f0a02" }}
                          >
                            <span style={{ color:"#c8a96e", fontWeight:"bold" }}>📅 {d.date}</span>
                            <span style={{ color:"#f5c842", fontWeight:"bold" }}>{d.count} tokens</span>
                            <span style={{ color:"#4dff91", fontWeight:"bold" }}>₹{d.sales||0} {isExpanded?"▲":"▼"}</span>
                          </div>
                          
                          {isExpanded && d.tokens && d.tokens.length > 0 && (
                            <div style={{ padding:10, display:"flex", flexDirection:"column", gap:8, borderTop:"1px solid #2a1f00", background:"#070501", maxHeight:"260px", overflowY:"auto" }}>
                              {d.tokens.map((t, idx) => (
                                <div key={idx} style={{ background:"#140d02", border:"1px solid #3a2a0a", padding:10, borderRadius:6, fontSize:11, color:"#ddd" }}>
                                  <div style={{ display:"flex", justifyContent:"space-between", borderBottom:"1px solid #2a1f00", paddingBottom:5, marginBottom:5 }}>
                                    <span style={{ color:"#f5c842", fontWeight:"bold", fontSize:12 }}>Token #{String(t.token).padStart(3,"0")}</span>
                                    <span style={{ color:"#888", fontFamily:"monospace" }}>🕒 {t.time}</span>
                                  </div>
                                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                                    <span style={{ color:"#c8a96e" }}>Bill: #{t.billNo} {t.customerName ? `(${t.customerName})` : ""}</span>
                                    <span style={{ color:"#4dff91", fontWeight:"bold" }}>₹{t.total} ({t.paymentMode})</span>
                                  </div>
                                  <div style={{ background:"#0a0701", padding:6, borderRadius:4, marginTop:4 }}>
                                    {t.items && t.items.map((item, itemIdx) => (
                                      <div key={itemIdx} style={{ display:"flex", justifyContent:"space-between", color:"#bbb", fontSize:10, marginTop:2 }}>
                                        <span>• {item.name} <b>x{item.qty}</b></span>
                                        <span>₹{item.price * item.qty}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          {isExpanded && (!d.tokens || d.tokens.length === 0) && (
                            <div style={{ padding:12, fontSize:11, color:"#888", fontStyle:"italic", background:"#070501", borderTop:"1px solid #2a1f00" }}>
                              Detailed transaction breakdown unavailable for this date.
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
              }
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
//  MAIN APP
// ══════════════════════════════════════════════
export default function App() {
  const [unlocked,      setUnlocked]     = useState(false);
  const [dbReady,       setDbReady]      = useState(false); 
  const [tokenData,     setTokenData]    = useState({ count:0, date:todayKey(), autoReset:true, log:[], sales:0, dailyTokens:[] });
  const [menuData,      setMenuData]     = useState(DEFAULT_MENU);
  
  const [order,         setOrder]        = useState({});
  const [tableNo,       setTableNo]      = useState("1");
  const [customerName,  setCustName]     = useState("");
  const [paymentMode,   setPayMode]      = useState("Cash");
  const [activeCategory,setActiveCat]    = useState(Object.keys(DEFAULT_MENU)[0]);
  const [searchQuery,   setSearch]       = useState("");
  const [billNo,        setBillNo]       = useState(()=>Math.floor(Math.random()*9000)+1000);
  const [printToken,    setPrintToken]   = useState(null);
  const [showFlash,     setFlash]        = useState(false);
  const [showAdmin,     setShowAdmin]    = useState(false);
  const [now,           setNow]          = useState(new Date());
  const printRef = useRef();

  // Clock
  useEffect(()=>{ const t=setInterval(()=>setNow(new Date()),1000); return()=>clearInterval(t); },[]);
  const dateStr = now.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});
  const timeStr = now.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit"}); 

  // ── 1. Load from LOCAL FILE on unlock ──
  useEffect(()=>{
    if(!unlocked) return;
    (async()=>{
      const saved = await FileDB.load();
      if(saved){
        let data = { ...saved };
        
        if(data.customMenuConfigs) {
          setMenuData(data.customMenuConfigs);
        } else {
          data.customMenuConfigs = DEFAULT_MENU;
        }

        if(!data.dailyTokens) data.dailyTokens = [];

        if(data.autoReset && data.date !== todayKey()){
          const log = [...(data.log||[])];
          if(data.count>0) log.push({date:data.date, count:data.count, sales:data.sales||0, tokens:data.dailyTokens||[]});
          data = { ...data, count:0, date:todayKey(), log, sales:0, dailyTokens:[] };
          await FileDB.save(data);
        }
        setTokenData(data);
      } else {
        const defaultData = { count:0, date:todayKey(), autoReset:true, log:[], sales:0, dailyTokens:[], customMenuConfigs: DEFAULT_MENU };
        await FileDB.save(defaultData);
        setTokenData(defaultData);
      }
      setDbReady(true);
    })();
  },[unlocked]);

  // ── 2. Save structural execution updates safely ──
  const saveToken = useCallback(async(data)=>{
    if (!dbReady) return; 
    setTokenData(data);
    await FileDB.save(data); 
  },[dbReady]); 

  const handleAddNewItemToState = async (category, itemName, itemPrice) => {
    const updatedMenu = { ...menuData };
    const allItems = Object.values(updatedMenu).flat();
    const maxId = allItems.reduce((max, i) => (i.id > max ? i.id : max), 0);
    
    const targetPayloadItem = { id: maxId + 1, name: itemName, price: itemPrice };
    updatedMenu[category] = [...(updatedMenu[category] || []), targetPayloadItem];
    
    setMenuData(updatedMenu);
    await saveToken({ ...tokenData, customMenuConfigs: updatedMenu });
  };

  const getNextToken = async()=>{
    let data = {...tokenData};
    if(data.autoReset && data.date!==todayKey()){
      const log=[...(data.log||[])];
      if(data.count>0) log.push({date:data.date,count:data.count,sales:data.sales||0, tokens:data.dailyTokens||[]});
      data={...data,count:0,date:todayKey(),log,sales:0, dailyTokens:[]};
    }
    data.count+=1;
    return data.count;
  }; 

  const handleManualReset = async()=>{
    const log=[...(tokenData.log||[])];
    if(tokenData.count>0) log.push({date:tokenData.date,count:tokenData.count,sales:tokenData.sales||0, tokens:tokenData.dailyTokens||[]});
    await saveToken({...tokenData,count:0,date:todayKey(),log,sales:0, dailyTokens:[]});
  }; 

  const handleToggleAutoReset = async()=>{
    await saveToken({...tokenData,autoReset:!tokenData.autoReset});
  }; 

  const handleClearHistory = async()=>{
    await saveToken({...tokenData,log:[]});
  }; 

  if(!unlocked) return <LockScreen onUnlock={()=>setUnlocked(true)} />; 

  const addItem    = (item)=>setOrder(p=>({...p,[item.id]:{...item,qty:(p[item.id]?.qty||0)+1}})); 
  const removeItem = (item)=>setOrder(p=>{
    if(!p[item.id]||p[item.id].qty<=1){const u={...p};delete u[item.id];return u;}
    return{...p,[item.id]:{...p[item.id],qty:p[item.id].qty-1}};
  }); 
  const clearOrder = ()=>{ setOrder({}); setCustName(""); setTableNo("1"); setPrintToken(null); setBillNo(Math.floor(Math.random()*9000)+1000); }; 

  const orderItems = Object.values(order);
  const subtotal   = orderItems.reduce((s,i)=>s+i.price*i.qty,0);
  const gst        = Math.round(subtotal*GST_RATE);
  const total      = subtotal+gst;
  const itemCount  = orderItems.reduce((s,i)=>s+i.qty,0); 

  const allItems     = Object.values(menuData).flat();
  const filteredItems = searchQuery ? allItems.filter(i=>i.name.toLowerCase().includes(searchQuery.toLowerCase())) : menuData[activeCategory];
  const activePrintToken = printToken ?? (tokenData.count+1); 

  const handlePrint = async()=>{
    let data = {...tokenData};
    if(data.autoReset && data.date!==todayKey()){
      const log=[...(data.log||[])];
      if(data.count>0) log.push({date:data.date,count:data.count,sales:data.sales||0, tokens:data.dailyTokens||[]});
      data={...data,count:0,date:todayKey(),log,sales:0, dailyTokens:[]};
    }
    const token = data.count + 1;
    data.count = token;
    
    const newSales = (data.sales||0)+total;
    data.sales = newSales;
    
    const currentOrder = {
      token,
      billNo,
      customerName,
      tableNo,
      paymentMode,
      items: orderItems.map(i=>({name:i.name, qty:i.qty, price:i.price})),
      total,
      time: new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit"})
    };
    data.dailyTokens = [...(data.dailyTokens||[]), currentOrder];
    
    setPrintToken(token);
    await saveToken(data);
    setBillNo(Math.floor(Math.random()*9000)+1000);
    setFlash(true);
    setTimeout(()=>setFlash(false),1200);
    setTimeout(()=>{
      const content=printRef.current?.innerHTML;
      if(!content) return;
      const win=window.open("","_blank","width=380,height=750");
      win.document.write(`<html><head><title>Token #${token}</title>
        <style>@page{margin:0;size:80mm auto;}*{margin:0;padding:0;box-sizing:border-box;}body{font-family:'Courier New',monospace;font-size:12px;background:#fff;color:#000;padding:8px;width:350px;}</style>
        </head><body>${content}</body></html>`);
      win.document.close(); win.focus();
      setTimeout(()=>{win.print();win.close();},300);
    },100);
  }; 

  return (
    <div style={{ minHeight:"100vh", background:"#0f0e0d", color:"#f5f0e8", fontFamily:"Georgia,serif", display:"flex", flexDirection:"column" }}>

      {showAdmin && (
        <AdminPanel
          tokenData={tokenData}
          currentMenu={menuData}
          onClose={()=>setShowAdmin(false)}
          onManualReset={handleManualReset}
          onToggleAutoReset={handleToggleAutoReset}
          onClearHistory={handleClearHistory}
          onAddItem={handleAddNewItemToState}
        />
      )}

      {/* HEADER */}
      <header style={{ background:"linear-gradient(135deg,#1a0a00,#2d1200)", borderBottom:"2px solid #c8860a", padding:"10px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <div style={{ fontSize:20, fontWeight:"bold", color:"#f5c842", letterSpacing:3 }}>🍽 {HOTEL_NAME}</div>
          <div style={{ fontSize:11, color:"#c8a96e" }}>{HOTEL_ADDR}</div>
          <div style={{ display:"flex", gap:8, marginTop:4 }}>
            <button onClick={()=>setShowAdmin(true)} style={{ background:"#2a1500", border:"1px solid #c8860a44", borderRadius:6, color:"#c8860a", fontSize:10, padding:"3px 8px", cursor:"pointer", fontFamily:"Georgia,serif" }}>🛡 Admin</button>
            <span style={{ fontSize:10, color:"#556", paddingTop:3 }}>Aaj: ₹{tokenData.sales||0} • {dbReady?"💾 Saved":"⏳ Loading..."}</span>
          </div>
        </div>

        <div style={{ textAlign:"center", background:showFlash?"#f5c842":"#1e1000", border:`2px solid ${showFlash?"#f5c842":"#c8860a"}`, borderRadius:10, padding:"6px 18px", transition:"all .3s", boxShadow:showFlash?"0 0 20px #f5c84288":"none" }}>
          <div style={{ fontSize:9, letterSpacing:2, color:showFlash?"#000":"#c8860a", fontWeight:"bold" }}>TODAY'S TOKEN</div>
          <div style={{ fontSize:28, fontWeight:"bold", color:showFlash?"#000":"#f5c842", lineHeight:1.1, fontFamily:"'Courier New',monospace" }}>
            #{String(tokenData.count).padStart(3,"0")}
          </div>
          <div style={{ fontSize:9, color:showFlash?"#333":"#888" }}>
            {!dbReady?"Loading...":tokenData.count===0?"No orders yet":`${tokenData.count} customer${tokenData.count>1?"s":""} served`}
          </div>
          <div style={{ fontSize:8, color:showFlash?"#333":"#555" }}>{tokenData.autoReset?"Auto ↺":"Manual"}</div>
        </div>

        <div style={{ textAlign:"right", fontSize:12, color:"#c8a96e" }}>
          <div style={{ fontSize:13, fontWeight:"bold", color:"#f5c842" }}>{dateStr}</div>
          <div style={{ fontFamily:"'Courier New',monospace", fontSize:11 }}>{timeStr}</div>
        </div>
      </header>

      <div style={{ display:"flex", flex:1, height:"calc(100vh - 80px)", overflow:"hidden" }}>

        {/* LEFT — MENU */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", borderRight:"1px solid #2a1f00", overflow:"hidden" }}>
          <div style={{ padding:"10px 14px", background:"#1a1208", borderBottom:"1px solid #2a1f00" }}>
            <input value={searchQuery} onChange={e=>setSearch(e.target.value)} placeholder="🔍  Search menu item..."
              style={{ width:"100%", background:"#0f0e0d", border:"1px solid #c8860a55", borderRadius:6, padding:"7px 12px", color:"#f5f0e8", fontSize:13, outline:"none", fontFamily:"Georgia,serif" }} />
          </div>
          {!searchQuery && (
            <div style={{ display:"flex", gap:4, padding:"8px 10px", background:"#150f04", overflowX:"auto", borderBottom:"1px solid #2a1f00", flexShrink:0 }}>
              {Object.keys(menuData).map(cat=>(
                <button key={cat} onClick={()=>setActiveCat(cat)}
                  style={{ whiteSpace:"nowrap", padding:"5px 10px", borderRadius:20, border:"none", cursor:"pointer", fontSize:11, fontFamily:"Georgia,serif", fontWeight:"bold", transition:"all .2s", background:activeCategory===cat?"#c8860a":"#2a1f00", color:activeCategory===cat?"#000":"#c8a96e" }}>
                  {cat}
                </button>
              ))}
            </div>
          )}
          <div style={{ flex:1, overflowY:"auto", padding:10, display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:8, alignContent:"start" }}>
            {(filteredItems||[]).map(item=>{
              const qty=order[item.id]?.qty||0;
              return (
                <div key={item.id} style={{ background:qty>0?"#1f1000":"#141007", border:`1.5px solid ${qty>0?"#c8860a":"#2a1f00"}`, borderRadius:8, padding:"10px 8px", cursor:"pointer" }} onClick={()=>addItem(item)}>
                  <div style={{ fontSize:13, fontWeight:"bold", color:"#f5c842", marginBottom:3 }}>{item.name}</div>
                  <div style={{ fontSize:12, color:"#c8a96e" }}>₹{item.price}</div>
                  {qty>0&&(
                    <div style={{ marginTop:6, display:"flex", alignItems:"center", gap:6 }}>
                      <button onClick={e=>{e.stopPropagation();removeItem(item);}} style={{ width:22, height:22, borderRadius:"50%", border:"none", background:"#c8860a", color:"#000", fontWeight:"bold", cursor:"pointer", fontSize:14 }}>−</button>
                      <span style={{ fontSize:13, color:"#f5f0e8", fontWeight:"bold" }}>{qty}</span>
                      <button onClick={e=>{e.stopPropagation();addItem(item);}} style={{ width:22, height:22, borderRadius:"50%", border:"none", background:"#c8860a", color:"#000", fontWeight:"bold", cursor:"pointer", fontSize:14 }}>+</button>
                    </div>
                  )}
                </div>
              );
            })}
            {filteredItems?.length===0&&<div style={{ color:"#666", fontSize:13, gridColumn:"1/-1", textAlign:"center", paddingTop:20 }}>No items found</div>}
          </div>
        </div>

        {/* RIGHT — ORDER */}
        <div style={{ width:320, display:"flex", flexDirection:"column", background:"#110d04", overflow:"hidden" }}>
          <div style={{ padding:"10px 12px", borderBottom:"1px solid #2a1f00" }}>
            <div style={{ display:"flex", gap:8, marginBottom:8 }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:10, color:"#c8860a", marginBottom:3, letterSpacing:1 }}>CUSTOMER NAME</div>
                <input value={customerName} onChange={e=>setCustName(e.target.value)} placeholder="Optional"
                  style={{ width:"100%", background:"#0f0e0d", border:"1px solid #2a1f00", borderRadius:5, padding:"5px 8px", color:"#f5f0e8", fontSize:12, outline:"none", fontFamily:"Georgia,serif" }} />
              </div>
              <div style={{ width:65 }}>
                <div style={{ fontSize:10, color:"#c8860a", marginBottom:3, letterSpacing:1 }}>TABLE</div>
                <input value={tableNo} onChange={e=>setTableNo(e.target.value)} placeholder="1"
                  style={{ width:"100%", background:"#0f0e0d", border:"1px solid #2a1f00", borderRadius:5, padding:"5px 8px", color:"#f5f0e8", fontSize:12, outline:"none", fontFamily:"Georgia,serif", textAlign:"center" }} />
              </div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <div style={{ flex:1, background:"#1a0f00", border:"1px solid #c8860a44", borderRadius:6, padding:"5px 10px" }}>
                <div style={{ fontSize:9, color:"#c8860a", letterSpacing:1 }}>TOKEN NO.</div>
                <div style={{ fontSize:18, fontWeight:"bold", color:"#f5c842", fontFamily:"'Courier New',monospace", lineHeight:1 }}>#{String(activePrintToken).padStart(3,"0")}</div>
                <div style={{ fontSize:9, color:"#888" }}>{printToken?"Printed":"Next"}</div>
              </div>
              <div style={{ flex:1, background:"#1a0f00", border:"1px solid #2a1f00", borderRadius:6, padding:"5px 10px" }}>
                <div style={{ fontSize:9, color:"#888", letterSpacing:1 }}>BILL NO.</div>
                <div style={{ fontSize:16, fontWeight:"bold", color:"#c8a96e", fontFamily:"'Courier New',monospace", lineHeight:1 }}>#{billNo}</div>
                <div style={{ fontSize:9, color:"#555" }}>{dateStr}</div>
              </div>
            </div>
          </div>

          <div style={{ padding:"7px 12px", borderBottom:"1px solid #2a1f00", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ color:"#c8860a", fontSize:12, fontWeight:"bold", letterSpacing:1 }}>ORDER SUMMARY</span>
            <span style={{ background:"#c8860a", color:"#000", borderRadius:10, padding:"1px 8px", fontSize:11, fontWeight:"bold" }}>{itemCount} items</span>
          </div>

          <div style={{ flex:1, overflowY:"auto", padding:"6px 12px" }}>
            {orderItems.length===0
              ? <div style={{ textAlign:"center", color:"#444", fontSize:13, paddingTop:30 }}><div style={{ fontSize:30, marginBottom:8 }}>🛒</div>No items added yet.<br />Click menu items to add.</div>
              : orderItems.map(item=>(
                <div key={item.id} style={{ display:"flex", alignItems:"center", borderBottom:"1px solid #1e1608", padding:"6px 0", gap:6 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12, color:"#f5f0e8", fontWeight:"bold" }}>{item.name}</div>
                    <div style={{ fontSize:11, color:"#c8a96e" }}>₹{item.price} × {item.qty}</div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                    <button onClick={()=>removeItem(item)} style={{ width:20, height:20, borderRadius:"50%", border:"none", background:"#3a1f00", color:"#c8860a", fontWeight:"bold", cursor:"pointer", fontSize:13 }}>−</button>
                    <span style={{ fontSize:12, color:"#f5f0e8", width:16, textAlign:"center" }}>{item.qty}</span>
                    <button onClick={()=>addItem(item)} style={{ width:20, height:20, borderRadius:"50%", border:"none", background:"#3a1f00", color:"#c8860a", fontWeight:"bold", cursor:"pointer", fontSize:13 }}>+</button>
                  </div>
                  <div style={{ fontSize:13, color:"#f5c842", fontWeight:"bold", width:50, textAlign:"right" }}>₹{item.price*item.qty}</div>
                </div>
              ))
            }
          </div>

          {orderItems.length>0&&(
            <div style={{ borderTop:"1px dashed #2a1f00", padding:"10px 12px", background:"#0f0c04" }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"#c8a96e", marginBottom:3 }}><span>Subtotal</span><span>₹{subtotal}</span></div>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"#c8a96e", marginBottom:6 }}><span>GST (5%)</span><span>₹{gst}</span></div>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:16, fontWeight:"bold", color:"#f5c842", marginBottom:10, borderTop:"1px solid #2a1f00", paddingTop:6 }}><span>TOTAL</span><span>₹{total}</span></div>
              <div style={{ display:"flex", gap:6, marginBottom:10 }}>
                {["Cash","UPI","Card"].map(m=>(
                  <button key={m} onClick={()=>setPayMode(m)}
                    style={{ flex:1, padding:"5px 0", border:"none", borderRadius:5, cursor:"pointer", fontSize:11, fontWeight:"bold", fontFamily:"Georgia,serif", background:paymentMode===m?"#c8860a":"#2a1f00", color:paymentMode===m?"#000":"#c8a96e" }}>
                    {m==="Cash"?"💵":m==="UPI"?"📱":"💳"} {m}
                  </button>
                ))}
              </div>
              <div style={{ display:"flex", gap:6 }}>
                <button onClick={clearOrder} style={{ flex:1, padding:"8px 0", background:"#2a0000", border:"1px solid #660000", borderRadius:6, color:"#ff6666", fontWeight:"bold", fontSize:12, cursor:"pointer", fontFamily:"Georgia,serif" }}>🗑 Clear</button>
                <button onClick={handlePrint} style={{ flex:2, padding:"8px 0", background:"linear-gradient(135deg,#c8860a,#f5c842)", border:"none", borderRadius:6, color:"#000", fontWeight:"bold", fontSize:13, cursor:"pointer", fontFamily:"Georgia,serif" }}>🖨 Print Bill</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PRINT RECEIPT */}
      <div style={{ display:"none" }}>
        <div ref={printRef}>
          <div style={{ textAlign:"center", border:"2px dashed #000", padding:"6px 0", marginBottom:6 }}>
            <div style={{ fontSize:11, letterSpacing:3, fontWeight:"bold" }}>TOKEN NUMBER</div>
            <div style={{ fontSize:38, fontWeight:"bold", fontFamily:"Courier New,monospace", lineHeight:1.1 }}>#{String(activePrintToken).padStart(3,"0")}</div>
          </div>
          <div style={{ textAlign:"center", fontWeight:"bold", fontSize:15, letterSpacing:2 }}>{HOTEL_NAME}</div>
          <div style={{ textAlign:"center", fontSize:10 }}>{HOTEL_ADDR}</div>
          <div style={{ textAlign:"center", fontSize:10 }}>Ph: {HOTEL_PHONE}</div>
          <div style={{ textAlign:"center", fontSize:10 }}>GSTIN: {GSTIN}</div>
          <div style={{ borderTop:"1px dashed #000", margin:"5px 0" }}></div>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, alignItems:"flex-start" }}>
            <span>Name: <b>{customerName||"Guest"}</b></span>
            <div style={{ textAlign:"right" }}>
              <div>Items: <b>{itemCount}</b></div>
              <div style={{ fontSize:10, marginTop:2 }}>Bill No: <b>#{billNo}</b></div>
            </div>
          </div>
          <div style={{ fontSize:11 }}>Time: {timeStr}</div>
          <div style={{ fontSize:11 }}>Date: {dateStr}</div>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:11 }}>
            <span>Table: <b>{tableNo}</b></span>
            <span>Payment: <b>{paymentMode}</b></span>
          </div>
          <div style={{ borderTop:"1px dashed #000", margin:"5px 0" }}></div>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, fontWeight:"bold" }}>
            <span style={{ flex:1 }}>ITEM</span>
            <span style={{ width:28, textAlign:"center" }}>QTY</span>
            <span style={{ width:44, textAlign:"right" }}>RATE</span>
            <span style={{ width:52, textAlign:"right" }}>AMT</span>
          </div>
          <div style={{ borderTop:"1px dashed #000", margin:"3px 0" }}></div>
          {orderItems.map(item=>(
            <div key={item.id} style={{ display:"flex", justifyContent:"space-between", fontSize:12, padding:"2px 0" }}>
              <span style={{ flex:1 }}>{item.name}</span>
              <span style={{ width:28, textAlign:"center" }}>{item.qty}</span>
              <span style={{ width:44, textAlign:"right" }}>{item.price}</span>
              <span style={{ width:52, textAlign:"right" }}>{item.price*item.qty}</span>
            </div>
          ))}
          <div style={{ borderTop:"1px dashed #000", margin:"5px 0" }}></div>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:12 }}><span>Subtotal</span><span>₹{subtotal}</span></div>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:12 }}><span>CGST (2.5%)</span><span>₹{Math.round(subtotal*.025)}</span></div>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:12 }}><span>SGST (2.5%)</span><span>₹{Math.round(subtotal*.025)}</span></div>
          <div style={{ borderTop:"1px dashed #000", margin:"5px 0" }}></div>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:15, fontWeight:"bold" }}><span>GRAND TOTAL</span><span>₹{total}</span></div>
          <div style={{ borderTop:"1px dashed #000", margin:"6px 0" }}></div>
          <div style={{ textAlign:"center", fontSize:12, fontWeight:"bold" }}>*** Thank You! Visit Again ***</div>
        </div>
      </div>
    </div>
  );
}