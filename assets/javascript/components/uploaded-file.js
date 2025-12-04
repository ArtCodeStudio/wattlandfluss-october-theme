/**
 * Single file of the uploaded-files component
 */
rivets.components['uploaded-file'] = {

  template: function() {
    // return $('template#uploaded-file').html();
    return jumplink.templates['uploaded-file'];
  },

  initialize: function(el, data) {
    var controller = this;
    controller.debug = window.debug('rivets:uploaded-file');
    controller.debug('initialize', el, data);
    var $el = $(el);
    controller.file = data.file;
    
    /**
     * Called if clicked delete button in this component template
     */
    controller.delete = function(event, controller) {
        controller.debug('[delete]');
        data.onDelete(event, controller.file);
    };
    
    return controller;
  }
};