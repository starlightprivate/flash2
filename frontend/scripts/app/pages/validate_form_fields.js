/* global $, DOMPurify, jQuery, callAPI, UniversalStorage */
/* global loadStateFromZip, customWrapperForIsMobileDevice */
(() => {
  let tmpZipCode = '';
  /* eslint-disable no-unused-vars */
  function validateFields(frm, fields) {
  /* eslint-enable no-unused-vars */
    if (frm.length > 0) {
      $.each(fields, (index, key) => {
        const tempKey = DOMPurify.sanitize(key);
        const $input = $(`input[name=${tempKey}]`);
        if ($input.length > 0 && $input.safeVal() !== '') {
          let phoneNumber = $('input[name=phoneNumber]').safeVal();
          switch (tempKey) {
          case 'postalCode':
            if ($input.safeVal() !== tmpZipCode) {
              tmpZipCode = $input.safeVal();
              loadStateFromZip();
            }
            break;
          case 'phoneNumber':
            if (phoneNumber.length === 10 && phoneNumber.indexOf('-') < 0) {
              phoneNumber = `${phoneNumber.substr(0, 3)}-${phoneNumber.substr(3, 3)}-${phoneNumber.substr(6)}`;
              $('input[name=phoneNumber]').safeVal(phoneNumber);
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
