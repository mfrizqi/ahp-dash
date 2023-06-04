<!-- eslint-disable vue/require-prop-types -->
<script setup>
import { computed, ref, onMounted } from "vue";
import CardBoxModal from "@/components/CardBoxModal.vue";
import TableCheckboxCell from "@/components/TableCheckboxCell.vue";
import BaseLevel from "@/components/BaseLevel.vue";
import BaseButtons from "@/components/BaseButtons.vue";
import BaseButton from "@/components/BaseButton.vue";

// --------------

const props = defineProps({ data: Array, checkable: Boolean, ahp: Boolean });
const dataTable = ref(props.data);

const isModalActive = ref(false);

const isModalDangerActive = ref(false);

const perPage = ref(15);

const currentPage = ref(0);

const checkedRows = ref([]);

const itemsPaginated = computed(() =>
  dataTable.value.slice(
    perPage.value * currentPage.value,
    perPage.value * (currentPage.value + 1)
  )
);

const numPages = computed(() =>
  Math.ceil(dataTable.value.length / perPage.value)
);

const currentPageHuman = computed(() => currentPage.value + 1);

const pagesList = computed(() => {
  const pagesList = [];

  for (let i = 0; i < numPages.value; i++) {
    pagesList.push(i);
  }

  return pagesList;
});

const remove = (arr, cb) => {
  const newArr = [];

  arr.forEach((item) => {
    if (!cb(item)) {
      newArr.push(item);
    }
  });

  return newArr;
};

const checked = (isChecked, client) => {
  if (isChecked) {
    checkedRows.value.push(client);
  } else {
    checkedRows.value = remove(
      checkedRows.value,
      (row) => row.id === client.id
    );
  }
};

onMounted(() => {
  console.log(dataTable);
});
</script>

<template>
  <CardBoxModal v-model="isModalActive" title="Sample modal">
    <p>Lorem ipsum dolor sit amet <b>adipiscing elit</b></p>
    <p>This is sample modal</p>
  </CardBoxModal>

  <CardBoxModal
    v-model="isModalDangerActive"
    title="Please confirm"
    button="danger"
    has-cancel
  >
    <p>Lorem ipsum dolor sit amet <b>adipiscing elit</b></p>
    <p>This is sample modal</p>
  </CardBoxModal>

  <div v-if="checkedRows.length" class="p-3 bg-gray-100/50 dark:bg-slate-800">
    <span
      v-for="checkedRow in checkedRows"
      :key="checkedRow.id"
      class="inline-block px-2 py-1 rounded-sm mr-2 text-sm bg-gray-100 dark:bg-slate-700"
    >
      {{ checkedRow.name }}
    </span>
  </div>

  <table>
    <thead>
      <tr>
        <th>No</th>
        <th>NIM</th>
        <th>Nama Mahasiswa</th>
        <th>IPK</th>
        <th>TAK</th>
        <th>Prestasi</th>
        <th v-if="ahp">Score AHP</th>
        <th v-if="ahp">AHP IPK</th>
        <th v-if="ahp">AHP TAK</th>
        <th v-if="ahp">AHP Prestasi</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(client, index) in itemsPaginated" :key="client.id">
        <TableCheckboxCell
          v-if="checkable"
          @checked="checked($event, client)"
        />
        <td
          data-label="no"
          :class="index < 5 ? 'bg-emerald-300 hover:bg-emerald-400' : ''"
        >
          {{ client.NO }}
        </td>
        <td
          data-label="nim"
          :class="index < 5 ? 'bg-emerald-300 hover:bg-emerald-400' : ''"
        >
          {{ client.STUDENTID }}
        </td>
        <td
          data-label="nama"
          :class="index < 5 ? 'bg-emerald-300 hover:bg-emerald-400' : ''"
        >
          {{ client.FULLNAME }}
        </td>
        <td
          data-label="ipk"
          :class="index < 5 ? 'bg-emerald-300 hover:bg-emerald-400' : ''"
        >
          {{ client.GPA }}
        </td>
        <td
          data-label="tak"
          :class="index < 5 ? 'bg-emerald-300 hover:bg-emerald-400' : ''"
        >
          {{ client.STUDENTACTIVITYSCORE }}
        </td>
        <td
          data-label="score_prestasi"
          :class="index < 5 ? 'bg-emerald-300 hover:bg-emerald-400' : ''"
        >
          {{ client.SCORE }}
        </td>
        <td
          v-if="ahp"
          data-label="score_ahp"
          :class="index < 5 ? 'bg-emerald-300 hover:bg-emerald-400' : ''"
        >
          {{ client.ahpTotal.toFixed(2) }}
        </td>
        <td
          v-if="ahp"
          data-label="score_ipk"
          :class="index < 5 ? 'bg-emerald-300 hover:bg-emerald-400' : ''"
        >
          {{ client.ahp.ipk.toFixed(2) }}
        </td>
        <td
          v-if="ahp"
          data-label="score_tak"
          :class="index < 5 ? 'bg-emerald-300 hover:bg-emerald-400' : ''"
        >
          {{ client.ahp.tak.toFixed(2) }}
        </td>
        <td
          v-if="ahp"
          data-label="score_prestasi"
          :class="index < 5 ? 'bg-emerald-300 hover:bg-emerald-400' : ''"
        >
          {{ client.ahp.prestasi.toFixed(2) }}
        </td>
      </tr>
    </tbody>
  </table>
  <div class="p-3 lg:px-6 border-t border-gray-100 dark:border-slate-800">
    <BaseLevel>
      <BaseButtons>
        <BaseButton
          v-for="page in pagesList"
          :key="page"
          :active="page === currentPage"
          :label="page + 1"
          :color="page === currentPage ? 'lightDark' : 'whiteDark'"
          small
          @click="currentPage = page"
        />
      </BaseButtons>
      <small>Page {{ currentPageHuman }} of {{ numPages }}</small>
    </BaseLevel>
  </div>
</template>
