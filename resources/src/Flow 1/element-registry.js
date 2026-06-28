// ============================================================
// FUNCTION NODE: element-registry
// Eingang:  discovery-mock
// Ausgang:  -> action-registry
// ------------------------------------------------------------
// Definiert die Element-Registry: Typ → Vuetify-Komponente,
// CSS-Klasse, Defaults und Event-Name.
// Komplexe Typen (led, badge, status-panel) haben component: null
// und stattdessen einen template-Key für den Render-Switch.
// ============================================================

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
                emits: "update:modelValue" },
    led:            { component: null, template: "led",          cssClass: "el-led",          emits: null, defaults: {} },
    badge:          { component: null, template: "badge",        cssClass: "el-badge",        emits: null, defaults: {} },
    "status-panel": { component: null, template: "status-panel", cssClass: "el-status-panel", emits: null, defaults: {} },

    "value-display": { component: null,               template: "value-display", cssClass: "el-value-display", emits: null,                  defaults: {} },
    "progress-bar":  { component: "v-progress-linear", template: null,           cssClass: "el-progress-bar",  emits: null,                  defaults: { height: "16px", rounded: true } },
    slider:          { component: null,               template: "slider",        cssClass: "el-slider",        emits: "update:modelValue",   defaults: {} },
    gauge:           { component: null,               template: "gauge",         cssClass: "el-gauge",         emits: null,                  defaults: {} },
    stepper:         { component: null,               template: "stepper",       cssClass: "el-stepper",       emits: "update:modelValue",   defaults: {} }
});

return msg;