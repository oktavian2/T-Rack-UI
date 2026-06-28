// ============================================================
// FUNCTION NODE: logger-sim
// Eingang:  switch "target" (Ausgang 2: logger)
// Ausgang:  -> debug "out"
// ------------------------------------------------------------
// Simuliert den Logger-Start.
// Spaeter: echtes Logging / File-Write anbinden.
// ============================================================

node.warn("LOGGER " + msg.payload.op + " (Slot " + msg.payload.slot + ")");

return msg;