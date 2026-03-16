import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import DatetimeWidget from './components/widgets/DatetimeWidget.vue'
import QuoteWidget from './components/widgets/QuoteWidget.vue'
import InfoWidget from './components/widgets/InfoWidget.vue'
import WeatherWidget from './components/widgets/WeatherWidget.vue'
import ArtWidget from './components/widgets/ArtWidget.vue'

import './assets/styles/style.css';

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.component('DatetimeWidget', DatetimeWidget);
app.component('QuoteWidget', QuoteWidget);
app.component('InfoWidget', InfoWidget);
app.component('WeatherWidget', WeatherWidget);
app.component('ArtWidget', ArtWidget);

app.mount('#app')
