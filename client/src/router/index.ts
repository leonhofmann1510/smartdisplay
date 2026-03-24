import { createRouter, createWebHistory } from 'vue-router';

import Home from '@/pages/Home.vue';
import Dashboard from '@/pages/Dashboard.vue';

import Draw from '@/pages/dashboard/Draw.vue';

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
      name     : 'draw',
      path     : '/dashboard/draw',
      component: Draw
    }
  ],
});

export default router;
