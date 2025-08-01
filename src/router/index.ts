// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import Login from '../components/Login.vue';
import BibleApp from '../components/App.vue'; // or App.vue if you're keeping it all there
import { auth } from '../firebase';

const routes = [
  {
    path: '/',
    name: 'BibleApp',
    component: BibleApp,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation Guard
router.beforeEach((to, from, next) => {
  const user = auth.currentUser;
  if (to.meta.requiresAuth && !user) {
    next('/login');
  } else if (to.path === '/login' && user) {
    next('/');
  } else {
    next();
  }
});

export default router;
