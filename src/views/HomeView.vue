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
  calculated: [],
  finalAHP: [],
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

const AHPValue = {
  ipk: {
    main: 0.63,
    sub: {
      greater: 0.83,
      lesser: 0.17,
    },
  },
  tak: {
    main: 0.11,
    sub: {
      greater: 0.83,
      lesser: 0.17,
    },
  },
  prestasi: {
    main: 0.26,
    sub: {
      greater: 0.83,
      lesser: 0.17,
    },
  },
};

const calculateStudent = () => {
  studentDatas.calculated = studentDatas.raw.map((el) => {
    let ahp = {
      ipk: 0,
      tak: 0,
      prestasi: 0,
    };

    //Checking GPA / IPK
    if (el.GPA >= 3) {
      ahp.ipk = AHPValue.ipk.sub.greater * AHPValue.ipk.main;
    } else {
      ahp.ipk = AHPValue.ipk.sub.lesser * AHPValue.ipk.main;
    }

    // Checkin TAK / STUDENT ACTIVITY SCORE
    if (el.STUDENTACTIVITYSCORE >= 60) {
      ahp.tak = AHPValue.tak.sub.greater * AHPValue.tak.main;
    } else {
      ahp.tak = AHPValue.tak.sub.lesser * AHPValue.tak.main;
    }

    // Checkin Prestasi / SCORE
    if (el.SCORE >= 5) {
      ahp.prestasi = AHPValue.prestasi.sub.greater * AHPValue.prestasi.main;
    } else {
      ahp.prestasi = AHPValue.prestasi.sub.lesser * AHPValue.prestasi.main;
    }

    ahp.total = ahp.ipk + ahp.tak + ahp.prestasi;

    return {
      ...el,
      ahp,
      ahpTotal: ahp.total,
    };
  });

  studentDatas.calculated.sort((a, b) => {
    return b.ahpTotal - a.ahpTotal;
  });

  studentDatas.finalAHP = studentDatas.calculated.filter(
    (el) => el.ahpTotal > 0.8
  );

  studentDatas.finalAHP.sort((a, b) => {
    return b.SCORE - a.SCORE;
  });
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

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-6">
        <CardBoxWidget
          color="text-blue-500"
          :icon="mdiAccountMultiple"
          :number="studentDatas.raw.length"
          label="Jumlah Wisudawan"
        />
        <CardBoxWidget
          color="text-emerald-500"
          :icon="mdiAccountMultiple"
          :number="25"
          label="Jumlah Calon Mahasiswa Berprestasi"
        />
        <CardBoxWidget
          color="text-yellow-500"
          :icon="mdiAccountMultiple"
          :number="studentDatas.finalAHP.length"
          label="Mahasiswa Berprestasi"
        />
      </div>

      <SectionTitleLineWithButton
        :icon="mdiAccountMultiple"
        title="Wisudawan Berprestasi"
        main
      />
      <CardBox has-table>
        <!-- <TableSampleClients /> -->
        <TableMahasiswa
          v-if="studentDatas.finalAHP.length > 0"
          ahp
          :data="studentDatas.finalAHP"
        />
      </CardBox>

      <div class="py-12"></div>

      <SectionTitleLineWithButton
        :icon="mdiAccountMultiple"
        title="Daftar Wisudawan"
        main
      />
      <CardBox has-table>
        <!-- <TableSampleClients /> -->
        <TableMahasiswa
          v-if="studentDatas.calculated.length > 0"
          ahp
          :data="studentDatas.calculated"
        />
      </CardBox>
    </SectionMain>
  </LayoutAuthenticated>
</template>
