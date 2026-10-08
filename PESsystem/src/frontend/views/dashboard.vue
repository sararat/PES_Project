<template>
  <div class="p-6">
    <div class="bg-white p-6 rounded-xl shadow">
      <div class="flex justify-between mb-4">
        <h1 class="text-2xl font-bold">จัดการการประเมิน</h1>
        <button
          @click="add"
          class="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + เพิ่ม
        </button>
      </div>

      <table class="w-full border">
        <thead class="bg-gray-100">
          <tr>
            <th class="border p-2">รอบ</th>
            <th class="border p-2">หัวข้อ</th>
            <th class="border p-2">ตัวชี้วัด</th>
            <th class="border p-2">น้ำหนัก</th>
            <th class="border p-2">หลักฐาน</th>
            <th class="border p-2">จัดการ</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="item in items" :key="item.id">

            <td class="border p-2">
              {{ item.period_name }}
            </td>

            <td class="border p-2">
              {{ item.topic_name }}
            </td>

            <td class="border p-2">
              {{ item.indicator_name }}
            </td>

            <td class="border p-2 text-center">
              {{ item.weight }}
            </td>

            <td class="border p-2 text-center">
              {{ item.evidence_type }}
            </td>

            <td class="border p-2 text-center">

              <button
                @click="edit(item)"
                class="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
              >
                แก้ไข
              </button>

              <button
                @click="remove(item.id)"
                class="bg-red-600 text-white px-3 py-1 rounded"
              >
                ลบ
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div
      v-if="show"
      class="fixed inset-0 bg-black/50 flex items-center justify-center"
    >
      <div class="bg-white p-6 rounded-xl w-full max-w-xl">
        <h2 class="text-xl font-bold mb-4">
          {{ editId ? "แก้ไขข้อมูล" : "เพิ่มข้อมูล" }}
        </h2>
        <div class="grid gap-3">
          <input
            v-model="form.period_name"
            placeholder="รอบการประเมิน"
            class="border p-2 rounded"
          >
          <div class="grid grid-cols-2 gap-2">
            <h3>วันเริ่มต้น</h3>
            <input
              v-model="form.start_date"
              type="date"
              class="border p-2 rounded"
            >
            <h3>วันสิ้นสุด</h3>
            <input
              v-model="form.end_date"
              type="date"
              class="border p-2 rounded"
            >
          </div>
          <input
            v-model="form.topic_name"
            placeholder="หัวข้อการประเมิน"
            class="border p-2 rounded"
          >
          <input
            v-model="form.indicator_name"
            placeholder="ชื่อตัวชี้วัด"
            class="border p-2 rounded"
          >
          <input
            v-model.number="form.weight"
            type="number"
            placeholder="น้ำหนักคะแนน"
            class="border p-2 rounded"
          >
          <select
            v-model="form.evidence_type"
            class="border p-2 rounded"
          >
            <option value="none">ไม่ใช้หลักฐาน</option>
            <option value="pdf">PDF</option>
            <option value="url">URL</option>
            <option value="both">PDF / URL</option>
          </select>
        </div>
        <div class="flex justify-end gap-2 mt-5">
          <button
            @click="show = false"
            class="border px-4 py-2 rounded"
          >
            ยกเลิก
          </button>
          <button
            @click="save"
            class="bg-blue-600 text-white px-4 py-2 rounded"
          >
            บันทึก
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
 
const api = "http://localhost:3000/api/evaluation-settings";
const token = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`
  }
});

const items = ref([]);
const show = ref(false);
const editId = ref(null);
const form = ref({
  period_name: "",
  topic_name: "",
  indicator_name: "",
  weight: 0,
  evidence_type: "none"
});
const load = async () => {
  const res = await axios.get(api, token());
  items.value = res.data;
};
const add = () => {
  editId.value = null;
  form.value = {
    period_name: "",
    topic_name: "",
    indicator_name: "",
    weight: 0,
    evidence_type: "none"
  };

  show.value = true;
};

const edit = (item) => {
  editId.value = item.id;
  form.value = { ...item };
  show.value = true;
};
const save = async () => {
  if (editId.value) {
    await axios.put(
      `${api}/${editId.value}`,
      form.value,
      token()
    );
  } else {
    await axios.post(
      api,
      form.value,
      token()
    );
  }
  show.value = false;
  load();
};
const remove = async (id) => {
  if (!confirm("ต้องการลบข้อมูลหรือไม่?")) return;
  await axios.delete(
    `${api}/${id}`,
    token()
  );
  load();
};
onMounted(load);

</script>