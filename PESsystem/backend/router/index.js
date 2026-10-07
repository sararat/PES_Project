import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../../src/frontend/stores/auth.js";
// ==============================
// หน้าเว็บ
// ==============================
import main from "../../src/frontend/views/main.vue";
import signup from "../../src/frontend/views/signup.vue";
import login from "../../src/frontend/views/login.vue";
// ==============================
// หน้าทั่วไป
// ==============================
import profile from "../../src/frontend/views/profile.vue";
// ==============================
// งานบุคลากร
// ==============================
import dashboard from "../../src/frontend/views/dashboard.vue";
// ==============================
// กรรมการผู้ประเมิน
// ==============================
import evaluatorAssign from "../../src/frontend/components/evaluator/evaluatorAssign.vue";
import evaluatorForm from "../../src/frontend/components/evaluator/evaluatorForm.vue";
// ==============================
// ผู้รับการประเมิน
// ==============================
import evaluateeAssign from "../../src/frontend/components/teacher/evaluateeAssign.vue";
import evaluateeForm from "../../src/frontend/components/teacher/evaluateeForm.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: main
  },

  {
    path: "/login",
    name: "login",
    component: login
  },

  {
    path: "/signup",
    name: "signup",
    component: signup
  },

  {
    path: "/profile",
    name: "profile",
    component: profile,

    meta: {
      requiresAuth: true
    }
  },

  {
    path: "/personnel",
    name: "personnel",
    component: dashboard,

    meta: {
      requiresAuth: true,
      role: "personnel"
    }
  },

  {
    path: "/evaluator",
    name: "evaluator",
    component: evaluatorAssign,

    meta: {
      requiresAuth: true,
      role: "evaluator"
    }
  },

  {
    path: "/evaluator/assignments/:id",
    name: "evaluationForm",
    component: evaluateeForm,
    props: true,

    meta: {
      requiresAuth: true,
      role: "evaluator"
    }
  },

  {
    path: "/evaluatee",
    name: "evaluateeAssign",
    component: evaluateeAssign,

    meta: {
      requiresAuth: true,
      role: "evaluatee"
    }
  },

  {
    path: "/evaluatee/assignments/:id",
    name: "evaluateeForm",
    component: evaluateeForm,
    props: true,
    meta: {
      requiresAuth: true,
      role: "evaluatee"
    }
  },

  {
    path: "/reports",
    name: "reports",

    component: () =>
      import("../../src/frontend/views/report.vue"),
    meta: {
      requiresAuth: true
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});


router.beforeEach((to) => {
  const auth = useAuthStore();

  if (
    to.meta.requiresAuth &&
    !auth.isLogin
  ) {
    return "/login";
  }
  if (
    to.meta.role &&
    auth.role !== to.meta.role
  ) {
    return "/";
  }
  return true;
});

export default router;