(() => {
  if (customWrapperForIsMobileDevice()) {
    $('#checkout-wrapper').addClass('mobile-mode');
    $('#step-4 .step-title span').html('Step #2 :');
  }
  $('input[name=phoneNumber]').mask('000-000-0000', { translation: { 0: { pattern: /[0-9*]/ } } });
  const MediaStorage = UniversalStorage.getCheckoutDetails();

  $('input[name=cardNumber]').attr('maxlength', '19');

  function submitOrderForm() {
    $('div#js-div-loading-bar').show();
    const year = $('select[name=year]').val();
    const month = $('select[name=month]').val();
    const d = new Date();
    const currentYear = d.getFullYear().toString().substr(2, 2);
    const currentMonth = (`0${d.getMonth() + 1}`).slice(-2);
    if (!(currentYear < year || (currentYear === year && currentMonth <= month))) {
      $('div#js-div-loading-bar').hide();
      bootstrapModal('Invalid Expiration Date', 'Problem with your order');
      return;
    }
    const apiFields = [
      'firstName',
      'lastName',
      'emailAddress',
      'phoneNumber',
      'address1',
      'city',
      'state',
      'postalCode',
      'cardNumber',
      'cardSecurityCode',
      'cardMonth',
      'cardYear',
      'campaignId',
      'productId',
    ];
    const orderDetails = {};
    apiFields.forEach((key) => {
      // const key = apiFields[index];
      let dirty;
      if (key !== 'productId') {
        dirty = $(`[name=${key}]`).val();
      } else {
        dirty = $('input[name=\'productId\']:checked', '#checkoutForm').val();
      }
      const uVal = filterXSS(dirty);
      orderDetails[key] = uVal;
    });

    orderDetails.cardMonth = $('[name=month]').val();
    orderDetails.cardYear = $('[name=year]').val();
    orderDetails.lastName = 'NA';
    orderDetails.orderId = MediaStorage.orderId;
    const contactInfo = {};
    contactInfo.firstName = orderDetails.firstName;
    contactInfo.lastName = orderDetails.lastName;
    contactInfo.emailAddress = orderDetails.emailAddress;
    contactInfo.phoneNumber = orderDetails.phoneNumber;
    contactInfo.address1 = orderDetails.address1;
    contactInfo.city = orderDetails.city;
    contactInfo.state = orderDetails.state;
    contactInfo.postalCode = orderDetails.postalCode;
    callAPI('update-contact', contactInfo, 'POST', (resp) => {
      console.log(resp);
    });
    callAPI('create-order', orderDetails, 'POST', (resp) => {
      if (resp.success) {
        $('#checkoutForm .btn-complete').removeClass('pulse');
        if (resp.orderId) {
          UniversalStorage.saveOrderId(filterXSS(resp.orderId));
        }
        // window.location = GlobalConfig.BasePagePath + "us_batteryoffer.html?orderId="
        // + MediaStorage.orderId + "&pId=" + orderDetails.productId;
        window.location = 'us_batteryoffer.html?orderId=' + filterXSS(MediaStorage.orderId) + '&pId=' + filterXSS(orderDetails.productId);
      } else {
        $('#checkoutForm .btn-complete').removeClass('pulse');
        let responseMessage = resp.message;
        if (responseMessage) {
          let errHead = 'Problem with your order';
          let errBody;
          if (responseMessage !== 'Invalid Credit Card Number') {
            errHead = 'Payment validation failed:  Processor Declined.';
            responseMessage += '<br><br>For security reasons, you must re-enter a new card number.<br><br>';
            responseMessage += 'Tip: you may try another card or call <a href=\'tel:+18558807233\'>(855) 880-7233</a>.';
          }
          errBody = '<span style=\'font-size:20px\'>';
          errBody += responseMessage;
          errBody += '<span>';
          bootstrapModal(errBody, errHead);
        }
      }
      $('div#js-div-loading-bar').hide();
    });
    return false; // eslint-disable-line consistent-return
  }
    // Checkout Form Validator
  let CheckoutFieldsReq;
  if (!customWrapperForIsMobileDevice()) {
    CheckoutFieldsReq = [
      'firstName',
      'lastName',
      'emailAddress',
      'phoneNumber',
      'address1',
      'city',
      'state',
      'postalCode',
      'cardNumber',
      'month',
      'year',
    ];
  } else {
    CheckoutFieldsReq = [
      'cardNumber',
      'month',
      'year',
    ];
  }

  function checkoutButtonPulse(CheckoutFields, invalidFieldsCount) {
    const cfCount = CheckoutFields.length;
    let icfCount = 1;
    if (customWrapperForIsMobileDevice()) {
      icfCount = 0;
    }

    CheckoutFields.forEach((field) => {
      if ($('[name=\'' + filterXSS(field) + '\'].required').parents('.form-group').hasClass('has-success')) { icfCount += 1; }
    });

    if (invalidFieldsCount === 0) {
      if ($('#checkoutForm .fv-has-feedback.has-warning').length > 0) {
        $('#checkoutForm .btn-complete').removeClass('pulse');
      } else if (cfCount === icfCount) {
        $('#checkoutForm .btn-complete').addClass('pulse');
      } else {
        $('#checkoutForm .btn-complete').removeClass('pulse');
      }
    } else {
      $('#checkoutForm .btn-complete').removeClass('pulse');
    }
  }
  if ($('#checkoutForm').length > 0) {
    $('#checkoutForm').on('init.field.fv', (e, data) => {
      const field = data.field;
      const $field = data.element;
      const bv = data.fv;
            // FormValidation instance
            // Create a span element to show valid message
            // and place it right before the field
      const $span = $('<small/>')
                    .addClass('help-block validMessage text-success')
                    .attr('data-field', field)
                    .insertAfter($field)
                    .hide();
            // Retrieve the valid message via getOptions()
      const message = filterXSS(bv.getOptions(field).validMessage);
      if (message) {
        $span.text(message);
      }
    }).formValidation({
      framework: 'bootstrap4',
      icon: {
        valid: 'ss-check',
        invalid: 'ss-delete',
        validating: 'ss-refresh',
      },
      autoFocus: true,
      fields: {
        firstName: {
          validMessage: 'Nice to meet you!',
          validators: {
            notEmpty: { message: 'Please enter your name.' },
            stringLength: {
              min: 1,
              max: 30,
              message: 'The name must be more than 1 and less than 50 characters long.',
            },
          },
        },
        emailAddress: {
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
                            // real that is "10" but that include 2 symbols "-"
              message: 'Not a valid 10-digit US phone number (must not include spaces or special characters).',
            },
          },
        },
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
        cardNumber: {
          validators: {
            notEmpty: { message: 'Enter the card number.' },
            creditCard: {
              message: 'Enter a valid card number.',
              // This will allow to Accept test credit card numbers
              transformer($field) {
                const TEST_CARD_NUMBERS = [
                  '0000 0000 0000 0000',
                  '3333 2222 3333 2222',
                  '3003 0008 4444 44'];
                // We will transform those test card numbers into a valid one as below
                const VALID_CARD_NUMBER = '4444111144441111';

                // Get the number pr by user
                let value = $field.val();
                const CountOfChars = parseInt($field.val().length, 10);
                if (CountOfChars === 17) {
                  value = value.substr(0, CountOfChars - 1);
                }

                // Check if it"s one of test card numbers
                if (value !== '' && $.inArray(value, TEST_CARD_NUMBERS) !== -1) {
                  // then turn it to be a valid one defined by VALID_CARD_NUMBER
                  return VALID_CARD_NUMBER;
                }
                  // Otherwise, just return the initial value
                return value;
              },
            },
          },
        },
                // CSC
        cardSecurityCode: { validators: { notEmpty: { message: 'The Security Code is required.' } } },
        month: {
          validators: {
            notEmpty: { message: 'The Month is required.' },
            callback: {
              message: 'Please set month more or equal current.',
              callback(value, validator, $field) {
                const form = $field.parents('form');
                const currentDate = new Date();
                const year = parseInt(currentDate.getYear(), 10);
                const yearVal = parseInt(form.find('[name=year]').val(), 10);
                if (isNaN(yearVal) || yearVal === null || yearVal === undefined) {
                  return true;
                }
                const selectedYear = 100 + (parseInt(form.find('[name=year]').val(), 10) || 0);
                const currentMonth = parseInt(value, 10) -
                                     1 >= parseInt(currentDate.getMonth(), 10);
                if (selectedYear === year) {
                  if (currentMonth) {
                    form.find('[name=year]')
                        .parents('.form-group')
                        .removeClass('has-warning')
                        .addClass('has-success');
                    form.find('[name=year]')
                        .parents('.form-group')
                        .find('.fv-control-feedback')
                        .removeClass('fa-remove')
                        .addClass('fa-check');
                    form.find('[name=year]')
                        .parents('.form-group')
                        .find('.form-control-feedback')
                        .hide();
                  } else {
                    form.find('[name=year]')
                        .parents('.form-group')
                        .removeClass('has-success')
                        .addClass('has-warning');
                    form.find('[name=year]')
                        .parents('.form-group')
                        .find('.fv-control-feedback')
                        .removeClass('fa-check')
                        .addClass('fa-remove');
                    form.find('[name=year]')
                        .parents('.form-group')
                        .find('[data-fv-validator=\'callback\']')
                        .show();
                  }
                  return currentMonth;
                }
                form.find('[name=year]')
                    .parents('.form-group')
                    .removeClass('has-warning')
                    .addClass('has-success');
                form.find('[name=year]')
                    .parents('.form-group')
                    .find('.fv-control-feedback')
                    .removeClass('fa-remove')
                    .addClass('fa-check');
                form.find('[name=year]')
                    .parents('.form-group')
                    .find('.form-control-feedback')
                    .hide();
                return true;
              },
            },
          },
        },
        year: {
          validators: {
            notEmpty: { message: 'The Year is required.' },
            callback: {
              message: 'Please set year more or equal current.',
              callback(value, validator, $field) {
                const form = $field.parents('form'); // eslint-disable-line no-unused-vars
                const currentDate = new Date();
                const yearCondition = 100 +
                                       parseInt(value, 10) >= parseInt(currentDate.getYear(), 10);
                $('#checkoutForm').formValidation('revalidateField', 'month');
                if ($('#checkoutForm').find('[name=month]').parents('.form-group').hasClass('has-warning')) {
                  return false;
                }
                return yearCondition;
              },
            },
          },
        },
      },
    }).on('success.validator.fv', (e, data) => {
      if (data.field === 'cardNumber') {
        if (data.validator === 'creditCard') {
          switch (data.result.type) {
            case 'VISA':
              $('.payment-icon .cc-icon.cc-visa').parents('a')
                                                 .siblings()
                                                 .find('.cc-icon')
                                                 .removeClass('active')
                                                 .addClass('inactive');
              $('.payment-icon .cc-icon.cc-visa').removeClass('inactive')
                                                 .addClass('active');
              $('.payment-icon .cc-icon.cc-visa').removeClass('faded');
              $('input[name=cardNumber]').attr('maxlength', '19');
              break;
            case 'MASTERCARD':
              $('.payment-icon .cc-icon.cc-mastercard').parents('a')
                                                       .siblings()
                                                       .find('.cc-icon')
                                                       .removeClass('active')
                                                       .addClass('inactive');
              $('.payment-icon .cc-icon.cc-mastercard').removeClass('inactive')
                                                       .addClass('active');
              $('.payment-icon .cc-icon.cc-mastercard').removeClass('faded');
              $('input[name=cardNumber]').attr('maxlength', '19');
              break;
            case 'AMERICAN_EXPRESS':
              $('.payment-icon .cc-icon.cc-american-express').parents('a')
                                                             .siblings()
                                                             .find('.cc-icon')
                                                             .removeClass('active')
                                                             .addClass('inactive');
              $('.payment-icon .cc-icon.cc-american-express').removeClass('inactive').addClass('active');
              $('.payment-icon .cc-icon.cc-american-express').removeClass('faded');
              $('input[name=cardNumber]').attr('maxlength', '18');
              break;
            case 'DISCOVER':
              $('.payment-icon .cc-icon.cc-discover').parents('a')
                                                     .siblings()
                                                     .find('.cc-icon')
                                                     .removeClass('active')
                                                     .addClass('inactive');
              $('.payment-icon .cc-icon.cc-discover').removeClass('inactive')
                                                     .addClass('active');
              $('.payment-icon .cc-icon.cc-discover').removeClass('faded');
              $('input[name=cardNumber]').attr('maxlength', '19');
              break;
            default:
              $('.payment-icon .cc-icon').removeClass('inactive active');
              $('.payment-icon .cc-icon').addClass('faded');
              $('input[name=cardNumber]').attr('maxlength', '19');
              break;
          }
        } else if (data.validator !== 'stringLength') {
          $('.payment-icon .cc-icon').removeClass('inactive active');
          $('.payment-icon .cc-icon').addClass('faded');
          $('input[name=cardNumber]').attr('maxlength', '19');
        }
      }
    })
    .on('err.field.fv', (e, data) => {
      const field = data.field;
      const $field = filterXSS(data.element);
      $field.next(`.validMessage[data-field='${field}']`).hide();
      const invalidFieldsCount = data.fv.getInvalidFields().length;
      checkoutButtonPulse(CheckoutFieldsReq, invalidFieldsCount);
    })
    .on('status.field.fv', (e, data) => {
      data.fv.disableSubmitButtons(false);
    })
    .on('success.field.fv', (e, data) => {
      const field = filterXSS(data.field);
      const $field = data.element;
      if (data.fv.getSubmitButton()) {
        data.fv.disableSubmitButtons(false);
      }

      // Show the valid message element
      $field.next(`.validMessage[data-field='${field}']`).show();
      const invalidFieldsCount = data.fv.getInvalidFields().length;
      checkoutButtonPulse(CheckoutFieldsReq, invalidFieldsCount);
    })
    .on('err.form.fv', () => {})
    .on('success.form.fv', (e) => {
      submitOrderForm();
      e.preventDefault();
    });
    $('#checkoutForm').submit((e) => {
      e.preventDefault();
    });

    //  Apply mask for checkout fields
    $('input[name=cardNumber]').mask('0000 0000 0000 0000', { translation: { 0: { pattern: /[0-9]/ } } });
    $('input[name=postalCode]').mask('00000', { translation: { 0: { pattern: /[0-9]/ } } });
    const checkoutFields = [
      'firstName',
      'lastName',
      'emailAddress',
      'phoneNumber',
      'address1',
      'city',
      'state',
      'postalCode',
    ];
    // Load cached values
    $.each(checkoutFields, (index, value) => {
      const tempValue = filterXSS(value);
      if ($(`[name=${tempValue}]`).length === 0) {
        return;
      }
      const uVal = filterXSS(MediaStorage[value]);
      if (uVal && uVal !== null && uVal !== 'null') {
        $(`[name=${tempValue}]`).val(uVal);
        $(`[name=${tempValue}]`).data('previousValue', uVal);
        $('#checkoutForm').formValidation('revalidateField', value);
      }
    });

    // Save checkout details to storage.
    const saveToStorage = () => {
      const checkoutDetails = {};
      checkoutFields.forEach((field) => {
        checkoutDetails[field] = filterXSS($(`[name=${field}]`).val());
      });
      UniversalStorage.saveCheckoutDetails(checkoutDetails);
    };

    $('form').on('change', saveToStorage);
    window.onbeforeunload = saveToStorage;
  }
})();
