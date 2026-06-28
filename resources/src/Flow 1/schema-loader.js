// ============================================================
// FUNCTION NODE: schema-loader
// Eingang:  action-registry
// Ausgang:  -> instance-builder
// ------------------------------------------------------------
// PoC: Karten-Schemas inline.
// Spaeter: per WebSocket vom Backend empfangen.
// Registry und Actions sind in separaten Nodes.
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
                    },
                    {
                        title: "value-display / progress-bar / slider / gauge / stepper \u2014 Welle 1",
                        elements: [
                            { id: "rpm",   type: "value-display", label: "Drehzahl",           unit: "rpm", rw: "read",  onChange: "demoRead" },
                            { id: "load",  type: "progress-bar",  label: "Auslastung (%)",                   rw: "read",  onChange: "demoRead" },
                            { id: "speed", type: "slider",        label: "Sollgeschwindigkeit", min: 0, max: 200, step: 5, onChange: "demoWrite", commit: "immediate" },
                            { id: "temp",  type: "gauge",         label: "Temperatur",          unit: "\u00b0C", min: 0, max: 150, rw: "read", onChange: "demoRead" },
                            { id: "count", type: "stepper",       label: "Schritte",            min: 0, max: 50, default: 5, onChange: "demoWrite", commit: "immediate" }
                        ]
                    },
                    {
                        title: "led / badge / status-panel \u2014 komplexe Elemente",
                        elements: [
                            { id: "fb",       type: "led",          label: "R\u00fcckm. {ch}",
                              repeat: "channels", rw: "read", onChange: "demoRead" },
                            { id: "status",   type: "badge",        label: "Systemstatus",
                              rw: "read", onChange: "demoRead" },
                            { id: "overview", type: "status-panel", label: "\u00dcbersicht",
                              ledCount: 4,
                              buttons: [
                                  { id: "reset", label: "Reset", action: "demoAction" },
                                  { id: "test",  label: "Test",  action: "demoAction" }
                              ]
                            }
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
                        columns: 5,
                        elements: [
                            { id: "mode", type: "dropdown", label: "Betriebsmodus",
                              options: ["Auto", "Manuell", "Aus"], default: "Auto",
                              onChange: "demoConfig", commit: "onSave", colSpan: 2 },
                            { id: "range", type: "dropdown", label: "Bereich {ch}",
                              repeat: "channels", options: ["niedrig", "mittel", "hoch"], default: "mittel",
                              onChange: "demoConfig", commit: "onSave" }
                        ]
                    },
                    {
                        title: "Welle-1-Konfiguration",
                        elements: [
                            { id: "rpm_max",   type: "numeric", label: "Drehzahl-Limit (rpm)",           min: 0, max: 10000, default: 3000, onChange: "demoConfig", commit: "onSave" },
                            { id: "temp_warn", type: "numeric", label: "Temperatur-Warnschwelle (\u00b0C)", min: 0, max: 150,   default: 80,   onChange: "demoConfig", commit: "onSave" }
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
                    },
                    {
                        title: "Noch was - durcheinander",
                        columns: 2,
                        elements: [
                            { id: "gauge1",    type: "gauge",   label: "Drehzahl",   unit: "rpm", min: 0, max: 5000, rw: "read", onChange: "demoRead" },
                            { id: "gauge2",    type: "gauge",   label: "Drehmoment", unit: "Nm",  min: 0, max: 350,  rw: "read", onChange: "demoRead" },
                            { id: "temp_warn", type: "numeric", label: "Temperatur-Warnschwelle (\u00b0C)", min: 0, max: 150, default: 80, onChange: "demoConfig", commit: "onSave" }
                        ]
                    }
                ]
            }
        }
    }

});

return msg;