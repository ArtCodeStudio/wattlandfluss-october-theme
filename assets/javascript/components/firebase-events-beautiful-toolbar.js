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
    
    controller.name = '';
    controller.lastname = '';
    controller.email = '';
    controller.phone = '';
    controller.street = '';
    controller.zip = '';
    
    
    var getValidations = function(event) {
        var validation = {
            valid: true,
            quantity: {
                required: true,
                min: null,
                max: null,
                error: '',
            },
            name: {
                required: true,
                minlength: 3,
                error: '',
            },
            lastname: {
                required: true,
                minlength: 3,
                error: '',
            },
            email: {
                required: true,
                isEmail: true,
                minlength: 3,
                error: '',
            },
            phone: {
                required: false,
                onlyNumbers: true,
                minlength: 4,
                error: '',
            },
            street: {
                required: false,
                minlength: 3,
                error: '',
            },
            zip: {
                required: false,
                onlyNumbers: true,
                minlength: 3,
                error: '',
            },
        };
        
        event.prices.forEach(function(priceObj) {
            if(validation.quantity.min === null || priceObj.min < validation.quantity.min) {
                validation.quantity.min = priceObj.min;
            }
            
            if(validation.quantity.max === null || priceObj.max > validation.quantity.max) {
                validation.quantity.max = priceObj.max;
            }
        });
        
        return validation;
    };
    
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
        
        keys.forEach(function(key) {
            validation[key].error = '';
            
            // value is requred
            if(validation[key].required) {
                if(jumplink.utilities.isString(controller[key])) {
                    if(controller[key].length <= 0) {
                        validation[key].error = 'Dieses Feld ist erforderlich.';
                    }
                }
                
                if(jumplink.utilities.isUndefined(controller[key])) {
                    validation[key].error = 'Dieses Feld ist erforderlich.';
                }
            }
            
            // validation for numbers
            if(jumplink.utilities.isNumber(controller[key])) {
                
                // maximum value for number 
                if(jumplink.utilities.isNumber(validation[key].max)) {
                    if(controller[key] > validation[key].max) {            
                        validation[key].error = 'Die Anzahl darf nur maximal '+ validation[key].max + ' betragen.';
                    }
                }
                
                // minimum value for number 
                if(jumplink.utilities.isNumber(validation[key].min)) {
                    if(controller[key] < validation[key].min) {            
                        validation[key].error = 'Die Anzahl darf nur mindestens '+ validation[key].min + ' betragen.';
                    }
                }
            }
            
            // validation for strings
            if(jumplink.utilities.isString(controller[key]) && controller[key].length >= 1 ) {
                
                // maximum value for string length 
                if(jumplink.utilities.isNumber(validation[key].maxlength)) {
                    if(controller[key].length > validation[key].maxlength) {            
                        validation[key].error = 'Die Anzahl der Zeichen darf nur maximal '+ validation[key].maxlength + ' betragen.';
                    }
                }
                
                // minimum value for string length 
                if(jumplink.utilities.isNumber(validation[key].minlength)) {
                    if(controller[key].length < validation[key].minlength) {            
                        validation[key].error = 'Die Anzahl der Zeichen muss mindestens '+ validation[key].minlength + ' betragen.';
                    }
                }
                
                // email
                if(validation[key].isEmail) {
                    if(controller[key].indexOf('@') <= -1) {
                        validation[key].error = 'Die E-Mail muss ein @ enthalten.';
                    }
                    
                    if(controller[key].indexOf('.') <= -1) {
                        validation[key].error = 'Die E-Mail muss ein Punkt enthalten.';
                    }
                }
                
                // only numbers
                if(validation[key].onlyNumbers) {
                    if(!jumplink.utilities.stringHasOnlyNumbers(controller[key])) {            
                        validation[key].error = 'Der Wert darf nur Nummern enthalten.';
                    }
                }
            }
            
            // is all valid?
            if(validation[key].error.length) {
                validation.valid = false;
            }
        });

        controller.debug('validate', validation);        
        return validation;
    };
    
    var collapse = function(action) {
        $el.find('.collapse').collapse(action);
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
        controller.validation = validate(controller.validation, ['quantity']);
    };
    
    controller.onFormChanged = function(event) {
        var $form = $(event.target);
        var name = $form.attr('name');
        controller.debug('onInputhanged', name);
        controller.validation = validate(controller.validation, [name]);
    };
    
    controller.onBook = function() {
        controller.debug('onBook');
        controller.validation = validate(controller.validation);
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
    

    
    $(document).on('click', function() {
        collapse('hide');
    });
    
    $el.on('click', function() {
        collapse('show');
        event.stopPropagation();
    });
        
    return controller;
  }
};
