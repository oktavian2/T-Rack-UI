// ============================================================
// FUNCTION NODE: action-registry
// Eingang:  element-registry
// Ausgang:  -> schema-loader
// ------------------------------------------------------------
// Definiert alle Actions: Name → Funktion(context) → Command.
// context = { topic, value, slot, addr }
// Command = { target, op, ... } → wird vom Dispatcher geroutet.
// ============================================================

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
