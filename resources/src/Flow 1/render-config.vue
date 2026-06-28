<template>
  <div class="poc-root">
    <v-tabs v-model="active" density="compact">
      <v-tab v-for="t in tabs" :key="t.tabId" :value="t.tabId">{{ t.title }}</v-tab>
    </v-tabs>

    <div v-for="t in tabs" :key="t.tabId" v-show="active === t.tabId" class="poc-tab">
      <div v-for="g in t.config.groups" :key="g.title" class="poc-group">
        <h3 class="poc-group-title">{{ g.title }}</h3>
        <div v-for="el in g.elements" :key="el.topic" class="poc-el">
          <component
            v-if="el.component"
            :is="el.component"
            :class="el.cssClass"
            :label="el.label"
            :items="el.options"
            :min="el.min" :max="el.max"
            v-bind="el.defaults"
            :model-value="state[el.topic] !== undefined ? state[el.topic] : el.value"
            @[el.emits]="v => onEvent(el, v)"
          >{{ el.type === 'button' ? el.label : '' }}</component>

          <template v-else-if="el.template === 'led'">
            <span class="poc-el__label">{{ el.label }}</span>
            <span :class="['el-led', state[el.topic] ? 'el-led--on' : 'el-led--off']"></span>
          </template>

          <template v-else-if="el.template === 'badge'">
            <span class="poc-el__label">{{ el.label }}</span>
            <span :class="['el-badge', 'el-badge--' + (state[el.topic] || 'unknown')]">
              {{ state[el.topic] || '—' }}
            </span>
          </template>

          <template v-else-if="el.template === 'status-panel'">
            <div class="el-status-panel">
              <span class="el-status-panel__label">{{ el.label }}</span>
              <div class="el-status-panel__leds">
                <span v-for="i in el.ledCount" :key="i"
                      :class="['el-led', state[el.topic+'/led/'+i] ? 'el-led--on' : 'el-led--off']" />
              </div>
              <div class="el-status-panel__output">{{ state[el.topic+'/output'] ?? '—' }}</div>
              <div class="el-status-panel__buttons">
                <v-btn v-for="btn in el.buttons" :key="btn.id" class="el-button"
                       @click="onEvent({...el, topic: el.topic+'/'+btn.id}, true)">
                  {{ btn.label }}
                </v-btn>
              </div>
            </div>
          </template>

          <template v-else-if="el.template === 'value-display'">
            <span class="poc-el__label">{{ el.label }}</span>
            <div class="el-value-display">
              <span class="el-value-display__number">{{ state[el.topic] ?? '—' }}</span>
              <span v-if="el.unit" class="el-value-display__unit">{{ el.unit }}</span>
            </div>
          </template>

          <template v-else-if="el.template === 'gauge'">
            <span class="poc-el__label">{{ el.label }}</span>
            <div class="el-gauge">
              <svg viewBox="0 0 100 65" class="el-gauge__svg">
                <path d="M5.2,58.1 A45,45 0 0,1 94.8,58.1" class="el-gauge__track" stroke-linecap="round" />
                <path :d="gaugeArc(state[el.topic], el.min, el.max)" class="el-gauge__fill" stroke-linecap="round" />
              </svg>
              <span class="el-gauge__value">{{ state[el.topic] ?? '—' }}<span v-if="el.unit" class="el-gauge__unit"> {{ el.unit }}</span></span>
            </div>
          </template>

          <template v-else-if="el.template === 'slider'">
            <span class="poc-el__label">{{ el.label }}</span>
            <v-slider
              class="el-slider"
              :model-value="state[el.topic] !== undefined ? state[el.topic] : el.value"
              :min="el.min ?? 0"
              :max="el.max ?? 100"
              :step="el.step ?? 1"
              hide-details
              @update:modelValue="v => onEvent(el, v)"
            />
          </template>

          <template v-else-if="el.template === 'stepper'">
            <span class="poc-el__label">{{ el.label }}</span>
            <div class="el-stepper">
              <v-btn class="el-stepper__btn" density="compact" @click="onStep(el, -1)">−</v-btn>
              <span class="el-stepper__value">{{ state[el.topic] ?? el.value ?? 0 }}</span>
              <v-btn class="el-stepper__btn" density="compact" @click="onStep(el, +1)">+</v-btn>
            </div>
          </template>
        </div>
      </div>
    </div>

    <v-btn class="el-button" @click="saveAll">Speichern</v-btn>
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
      this.state = Object.assign({}, this.state, { [el.topic]: v });
      this.send({ topic: el.topic, payload: v });
    },
    onStep(el, delta) {
      const cur = Number(this.state[el.topic] ?? el.value ?? 0);
      const next = Math.min(el.max ?? Infinity, Math.max(el.min ?? -Infinity, cur + (el.step ?? 1) * delta));
      this.onEvent(el, next);
    },
    gaugeArc(value, min = 0, max = 100) {
      const v = value ?? min;
      const pct = Math.min(1, Math.max(0, (v - min) / (max - min)));
      if (pct <= 0) return 'M5.2,58.1 A45,45 0 0,1 5.2,58.1';
      const angleDeg = 175 - pct * 170;
      const rad = angleDeg * Math.PI / 180;
      const x = (50 + 45 * Math.cos(rad)).toFixed(1);
      const y = (62 - 45 * Math.sin(rad)).toFixed(1);
      return `M5.2,58.1 A45,45 0 0,1 ${x},${y}`;
    },
    saveAll() {
      for (const topic in this.state) {
        this.send({ topic, payload: this.state[topic], forceCommit: true });
      }
    }
  }
};
</script>
