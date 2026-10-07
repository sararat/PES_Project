<template>
  <div class="min-h-screen bg-gray-100">
    <section class="flex gap-4 justify-center py-6 flex-wrap">
      <select
        v-model="selectedPeriod"
        class="border rounded-lg px-4 py-2 bg-white"
      >
        <option value="">
          รอบการประเมิน
        </option>
        <option
          v-for="period in periods"
          :key="period"
          :value="period"
        >
          {{ period }}
        </option>
      </select>
      <select
        v-model="selectedDept"
        class="border rounded-lg px-4 py-2 bg-white"
      >
        <option value="">
          ภาควิชา
        </option>
        <option
          v-for="department in departments"
          :key="department"
          :value="department"
        >
          {{ department }}
        </option>
      </select>
      <input
        v-model="search"
        type="text"
        placeholder="🔍 ค้นหาชื่อบุคลากร..."
        class="border rounded-lg px-4 py-2 w-64 bg-white"
      />
    </section>
    <div
      v-if="loading"
      class="text-center py-10 text-gray-500"
    >
      กำลังโหลดข้อมูล...
    </div>
    <div
      v-else-if="error"
      class="mx-10 bg-red-100 text-red-700 p-4 rounded-lg"
    >
      {{ error }}
    </div>
    <div
      v-else-if="filteredUsers.length === 0"
      class="text-center py-10 text-gray-500"
    >
      ไม่พบข้อมูลผู้รับการประเมิน
    </div>
    <section
      v-else
      class="px-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <div
        v-for="u in filteredUsers"
        :key="u.id"
        class="bg-blue-100 rounded-2xl p-6 shadow hover:shadow-lg transition"
      >
        <h3 class="text-lg font-semibold">
          {{ u.name }}
        </h3>

        <p class="text-gray-600 text-sm mt-1">
          {{ u.department }}
        </p>

        <span
          class="inline-block mt-2 text-xs bg-blue-200 text-blue-700 px-2 py-1 rounded"
        >
          {{ u.period }}
        </span>

        <div class="mt-3">
          <span
            v-if="u.status === 'pending'"
            class="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded"
          >
            รอประเมิน
          </span>
          <span
            v-else-if="u.status === 'completed'"
            class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded"
          >
            ประเมินแล้ว
          </span>
          <span
            v-else
            class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
          >
            {{ u.status }}
          </span>
        </div>

        <div class="mt-6 flex justify-end">
          <router-link
            :to="{
              name: 'EvaluationForm',
              params: {
                id: u.id
              }
            }"
            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            เริ่มประเมิน
          </router-link>
        </div>
      </div>
    </section>

    <footer
      class="bg-white text-center py-4 text-gray-500 text-sm mt-8"
      style="font-family: 'Prompt', sans-serif;"
    >
      © 2026 วิทยาลัยเทคนิคขอนแก่น — ระบบประเมินบุคลากร
    </footer>
  </div>
</template>

<script setup>
import { useAuthStore } from "../../stores/auth.js"
const auth = useAuthStore()
import {
  ref,
  computed,
  onMounted
} from "vue";

import { useRouter } from "vue-router";

const router = useRouter();
const users = ref([]);
const search = ref("");
const selectedPeriod = ref("");
const selectedDept = ref("");
const loading = ref(false);
const error = ref("");
const API_URL = "http://localhost:3000/api";
const loadAssignments = async () => {
  loading.value = true
  error.value = ""
  try {
    const res = await fetch(
      `${API}/evaluator/assignments`,
      {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      }
    )
    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}`)
    }
    const result = await res.json()
    users.value = result.data || []
  } catch (err) {
    console.error("โหลดข้อมูลไม่สำเร็จ:", err)
    error.value = "ไม่สามารถโหลดข้อมูลได้"
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadAssignments();
});

const periods = computed(() => {
  return [
    ...new Set(
      users.value.map(
        u => u.period
      )
    )
  ];
});

const departments = computed(() => {
  return [
    ...new Set(
      users.value.map(
        u => u.department
      )
    )
  ];
});

const filteredUsers = computed(() => {
  const keyword =
    search.value
      .trim()
      .toLowerCase();
  return users.value.filter(u => {
    const matchPeriod =
      !selectedPeriod.value ||
      u.period === selectedPeriod.value;

    const matchDepartment =
      !selectedDept.value ||
      u.department === selectedDept.value;

    const matchSearch =
      !keyword ||
      u.name
        .toLowerCase()
        .includes(keyword);

    return (
      matchPeriod &&
      matchDepartment &&
      matchSearch
    );
  });
});

const goSignIn = () => {
  router.push("/signin");
};

const goSignUp = () => {
  router.push("/signup");
};
</script>