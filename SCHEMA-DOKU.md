# T-Rack-UI — Schema-Dokumentation

Dieses Dokument beschreibt, wie du im `schema-loader.js` eigene Karten-Schemas und Views aufbauen kannst.

---

## Aufbau eines Karten-Schemas

```js
flow.set("schemas", {
    meinKartenTyp: {
        cardType:    "meinKartenTyp",   // eindeutiger Bezeichner (= Schlüssel oben)
        displayName: "Meine Karte",     // Anzeigename im Tab
        version:     "1.0",
        io: {
            channels: 4,                // Anzahl Kanäle (für repeat: "channels")
            protocol: "i2c"             // Protokoll (nur informativ)
        },
        views: {
            user:   { groups: [ ... ] },   // User-View  (/dashboard/user)
            config: { groups: [ ... ] }    // Config-View (/dashboard/config)
        }
    }
});
```

---

## Gruppen

Eine View besteht aus einer Liste von Gruppen. Jede Gruppe hat einen Titel, optional eine Spaltenanzahl und eine Liste von Elementen.

```js
{
    title:   "Meine Gruppe",   // Gruppenüberschrift
    columns: 2,                // OPTIONAL: Elemente nebeneinander (default: 1)
    elements: [ ... ]
}
```

### `columns`
Gibt an, wie viele Spalten die Elemente innerhalb der Gruppe haben.

| Wert | Effekt |
|------|--------|
| `1` (default) | Elemente untereinander, Label links — Element rechts |
| `2`, `3`, `4` … | Elemente im Grid nebeneinander, Label oben — Element darunter |

Beispiel: 4 Gauges nebeneinander
```js
{ title: "Antriebe", columns: 4, elements: [
    { id: "rpm1", type: "gauge", label: "Motor 1", unit: "rpm", min: 0, max: 3000, rw: "read", onChange: "readRpm" },
    { id: "rpm2", type: "gauge", label: "Motor 2", unit: "rpm", min: 0, max: 3000, rw: "read", onChange: "readRpm" },
    { id: "rpm3", type: "gauge", label: "Motor 3", unit: "rpm", min: 0, max: 3000, rw: "read", onChange: "readRpm" },
    { id: "rpm4", type: "gauge", label: "Motor 4", unit: "rpm", min: 0, max: 3000, rw: "read", onChange: "readRpm" },
]}
```

---

## Gemeinsame Element-Properties

Diese Properties gelten für **alle** Element-Typen:

| Property | Typ | Pflicht | Beschreibung |
|----------|-----|---------|--------------|
| `id` | String | ✅ | Eindeutiger Bezeichner **innerhalb der Karte**. Wird Teil des Topics (`slot1/meinId`). Keine Leerzeichen, keine Sonderzeichen. |
| `type` | String | ✅ | Element-Typ (siehe Liste unten) |
| `label` | String | ✅ | Beschriftung. `{ch}` wird durch Kanalnummer ersetzt wenn `repeat` aktiv ist. |
| `repeat` | String | — | `"channels"` → Element wird `io.channels`-mal wiederholt (z.B. für jeden Kanal). Topic wird zu `slot1/meinId/1`, `/2`, usw. |
| `rw` | String | — | `"read"` = nur lesen (Wert kommt vom Backend). Ohne `rw` = schreibbar. |
| `onChange` | String | — | Name der Action, die beim Wertewechsel aufgerufen wird (aus `action-registry`). |
| `onClick` | String | — | Wie `onChange`, aber für Buttons. |
| `commit` | String | — | `"immediate"` = Wert sofort senden. `"onSave"` = erst beim Klick auf "Speichern" (nur Config-View). Default: `"immediate"`. |
| `default` | any | — | Startwert des Elements. |
| `colSpan` | Number | — | Wie viele Grid-Spalten das Element einnimmt (default: `1`). Nur sinnvoll wenn die Gruppe `columns > 1` hat. |

---

## Element-Typen

### `toggle` — Ein/Aus-Schalter

```js
{ id: "power", type: "toggle", label: "Hauptschalter", onChange: "writeRelay", commit: "immediate" }
```

Kein weiterer Parameter nötig. Wert: `true` / `false`.

---

### `button` — Schaltfläche

```js
{ id: "start", type: "button", label: "Starten", onClick: "startMotor" }
```

Löst beim Klick die `onClick`-Action aus (Payload: `true`). Kein Wert, kein `default`.

---

### `output` — Nur-Lese-Anzeige

```js
{ id: "current", type: "output", label: "Strom {ch} (A)", repeat: "channels", rw: "read", onChange: "readCurrent" }
```

Zeigt einen Wert aus dem Backend an. Nicht editierbar.

---

### `numeric` — Zahleneingabe

```js
{ id: "threshold", type: "numeric", label: "Schwellwert", min: 0, max: 100, step: 1, default: 50, onChange: "setThreshold", commit: "onSave" }
```

| Property | Beschreibung |
|----------|-------------|
| `min` | Minimalwert |
| `max` | Maximalwert |
| `step` | Schrittweite (default: 1) |
| `default` | Startwert |

---

### `dropdown` — Auswahlliste

```js
{ id: "mode", type: "dropdown", label: "Modus", options: ["Auto", "Manuell", "Aus"], default: "Auto", onChange: "setMode", commit: "onSave" }
```

| Property | Beschreibung |
|----------|-------------|
| `options` | Array von Strings — die wählbaren Optionen |
| `default` | Vorausgewählter Wert |

---

### `value-display` — Großer Messwert

```js
{ id: "rpm", type: "value-display", label: "Drehzahl", unit: "rpm", rw: "read", onChange: "readRpm" }
```

Zeigt einen Wert groß und fett an (kein Input). Ideal für prominente Messwerte.

| Property | Beschreibung |
|----------|-------------|
| `unit` | Einheit, die hinter dem Wert erscheint (z.B. `"rpm"`, `"°C"`, `"A"`) |

---

### `progress-bar` — Fortschrittsbalken

```js
{ id: "load", type: "progress-bar", label: "Auslastung (%)", rw: "read", onChange: "readLoad" }
```

Zeigt einen Wert zwischen 0 und 100 als Balken. Kein `unit`, kein `min`/`max` nötig.

---

### `slider` — Schieberegler

```js
{ id: "speed", type: "slider", label: "Sollgeschwindigkeit", min: 0, max: 200, step: 5, onChange: "setSpeed", commit: "immediate" }
```

| Property | Beschreibung |
|----------|-------------|
| `min` | Minimalwert (default: 0) |
| `max` | Maximalwert (default: 100) |
| `step` | Schrittweite (default: 1) |

---

### `gauge` — Halbkreis-Anzeige

```js
{ id: "temp", type: "gauge", label: "Temperatur", unit: "°C", min: 0, max: 150, rw: "read", onChange: "readTemp" }
```

Zeigt einen Wert als Halbkreis-Gauge an. Gut in Grid-Layouts (`columns: 2–4`).

| Property | Beschreibung |
|----------|-------------|
| `min` | Unterer Grenzwert (default: 0) |
| `max` | Oberer Grenzwert (default: 100) |
| `unit` | Einheit unter dem Wert |

---

### `stepper` — Schritt-Eingabe (+ / −)

```js
{ id: "count", type: "stepper", label: "Wiederholungen", min: 0, max: 50, default: 5, onChange: "setCount", commit: "immediate" }
```

Zwei Buttons zum Hoch- und Runterzählen.

| Property | Beschreibung |
|----------|-------------|
| `min` | Untere Grenze (kein Unterschreiten möglich) |
| `max` | Obere Grenze (kein Überschreiten möglich) |
| `step` | Schrittgröße pro Klick (default: 1) |
| `default` | Startwert |

---

### `led` — Status-LED

```js
{ id: "fb", type: "led", label: "Rückm. {ch}", repeat: "channels", rw: "read", onChange: "readFb" }
```

Kleiner Punkt: grün wenn Wert `true`, dunkel wenn `false`. Gut für Binär-Feedback.

---

### `badge` — Status-Badge

```js
{ id: "status", type: "badge", label: "Systemstatus", rw: "read", onChange: "readStatus" }
```

Zeigt einen Textstatus als farbiges Label. Der Wert bestimmt die Farbe:

| Wert | Farbe |
|------|-------|
| `"ok"` | Grün |
| `"warn"` | Orange |
| `"err"` | Rot |
| alles andere | Grau |

---

### `status-panel` — Kombiniertes Panel

```js
{
    id: "overview", type: "status-panel", label: "Übersicht",
    ledCount: 4,
    buttons: [
        { id: "reset", label: "Reset", action: "doReset" },
        { id: "test",  label: "Test",  action: "doTest"  }
    ]
}
```

Kombiniert LEDs, einen Textausgang und optionale Buttons in einer Box.

| Property | Beschreibung |
|----------|-------------|
| `ledCount` | Anzahl der LEDs im Panel |
| `buttons` | Array von Buttons mit `id`, `label`, `action` |

---

## Topic-Format

Jedes Element bekommt automatisch ein Topic der Form:

```
slot{N}/{id}          → ohne repeat
slot{N}/{id}/{ch}     → mit repeat: "channels"
```

Beispiel bei Slot 2, id `"relay"`, 4 Kanäle:
- `slot2/relay/1`
- `slot2/relay/2`
- `slot2/relay/3`
- `slot2/relay/4`

Das Topic ist gleichzeitig die Adresse für eingehende Nachrichten vom Backend.

---

## commit-Modi

Nur relevant für schreibbare Elemente in der **Config-View**.

| Wert | Verhalten |
|------|-----------|
| `"immediate"` | Wert wird sofort gesendet, sobald der Nutzer ihn ändert |
| `"onSave"` | Wert wird zwischengespeichert und erst beim Klick auf **Speichern** gesendet |

In der **User-View** ist immer `"immediate"` aktiv (kein Speichern-Button).

---

## Vollständiges Beispiel

```js
motorKarte: {
    cardType:    "motorKarte",
    displayName: "Motorsteuerung",
    version:     "1.0",
    io: { channels: 2, protocol: "can" },
    views: {
        user: {
            groups: [
                {
                    title: "Drehzahlen",
                    columns: 2,
                    elements: [
                        { id: "rpm1", type: "gauge", label: "Motor 1", unit: "rpm", min: 0, max: 3000, rw: "read", onChange: "readRpm" },
                        { id: "rpm2", type: "gauge", label: "Motor 2", unit: "rpm", min: 0, max: 3000, rw: "read", onChange: "readRpm" }
                    ]
                },
                {
                    title: "Steuerung",
                    elements: [
                        { id: "enable", type: "toggle",  label: "Antrieb aktiv", onChange: "setEnable", commit: "immediate" },
                        { id: "speed",  type: "slider",  label: "Sollgeschwindigkeit", min: 0, max: 3000, step: 50, onChange: "setSpeed", commit: "immediate" },
                        { id: "stop",   type: "button",  label: "NOT-STOP", onClick: "emergencyStop" }
                    ]
                },
                {
                    title: "Status",
                    elements: [
                        { id: "state",  type: "badge",  label: "Zustand", rw: "read", onChange: "readState" },
                        { id: "temp",   type: "gauge",  label: "Temperatur", unit: "°C", min: 0, max: 120, rw: "read", onChange: "readTemp" },
                        { id: "load",   type: "progress-bar", label: "Last (%)", rw: "read", onChange: "readLoad" }
                    ]
                }
            ]
        },
        config: {
            groups: [
                {
                    title: "Regler-Parameter",
                    elements: [
                        { id: "kp",      type: "numeric", label: "P-Anteil",   min: 0, max: 10,   step: 0.1, default: 1,  onChange: "setParam", commit: "onSave" },
                        { id: "ki",      type: "numeric", label: "I-Anteil",   min: 0, max: 10,   step: 0.1, default: 0,  onChange: "setParam", commit: "onSave" },
                        { id: "maxRpm",  type: "numeric", label: "Max-Drehzahl (rpm)", min: 0, max: 3000, default: 3000, onChange: "setParam", commit: "onSave" }
                    ]
                },
                {
                    title: "Kanal-Zuordnung",
                    elements: [
                        { id: "canId", type: "dropdown", label: "CAN-ID Kanal {ch}", repeat: "channels",
                          options: ["0x01", "0x02", "0x03", "0x04"], default: "0x01",
                          onChange: "setCanId", commit: "onSave" }
                    ]
                }
            ]
        }
    }
}
```
