<template>
  <div class="min-h-screen bg-gray-100 p-10" style="font-family: 'Prompt', sans-serif;">
    <h1 class="text-2xl font-bold text-center pt-15 pb-5">รายงานผลการประเมินบุคลากร</h1>

    <div class="bg-white p-6 rounded-xl shadow-md ">
      <button @click="clearEvaluations" class="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg mb-5">
        ลบข้อมูลรายงานทั้งหมด
      </button>
      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-blue-200 text-gray-700">
            <th class="border p-2">ลำดับ</th>
            <th class="border p-2">ชื่อครู</th>
            <th class="border p-2">ผู้ประเมิน</th>
            <th class="border p-2">ภาควิชา</th>
            <th class="border p-2">รอบการประเมิน</th>
            <th class="border p-2">คะแนนรวม</th>
            <th class="border p-2">วันที่ประเมิน</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in evaluations" :key="index" class="hover:bg-gray-50">
            <td class="border p-2 text-center">{{ index + 1 }}</td>
            <td class="border p-2">{{ item.teacher }}</td>
            <td class="border p-2">{{ item.evaluator }}</td>
            <td class="border p-2">{{ item.department }}</td>
            <td class="border p-2">{{ item.period }}</td>
            <td class="border p-2 text-center font-semibold text-blue-700">{{ item.totalScore }}</td>
            <td class="border p-2 text-center">{{ item.date }}</td>
          </tr>
        </tbody>
      </table>

      <p v-if="evaluations.length === 0" class="text-center text-gray-500 mt-4">
        ยังไม่มีข้อมูลการประเมิน
      </p>
    </div>
    
  </div>
  <footer class="bg-white text-center py-5 text-gray-500 text-sm mt-2" style="font-family: 'Prompt', sans-serif;">
      © 2025 วิทยาลัยเทคนิคขอนแก่น — ระบบประเมินบุคลากร
    </footer>
</template>

<script>
export default {
  data() {
    return {
      evaluations: []
    };
  },
  mounted() {
    // 📌 โหลดข้อมูลจาก localStorage (หรือ fetch API backend)
    const saved = localStorage.getItem("evaluations");
    this.evaluations = saved ? JSON.parse(saved) : [];
  },
  methods: {
    clearEvaluations() {
      localStorage.removeItem("evaluations");

      this.evaluations = [];

      alert("ลบข้อมูลทั้งหมดเรียบร้อย!");
    }
  }
};
</script>

 