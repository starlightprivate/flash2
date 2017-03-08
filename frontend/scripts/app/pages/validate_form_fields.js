(() => {
  let tmpZipCode = '';
  /* eslint-disable no-unused-vars */
  function validateFields(frm, fields) {
  /* eslint-enable no-unused-vars */
    if (frm.length > 0) {
      $.each(fields, (index, key) => {
        const tempKey = filterXSS(key);
        const $input = $(`input[name=${tempKey}]`);
        if ($input.length > 0 && $input.val() !== '') {
          let phoneNumber = filterXSS($('input[name=phoneNumber]').val());
          switch (tempKey) {
            case 'postalCode':
              if ($input.val() !== tmpZipCode) {
                tmpZipCode = $input.val();
                loadStateFromZip();
              }
              break;
            case 'phoneNumber':
              if (phoneNumber.length === 10 && phoneNumber.indexOf('-') < 0) {
                phoneNumber = `${phoneNumber.substr(0, 3)}-${phoneNumber.substr(3, 3)}-${phoneNumber.substr(6)}`;
                $('input[name=phoneNumber]').val(phoneNumber);
                frm.formValidation('revalidateField', 'phoneNumber');
              }
              break;
            default:
              frm.formValidation('revalidateField', tempKey);
          }
        }
      });
    }
  }
})();
