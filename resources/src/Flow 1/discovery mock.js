// ============================================================
// FUNCTION NODE: discovery-mock
// Eingang:  inject "boot"
// Ausgang:  -> schema-loader
// ------------------------------------------------------------
// PoC: Hardware fest verdrahtet.
// Spaeter durch echten I2C-Scan / EEPROM-Read ersetzen.
// Nur DIESE Node tauschen, der Rest bleibt unveraendert.
// SO
// ============================================================

msg.discovery = [
    { slot: 1, type: "relay" },
    { slot: 2, type: "current" },
    { slot: 3, type: "demo"}
];

return msg;