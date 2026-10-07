<template>
  <div class="max-w-xl mx-auto p-6">

    <div class="bg-white rounded-2xl shadow p-6">

      <h1 class="text-2xl font-bold mb-6">
        ข้อมูลส่วนตัว
      </h1>

      <!-- Username -->
      <div class="mb-4">
        <label class="block mb-2 font-medium">
          Username
        </label>

        <input
          v-model="form.username"
          type="text"
          class="w-full border rounded-lg px-4 py-2"
        />
      </div>

      <!-- ชื่อ-นามสกุล -->
      <div class="mb-4">
        <label class="block mb-2 font-medium">
          ชื่อ-นามสกุล
        </label>

        <input
          v-model="form.full_name"
          type="text"
          class="w-full border rounded-lg px-4 py-2"
        />
      </div>

      <!-- Password -->
      <div class="mb-4">
        <label class="block mb-2 font-medium">
          Password ใหม่
        </label>

        <input
          v-model="form.password"
          type="password"
          placeholder="เว้นว่างหากไม่ต้องการเปลี่ยน"
          class="w-full border rounded-lg px-4 py-2"
        />
      </div>

      <button
        @click="saveProfile"
        class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
      >
        บันทึกข้อมูล
      </button>

      <p
        v-if="message"
        class="mt-4 text-center"
        :class="success ? 'text-green-600' : 'text-red-600'"
      >
        {{ message }}
      </p>

    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const form = ref({
  username: "",
  full_name: "",
  password: ""
});

const message = ref("");
const success = ref(false);

const loadProfile = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.get(
      "http://localhost:3000/api/profile",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    form.value.username = response.data.username;
    form.value.full_name = response.data.full_name || "";

  } catch (error) {
    console.error(error);

    message.value = "ไม่สามารถโหลดข้อมูลได้";
    success.value = false;
  }
};

const saveProfile = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.put(
      "http://localhost:3000/api/profile",
      {
        username: form.value.username,
        full_name: form.value.full_name,
        password: form.value.password
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    message.value = response.data.message;
    success.value = true;

    // ล้างช่อง Password หลังบันทึก
    form.value.password = "";

    // อัปเดตข้อมูลใน localStorage ถ้ามี user
    const user = JSON.parse(
      localStorage.getItem("user") || "{}"
    );

    user.username = form.value.username;
    user.full_name = form.value.full_name;

    localStorage.setItem(
      "user",
      JSON.stringify(user)
    );

  } catch (error) {
    console.error(error);

    message.value =
      error.response?.data?.message ||
      "ไม่สามารถบันทึกข้อมูลได้";

    success.value = false;
  }
};

onMounted(() => {
  loadProfile();
});
</script>