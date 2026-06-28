// ============================================================
// FUNCTION NODE: instance-builder
// Eingang:  schema-loader
// Ausgang:  -> render-user  UND  render-config  (zwei Drähte
//              vom selben Ausgang, oder 2 Outputs - hier 1 Output,
//              beide Templates am selben Draht)
// ------------------------------------------------------------
// Kernlogik: Discovery + Schemas + Registry  ->  tabs[]
// - klont pro Slot das Schema
// - vergibt Slash-Topics im Projekt-Stil: slot1/relay/1 (kollisionsfrei)
// - expandiert repeat -> {ch}
// - merged Registry-Eintrag (component/cssClass/defaults/emits)
// - schreibt flow.instances (Meta fuer den Dispatcher, Key = Topic)
// ============================================================

const slots     = msg.discovery;
const schemas   = flow.get("schemas");
const registry  = flow.get("registry");
const tabs      = [];
const instances = {};

function expand(view, slot, prefix, io) {
    const groups = [];
    for (const g of view.groups) {
        const els = [];
        for (const el of g.elements) {
            const count = el.repeat === "channels" ? io.channels : 1;
            for (let ch = 1; ch <= count; ch++) {
                const reg = registry[el.type] || {};
                // Slash-Topic im Projekt-Stil (kompakt): slot1/relay/1
                const topic = el.repeat
                    ? prefix + "/" + el.id + "/" + ch
                    : prefix + "/" + el.id;

                els.push(Object.assign({}, el, {
                    topic:     topic,
                    label:     (el.label || "").replace("{ch}", ch),
                    component: reg.component,
                    cssClass:  reg.cssClass,
                    emits:     reg.emits,
                    defaults:  reg.defaults || {},
                    value:     el.default !== undefined ? el.default : null
                }));

                instances[topic] = {
                    slot:   slot,
                    addr:   topic,                    // PoC: Topic == Adresse
                    action: el.onChange || el.onClick || null,
                    commit: el.commit || "immediate"
                };
            }
        }
        groups.push({ title: g.title, elements: els });
    }
    return { groups: groups };
}

for (const s of slots) {
    const schema = JSON.parse(JSON.stringify(schemas[s.type]));
    const tabId  = "slot" + s.slot + "_" + s.type;   // interne Tab-ID (kein Topic)
    const prefix = "slot" + s.slot;                  // Topic-Praefix: slot1/...
    tabs.push({
        tabId: tabId,
        title: schema.displayName + " (Slot " + s.slot + ")",
        user:   expand(schema.views.user,   s.slot, prefix, schema.io),
        config: expand(schema.views.config, s.slot, prefix, schema.io)
    });
}

flow.set("instances", instances);
msg.payload = tabs;
return msg;