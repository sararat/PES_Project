<template>

  <div class="min-h-screen bg-gray-100 p-6">

    <div class="max-w-6xl mx-auto">

      <!-- ข้อมูลผู้รับการประเมิน -->
      <div class="bg-white rounded-xl shadow p-6 mb-6">

        <h1 class="text-2xl font-bold mb-4">
          แบบประเมินผู้รับการประเมิน
        </h1>

        <p>
          <b>ชื่อ:</b>
          {{ assignment.evaluatee_name }}
        </p>

        <p>
          <b>แผนก:</b>
          {{ assignment.department }}
        </p>

        <p>
          <b>รอบการประเมิน:</b>
          {{ assignment.period }}
        </p>

        <p>
          <b>สถานะ:</b>
          {{ assignment.status }}
        </p>

      </div>


      <!-- ตัวชี้วัด -->
      <div class="bg-white rounded-xl shadow p-6">

        <h2 class="text-xl font-bold mb-4">
          ตัวชี้วัดการประเมิน
        </h2>

        <div
          v-if="indicators.length === 0"
          class="text-gray-500"
        >
          ไม่พบตัวชี้วัด
        </div>


        <div
          v-for="item in indicators"
          :key="item.id"
          class="border rounded-lg p-5 mb-4"
        >

          <p class="text-gray-500">
            หัวข้อ
          </p>

          <p class="font-bold text-lg">
            {{ item.topic_name }}
          </p>


          <p class="text-gray-500 mt-3">
            ตัวชี้วัด
          </p>

          <p>
            {{ item.indicator_name }}
          </p>


          <p class="text-gray-500 mt-3">
            รายละเอียดข้อมูล
          </p>

          <div class="bg-gray-50 p-3 rounded">
            {{ item.detail || "-" }}
          </div>


          <p class="text-gray-500 mt-3">
            หลักฐาน
          </p>

          <div class="bg-gray-50 p-3 rounded">
            {{ item.evidence || "-" }}
          </div>


          <p class="text-gray-500 mt-3">
            คะแนนผู้รับการประเมิน
          </p>

          <p class="font-bold">
            {{ item.self_score || "-" }}
          </p>


          <!-- คะแนนกรรมการ -->
          <div class="mt-4">

            <label class="font-bold">
              คะแนนกรรมการ
            </label>

            <select
              v-model="item.evaluator_score"
              class="border rounded-lg px-4 py-2 ml-3"
            >

              <option value="">
                เลือกคะแนน
              </option>

              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>

            </select>

          </div>

        </div>


        <!-- ปุ่มบันทึก -->
        <div class="flex justify-center pt-4">

          <button
            @click="saveAll"
            :disabled="saving"
            class="bg-blue-600 text-white px-10 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {{ saving ? "กำลังบันทึก..." : "บันทึกทั้งหมด" }}
          </button>

        </div>

      </div>

    </div>

  </div>

</template>


<script setup>

import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";

const route = useRoute();
const router = useRouter();

const assignment = ref({});
const indicators = ref([]);
const saving = ref(false);


// โหลดข้อมูล
async function load() {

  const token = localStorage.getItem("token");

  try {

    const res = await axios.get(
      `http://localhost:3000/api/evaluator/assignments/${route.params.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    assignment.value = res.data.assignment || {};

    indicators.value = res.data.indicators || [];

  } catch (error) {

    console.error(error);

    alert(
      error.response?.data?.message ||
      "โหลดข้อมูลไม่สำเร็จ"
    );

  }

}


// บันทึกทั้งหมด
async function saveAll() {

  const token = localStorage.getItem("token");

  const scores = {};

  indicators.value.forEach(item => {

    scores[item.id] = {
      score: item.evaluator_score
    };

  });


  saving.value = true;

  try {

    await axios.post(
      `http://localhost:3000/api/evaluator/assignments/${route.params.id}`,
      {
        scores
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );


    alert("บันทึกผลการประเมินเรียบร้อย");


    // ไปหน้ารายงาน
    router.push("/reports");


  } catch (error) {

    console.error(error);

    alert(
      error.response?.data?.message ||
      "บันทึกไม่สำเร็จ"
    );

  } finally {

    saving.value = false;

  }

}


onMounted(load);

</script>