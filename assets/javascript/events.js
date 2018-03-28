// JumpLink object
window.jumplink = window.jumplink || {};
window.jumplink.events = window.jumplink.events || {};

window.jumplink.debug = window.jumplink.debug || {};
window.jumplink.debug.events = debug('theme:events');

/**
 * Gibt den Staffelpreis (der für die Anzahl der Personen passt) zurück
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

jumplink.events.getDefaultPrice = function () {
    return {
        price: 0,
        fixprice: 0,
        unit: 'person',
        min: 1,
        max: 1,
        eachAdditionalUnit: false,
    };
};

jumplink.events.getDefaultNotification = function () {
    return {
        email: jumplink.settings.theme.email_address || '',
        name: jumplink.settings.theme.site_name || '',
    };
};


/**
 * Gets the default values for an event e.g. if you want to create a new one
 */
jumplink.events.getDefaultValues = function (calendars, types) {
    
    var event = {};
    
    event.active = true;

    event.images = [];
    
    event.calendar = calendars[0].value;
    event.type = types[0].value;
    
    // start and end time
    event.startAt = moment().format('YYYY-MM-DD');
    event.showTimes = true;
    event.startTimeAt = '14:00';
    event.endTimeAt = '16:00';
    
    // title, subtitle
    event.title = '';
    event.subtitle = '';
    
    // additional attributes TODO move to custom attributes form in calendar settings
    event.offer = '';
    event.location = '';
    event.equipment = '';
    
    // textareas description and note
    event.description = '';
    event.note = '';
    
    // price
    event.prices = [jumplink.events.getDefaultPrice()];
    event.pricetext = '';
    
    // notifications
    event.notifications = [jumplink.events.getDefaultNotification()];
    
    return event;
};
    
jumplink.events.getDatabaseCollection = function() {
    var dbEvents = db.collection('customerDomains').doc(jumplink.firebase.config.customerDomain).collection('events');
    return dbEvents;
};

/**
 * prepair event object to store in firebase datastore database
 */
jumplink.events.prepairForFirestore = function(event) {
    
    var newEvent = {
        handle: rivets.formatters.handleize(event.title),
        active: event.active,
        title: event.title,
        subtitle: event.subtitle,
        description: event.description,
        showTimes: event.showTimes,
        startAt: moment(event.startAt),
        endAt: moment(event.startAt),
        prices: event.prices,
        pricetext: event.pricetext || null,
        notifications: event.notifications,
        type: event.type,
        calendar: event.calendar,
        
        // additional attributes
        offer: event.offer || null,
        location: event.location || null,
        equipment: event.equipment || null,
        
        note: event.note || null,
        images: event.images,
        price: null,
    };

    // split times in hour and minutes
    var startTimes = event.startTimeAt.split(':');
    var endTimes = event.endTimeAt.split(':');
    
    // set time to start and end date
    newEvent.startAt.hour(startTimes[0]);
    newEvent.startAt.minute(startTimes[1]);
    newEvent.endAt.hour(endTimes[0]);
    newEvent.endAt.minute(endTimes[1]);
    
    // firestore need the default date object to store
    newEvent.startAt = newEvent.startAt.toDate();
    newEvent.endAt = newEvent.endAt.toDate();
    
    // Merge old images with new uploaded images
    if(!jumplink.utilities.isArray(newEvent.images)) {
        jumplink.debug.events('no images are set, init image object with empty array!');
        newEvent.images = [];
    }
    
    return newEvent;
};

/**
 * Get event from array by property and value
 */
jumplink.events.getByPropertyFromArray = function(events, property, value) {
    var foundEvent = null;
    events.forEach(function(event) {
        if(event[property] && event[property] === value) {
            foundEvent = event;
            return foundEvent;
        }
    });
    return foundEvent;
};

/**
 * Push a new event to events array but group it by property like `handle`
 * @param events The array you want to push the event to
 * @param event The event to group or push
 * @param groupBy The property name you want to group the events, events with the same propertie value will be grouped 
 */
jumplink.events.pushGroupedByProperty = function(events, event, groupBy) {
    switch(groupBy) {
        // supported properties
        case 'title':
        case 'subtitle':
        case 'handle':
            var alreadyPushedEvent = jumplink.events.getByPropertyFromArray(events, groupBy, event[groupBy]);
            if(alreadyPushedEvent === null) {
                // push event as new event to default list
                events.push(event);
                return event;
            }
            // check if event has allready a groupedEvents array otherwise create it
            if(!jumplink.utilities.isArray(alreadyPushedEvent.groupedEvents)) {
                alreadyPushedEvent.groupedEvents = [];
            }
            // push event to existing event
            alreadyPushedEvent.groupedEvents.push(event);
            return alreadyPushedEvent;
        // properties they will just pushed without grouping
        default:
            events.push(event);
            break;
            
    }
    return event;
};

/**
 *  Get event by id and set it to the forms
 */
jumplink.events.getById = function (id) {
    jumplink.debug.events('getById', id);
    
    var dbEvents = jumplink.events.getDatabaseCollection();
    
    try {
        return dbEvents.doc(id).get()
        .then(function(docRef) {
            if (!docRef.exists) {
                var error = new Error('Event not found!');
                jumplink.debug.events(error);
                return null;
            }
            jumplink.debug.events('getById start', docRef.data());
            var event = docRef.data();
            event.id = docRef.id;
            return event;
        });
    }
    catch(error) {
        return new Promise(function(resolve, reject) {
            reject(error);
        });
    }
};

/**
 *  Get event by title and set it to the forms
 */
jumplink.events.getByTitle = function (title) {
    jumplink.debug.events('getByTitle', title);
    
    var ref = jumplink.events.getDatabaseCollection();
    
    ref = ref.where('title', "==", title);
    
    ref = ref.orderBy("startAt");
    
    try {
        return ref.get()
        .then(function(querySnapshot) {
            var events = [];
            querySnapshot.forEach((doc) => {
                var event = doc.data();
                event.id = doc.id;
                events.push(event);
            });
            return events;
        });
    }
    catch(error) {
        return new Promise(function(resolve, reject) {
            reject(error);
        });
    }
};

/**
 * Get events with filters
 * 
 * @param events the events
 * @param hasType 'fix' | 'variable' | 'all'
 * @param hasActive true | false | 'all'
 * @param hasCalendar '{string} | 'all'
 * @param startTimeIs 'future' | 'past' | 'all'
 * @param excludeCalendar {string} | 'none'
 * @param groupBy 'none' | 'handle'
 * @param limit {number}
 */
jumplink.events.get = function(hasType, hasActive, hasCalendar, startTimeIs, excludeCalendar, groupBy, limit) {
    // delete old getted events
    events = [];
    var ref = jumplink.events.getDatabaseCollection();
    
    // set type filter
    switch (hasType) {
        case 'fix':
        case 'variable':
            ref = ref.where('type', "==", hasType);
            break;
        case 'all':
            // all types
            ref = ref;
            break;
        default:
            // all types
            ref = ref;
            break;
    }
    
    switch(hasActive) {
        case true:
        case false:
            ref = ref.where('active', "==", hasActive);
            break;
        case 'all':
            ref = ref;
            break;
        default:
            // all
            ref = ref;
            break;
    }
    
    // set calendar filter
    if(jumplink.utilities.isString(hasCalendar) && hasCalendar.length && hasCalendar !== 'all') {
        ref = ref.where('calendar', "==", hasCalendar);
    } else {
        // all calendars
        ref = ref;
    }
    
    // get events only in future
    if(hasType !== 'variable') {
        var now = new Date();
        switch(startTimeIs) {
            case 'future':
                jumplink.debug.events('get events in future from', now);
                ref = ref.where('startAt', ">=", now);
                break;
            case 'past':
                jumplink.debug.events('get events from the past in reference to', now);
                ref = ref.where('startAt', "<", now);
                break;
            case 'all':
                jumplink.debug.events('get events from the past and in the future');
                ref = ref;
                break;
            default:
                jumplink.debug.events('get events from the past and in the future');
                ref = ref;
                break;
        }
    }
    
    if(!jumplink.utilities.isString(excludeCalendar)) {
        excludeCalendar = 'none';
    }
    
    /**
     * Only set limit if no exclude is set otherwise limit is not working
     * If excludes is set we have a client site limit implement with a counter (search for 'count')
     */
    if (excludeCalendar === 'none' && limit >= 1) {
        jumplink.debug.events('set limit of orders to', limit);
        ref = ref.limit(limit);
    }

    
    // set order
    ref = ref.orderBy("startAt");
    
    return ref.get()
    .then((querySnapshot) => {
        //yevents = querySnapshot.data();
        jumplink.debug.events('event', querySnapshot);
        var count = 0;
        querySnapshot.forEach((doc) => {
            // own client site limit to make excludeCalendar working
            if(count <= limit) {
                var event = doc.data();
                event.id = doc.id;
                if(event.calendar !== excludeCalendar) {
                    count++;
                    if(jumplink.utilities.isString(groupBy) && groupBy !== 'none') {
                        jumplink.events.pushGroupedByProperty(events, event, groupBy);
                    } else {
                        events.push(event);
                    }
                }
            }
        });
        return events;
    });
};

/**
 * Create new event
 */
jumplink.events.add = function(event, uploadedImages) {
    
    var dbEvents = jumplink.events.getDatabaseCollection();

    var newEvent = jumplink.events.prepairForFirestore(event, uploadedImages);
    
    if(jumplink.utilities.isArray(uploadedImages)) {
        newEvent.images.push.apply(newEvent.images, uploadedImages);
    }
    
    jumplink.debug.events('[createEvent]', newEvent);

    try {
        return dbEvents.add(newEvent)
        .then(function(result) {        
            jumplink.debug.events('[createEvent] result', result);
            return result;
        });
    }
    catch(error) {
        return new Promise(function(resolve, reject) {
            reject(error);
        });
    }

};

jumplink.events.update = function(id, event, uploadedImages) {
    var dbEvents = jumplink.events.getDatabaseCollection();
    var updateEvent = jumplink.events.prepairForFirestore(event, uploadedImages);
    jumplink.debug.events('updateEvent', id, updateEvent);
    try {
        return dbEvents.doc(id).update(updateEvent);
    }
    catch(error) {
        return new Promise(function(resolve, reject) {
            reject(error);
        });
    }
};