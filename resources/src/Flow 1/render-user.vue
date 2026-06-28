<!-- ============================================================
     UI-TEMPLATE NODE: render-user
     Template Type:  "Widget in group"  (templateScope: widget)
     Group:          User View  (Page: User, /dashboard/user)
     Eingang:        instance-builder  (empfaengt tabs[] als msg.payload)
     Ausgang:        -> dispatcher
     ------------------------------------------------------------
     Reiner Renderer. Kein kartenspezifisches Wissen.
     Unterschied zu render-config: nur  t.user  statt  t.config.
     ============================================================ -->

<template>
  <div class="poc-root">
    <v-tabs v-model="active" density="compact">
      <v-tab v-for="t in tabs" :key="t.tabId" :value="t.tabId">{{ t.title }}</v-tab>
    </v-tabs>

    <div v-for="t in tabs" :key="t.tabId" v-show="active === t.tabId" class="poc-tab">
      <div v-for="g in t.user.groups" :key="g.title" class="poc-group">
        <h3 class="poc-group-title">{{ g.title }}</h3>
        <div v-for="el in g.elements" :key="el.topic" class="poc-el">
          <component
            :is="el.component"
            :class="el.cssClass"
            :label="el.label"
            :items="el.options"
            :min="el.min" :max="el.max"
            v-bind="el.defaults"
            :model-value="state[el.topic] !== undefined ? state[el.topic] : el.value"
            @[el.emits]="v => onEvent(el, v)"
          >{{ el.type === 'button' ? el.label : '' }}</component>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return { tabs: [], active: null, state: {} };
  },
  watch: {
    msg(m) {
      if (m && Array.isArray(m.payload)) {
        this.tabs = m.payload;
        if (!this.active && this.tabs.length) this.active = this.tabs[0].tabId;
      }
    }
  },
  methods: {
    onEvent(el, v) {
      // lokalen Anzeige-State aktualisieren
      this.state = Object.assign({}, this.state, { [el.topic]: v });
      // Projekt-Konvention: msg.topic = Adresse, msg.payload = Wert
      this.send({ topic: el.topic, payload: v });
    }
  }
};
</script>