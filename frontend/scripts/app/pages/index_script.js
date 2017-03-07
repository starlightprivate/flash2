function initFieldFv(e, data) {
  const field = filterXSS(data.field);
  const $field = data.element;
  const bv = data.fv;

  const $span =
   $('<small/>')
    .addClass('help-block validMessage text-success')
    .attr('data-field', field)
    .insertAfter($field)
    .hide();
  // Retrieve the valid message via getOptions()
  const message = filterXSS(bv.getOptions(field).validMessage);
  if (message) {
    $span.text(message);
  }
}
function successFieldFv(e, data) {
  const field = filterXSS(data.field);
  const $field = data.element;
  $field.next(`.validMessage[data-field='${field}']`).show();
}
function errFieldFv(e, data) {
  const field = filterXSS(data.field);
  const $field = data.element;
  $field.next(`.validMessage[data-field='${field}']`).hide();
}
function wistiaVideo() {  // eslint-disable-line no-unused-vars
  $('.btn-buy-modal').click();
}
(() => {
  $('input[name=phoneNumber]').mask('000-000-0000', { translation: { 0: { pattern: /[0-9*]/ } } });
  const MediaStorage = {};
  // Lead create/update
  function createLead(data, callback, err) {
    const crmLead = {};
    crmLead.firstName = data.FirstName;
    crmLead.lastName = data.LastName;
    crmLead.phoneNumber = data.MobilePhone;
    crmLead.emailAddress = data.Email;

    MediaStorage.firstName = data.FirstName;
    MediaStorage.lastName = data.LastName;
    MediaStorage.phoneNumber = data.MobilePhone;
    MediaStorage.emailAddress = data.Email;

    callAPI('create-lead', crmLead, 'POST', (resp) => {
      if (resp.success) {
        if (resp.orderId) {
          MediaStorage.orderId = filterXSS(resp.orderId);
          UniversalStorage.saveOrderId(filterXSS(resp.orderId));
        }
      }
      callback(resp.success);
    }, (textStatus) => {
      if (typeof err === 'function') {
        err(textStatus);
      }
    });
  }
  function updateLead(data, cb) {
    const crmLead = data;
    crmLead.orderId = MediaStorage.orderId;
    crmLead.firstName = MediaStorage.firstName;
    crmLead.lastName = MediaStorage.lastName;
    crmLead.phoneNumber = MediaStorage.phoneNumber;
    crmLead.emailAddress = MediaStorage.emailAddress;
    callAPI('create-lead', crmLead, 'POST', (e) => {
      console.log(e);
      cb();
    }, () => {});
  }
  // Forms submit
  const submittedContactForm = false;
  // This switches between contact modal & address modal
  function submitContactForm() {
    const data = {};
    const tempData = {};
    tempData.Email = $('[name=email]').val();
    tempData.FirstName = $('[name=contactModalName]').val();
    tempData.MobilePhone = $('[name=phoneNumber]').val();

    data.Email = filterXSS(tempData.Email);
    data.FirstName = filterXSS(tempData.FirstName);
    data.MobilePhone = filterXSS(tempData.MobilePhone);
    data.LastName = 'NA';

    UniversalStorage.saveCheckoutField('firstName', data.FirstName);
    UniversalStorage.saveCheckoutField('lastName', data.LastName);
    UniversalStorage.saveCheckoutField('emailAddress', data.Email);
    UniversalStorage.saveCheckoutField('phoneNumber', data.MobilePhone);

    if (customWrapperForIsMobileDevice()) {
      callAPI('add-contact', data, 'POST', (response) => {
        if (response.success) {
          createLead(data, () => {
            $('.btn-address-modal').click();
          }, () => {});
        }
      }, () => {});
      $('#modal-contact .close-modal').click();
    } else {
      $('div#js-div-loading-bar').show();

      callAPI('add-contact', data, 'POST', (response) => {
        if (response.success) {
          createLead(data, () => {
            // In case of Mobile devices, show address modal and go to checkout page.
            window.location = 'checkout.html';
          }, () => {
            $('div#js-div-loading-bar').hide();
          });
        } else {
          $('div#js-div-loading-bar').hide();
        }
      }, () => {
        $('div#js-div-loading-bar').hide();
      });
    }
  }
  // submit address form
  function submitAddressForm() {
    const addressFormFields = [
      'address1',
      'city',
      'state',
      'postalCode',
    ];
    const tmp = {};
    addressFormFields.forEach((value) => {
      if ($(`[name=${value}]`).length > 0) {
        const dirty = $(`[name=${value}]`).val();
        const uVal = filterXSS(dirty);
        UniversalStorage.saveCheckoutField(value, uVal);
        tmp[value] = uVal;
      }
    });
    // if(evil) return;
    updateLead(tmp, () => {
      window.location = 'checkout.html';
    });
  }

  if ($('#form-contact').length > 0) {
    $('#form-contact').on('init.field.fv', initFieldFv).formValidation({
      framework: 'bootstrap4',
      icon: {
        valid: 'ss-check',
        invalid: 'ss-delete',
        validating: 'ss-refresh',
      },
      autoFocus: true,
      fields: {
        contactModalName: {
          validMessage: 'Nice to meet you!',
          validators: {
            notEmpty: { message: 'Please enter your name.' },
            stringLength: {
              max: 100,
              message: 'The name must be more than 1 and less than 50 characters long.',
            },
          },
        },
        email: {
          validMessage: 'Great! We will send you a confirmation e-mail with tracking # after purchasing.',
          validators: {
            notEmpty: { message: 'The email address is required.' },
            stringLength: {
              min: 1,
              max: 100,
              message: 'The email address must be more than 6 and less than 30 characters long.',
            },
            emailAddress: { message: 'The email address is not valid.' },
          },
        },
        phoneNumber: {
          validMessage: 'Success! We will only call if there\u2019s a problem shipping to your location.',
          validators: {
            notEmpty: { message: 'Please supply a phone number so we can call if there are any problems shipping your flashlight.' },
            stringLength: {
              min: 12,
              message: 'Not a valid 10-digit US phone number (must not include spaces or special characters).',
            },
          },
        },
      },
    })
    .on('err.field.fv', () => {})
    .on('success.validator.fv', () => {})
    .on('err.form.fv', () => {})
    .on('success.form.fv', (e) => {
      submitContactForm();
      e.preventDefault();
    })
    .on('success.field.fv', successFieldFv)
    .on('err.field.fv', errFieldFv);
    $('#form-contact').submit((e) => {
      e.preventDefault();
    });
  }
  // Address Form Validator
  if ($('#form-address').length > 0) {
    $('#form-address').on('init.field.fv', initFieldFv).formValidation({
      framework: 'bootstrap4',
      icon: {
        valid: 'ss-check',
        invalid: 'ss-delete',
        validating: 'ss-refresh',
      },
      autoFocus: true,
      fields: {
        address1: {
          validMessage: 'Success! Free shipping confirmed.',
          validators: {
            stringLength: {
              min: 1,
              max: 100,
              message: 'The address must be less than 100 characters long.',
            },
            notEmpty: { message: 'The address is required.' },
          },
        },
        state: { validators: { notEmpty: { message: 'The State is required.' } } },
        city: {
          validMessage: 'That was easy!',
          validators: {
            stringLength: {
              max: 50,
              message: 'The city must be less than 50 characters long.',
            },
            notEmpty: { message: 'The city is required.' },
          },
        },
        postalCode: {
          validators: {
            stringLength: {
              min: 5,
              message: 'The zip code must be 5 number long.',
            },
            notEmpty: { message: 'The zip code is required.' },
          },
        },
      },
    })
    .on('err.field.fv', () => {})
    .on('success.validator.fv', () => {})
    .on('err.form.fv', () => {})
    .on('success.form.fv', (e) => {
      console.log('submit!!!!!!');
      submitAddressForm();
      e.preventDefault();
    })
    .on('success.field.fv', successFieldFv)
    .on('err.field.fv', errFieldFv);
    $('#form-address').submit((e) => {
      e.preventDefault();
    });
    $('input[name=postalCode]').mask('00000', { translation: { 0: { pattern: /[0-9]/ } } });
  }
  $('.footer-image').click(() => {
    $('.btn-buy-modal').click();
  });

  if ($('#modal-contact').length > 0) {
    $('#modal-contact').on('shown.bs.modal', () => {});
  }
  // Once submitted contact form and click on the green button again show address modal
  $('.btn-buy-modal').click((e) => {
    if (submittedContactForm) {
      $('.btn-address-modal').click();
      e.stopPropagation();
    }
  });
})();
