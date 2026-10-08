<template>
  <div class="min-h-screen bg-gray-100">

    <!-- Loading -->
    <div v-if="loading" class="text-center py-10">
      กำลังโหลดข้อมูล...
    </div>

    <!-- Error -->
    <div
      v-else-if="error"
      class="mx-10 bg-red-100 text-red-700 p-4 rounded-lg"
    >
      {{ error }}
    </div>

    <!-- ไม่มีข้อมูล -->
    <div
      v-else-if="users.length === 0"
      class="text-center py-10 text-gray-500"
    >
      ยังไม่มีผู้เข้ารับการประเมิน
    </div>

    <!-- รายชื่อ -->
    <section
      v-else
      class="px-10 py-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >

      <div
        v-for="u in users"
        :key="u.id"
        class="bg-white rounded-2xl p-6 shadow"
      >

        <h3 class="text-lg font-bold">
          {{ u.evaluatee_name }}
        </h3>

        <p class="text-gray-600 mt-1">
          {{ u.department }}
        </p>

        <p class="text-sm mt-2">
          รอบ: {{ u.period }}
        </p>

        <p class="text-sm mt-1">
          ผู้ประเมิน:
          {{ u.evaluator_fname }}
          {{ u.evaluator_lname }}
        </p>

        <p class="mt-2">
          สถานะ:
          <span class="text-blue-600">
            {{ u.status }}
          </span>
        </p>

        <button
          @click="openEvaluation(u.id)"
          class="mt-5 bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          ประเมิน
        </button>

      </div>

    </section>

    <footer class="bg-white text-center py-4 text-gray-500 text-sm mt-8">
      © 2026 วิทยาลัยเทคนิคขอนแก่น — ระบบประเมินบุคลากร
    </footer>

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();

const API = "http://localhost:3000/api";

const users = ref([]);
const loading = ref(true);
const error = ref("");

async function load() {
  const token = localStorage.getItem("token");

  if (!token) {
    error.value = "กรุณาเข้าสู่ระบบ";
    loading.value = false;
    router.push("/login");
    return;
  }

  try {
    const res = await axios.get(
      `${API}/evaluatee/assignments`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    users.value = res.data.data || [];

  } catch (err) {
    console.error(err);
    error.value = "ไม่สามารถโหลดข้อมูลได้";
  } finally {
    loading.value = false;
  }
}

function openEvaluation(id) {
  router.push(`/evaluator/assignments/${id}`);
}

onMounted(load);
</script>