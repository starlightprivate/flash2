/* global $, DOMPurify, jQuery, UniversalStorage, utilsInstance */
function validate(utils) { // eslint-disable-line no-unused-vars
  const utilsInstance = utils;
  const cardNumberConfigurations = {
    amex: {
      mask: {
        pattern: '0000 000000 00000',
        config: { translation: { 0: { pattern: /[0-9]/ } } },
      },
      maxLength: '17',
    },
    defaultCC: {
      mask: {
        pattern: '0000 0000 0000 0000',
        config: { translation: { 0: { pattern: /[0-9]/ } } },
      },
      maxLength: '19',
    },
  };
  // Look for ios devices and safari
  const isMobileSafari = window.navigator.userAgent.match(/(iPod|iPhone|iPad)/) && window.navigator.userAgent.match(/AppleWebKit/);
  if (isMobileSafari) {
    // Search for credit card input and change it to text field
    if ($('input.creditcard').length > 0) {
      $('input.creditcard').attr('type', 'text');
    }
  }
  if (!utilsInstance.customWrapperForIsMobileDevice()) {
    $('input[type=number]').attr('type', 'text');
  }
  let numbstr = '';

  function setCCActive(className) {
    $('.payment-icon .cc-icon').addClass('faded');
    $(`.payment-icon .${className}`).removeClass('faded').addClass('active');
  }

  function configureCCInput(config) {
    const $inputCardNumber = $('input[name=cardNumber]');
    $inputCardNumber.mask(config.mask.pattern, config.mask.config);
    $inputCardNumber.attr('maxlength', config.maxLength);
  }

  function keyupEvent(event) {
    if (event.target.value.length >= 2) {
      numbstr = event.target.value.replace(/\s/g, '');
      let stcase = numbstr.slice(0, 2);
      stcase = parseInt(stcase, 10);
      if (stcase === 34 || stcase === 37) {
        if (event.target.value.length === 17) return;
        setCCActive('cc-american-express');
        configureCCInput(cardNumberConfigurations.amex);
      } else if (stcase >= 40 && stcase <= 49) {
        if (event.target.value.length === 19) return;
        setCCActive('cc-visa');
        configureCCInput(cardNumberConfigurations.defaultCC);
      } else if ((stcase > 21 && stcase < 28) || (stcase > 50 && stcase < 56)) {
        if (event.target.value.length === 19) return;
        setCCActive('cc-mastercard');
        configureCCInput(cardNumberConfigurations.defaultCC);
      } else if ((stcase > 56 && stcase <= 59) || (stcase > 66 && stcase < 69) || stcase === 50) {
        if (event.target.value.length === 19) return;
        $('#last').addClass('cc-maestro').removeClass('cc-discover');
        setCCActive('cc-maestro');
        configureCCInput(cardNumberConfigurations.defaultCC);
      } else {
        configureCCInput(cardNumberConfigurations.defaultCC);
      }
    }
    if (event.target.value.length >= 7) {
      if (event.target.value.length === 19) return;
      numbstr = event.target.value.replace(/\s/g, '');
      let ndcase = numbstr.slice(0, 6);
      ndcase = parseInt(ndcase, 10);
      if ((ndcase >= 601100 && ndcase <= 601109) || (ndcase >= 601120 && ndcase <= 601149)
        || (ndcase >= 601177 && ndcase <= 601179) || (ndcase >= 601186 && ndcase <= 601199)
        || (ndcase >= 644000 && ndcase <= 659999) || ndcase === 601174) {
        $('.payment-icon .cc-discover').addClass('active').removeClass('faded');
        $('.payment-icon .cc-visa').addClass('faded');
        $('.payment-icon .cc-mastercard').addClass('faded');
        $('.payment-icon .cc-american-express').addClass('faded');
      } else if ((ndcase >= 300000 && ndcase <= 305999) || (ndcase >= 309500 && ndcase <= 309599)
        || (ndcase >= 360000 && ndcase <= 369999) || (ndcase >= 380000 && ndcase <= 399999)) {
        $('#last').addClass('cc-diners-club').removeClass('cc-discover');
        $('.payment-icon .cc-diners-club').addClass('active').removeClass('faded');
        $('.payment-icon .cc-visa').addClass('faded');
        $('.payment-icon .cc-mastercard').addClass('faded');
        $('.payment-icon .cc-american-express').addClass('faded');
      } else if ((ndcase > 599999 && ndcase <= 643999)) {
        $('.payment-icon .cc-discover').addClass('active').removeClass('faded');
        $('.payment-icon .cc-visa').addClass('faded');
        $('.payment-icon .cc-mastercard').addClass('faded');
        $('.payment-icon .cc-american-express').addClass('faded');
      }
    }
    if (event.target.value.length >= 4) {
      numbstr = event.target.value.replace(/\s/g, '');
      let rdcase = numbstr.slice(0, 4);
      rdcase = parseInt(rdcase, 10);
      if (rdcase === 2014 || rdcase === 2149) {
        $('#last').addClass('cc-enroute').removeClass('cc-discover');
        $('.payment-icon .cc-enroute').addClass('active').removeClass('faded');
        $('.payment-icon .cc-visa').addClass('faded');
        $('.payment-icon .cc-mastercard').addClass('faded');
        $('.payment-icon .cc-american-express').addClass('faded');
      } else if (rdcase >= 3528 && rdcase <= 3589) {
        $('#last').addClass('cc-jcb').removeClass('cc-discover');
        $('.payment-icon .cc-jcb').addClass('active').removeClass('faded');
        $('.payment-icon .cc-visa').addClass('faded');
        $('.payment-icon .cc-mastercard').addClass('faded');
        $('.payment-icon .cc-american-express').addClass('faded');
      }
    }
    if ($(this).val() === '') {
      $('.payment-icon .cc-icon').removeClass('inactive active faded');
      $('#last').addClass('cc-discover').removeClass('cc-diners-club cc-enroute cc-jcb cc-maestro');
    }
  }
  $(document).on('keyup', '.creditcard', keyupEvent);

  function blurEvent() {
    const domains = ['hotmail.com', 'gmail.com', 'aol.com'];
    const topLevelDomains = ['com', 'net', 'org'];
    const $targetElement = $('.email ~ small:first');

    if (!$targetElement.has('br').length) {
      $(this).mailcheck({
        domains,
        topLevelDomains,
        suggested(element, suggestion) {
          const newRow = `${DOMPurify.sanitize($targetElement.html())}<br/>Did you mean <a href='javascript:void(0)'>${DOMPurify.sanitize(suggestion.full)}</a><br/>`;
          $targetElement.first().unsafeHtml(newRow).show();
        },
        empty() {
        },
      });
    }
  }

  function clickEvent() {
    const $targetElement = $('.email ~ small').first();

    $('.email').val($(this).html());
    $targetElement.html($targetElement.html().split('<br>', 1)[0]);
    if ($('form').length > 0) {
      $('form').formValidation('revalidateField', 'email');
    }
  }

  // Mailcheck Plugin Code here
  if ($('.email').length > 0) {
    $('.email').on('blur vmouseup', blurEvent);
    // If user click on the suggested email, it will replace that email with suggested one.
    $('body').on('click', '.email ~ small a', clickEvent);
  }
}
