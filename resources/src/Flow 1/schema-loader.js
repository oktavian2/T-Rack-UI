// ============================================================
// FUNCTION NODE: schema-loader
// Eingang:  discovery-mock
// Ausgang:  -> instance-builder
// ------------------------------------------------------------
// PoC: Schemas + Registry + Actions inline.
// Spaeter: aus cards/*.json + registry/elements.json laden
//          (file in / fs-Modul) statt inline.
// ============================================================

// ---- Karten-Schemas ----------------------------------------
flow.set("schemas", {
    relay: {
        cardType: "relay",
        displayName: "Relaiskarte",
        version: "1.0",
        io: { channels: 4, protocol: "i2c" },
        views: {
            user: {
                groups: [
                    {
                        title: "Relais",
                        elements: [
                            { id: "relay", type: "toggle", label: "Relais {ch}",
                              repeat: "channels", rw: "write",
                              onChange: "writeRelay", commit: "immediate" }
                        ]
                    },
                    {
                        title: "default state",
                        elements: [
                            { id: "state", type: "toggle", label: "Default state Relais {ch}", repeat: "channels", rw: "write"}
                        ]
                    },
                    {
                        title: "Steuerung",
                        elements: [
                            { id: "log_start", type: "button", label: "Log starten",
                              onClick: "startLog" }
                        ]
                    }
                ]
            },
            config: {
                groups: [
                    {
                        title: "Kanal-Setup",
                        elements: [
                            { id: "mode", type: "dropdown", label: "Modus {ch}",
                              repeat: "channels", options: ["NO", "NC"], default: "NO",
                              onChange: "setMode", commit: "onSave" },
                            { id: "debounce", type: "numeric", label: "Entprellzeit {ch} (ms)",
                              repeat: "channels", min: 0, max: 1000, default: 50,
                              onChange: "setDebounce", commit: "onSave" }
                        ]
                    }
                ]
            }
        }
    },
    current: {
        cardType: "current",
        displayName: "Strommesskarte",
        version: "1.0",
        io: { channels: 2, protocol: "i2c" },
        views: {
            user: {
                groups: [
                    {
                        title: "Messwerte",
                        elements: [
                            { id: "current", type: "output", label: "Strom {ch} (A)",
                              repeat: "channels", rw: "read", onChange: "readCurrent" }
                        ]
                    }
                ]
            },
            config: {
                groups: [
                    {
                        title: "Messbereich",
                        elements: [
                            { id: "range", type: "dropdown", label: "Bereich {ch}",
                              repeat: "channels", options: ["1A", "10A", "50A"], default: "10A",
                              onChange: "setRange", commit: "onSave" },
                            { id: "samplerate", type: "numeric", label: "Samplerate {ch} (Hz)",
                              repeat: "channels", min: 1, max: 1000, default: 100,
                              onChange: "setSampleRate", commit: "onSave" }
                        ]
                    }
                ]
            }
        }
    },
    demo: {
        cardType: "demo",
        displayName: "Demo-Karte (alle Elemente)",
        version: "1.0",
        io: { channels: 3, protocol: "i2c" },
        views: {
            user: {
                groups: [
                    {
                        title: "toggle \u2014 Ein/Aus-Schalter",
                        elements: [
                            { id: "power", type: "toggle", label: "Hauptschalter",
                              onChange: "demoWrite", commit: "immediate" },
                            { id: "relay", type: "toggle", label: "Kanal {ch}",
                              repeat: "channels", onChange: "demoWrite", commit: "immediate" }
                        ]
                    },
                    {
                        title: "button \u2014 Aktion ausloesen",
                        elements: [
                            { id: "start", type: "button", label: "Start", onClick: "demoAction" },
                            { id: "stop",  type: "button", label: "Stopp", onClick: "demoAction" }
                        ]
                    },
                    {
                        title: "output \u2014 Nur-Lese-Anzeige (Messwerte)",
                        elements: [
                            { id: "value", type: "output", label: "Messwert {ch}",
                              repeat: "channels", rw: "read", onChange: "demoRead" }
                        ]
                    }
                ]
            },
            config: {
                groups: [
                    {
                        title: "numeric \u2014 Zahleneingabe mit Grenzen",
                        elements: [
                            { id: "threshold", type: "numeric", label: "Schwellwert (global)",
                              min: 0, max: 100, step: 1, default: 50,
                              onChange: "demoConfig", commit: "onSave" },
                            { id: "delay", type: "numeric", label: "Verzoegerung {ch} (ms)",
                              repeat: "channels", min: 0, max: 5000, step: 10, default: 100,
                              onChange: "demoConfig", commit: "onSave" }
                        ]
                    },
                    {
                        title: "dropdown \u2014 Auswahl aus festen Optionen",
                        elements: [
                            { id: "mode", type: "dropdown", label: "Betriebsmodus",
                              options: ["Auto", "Manuell", "Aus"], default: "Auto",
                              onChange: "demoConfig", commit: "onSave" },
                            { id: "range", type: "dropdown", label: "Bereich {ch}",
                              repeat: "channels", options: ["niedrig", "mittel", "hoch"], default: "mittel",
                              onChange: "demoConfig", commit: "onSave" }
                        ]
                    },
                    {
                        title: "Gemischt \u2014 immediate vs. onSave in einer Gruppe",
                        elements: [
                            { id: "live_offset", type: "numeric", label: "Live-Offset (sofort)",
                              min: -50, max: 50, default: 0,
                              onChange: "demoConfig", commit: "immediate" },
                            { id: "saved_gain", type: "numeric", label: "Verstaerkung (erst speichern)",
                              min: 1, max: 10, default: 1,
                              onChange: "demoConfig", commit: "onSave" }
                        ]
                    }
                ]
            }
        }
    }

});

// ---- Element-Registry (Aufbau / Defaults / cssClass) -------
flow.set("registry", {
    toggle:   { component: "v-switch",     cssClass: "el-toggle",
                defaults: { color: "var(--accent)", inset: true, hideDetails: true },
                emits: "update:modelValue" },
    button:   { component: "v-btn",        cssClass: "el-button",
                defaults: { variant: "flat" },
                emits: "click" },
    numeric:  { component: "v-text-field", cssClass: "el-numeric",
                defaults: { type: "number", variant: "outlined", density: "compact", hideDetails: true },
                emits: "update:modelValue" },
    dropdown: { component: "v-select",     cssClass: "el-dropdown",
                defaults: { variant: "outlined", density: "compact", hideDetails: true },
                emits: "update:modelValue" },
    output:   { component: "v-text-field", cssClass: "el-output",
                defaults: { readonly: true, variant: "plain", density: "compact", hideDetails: true },
                emits: "update:modelValue" }
});

// ---- Action-Registry (Verhalten bei Interaktion) -----------
flow.set("actions", {
    writeRelay:    function (c) { return { target: "io",     op: "write",  addr: c.addr, value: c.value }; },
    setMode:       function (c) { return { target: "io",     op: "config", addr: c.addr, field: "mode",       value: c.value }; },
    setDebounce:   function (c) { return { target: "io",     op: "config", addr: c.addr, field: "debounce",   value: c.value }; },
    setRange:      function (c) { return { target: "io",     op: "config", addr: c.addr, field: "range",      value: c.value }; },
    setSampleRate: function (c) { return { target: "io",     op: "config", addr: c.addr, field: "samplerate", value: c.value }; },
    readCurrent:   function (c) { return { target: "io",     op: "read",   addr: c.addr }; },
    startLog:      function (c) { return { target: "logger", op: "start",  slot: c.slot }; },

    // ---- Demo-Karte ----
    demoWrite:     function (c) { return { target: "io",     op: "write",  addr: c.addr, value: c.value }; },
    demoConfig:    function (c) { return { target: "io",     op: "config", addr: c.addr, value: c.value }; },
    demoRead:      function (c) { return { target: "io",     op: "read",   addr: c.addr }; },
    demoAction:    function (c) { return { target: "logger", op: "action", addr: c.addr }; }
});

return msg;