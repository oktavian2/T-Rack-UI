# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev    # Node-RED starten auf Port :1880
npm run watch  # Sync-Watcher: src/*.js|*.vue ↔ flows.json (bidirektional)
```

Beide Prozesse laufen parallel im Entwicklungsbetrieb.

## Wichtigste Regel

`resources/flows.json` **niemals direkt bearbeiten**. Alle Änderungen gehören in `resources/src/`. Der Watch-Prozess (`npm run watch`) schreibt sie automatisch in die `flows.json` zurück.

## Dateistruktur

```
resources/
  flows.json          ← von Node-RED konsumiert (Watch-Tool-Output)
  src/
    manifest.json     ← Node-ID → Dateiname-Mapping (Watch-Tool verwaltet das)
    Flow 1/
      *.js            ← Function-Nodes
      *.vue           ← ui-template-Nodes (Vue 3, Node-RED Dashboard 2)
```

Neue Function-Nodes → `.js`, neue Dashboard-Views → `.vue`. Dateiname = Node-Name in Node-RED.

## Architektur

Der Flow implementiert ein **generisches Kartenverwaltungs-System** für Hardware-Slots:

```
[boot inject]
    → [discovery mock]    # liefert msg.discovery: [{slot, type}, ...]
    → [schema-loader]     # schreibt flow: schemas, registry, actions
    → [instance-builder]  # schemas × discovery → msg.payload: tabs[], flow.instances
    → [render-user.vue]   # User-View im Dashboard
    → [render-config.vue] # Config-View im Dashboard
    → [dispatcher]        # routet UI-Events zu Hardware-Aktionen
    → [io sim]            # simuliert I/O-Schreiboperationen
    → [logger]
```

## Flow-Context-Konventionen

| Key | Inhalt |
|---|---|
| `flow.get("schemas")` | Karten-Typ-Definitionen (relay, …) |
| `flow.get("registry")` | Element-Typ → `{component, cssClass, emits, defaults}` |
| `flow.get("actions")` | Action-Name → Funktion |
| `flow.get("instances")` | Topic → `{slot, addr, action, commit}` (vom Dispatcher genutzt) |
| `flow.get("pending")` | onSave-Buffer: Topic → Wert |

## Message-Konventionen

- `msg.topic` = Adresse im Format `slot{N}/{elementId}/{ch}` (z.B. `slot1/relay/1`)
- `msg.payload` = reiner Wert
- `msg.forceCommit = true` → leert den `onSave`-Buffer im Dispatcher
- commit-Modi: `"immediate"` = sofort schreiben, `"onSave"` = puffern

## Dashboard 2 (Vue-Nodes)

Die `.vue`-Dateien sind Vue 3 SFCs im Node-RED Dashboard 2 Kontext. Wichtige Globals:
- `send(msg)` → sendet Msg an den Node-RED-Output
- `msg` → letzter eingehender Msg (reaktiv)
- `$socket` → SocketIO-Instanz

Kein Vuex/Pinia — State läuft über `msg` und SocketIO.

## Geplante Erweiterungen

Laut Kommentaren in `schema-loader.js`: Schemas künftig aus `cards/*.json` + `registry/elements.json` laden statt inline. Karten-Typen aktuell: `relay` (4-Kanal I2C).
