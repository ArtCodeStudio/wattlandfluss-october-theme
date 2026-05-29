// JumpLink object
window.jumplink = window.jumplink || {};
window.jumplink.events = window.jumplink.events || {};

window.jumplink.debug = window.jumplink.debug || {};
window.jumplink.debug.events = debug('theme:events');

/**
 * Unterordner im CMS-Media-Ordner, in den die Event-Bilder migriert wurden.
 * Wird per tools/migrate-event-images.js befüllt und spiegelt den früheren
 * Firebase-Storage-Pfad ( <domain>/events/images/<datei> ).
 */
jumplink.events.MEDIA_SUBFOLDER = 'events/images';

/**
 * Liefert die anzuzeigende Bild-URL für ein Event-Bild.
 *
 * Die Bilder werden nicht mehr aus dem Firebase-Storage geladen, sondern aus
 * dem lokalen Winter-CMS Media-Ordner. Der Dateiname wird – exakt wie im
 * Migrationsskript – aus der (alten) downloadURL abgeleitet, damit on-disk-Name
 * und URL garantiert übereinstimmen (Leerzeichen/Umlaute etc.).
 *
 * Fallback: Steht kein Media-Pfad zur Verfügung oder lässt sich der Dateiname
 * nicht ermitteln, wird die ursprüngliche Firebase-downloadURL verwendet – so
 * funktioniert die Anzeige auch während einer stückweisen Migration weiter.
 */
jumplink.events.getImageUrl = function (image) {
    if (!image) return '';
    var base = (window.jumplink.settings && jumplink.settings.media_path) || '';
    var downloadURL = image.downloadURL || '';
    if (!base) return downloadURL;
    // downloadURL: https://firebasestorage.googleapis.com/v0/b/<bucket>/o/<urlenc-pfad>?alt=media&token=...
    var match = downloadURL.match(/\/o\/([^?]+)/);
    if (!match) {
        // Bild ohne Firebase-URL: ggf. nur der Dateiname in den Metadaten
        var metaName = image.metadata && image.metadata.name;
        if (metaName) return base + jumplink.events.MEDIA_SUBFOLDER + '/' + encodeURIComponent(metaName);
        return downloadURL;
    }
    var objectPath = decodeURIComponent(match[1]); // <domain>/events/images/<datei>
    var name = objectPath.substring(objectPath.lastIndexOf('/') + 1);
    return base + jumplink.events.MEDIA_SUBFOLDER + '/' + encodeURIComponent(name);
};

/**
 * Lokale Plugin-API (JumpLink.Events) – einzige Datenquelle für Führungen
 * (Kalender, Events, Buchungen). Ersetzt die frühere Firebase/Firestore-Lösung.
 */
jumplink.events.api = {
    base: (window.jumplink.settings && jumplink.settings.events_api_base) || '/api/jumplink/events'
};

/** GET-Request gegen die lokale API, liefert ein natives Promise mit JSON. */
jumplink.events.apiGet = function(path, params) {
    var url = jumplink.events.api.base + path;
    return new Promise(function(resolve, reject) {
        $.ajax({ url: url, method: 'GET', dataType: 'json', data: params || {} })
            .done(function(data) { resolve(data); })
            .fail(function(xhr) { reject(new Error('API-Fehler ' + xhr.status + ' bei ' + url)); });
    });
};

/** POST-Request gegen die lokale API (JSON), liefert ein natives Promise. */
jumplink.events.apiPost = function(path, payload) {
    var url = jumplink.events.api.base + path;
    return new Promise(function(resolve, reject) {
        $.ajax({
            url: url, method: 'POST', dataType: 'json',
            contentType: 'application/json', data: JSON.stringify(payload || {})
        })
            .done(function(data) {
                if (data && data.success === false) {
                    reject(data);
                } else {
                    resolve(data);
                }
            })
            .fail(function(xhr) {
                var res = xhr.responseJSON || { error: 'API-Fehler ' + xhr.status };
                reject(res);
            });
    });
};

/**
 * Buchungsanfrage an die lokale API senden, liefert ein Promise.
 */
jumplink.events.requestBooking = function(form, event) {
    var payload = {
        event_id:  event && event.id,
        handle:    event && event.handle,
        title:     event && event.title,
        calendar:  event && event.calendar,
        firstname: form.name,
        lastname:  form.lastname,
        email:     form.email,
        phone:     form.phone,
        street:    form.street,
        zip:       form.zip,
        quantity:  form.quantity,
        total:     form.total,
        date:      form.date
    };
    return jumplink.events.apiPost('/book', payload);
};

/** Events aus der lokalen API (gleiche Signatur wie jumplink.events.get). */
jumplink.events.getFromApi = function(hasType, hasActive, hasCalendar, startTimeIs, excludeCalendar, groupBy, limit) {
    var params = {
        type: hasType || 'all',
        calendar: (jumplink.utilities.isString(hasCalendar) && hasCalendar.length) ? hasCalendar : 'all',
        excludeCalendar: jumplink.utilities.isString(excludeCalendar) ? excludeCalendar : 'none',
        active: (hasActive === true || hasActive === false) ? String(hasActive) : 'all',
        startTime: startTimeIs || 'all',
        limit: limit || 0
    };
    return jumplink.events.apiGet('/events', params).then(function(rawEvents) {
        var events = [];
        rawEvents.forEach(function(event) {
            event = jumplink.events.parse(event);
            if (jumplink.utilities.isString(groupBy) && groupBy !== 'none') {
                jumplink.events.pushGroupedByProperty(events, event, groupBy);
            } else {
                events.push(event);
            }
        });
        jumplink.debug.events('getFromApi', events);
        return events;
    });
};

jumplink.events.getByIdFromApi = function(id) {
    return jumplink.events.apiGet('/events', { id: id }).then(function(rawEvents) {
        if (!rawEvents || !rawEvents.length) return null;
        return jumplink.events.parse(rawEvents[0]);
    });
};

jumplink.events.getByTitleFromApi = function(title) {
    return jumplink.events.apiGet('/events', { title: title }).then(function(rawEvents) {
        return (rawEvents || []).map(function(event) { return jumplink.events.parse(event); });
    });
};

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
        // Keine passende Preisstufe für diese Personenzahl – normal bei
        // "auf Anfrage"-Touren ohne (passende) Staffel. Kein Fehler.
        window.jumplink.debug.events('calcEventTotal: keine passende Preisstufe für Menge', quantity);
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
            var value = form[key];
            var isEmpty =
                jumplink.utilities.isUndefined(value) ||
                value === null ||
                (jumplink.utilities.isString(value) && value.replace(/\s/g, '').length <= 0) ||
                (typeof value === 'number' && isNaN(value));
            if(isEmpty) {
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

    // Fallback, falls keine (gültige) Staffel vorhanden ist – sonst würde die
    // Mindestanzahl-Prüfung übersprungen und "0 Teilnehmer" durchrutschen.
    if(!jumplink.utilities.isNumber(validation.quantity.min) || validation.quantity.min < 1) {
        validation.quantity.min = 1;
    }
    if(!jumplink.utilities.isNumber(validation.quantity.max) || validation.quantity.max < validation.quantity.min) {
        validation.quantity.max = 99;
    }

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
        name: jumplink.settings.theme.owner_name || '',
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
    return jumplink.events.getByIdFromApi(id);
};

/**
 *  Get event by title and set it to the forms
 */
jumplink.events.getByTitle = function (title) {
    jumplink.debug.events('getByTitle', title);
    return jumplink.events.getByTitleFromApi(title);
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
    return jumplink.events.getFromApi(hasType, hasActive, hasCalendar, startTimeIs, excludeCalendar, groupBy, limit);
};

jumplink.events.parse = function(event) {
    // Datumsfelder der lokalen API (ISO-Strings) in Date-Objekte wandeln.
    ['startAt', 'endAt'].forEach(function(key) {
        var value = event[key];
        if (!value || value.getMonth) {
            return; // leer oder bereits ein Date-Objekt
        }
        event[key] = new Date(value);
    });
    return event;
};