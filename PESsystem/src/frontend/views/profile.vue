<template>
  <div class="max-w-xl mx-auto p-6">

    <div class="bg-white p-6 rounded-xl shadow">

      <h1 class="text-xl font-bold mb-5">
        แก้ไขโปรไฟล์
      </h1>
      <label class="block mb-1">ชื่อ</label>
      <input
        v-model="form.fname"
        placeholder="ชื่อ"
        class="w-full border p-3 rounded mb-3"
      >
      <label class="block mb-1">นามสกุล</label>
      <input
        v-model="form.lname"
        placeholder="นามสกุล"
        class="w-full border p-3 rounded mb-3"
      >
      <label class="block mb-1">ชื่อผู้ใช้</label>
      <input
        v-model="form.username"
        placeholder="Username"
        class="w-full border p-3 rounded mb-4"
      >

      <button
        @click="save"
        class="w-full bg-blue-600 text-white p-3 rounded"
      >
        บันทึก
      </button>

    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const token = localStorage.getItem("token");

const form = ref({
  fname: "",
  lname: "",
  username: ""
});

async function load() {
  const res = await axios.get(
    "http://localhost:3000/api/profile",
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  form.value = res.data;
}

async function save() {
  await axios.put(
    "http://localhost:3000/api/profile",
    form.value,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  alert("บันทึกเรียบร้อย");
}

onMounted(load);
</script>