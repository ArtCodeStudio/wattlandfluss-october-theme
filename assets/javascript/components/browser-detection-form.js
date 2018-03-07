/**
 * Single file of the preview-files component
 */
rivets.components['browser-detection-form'] = {

  template: function() {
    return jumplink.templates['browser-detection-form'];
  },

  initialize: function(el, data) {
    var controller = this;
    controller.debug = debug('rivets:browser-detection-form');
    var $el = $(el);
    controller.debug('initialize', $el, data);
    
    $el.one('DOMSubtreeModified', function() {
        setTimeout(function() {
            controller.platform = window.jumplink.initBrowserDetection();
        }, 0);    
        
    });
    

    
    return controller;
  }
};