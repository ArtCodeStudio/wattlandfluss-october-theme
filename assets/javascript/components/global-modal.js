/**
 * A modal component for alerts, do you need to use this component in dom only once
 * and you can call by tigger a global event:
 * @example $.event.trigger('rivets:global-modal', [true, data]);
 * 
 * The data param should have title, body, ..
 * 
 * @events
 *  * rivets:global-modal (event, show, data)
 */
rivets.components['global-modal'] = {

  template: function() {
    // return $('template#global-modal').html();
    return jumplink.templates['global-modal'];
  },

  initialize: function(el, data) {
    var controller = this;
    controller.debug = debug('rivets:global-modal');
    controller.debug('initialize', el, data);
    
    controller.data = {
        title: '',
        body: '',
    };
    
    var $el = $(el);
    var $modal = $el.find('#modal');
    
    /**
     * global event to show / hide this modal 
     * 
     */
    $(document).bind('rivets:global-modal', function (event, show, data) {
        if(show) {
            controller.data = data;
            controller.debug('show', event, show, data, controller.data);
            controller.show(event, controller);
        } else {
            controller.hide(event, controller);
        }
        
    });
    
    $modal.modal({
        show: false,
        focus: false,
        keyboard: true,
        backdrop: true,
    });
    
    controller.toggle = function(event, controller, show) {
        controller.debug('toggle', event, controller, show);
        $modal.modal('toggle');
    };
    
    controller.show = function(event, controller) {
        controller.debug('show', controller.data);
       $modal.modal('show');
    };
    
    controller.hide = function(event, controller) {
       $modal.modal('hide');
    };

    return controller;
  }
};