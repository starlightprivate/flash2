function validate() {
  'use strict';
  // Look for ios devices and safari
  if (isMobileSafari()) {
    // Search for credit card input and change it to text field
    if ($('input#creditcard').length > 0) {
      $('input#creditcard').attr('type', 'text');
    }
  }
  if (!customWrapperForIsMobileDevice()) {
    $('input[type=number]').attr('type', 'text');
  }
   var numbstr = '';
  $('#creditcard').keyup(function(event) {
    if(event.target.value.length >= 2){
      numbstr = event.target.value.replace(/\s/g,'');
      var stcase = numbstr.slice(0,2);
      stcase = parseInt(stcase);
      if(stcase == 34 || stcase == 37){
        if (event.target.value.length == 18) return;
        $('.payment-icon .cc-american-express').removeClass('faded');
        $('.payment-icon .cc-american-express').addClass('active');
        $('.payment-icon .cc-visa').addClass('faded');
        $('.payment-icon .cc-mastercard').addClass('faded');
        $('.payment-icon .cc-discover').addClass('faded');
        $('input[name=cardNumber]').mask('0000 000000 00000', { 'translation': { 0: { pattern: /[0-9]/ } } });
      }else if (stcase >= 40 && stcase <= 49){
        if (event.target.value.length == 19) return;
        $('.payment-icon .cc-visa').removeClass('faded');
        $('.payment-icon .cc-visa').addClass('active');
        $('.payment-icon .cc-american-express').addClass('faded');
        $('.payment-icon .cc-mastercard').addClass('faded');
        $('.payment-icon .cc-discover').addClass('faded');
        $('input[name=cardNumber]').mask('0000 0000 0000 0000', { 'translation': { 0: { pattern: /[0-9]/ } } });
      }else if((stcase > 21 && stcase < 28) || (stcase > 50 && stcase < 56)){
        if (event.target.value.length == 19) return;
        $('.payment-icon .cc-mastercard').removeClass('faded');
        $('.payment-icon .cc-mastercard').addClass('active');
        $('.payment-icon .cc-visa').addClass('faded');
        $('.payment-icon .cc-discover').addClass('faded');
        $('.payment-icon .cc-american-express').addClass('faded');  
        $('input[name=cardNumber]').mask('0000 0000 0000 0000', { 'translation': { 0: { pattern: /[0-9]/ } } });
      }else if((stcase > 56 && stcase <= 59) || (stcase > 66 && stcase < 69) || stcase == 50){
        if (event.target.value.length == 19) return;
        $('#last').addClass('cc-maestro').removeClass('cc-discover');
        $('.payment-icon .cc-maestro').removeClass('faded');
        $('.payment-icon .cc-maestro').addClass('active');
        $('.payment-icon .cc-visa').addClass('faded');
        $('.payment-icon .cc-mastercard').addClass('faded');
        $('.payment-icon .cc-american-express').addClass('faded');   
        $('input[name=cardNumber]').mask('0000 0000 0000 0000', { 'translation': { 0: { pattern: /[0-9]/ } } });
      }
    }
    if(event.target.value.length >= 7){
      if (event.target.value.length == 19) return;
      numbstr = event.target.value.replace(/\s/g,'');
      var ndcase = numbstr.slice(0,6);
      ndcase = parseInt(ndcase);
      if((ndcase >= 601100 && ndcase <= 601109) || (ndcase >= 601120 && ndcase <= 601149) || (ndcase >= 601177 && ndcase <= 601179) || (ndcase >= 601186 && ndcase <= 601199) || (ndcase >= 644000 && ndcase <= 659999) || ndcase == 601174){
        $('.payment-icon .cc-discover').addClass('active');
        $('.payment-icon .cc-discover').removeClass('faded');
        $('.payment-icon .cc-visa').addClass('faded');
        $('.payment-icon .cc-mastercard').addClass('faded');
        $('.payment-icon .cc-american-express').addClass('faded');
      }else if((ndcase >= 300000 && ndcase <= 305999) || (ndcase >= 309500 && ndcase <= 309599) || (ndcase >= 360000 && ndcase <= 369999) || (ndcase >= 380000 && ndcase <= 399999)){
        $('#last').addClass('cc-diners-club').removeClass('cc-discover');
        $('.payment-icon .cc-diners-club').addClass('active');
        $('.payment-icon .cc-diners-club').removeClass('faded');
        $('.payment-icon .cc-visa').addClass('faded');
        $('.payment-icon .cc-mastercard').addClass('faded');
        $('.payment-icon .cc-american-express').addClass('faded');
      }else if((ndcase > 599999 && ndcase <=643999)){
        //$('#last').addClass('cc-maestro').removeClass('cc-discover');
        $('.payment-icon .cc-discover').addClass('active');
        $('.payment-icon .cc-discover').removeClass('faded');
        $('.payment-icon .cc-visa').addClass('faded');
        $('.payment-icon .cc-mastercard').addClass('faded');
        $('.payment-icon .cc-american-express').addClass('faded');
      }
    }
    if(event.target.value.length >= 4){
      numbstr = event.target.value.replace(/\s/g,'');
      var rdcase = numbstr.slice(0,4);
      rdcase = parseInt(rdcase);
      if(rdcase == 2014 || rdcase == 2149){
        $('#last').addClass('cc-enroute').removeClass('cc-discover');
        $('.payment-icon .cc-enroute').addClass('active');
        $('.payment-icon .cc-enroute').removeClass('faded');
        $('.payment-icon .cc-visa').addClass('faded');
        $('.payment-icon .cc-mastercard').addClass('faded');
        $('.payment-icon .cc-american-express').addClass('faded');
      }else if(rdcase >= 3528 && rdcase <= 3589){
        $('#last').addClass('cc-jcb').removeClass('cc-discover');
        $('.payment-icon .cc-jcb').addClass('active');
        $('.payment-icon .cc-jcb').removeClass('faded');
        $('.payment-icon .cc-visa').addClass('faded');
        $('.payment-icon .cc-mastercard').addClass('faded');
        $('.payment-icon .cc-american-express').addClass('faded');
      }
    }
      if($( this ).val() === ''){
          $('.payment-icon .cc-icon').removeClass('inactive active faded');
          $('#last').addClass('cc-discover').removeClass('cc-diners-club cc-enroute cc-jcb cc-maestro');
      }
  });

  // Mailcheck Plugin Code here
  if ($('#email').length > 0) {
    var domains = ['hotmail.com', 'gmail.com', 'aol.com'];
    var topLevelDomains = ["com", "net", "org"];
    $('#email').on('blur', function (event) {
      // console.log("event ", event);
      // console.log("this ", $(this));
      $(this).mailcheck({
        domains: domains,
        topLevelDomains: topLevelDomains,
        suggested: function (element, suggestion) {
          // console.log("suggestion ", suggestion.full);
          $('#email + small').show();
          $('#email + small').html('Did you mean <a href=\'javascript:void(0)\'>' + suggestion.full + '</a>');
        },
        empty: function (element) {
          // console.log("suggestion ", "No suggestion");
        }
      });
    });
    // If user click on the suggested email, it will replace that email with suggested one.
    $('body').on('click', '#email + small a', function () {
      $('#email').val($(this).html());
      $('#email + small').hide();
      $('#email + small').html('Great! We will send you a confirmation e-mail with tracking # after purchasing.');
      if ($('form').length > 0) {
        $('form').formValidation('revalidateField', 'email');
      }
    });
  }
}
validate();