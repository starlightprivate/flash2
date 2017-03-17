/* global DOMPurify:true jQuery:true*/
/* eslint no-undef: "error"*/

(($) => { // eslint-disable-line no-await-in-loop, require-await
  $.fn.unval = $.fn.val; // eslint-disable-line no-param-reassign
  $.fn.val = function (value) { // eslint-disable-line no-param-reassign, func-names
    if (arguments.length >= 1) {
      return $.fn.unval
             .call(this, DOMPurify.sanitize(value)); // eslint-disable-line babel/no-invalid-this
    }
    return DOMPurify
            .sanitize($.fn.unval.call(this)); // eslint-disable-line babel/no-invalid-this
  };
})(jQuery);
