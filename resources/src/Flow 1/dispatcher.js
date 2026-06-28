// ============================================================
// FUNCTION NODE: dispatcher
// Eingang:  render-user / render-config (Element-Events)
// Ausgang:  -> switch "target"
// ------------------------------------------------------------
// Projekt-Konvention: msg.topic = Adresse, msg.payload = Wert.
// commit-Steuerung: "immediate" schreibt sofort,
//                   "onSave" puffert bis msg.forceCommit.
// ============================================================

const topic   = msg.topic;                         // z.B. "slot1/relay/1"
const value   = msg.payload;                       // reiner Wert
const meta    = (flow.get("instances") || {})[topic];
const actions = flow.get("actions") || {};

if (!meta) {
    node.warn("Unbekanntes Topic: " + topic);
    return null;
}

// onSave: puffern statt sofort schreiben
if (meta.commit === "onSave" && !msg.forceCommit) {
    const buf = flow.get("pending") || {};
    buf[topic] = value;
    flow.set("pending", buf);
    node.status({ fill: "yellow", shape: "ring", text: "gepuffert: " + topic });
    return null;
}

const fn = actions[meta.action];
if (!fn) {
    node.warn("Unbekannte Aktion: " + meta.action);
    return null;
}

// Ergebnis: msg.topic bleibt erhalten, msg.payload = Kommando-Objekt
msg.payload = fn({
    topic: topic,
    value: value,
    slot:  meta.slot,
    addr:  meta.addr
});

return msg;