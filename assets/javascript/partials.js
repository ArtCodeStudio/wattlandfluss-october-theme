// JumpLink object
window.jumplink = window.jumplink || {};
window.jumplink.partials = {};

// debugging https://github.com/visionmedia/debug
window.jumplink.debug = window.jumplink.debug || {};
window.jumplink.debug.partials = debug('theme:partials');

/**
 * Search for partials and init them if init function is defined
 * @see https://help.shopify.com/themes/development/theme-editor/partials
 */
window.jumplink.partials.init = function(dataset, data) {
  window.jumplink.debug.partials('init');
  var $partials = $('.jumplink-partial');
  $partials.each(function(index) {
    var $partial = $(this);
    window.jumplink.debug.partials('$partial', $partial);
    var partialID = $partial.data('partialName'); // allways the second class is the partial name
    
    if(window.jumplink.isFunction(window.jumplink.partials[partialID])) {
      window.jumplink.debug.partials('init '+partialID);
      window.jumplink.partials[partialID]($partials, $partial, dataset, data);
    } else {
      window.jumplink.debug.partials('no javascript for partial:', partialID);
    }
  });
};

/**
 * init sections/jumplink-pages.liquid
 * * show fixed logo as svg on page
 * * hide element by scroll down of svg
 */
window.jumplink.partials['jumplink-fixed-logo'] = function($partials, $partial, dataset, data) {
    var partialData = $partial.data();
    var $hideShowElement = $(partialData.hideSelectorOnScroll);
    window.jumplink.debug.partials('init jumplink-fixed-logo', partialData);
    $(window).scroll(function() {
        pos = $(this).scrollTop();        
        if(pos > partialData.offsetInPx) {
            $hideShowElement.fadeOut();
        } else {
            $hideShowElement.fadeIn();
        }
    });
};


