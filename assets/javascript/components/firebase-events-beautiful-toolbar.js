/**
 * firebase-events-beautiful-toolbar
 */
rivets.components['firebase-events-beautiful-toolbar'] = {
  template: function() {
    return jumplink.templates['firebase-events-beautiful-toolbar'];
  },

  initialize: function(el, data) {
    var controller = this;
    controller.debug = debug('rivets:firebase-events-beautiful-toolbar');
    controller.debug('initialize', el, data);
    var $el = $(el);

    controller.type = data.type;
    controller.calendar = data.calendar;
    controller.style = data.style;
    controller.events = data.events;
    
    controller.date;
    controller.quantity = 1;
    controller.total = 0;
    
    controller.name = '';
    controller.lastname = '';
    controller.email = '';
    controller.phone = '';
    controller.street = '';
    controller.zip = '';
    
    /**
     * validate form, if keys is undefined all keys will be validated
     * @param validation object with the validation rules
     * @param keys keys you want to validate
     */
    var validate = function(validation, keys) {
        validation.valid = true;
        
        if(jumplink.utilities.isUndefined(keys)) {
            keys = ['quantity', 'name', 'lastname', 'email', 'phone', 'street', 'zip'];
        }
        
        return jumplink.events.validate(validation, controller, keys);
    };
    
    var collapse = function(action) {
        $el.find('.collapse').collapse(action);
    };
        
    controller.onSelectEventChanged = function(selectedEvent) {
        controller.event = controller.events[selectedEvent.index];
        controller.debug('onSelectEventChanged', controller.event);
        controller.total = jumplink.events.calcEventTotal(controller.event, controller.quantity);
        controller.validation = jumplink.events.getValidationsForEvent(controller.event);
        controller.validation = validate(controller.validation, ['quantity']);
    };
        
    controller.onDateChanged = function(dates) {
        controller.debug('onDateChanged', dates);
        controller.date = dates[0];
    };
    
    controller.onQuantityChanged = function(event) {
        controller.debug('onQuantityChanged', controller.quantity);
        controller.total = jumplink.events.calcEventTotal(controller.event, controller.quantity);
        controller.validation = validate(controller.validation, ['quantity']);
    };
    
    controller.onFormChanged = function(event) {
        var $form = $(event.target);
        var name = $form.attr('name');
        controller.debug('onInputhanged', name);
        controller.validation = validate(controller.validation, [name]);
    };
    
    /**
     * Aks for booking this event by send a octobercms request with the informations from the form.
     * The PHP funtion `onReguestEvent` is defined in the layout file
     * 
     * @see https://octobercms.com/docs/ajax/javascript-api
     */
    controller.onBook = function() {
        controller.debug('onBook');
        controller.validation = validate(controller.validation, ['quantity', 'name', 'lastname', 'email', 'phone', 'street', 'zip']);
        // var validator = $form.parsley();
        
        if(controller.validation.valid) {
            // use the october cms javascript api function
            $.request('onReguestEvent', {
                data: {
                    event: controller.event,
                    date: controller.date.format('DD.MM.YYYY'),
                    quantity: controller.quantity,
                    total: controller.total,
                    name: controller.name,
                    lastname: controller.lastname,
                    email: controller.email,
                    phone: controller.phone,
                    street: controller.street,
                    zip: controller.zip,
                },
                success: function(data) {
                    this.success(data).done(function() {
                        controller.debug('reuqest success', data);
                        
                        var message = 'Anfrage erfolgreich abgeschickt.';
                        var notification = alertify.notify(message, 'success' ,5, function(){
                            
                        });
                        
                        collapse('hide');
                        
                    });
                }
            });
        } else {
            var message = 'Bitte überprüfen Sie Ihr Eingabeformular';
            var notification = alertify.notify(message, 'error' ,5, function(){
                
            });
            
            collapse('show');
        }
    };

    controller.selectEventValues = [];
    
    controller.events.forEach(function(event, i) {
        controller.selectEventValues.push({
            index: i,
            label: event.title,
            value: event.id,
        });
    });
    
    $(document).on('click', function() {
        collapse('hide');
    });
    
    $el.on('click', function() {
        collapse('show');
        event.stopPropagation();
    });
        
    $el.one('DOMSubtreeModified', function() {
        setTimeout(function() {
            controller.onSelectEventChanged({index: 0});
            controller.onDateChanged([moment()]);
            controller.validation = jumplink.events.getValidationsForEvent(controller.event);
        }, 0);     
    });
        
    return controller;
  }
};
