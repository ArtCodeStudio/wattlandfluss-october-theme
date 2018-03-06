/**
 * Component to show files they will be uploaded, similar to uploaded-files but shown before the upload is complete
 */
rivets.components['preview-files'] = {

  template: function() {
    // return $('template#preview-files').html();
    return jumplink.templates['preview-files'];
  },

  initialize: function(el, data) {
    var controller = this;
    controller.debug = debug('rivets:preview-files');
    controller.debug('initialize', el, data);
    var $el = $(el);
    controller.files = data.files;
    controller.label = data.label || 'Files';
        
    return controller;
  }
};
