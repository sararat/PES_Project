<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <div class="max-w-7xl mx-auto">
      <div class="bg-white rounded-xl shadow p-6 mb-6">
        <h1 class="text-2xl font-bold">
          รายงานผลการประเมิน
        </h1>
        <p class="text-gray-500 mt-1">
          รายการผลการประเมินบุคลากร
        </p>
      </div>

      <!-- ตาราง -->
      <div class="bg-white rounded-xl shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-blue-600 text-white">
                <th class="border p-3">
                  ลำดับ
                </th>
                <th class="border p-3 text-left">
                  ผู้รับการประเมิน
                </th>
                <th class="border p-3 text-left">
                  แผนก
                </th>
                <th class="border p-3">
                  รอบการประเมิน
                </th>
                <th class="border p-3">
                  ผู้ประเมิน
                </th>
                <th class="border p-3">
                  สถานะ
                </th>
                <th class="border p-3">
                  รายงาน
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="reports.length === 0">
                <td
                  colspan="7"
                  class="p-8 text-center text-gray-500"
                >
                  ยังไม่มีข้อมูลรายงาน
                </td>
              </tr>
              <tr
                v-for="(item, index) in reports"
                :key="item.id"
                class="hover:bg-gray-50"
              >
                <td class="border p-3 text-center">
                  {{ index + 1 }}
                </td>
                <td class="border p-3">
                  {{ item.evaluatee_name || "-" }}
                </td>
                <td class="border p-3">
                  {{ item.department || "-" }}
                </td>
                <td class="border p-3 text-center">
                  {{ item.period || "-" }}
                </td>
                <td class="border p-3">
                  {{ item.evaluator_fname || "" }}
                  {{ item.evaluator_lname || "" }}
                </td>
                <td class="border p-3 text-center">
                  <span
                    v-if="item.status === 'ประเมินแล้ว'"
                    class="text-green-600 font-bold"
                  >
                    ประเมินแล้ว
                  </span>
                  <span
                    v-else
                    class="text-orange-600"
                  >
                    {{ item.status || "-" }}
                  </span>
                </td>
                <td class="border p-3 text-center">
                  <button
                    @click="viewReport(item.id)"
                    class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    ดูรายงาน
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
const router = useRouter();
const reports = ref([]);

async function loadReports() {
  const token = localStorage.getItem("token");
  try {
    const res = await axios.get(
      "http://localhost:3000/api/reports",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    reports.value = res.data.data || [];
    console.log("REPORTS =", reports.value);
  } catch (error) {
    console.error("REPORT ERROR =", error);
    alert(
      error.response?.data?.message ||
      "โหลดรายงานไม่สำเร็จ"
    );
  }
}

function viewReport(id) {
  router.push(`/report/${id}`);
}
onMounted(loadReports);
</script>