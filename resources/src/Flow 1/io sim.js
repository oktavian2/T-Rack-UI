// ============================================================
// FUNCTION NODE: io-sim
// Eingang:  switch "target" (Ausgang 1: io)
// Ausgang:  -> debug "out"
// ------------------------------------------------------------
// Simuliert Hardware-Zugriff.
// Spaeter: durch node-red-contrib-i2c ersetzen,
//          addr aus instanceKey auf echte Register mappen.
// ============================================================

const p = msg.payload;
const store = flow.get("io_state") || {};

if (p.op === "write" || p.op === "config") {
    const k = p.addr + (p.field ? ":" + p.field : "");
    store[k] = p.value;
    flow.set("io_state", store);
    node.warn("IO " + p.op + " -> " + p.addr + (p.field ? ("." + p.field) : "") + " = " + p.value);

} else if (p.op === "read") {
    const val = (Math.random() * 10).toFixed(2);   // Fake-Messwert
    node.warn("IO read <- " + p.addr + " = " + val + " A");
    msg.payload = { addr: p.addr, value: val };
}

return msg;