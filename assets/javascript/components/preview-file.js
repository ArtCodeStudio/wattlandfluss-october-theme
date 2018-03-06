/**
 * Single file of the preview-files component
 */
rivets.components['preview-file'] = {

  template: function() {
    // return $('template#preview-file').html();
    return jumplink.templates['preview-file'];
  },

  initialize: function(el, data) {
    var controller = this;
    controller.debug = debug('rivets:preview-file');
    controller.debug('initialize', el, data);
    var $el = $(el);
    controller.file = data.file;
    
    return controller;
  }
};
