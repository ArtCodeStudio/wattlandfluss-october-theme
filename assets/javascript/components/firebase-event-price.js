/**
 * Single file of the preview-files component
 */
rivets.components['firebase-event-price'] = {

  template: function() {
    return jumplink.templates['firebase-event-price'];
  },

  initialize: function(el, data) {
    var controller = this;
    controller.debug = debug('rivets:firebase-event-price');
    var $el = $(el);
    controller.debug('initialize', $el, data);
    controller.event = data.event;
    
    return controller;
  }
};
