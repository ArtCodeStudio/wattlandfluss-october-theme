/**
 * Single file of the preview-files component
 */
rivets.components['browser-detection-form'] = {

  template: function() {
    return jumplink.templates['browser-detection-form'];
  },

  initialize: function(el, data) {
    var controller = this;
    controller.debug = window.debug('rivets:browser-detection-form');
    var $el = $(el);
    controller.debug('initialize', $el, data);
    
    // Use MutationObserver instead of deprecated DOMSubtreeModified
    var observer = new MutationObserver(function(mutationsList) {
        // Check if component is ready (has any child elements)
        if($el.children().length > 0) {
            observer.disconnect(); // Stop observing once component is ready
            setTimeout(function() {
                controller.platform = window.jumplink.initBrowserDetection();
            }, 0);
        }
    });
    
    // Start observing the element for child changes
    observer.observe(el, {
        childList: true,
        subtree: true
    });
    
    // Also call immediately in case component is already rendered
    setTimeout(function() {
        if($el.children().length > 0) {
            observer.disconnect();
            controller.platform = window.jumplink.initBrowserDetection();
        }
    }, 0);
    
    return controller;
  }
};