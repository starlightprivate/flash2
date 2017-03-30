/* global $, DOMPurify, jQuery, utils, history, validate, UniversalStorage, loadAssets */
/* global utilsInstance */

const requireAssets = [
  'https://cdn.jsdelivr.net/g/jquery@3.1.1,js-cookie@2.2.0,tether@1.3.7,bootstrap@4.0.0-alpha.5,jquery.mask@1.14.10,mailcheck@1.1,mobile-detect.js@1.3.4,modernizr@3.3.1',
  '/tacticalsales/assets/js/libs.js',
  '/tacticalsales/assets/js/common_validators.js',
];

const index = () => {
  function initFieldFv(e, data) {
    const field = DOMPurify.sanitize(data.field);
    const $field = data.element;
    const bv = data.fv;

    const $span = $field.siblings('.valid-message');
    $span.attr('data-field', field);

    // Retrieve the valid message via getOptions()
    const message = DOMPurify.sanitize(bv.getOptions(field).validMessage);
    if (message) {
      $span.text(message);
    }
  }
  function successFieldFv(e, data) {
    const field = DOMPurify.sanitize(data.field);
    const $field = data.element;
    $field.siblings(`.valid-message[data-field='${field}']`).show();
  }
  function errFieldFv(e, data) {
    const field = DOMPurify.sanitize(data.field);
    const $field = data.element;
    $field.siblings(`.valid-message[data-field='${field}']`).hide();
  }
  function openContactModal() {
    $('#modal-contact').modal('show');
  }

  $(document).on('keyup', '#zipcode', () => {
    utilsInstance.loadStateFromZip();
  });

  validate(utilsInstance);
  $(document).on('click', '.popupButton', (e) => {
    const data = $(e.currentTarget).data();
    utilsInstance.showModal(data.modalid);
  });
  utilsInstance.initSessionIfNoCookies(() => {
    $('input[name=phoneNumber]').mask('000-000-0000', { translation: { 0: { pattern: /[0-9*]/ } } });
    const MediaStorage = {};
  // Lead create/update
    const createLead = (data, callback, err) => {
      const crmLead = {
        firstName: data.FirstName,
        lastName: data.LastName,
        phoneNumber: data.MobilePhone,
        emailAddress: data.Email,
      };

      MediaStorage.firstName = data.FirstName;
      MediaStorage.lastName = data.LastName;
      MediaStorage.phoneNumber = data.MobilePhone;
      MediaStorage.emailAddress = data.Email;

      utilsInstance.callAPI('create-lead', crmLead, 'POST', (resp) => {
        if (resp.success) {
          if (resp.orderId) {
            MediaStorage.orderId = DOMPurify.sanitize(resp.orderId);
            UniversalStorage.saveOrderId(DOMPurify.sanitize(resp.orderId));
          }
        }
        callback(resp.success);
      }, (textStatus) => {
        if (typeof err === 'function') {
          err(textStatus);
        }
      });
    };

    const updateLead = (data, cb) => {
      const crmLead = data;
      crmLead.orderId = MediaStorage.orderId;
      crmLead.firstName = MediaStorage.firstName;
      crmLead.lastName = MediaStorage.lastName;
      crmLead.phoneNumber = MediaStorage.phoneNumber;
      crmLead.emailAddress = MediaStorage.emailAddress;
      utilsInstance.callAPI('create-lead', crmLead, 'POST', () => {
        cb();
      }, () => {});
    };
  // This switches between contact modal & address modal
    const submitContactForm = () => {
      const data = {
        Email: $('[name=email]').val(),
        FirstName: $('[name=contactModalName]').val(),
        MobilePhone: $('[name=phoneNumber]').val(),
        LastName: 'NA',
      };

      UniversalStorage.saveCheckoutField('firstName', data.FirstName);
      UniversalStorage.saveCheckoutField('lastName', data.LastName);
      UniversalStorage.saveCheckoutField('emailAddress', data.Email);
      UniversalStorage.saveCheckoutField('phoneNumber', data.MobilePhone);

      utilsInstance.storeSessionToServer(UniversalStorage.getCheckoutDetails(), () => {
        if (utilsInstance.customWrapperForIsMobileDevice()) {
          utilsInstance.callAPI('add-contact', data, 'POST', (response) => {
            if (response.success) {
              createLead(data, () => {
                $('#modal-address').modal('show');
              }, () => {});
            }
          }, () => {});
          $('#modal-contact').modal('hide');
        } else {
          const $loadingBar = $('div.js-div-loading-bar');
          $loadingBar.show();
          utilsInstance.callAPI('add-contact', data, 'POST', (response) => {
            if (response.success) {
              createLead(data, () => {
              // In case of Mobile devices, show address modal and go to checkout page.
                utilsInstance.wrapLocationChange('checkout.html');
              }, () => {
                $loadingBar.hide();
              });
            } else {
              $loadingBar.hide();
            }
          }, () => {
            $loadingBar.hide();
          });
        }
      });
    };
  // submit address form
    const submitAddressForm = () => {
      const addressFormFields = [
        'address1',
        'city',
        'state',
        'postalCode',
      ];
      const tmp = {};
      addressFormFields.forEach((field) => {
        const value = $(`[name=${field}]`).val();
        UniversalStorage.saveCheckoutField(field, value);
        tmp[field] = value;
      });
      utilsInstance.storeSessionToServer(UniversalStorage.getCheckoutDetails(), () => {
        updateLead(tmp, () => {
          utilsInstance.wrapLocationChange('checkout.html');
        });
      });
    };

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

  // Address Form Validator
    $('.form-address').on('init.field.fv', initFieldFv).formValidation({
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
    submitAddressForm();
    e.preventDefault();
  })
  .on('success.field.fv', successFieldFv)
  .on('err.field.fv', errFieldFv);
    $('.form-address').submit((e) => {
      e.preventDefault();
    });
    $('input[name=postalCode]').mask('00000', { translation: { 0: { pattern: /[0-9]/ } } });

    $(document).on('click', '.footer-image', () => {
      openContactModal();
    });

    // const removeHashUrl = () => {
    //   const original = window.location.href.substr(0, window.location.href.indexOf('#'));
    //   history.replaceState({}, document.title, original);
    // };
    //
    // const toggleModalIfHashUrl = () => {
    //   if (window.location.hash === '#modal-contact') {
    //     $('#modal-contact').modal('toggle');
    //     removeHashUrl();
    //   }
    // };
    //
    // toggleModalIfHashUrl();
    // $(window).bind('hashchange', () => toggleModalIfHashUrl());
  });
};

(function init() {
  loadAssets(requireAssets, {
    success: () => index(),
    async: false,
  });
}());
