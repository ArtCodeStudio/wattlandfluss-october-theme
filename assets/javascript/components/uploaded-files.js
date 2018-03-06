/**
 * Component to show uploaded files or files added to a event
 */
rivets.components['uploaded-files'] = {

  template: function() {
    // return $('template#uploaded-files').html();
    return jumplink.templates['uploaded-files'];
  },

  initialize: function(el, data) {
    var controller = this;
    controller.debug = debug('rivets:uploaded-files');
    controller.debug('initialize', el, data);
    var $el = $(el);
    controller.files = data.files;
    controller.label = data.label || 'Files';
    
    /**
     * Called if clicked delete button on uploaded-file component template
     */
    controller.delete = function(event, file) {
        var $this = $(event.target);
        controller.debug('[delete]');
        var index = controller.files.indexOf(file);
        if(index !== -1) {
        	controller.files.splice(index, 1);
        }
    }
    
    return controller;
  }
};