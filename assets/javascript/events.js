// JumpLink object
window.jumplink = window.jumplink || {};
window.jumplink.events = window.jumplink.events || {};

window.jumplink.debug = window.jumplink.debug || {};
window.jumplink.debug.events = debug('theme:events');

/**
 * Gibt den Staffelpreis (der für die Anzahl der Personen passt) zurück
 * TODO move to events
 */
jumplink.events.getEventScalePriceByQuantity = function(event, quanity) {
    var result = null;
    
    event.prices.forEach(function(priceObj) {
        if(quanity >= priceObj.min && quanity <= priceObj.max) {
            result = priceObj;
        }
    });
    return result;
};

/**
 * Gesamtpreis eines Events berechnen
 * TODO move to events
 */
jumplink.events.calcEventTotal = function (event, quantity) {
    var priceObj = jumplink.events.getEventScalePriceByQuantity(event, quantity);
    var total = 0;
    if(priceObj === null) {
        var warn = new Error('Kein Staffelpreis gefunden, TODO handle error');
        window.jumplink.debug.events(warn);
        return null;
    }
    
    // Wenn nur jede zusätzliche Person gezählt werden soll
    if(priceObj.eachAdditionalUnit) {
        quantityToCalc = quantity - (priceObj.min - 1);
    } else {
        quantityToCalc = quantity;
    }
    
    total = priceObj.fixprice + (priceObj.price * quantityToCalc);
    
    return total;
};

/**
 * validate form
 * @param validation object with the validation rules
 * @param the form with the values from the form
 * @param keys keys you want to validate
 */
jumplink.events.validate = function(validation, form, keys) {
    validation.valid = true;
    
    keys.forEach(function(key) {
        validation[key].error = '';
        
        // value is requred
        if(validation[key].required) {
            if(jumplink.utilities.isString(form[key])) {
                if(form[key].length <= 0) {
                    validation[key].error = 'Dieses Feld ist erforderlich.';
                }
            }
            
            if(jumplink.utilities.isUndefined(form[key])) {
                validation[key].error = 'Dieses Feld ist erforderlich.';
            }
        }
        
        // validation for numbers
        if(jumplink.utilities.isNumber(form[key])) {
            
            // maximum value for number
            if(jumplink.utilities.isNumber(validation[key].max)) {
                if(form[key] > validation[key].max) {            
                    validation[key].error = 'Die Anzahl darf nur maximal '+ validation[key].max + ' betragen.';
                }
            }
            
            // minimum value for number
            if(jumplink.utilities.isNumber(validation[key].min)) {
                if(form[key] < validation[key].min) {            
                    validation[key].error = 'Die Anzahl darf nur mindestens '+ validation[key].min + ' betragen.';
                }
            }
        }
        
        // validation for strings
        if(jumplink.utilities.isString(form[key]) && form[key].length >= 1 ) {
            
            // maximum value for string length 
            if(jumplink.utilities.isNumber(validation[key].maxlength)) {
                if(form[key].length > validation[key].maxlength) {            
                    validation[key].error = 'Die Anzahl der Zeichen darf nur maximal '+ validation[key].maxlength + ' betragen.';
                }
            }
            
            // minimum value for string length 
            if(jumplink.utilities.isNumber(validation[key].minlength)) {
                if(form[key].length < validation[key].minlength) {            
                    validation[key].error = 'Die Anzahl der Zeichen muss mindestens '+ validation[key].minlength + ' betragen.';
                }
            }
            
            // email
            if(validation[key].isEmail) {
                if(form[key].indexOf('@') <= -1) {
                    validation[key].error = 'Die E-Mail muss ein @ enthalten.';
                }
                
                if(form[key].indexOf('.') <= -1) {
                    validation[key].error = 'Die E-Mail muss ein Punkt enthalten.';
                }
            }
            
            // phone number
            if(validation[key].isPhone) {
                if(!jumplink.utilities.stringIsPhoneNumber(form[key])) {
                    validation[key].error = 'Die Telefonnummer darf nur Zahlen, +, -, ( und ) enthalten.';
                }
            }
            
            
            // only numbers
            if(validation[key].onlyNumbers) {
                if(!jumplink.utilities.stringHasOnlyNumbers(form[key])) {            
                    validation[key].error = 'Der Wert darf nur Nummern enthalten.';
                }
            }
        }
        
        // is all valid?
        if(validation[key].error.length) {
            validation.valid = false;
        }
    });

    window.jumplink.debug.events('validate', validation);        
    return validation;
};

/**
 * Get validation rules for a event book form
 */
jumplink.events.getValidationsForEvent = function(event) {
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
            isPhone: true,
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