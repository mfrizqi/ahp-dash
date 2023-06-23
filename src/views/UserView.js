// import FormFilePicker from "@/components/FormFilePicker.vue";


const uploadFile = (event) => {
  // console.log(form);
  // console.log(form.file);
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
      // console.log(studentDatas.uploadRaw);
    };
  }
};

// const form = reactive({
//   file: null,
// });

{
  /* <CardBox class="mb-4 hidden">
<FormFilePicker
  v-model="form.file"
  label="Upload"
  @change="uploadFile($event)"
/>
</CardBox> */
}
