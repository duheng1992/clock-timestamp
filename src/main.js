import { createApp } from 'vue'
import App from './App.vue'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

import './assets/index.css';

dayjs.extend(utc)
dayjs.extend(timezone)

createApp(App).mount('#app')
