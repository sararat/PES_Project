<template>
  <div class="p-6 bg-gray-100 min-h-screen">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold text-center mb-6">
        การประเมินตนเอง
      </h1>

      <div v-if="assignment" class="bg-white p-5 rounded-xl shadow mb-6">
        <h2 class="text-xl font-bold">
          ผู้รับการประเมิน: {{ assignment.evaluatee_name }}
        </h2>
        <p class="text-gray-600 mt-2">
          แผนก: {{ assignment.department }}
        </p>
        <p class="text-gray-600">
          รอบประเมิน: {{ assignment.period }}
        </p>
      </div>

      <div v-if="indicators.length > 0" class="bg-white rounded-xl shadow p-6">
        <h2 class="text-xl font-bold mb-6">
          รายละเอียดการประเมิน
        </h2>
        <div v-for="(item, index) in indicators" :key="item.id" class="border-b pb-6 mb-6 last:border-b-0">
          <div class="flex justify-between mb-2">
            <h3 class="font-bold">
              {{ index + 1 }}. {{ item.indicator_name }}
            </h3>
            <span class="text-sm text-gray-500">
              น้ำหนัก {{ item.weight }}
            </span>
          </div>
          <p class="text-gray-600 mb-4">
            หัวข้อ: {{ item.topic_name }}
          </p>

          <label class="font-semibold">
            ข้อมูล / รายละเอียดการดำเนินงาน
          </label>
          <textarea v-model="item.detail" rows="3" class="w-full border rounded-lg p-3 mt-2 mb-4"
            placeholder="กรอกข้อมูลการดำเนินงาน"></textarea>

          <label class="font-semibold">
            หลักฐาน
          </label>
          <input v-model="item.evidence" type="text" class="w-full border rounded-lg p-3 mt-2 mb-4"
            placeholder="URL หรือชื่อไฟล์หลักฐาน" />

          <label class="font-semibold">
            คะแนนประเมินตนเอง
          </label>
          <select v-model="item.self_score" class="w-full border rounded-lg p-3 mt-2">
            <option value="">
              -- เลือกคะแนน --
            </option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </div>

        <div class="flex justify-center pt-4">
          <button @click="saveAll" :disabled="saving"
            class="bg-blue-600 text-white px-10 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
            {{ saving ? "กำลังบันทึก..." : "บันทึกทั้งหมด" }}
          </button>
          <button @click="exportPDF" class="bg-green-600 text-white px-4 py-2 rounded-lg mb-5">
            Export PDF
          </button>
        </div>
      </div>
      <div v-else-if="!loading" class="bg-white p-6 rounded-xl shadow text-center">
        ไม่พบข้อมูลตัวชี้วัด
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from "axios";
import { ref, onMounted } from "vue";
const indicators = ref([]);
const assignment = ref(null);
const loading = ref(true);
const saving = ref(false);
function exportPDF() {
  window.print();
}

async function loadData() {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(
      "http://localhost:3000/api/evaluatee",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    assignment.value = res.data.assignment;
    indicators.value = res.data.indicators || [];
  } catch (error) {
    console.error("LOAD ERROR:", error);
  } finally {
    loading.value = false;
  }
}

async function saveAll() {
  try {
    saving.value = true;
    const token = localStorage.getItem("token");
    const data = {};
    indicators.value.forEach(item => {
      data[item.id] = {
        detail: item.detail || "",
        evidence: item.evidence || "",
        self_score: item.self_score || ""
      };

    });
    console.log("SAVE DATA:", data);
    const res = await axios.post(
      "http://localhost:3000/api/evaluatee",
      {
        data: data
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    console.log("SAVE RESULT:", res.data);
    alert("บันทึกข้อมูลเรียบร้อย");
  } catch (error) {
    console.error("SAVE ERROR:", error);
    alert(
      error.response?.data?.message ||
      "บันทึกข้อมูลไม่สำเร็จ"
    );
  } finally {
    saving.value = false;
  }
}
onMounted(() => {
  loadData();
});
</script>