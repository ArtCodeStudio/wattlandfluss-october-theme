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
    // var $form = $el.find('.toolbar-form');
    controller.type = data.type;
    controller.calendar = data.calendar;
    controller.style = data.style;
    controller.events = data.events;
    
    controller.date;
    controller.quantity = 1;
    controller.total = 0;
    
    
    var getValidations = function(event) {
        var validation = {
            valid: true,
            quantity: {
                min: null,
                max: null,
                error: '',
            }
        };
        
        event.prices.forEach(function(priceObj) {
            if(validation.quantity.min === null || priceObj.min < validation.quantity.min) {
                validation.quantity.min = priceObj.min;
            }
            
            if(validation.quantity.max === null || priceObj.max > validation.max) {
                validation.quantity.max = priceObj.max;
            }
        });
        
        return validation;
    };
    
    var validate = function(validation) {
        validation.valid = true;
        
        // quantity
        validation.quantity.error = '';
        if(controller.quantity > validation.quantity.max) {            
            validation.quantity.error = 'Die Anzahl der Personen darf nur maximal '+ validation.quantity.max + ' betragen.';
        }
        
        if(controller.quantity < validation.quantity.min) {
            validation.quantity.error = 'Die Anzahl der Personen muss mindestens '+ validation.quantity.min + ' betragen.';
        }
        
        
        
        if(validation.quantity.error.length) {
            validation.valid = false;
        }

        
        return validation;
    };
    
    controller.event = controller.events[0];
    controller.validation = getValidations(controller.event);
    
    
    controller.onSelectEventChanged = function(selectedEvent) {
        controller.event = controller.events[selectedEvent.index];
        controller.debug('onSelectEventChanged', controller.event);
        controller.total = jumplink.utilities.calcEventTotal(controller.event, controller.quantity);
        controller.validation = getValidations(controller.event);
    };
        
    controller.onDateChanged = function(dates) {
        controller.debug('onDateChanged', dates);
        controller.date = dates[0];
    };
    
    controller.onQuantityChanged = function(event) {
        controller.debug('onQuantityChanged', controller.quantity);
        controller.total = jumplink.utilities.calcEventTotal(controller.event, controller.quantity);
        controller.validation = validate(controller.validation);
    };
    
    controller.onBook = function() {
        controller.debug('onBook');
        // var validator = $form.parsley();
        
        
        // controller.debug(validator.validate());
        // return false; // Don't submit form for tests
    };

    
    controller.selectEventValues = [];
    
    controller.events.forEach(function(event, i) {
        controller.selectEventValues.push({
            index: i,
            label: event.title,
            value: event.id,
        });
    });
    
    controller.date;
        
    return controller;
  }
};
