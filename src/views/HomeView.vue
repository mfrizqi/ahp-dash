<script setup>
import { ref, onMounted, reactive } from "vue";
// import { useMainStore } from "@/stores/main";
import {
  mdiAccountMultiple,
  // mdiCartOutline,
  mdiChartTimelineVariant,
} from "@mdi/js";
import * as chartConfig from "@/components/Charts/chart.config.js";
import SectionMain from "@/components/SectionMain.vue";
import CardBoxWidget from "@/components/CardBoxWidget.vue";
import CardBox from "@/components/CardBox.vue";
// import TableSampleClients from "@/components/TableSampleClients.vue";
import TableMahasiswa from "@/components/TableMahasiswa.vue";
import LayoutAuthenticated from "@/layouts/LayoutAuthenticated.vue";
import SectionTitleLineWithButton from "@/components/SectionTitleLineWithButton.vue";
import * as XLSX from "xlsx";

const chartData = ref(null);

const fillChartData = () => {
  chartData.value = chartConfig.sampleChartData();
};

let studentDatas = reactive({
  raw: [],
});

const readExcelFile2 = async () => {
  console.log("readExcelFile2");
  const url = new URL("./data_wisudawan.xls", import.meta.url).href;
  const data = await (await fetch(url)).arrayBuffer();
  /* data is an ArrayBuffer */
  const workbook = XLSX.read(data);

  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const sheetValues = XLSX.utils.sheet_to_json(worksheet);
  studentDatas.raw = sheetValues;
};

const calculateStudent = () => {
  console.log(studentDatas.raw);

  // studentDatas.raw.forEach(element => {

  // });
};

onMounted(async () => {
  fillChartData();
  await readExcelFile2();
  calculateStudent();
});
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton
        :icon="mdiChartTimelineVariant"
        title="Overview"
        main
      >
        <!-- <BaseButton
          href="https://github.com/justboil/admin-one-vue-tailwind"
          target="_blank"
          :icon="mdiGithub"
          label="Star on GitHub"
          color="contrast"
          rounded-full
          small
        /> -->
      </SectionTitleLineWithButton>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6">
        <CardBoxWidget
          color="text-emerald-500"
          :icon="mdiAccountMultiple"
          :number="studentDatas.raw.length"
          label="Jumlah Wisudawan"
        />
        <CardBoxWidget
          color="text-yellow-500"
          :icon="mdiAccountMultiple"
          :number="25"
          label="Jumlah Calon Mahasiswa Berprestasi"
        />
      </div>

      <SectionTitleLineWithButton
        :icon="mdiAccountMultiple"
        title="Mahasiswa"
        main
      />
      <CardBox has-table>
        <!-- <TableSampleClients /> -->
        <TableMahasiswa
          v-if="studentDatas.raw.length > 0"
          :data="studentDatas.raw"
        />
      </CardBox>
    </SectionMain>
  </LayoutAuthenticated>
</template>
