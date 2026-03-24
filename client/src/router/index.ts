import { createRouter, createWebHistory } from 'vue-router';

import Home from '@/pages/Home.vue';
import Dashboard from '@/pages/Dashboard.vue';

import Draw from '@/pages/dashboard/Draw.vue';
import Calendar from '@/pages/dashboard/Calendar.vue';
import Music from '@/pages/dashboard/Music.vue';
import Settings from '@/pages/dashboard/Settings.vue';
import ToDos from '@/pages/dashboard/ToDos.vue';
import Weather from '@/pages/dashboard/Weather.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      name     : 'home',
      path     : '/',
      component: Home
    },
    {
      name     : 'dashboard',
      path     : '/dashboard',
      component: Dashboard
    },
    {
      name     : 'calendar',
      path     : '/dashboard/calendar',
      component: Calendar
    },
    {
      name     : 'draw',
      path     : '/dashboard/draw',
      component: Draw
    },
    {
      name     : 'music',
      path     : '/dashboard/music',
      component: Music
    },
    {
      name     : 'settings',
      path     : '/dashboard/settings',
      component: Settings
    },
    {
      name     : 'todos',
      path     : '/dashboard/todos',
      component: ToDos
    },
    {
      name     : 'weather',
      path     : '/dashboard/weather',
      component: Weather
    },
  ],
});

export default router;
