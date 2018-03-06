/**
 * rv-checkbox
 */
rivets.components['rv-checkbox'] = {
  template: function() {
    return jumplink.templates['rv-checkbox'];
  },
  initialize: function(el, data) {
    var controller = this;
    controller.debug = debug('rivets:rv-checkbox');
    controller.debug('initialize', el, data);
    var $el = $(el);
    var $checkbox = $el.find('input[type="checkbox"]');
    
    controller.ready = false;
    controller.label = data.label;
    controller.description = data.description;
    controller.values = data.values;
    controller.id = data.id ? 'rv-checkbox-'+data.id : Date.now();
    controller.checked = data.default;
    jumplink.utilities.setCheckboxValue($checkbox, controller.checked);
        
    $checkbox.change(function() {
        controller.checked = $checkbox.is(":checked");
        controller.debug('changed', controller.checked);
        if (jumplink.utilities.isFunction(data.onChange)) {
            data.onChange(controller.checked);
        }
    });
    
    setTimeout(function() {
        controller.ready = true;
    },0);
    
    
    return controller;
  }
};