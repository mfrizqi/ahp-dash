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
import FormFilePicker from "@/components/FormFilePicker.vue";
// import TableSampleClients from "@/components/TableSampleClients.vue";
import TableMahasiswa from "@/components/TableMahasiswa.vue";
import LayoutAuthenticated from "@/layouts/LayoutAuthenticated.vue";
import SectionTitleLineWithButton from "@/components/SectionTitleLineWithButton.vue";
import * as XLSX from "xlsx";

const chartData = ref(null);

const fillChartData = () => {
  chartData.value = chartConfig.sampleChartData();
};

//
// AHP Calculation
//
let studentDatas = reactive({
  raw: [],
  calculated: [],
  finalAHP: [],
  uploadRaw: [],
  uploadCalculated: [],
  uploadFinal: [],
});

const rawData = ref(null);
const isInit = ref(true);

const readExcelFile2 = async () => {
  const url = new URL("./data_wisudawan.xls", import.meta.url).href;
  const data = await (await fetch(url)).arrayBuffer();
  console.log("readExcelFile2");
  console.log(url);
  console.log(data);
  /* data is an ArrayBuffer */
  const workbook = XLSX.read(data);

  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const sheetValues = XLSX.utils.sheet_to_json(worksheet);
  studentDatas.raw = sheetValues;
};

const readExcelFile3 = async () => {
  const url = new URL("./wisudawan_raw.xls", import.meta.url).href;
  const data = await (await fetch(url)).arrayBuffer();
  /* data is an ArrayBuffer */
  const workbook = XLSX.read(data);

  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const sheetValues = XLSX.utils.sheet_to_json(worksheet);
  rawData.value = sheetValues;
  console.log("readExcelFile3");
  console.log(rawData);

  rawData.value.forEach((el) => {
    if (el.COMPETITIONLIST) {
      const competitions = el.COMPETITIONLIST.split(/\r?\n/);
      // console.log(el.FULLNAME);
      // console.log(competitions);
      competitions.forEach((el) => {
        // console.log(el.split("_"));
        const sp = el.split("_");
        // console.log(sp[1], typeof sp[1]);
        if (sp[1]) {
          // console.log(sp[1].split(","));
        }
      });
    }
  });
};

const form = reactive({
  file: null,
});

//
// Nilai hasil perhitungan AHP
// TODO : Perubahan value dari Rey untuk main value
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
// List Nilai prestasi berdasarkan SK
const fixedPrestasi = {
  kemendikbud: {
    internasional: {
      1: 30,
      2: 25,
      3: 20,
      harapan: 17,
      inspiring: 16,
      finalis: 15,
    },
    nasional: {
      1: 25,
      3: 20,
      2: 15,
      hibah: 15,
      harapan: 13,
      inpiring: 12,
      finalis: 11,
      pendanaan: 10,
    },
    regional: {
      1: 10,
      2: 9,
      3: 8,
      harapan: 6,
      inspiring: 5,
      finalis: 3,
    },
  },
  mandiri: {
    internasional: {
      1: 15,
      2: 14,
      3: 13,
      harapan: 12,
      inspiring: 11,
      finalis: 10,
    },
    nasional: {
      1: 10,
      2: 9,
      3: 8,
      harapan: 7,
      inspiring: 6,
      finalis: 5,
    },
    regional: {
      1: 7,
      2: 6,
      3: 5,
      harapan: 4,
      inspiring: 3,
      finalis: 2,
    },
  },
};

//
// Function: Menghithung AHP dari tiap Mahasiswa
//
const calculateStudent = () => {
  if (isInit.value) {
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

      // Checking TAK / STUDENT ACTIVITY SCORE
      if (el.STUDENTACTIVITYSCORE >= 60) {
        ahp.tak = AHPValue.tak.sub.greater * AHPValue.tak.main;
      } else {
        ahp.tak = AHPValue.tak.sub.lesser * AHPValue.tak.main;
      }

      // Checking Prestasi / SCORE
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

    // Sort Descending berdasarkan AHP
    studentDatas.calculated.sort((a, b) => {
      return b.ahpTotal - a.ahpTotal;
    });

    // Filter Data Mahasiswa yang nilai AHP > 0.8
    studentDatas.finalAHP = studentDatas.calculated.filter(
      (el) => el.ahpTotal > 0.8
    );

    // Sort data final AHP descending
    studentDatas.finalAHP.sort((a, b) => {
      return b.SCORE - a.SCORE;
    });
  }
};

const uploadFile = (event) => {
  console.log(form);
  console.log(form.file);
  const eventFile = event.target.files ? event.target.files[0] : null;
  if (eventFile) {
    const reader = new FileReader();
    reader.readAsArrayBuffer(eventFile);
    reader.onload = (e) => {
      const arrayBuffer = reader.result;
      var data = new Uint8Array(arrayBuffer);
      var arr = new Array();
      for (var i = 0; i != data.length; ++i)
        arr[i] = String.fromCharCode(data[i]);
      var bstr = arr.join("");
      var workbook = XLSX.read(bstr, { type: "binary" });
      var first_sheet_name = workbook.SheetNames[0];
      var worksheet = workbook.Sheets[first_sheet_name];
      // console.log(XLSX.utils.sheet_to_json(worksheet, { raw: true }));
      var arraylist = XLSX.utils.sheet_to_json(worksheet, { raw: true });
      studentDatas.uploadRaw = arraylist;
      console.log(studentDatas.uploadRaw);
    };
  }
};

onMounted(async () => {
  fillChartData();
  await readExcelFile2();
  await readExcelFile3();
  calculateStudent();
  // console.log("raw datas");
  // console.log(studentDatas.raw);
});
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton
        id="overview"
        :icon="mdiChartTimelineVariant"
        title="Overview"
        main
      >
      </SectionTitleLineWithButton>

      <div
        id="calon_berprestasi"
        class="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-6"
      >
        <CardBoxWidget
          color="text-blue-500"
          :icon="mdiAccountMultiple"
          :number="studentDatas.raw.length"
          label="Jumlah Wisudawan"
        />
        <CardBoxWidget
          color="text-emerald-500"
          :icon="mdiAccountMultiple"
          :number="studentDatas.finalAHP.length"
          label="Jumlah Calon Mahasiswa Berprestasi"
        />
        <CardBoxWidget
          color="text-yellow-500"
          :icon="mdiAccountMultiple"
          :number="5"
          label="Mahasiswa Berprestasi"
        />
      </div>

      <CardBox class="mb-4">
        <FormFilePicker
          v-model="form.file"
          label="Upload"
          @change="uploadFile($event)"
        />
      </CardBox>

      <SectionTitleLineWithButton
        :icon="mdiAccountMultiple"
        title="Calon Wisudawan Berprestasi"
        main
      />
      <CardBox has-table>
        <!-- <TableSampleClients /> -->
        <TableMahasiswa
          v-if="studentDatas.finalAHP.length > 0"
          ahp
          top-five
          :data="studentDatas.finalAHP"
        />
      </CardBox>

      <div class="py-12"></div>

      <SectionTitleLineWithButton
        id="daftar_wisudawan"
        :icon="mdiAccountMultiple"
        title="Daftar Wisudawan"
        main
      />
      <CardBox has-table>
        <!-- <TableSampleClients /> -->
        <TableMahasiswa
          v-if="studentDatas.calculated.length > 0"
          :data="studentDatas.calculated"
        />
      </CardBox>
    </SectionMain>
  </LayoutAuthenticated>
</template>

<style scoped>
* {
  scroll-behavior: smooth;
}
</style>
