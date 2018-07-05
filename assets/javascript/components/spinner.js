/**
 * Single file of the preview-files component
 */
rivets.components.spinner = {

  template: function() {
    // return $('template#spinner').html();
    return jumplink.templates.spinner;
  },

  initialize: function(el, data) {
    var controller = this;
    controller.debug = debug('rivets:spinner');
    controller.debug('initialize', el, data);
    var $el = $(el);
    controller.name = data.name;    
    
    if(data.colorClass) {
        $el.find('[data-color="bg"]').addClass('bg-' + data.colorClass);
        $el.find('[data-color="bg-before"]').addClass('bg-' + data.colorClass + '-before');
    }
    
    return controller;
  }
};