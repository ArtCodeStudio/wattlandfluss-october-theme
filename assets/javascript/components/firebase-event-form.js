/**
 * Component to create or update events in firebase
 * types:
 *  * fix (event with date)
 * * variable (event without date)
 */
rivets.components['firebase-event-form'] = {

  template: function() {
    return jumplink.templates['firebase-event-form'];
  },

  initialize: function(el, data) {
    var controller = this;
    controller.debug = window.debug('rivets:firebase-event-form');
    controller.debug('initialize', el, data);
    
    var $el = $(el);
    var db = firebase.firestore();
    
    var dbEvents = db.collection('customerDomains').doc(jumplink.firebase.config.customerDomain).collection('events');
    var $eventDesc = $(el).find('#eventDesc');
    var $eventNote = $(el).find('#eventNote');    
    
    controller.showTimesChanged = function(showTimes) {
        controller.debug('showTimesChanged', showTimes);
        controller.event.showTimes = showTimes;
    };    
    
    controller.onStartAtChanged = function(startAt) {
        controller.event.startAt = date[0].format('YYYY-MM-DD');
    };
    
    // if id is set the event will be updated otherwise it will be created
    controller.id = data.id;
    controller.titleEdit = 'Ereignis bearbeiten';
    controller.titleCreate = 'Ereignis anlegen';
    
    // to store uploaded Images in event
    controller.uploadedImages = [];
    
    // start values of a event to have it not undefined, will be replaced in next steps
    controller.event = {};
    
    controller.similarEvents = [];
    
    // TODO save in own db
    controller.calendars = [
        {id:1, label: 'Watt', value: 'Watt'},
        {id:2, label: 'Land', value: 'Land'},
        {id:3, label: 'Fluss', value: 'Fluss'},
        {id:4, label: 'Spezial', value: 'Spezial'},
    ];
    
    // TODO save types in own db
    controller.types = [
        {id:1, label: 'öffentliche Führung', value: 'fix'},
        {id:2, label: 'Führung anfragen', value: 'variable'},
    ];
            
    // watch for upload event from :file-upload component
    $(document).bind('rivets:file-upload:complete', function (event, files) {
        controller.debug('rivets:file-upload:complete', files);
    });

    
    /**
     *  Get event by id and set it to the forms
     */
    var getEvent = function (id) {
        controller.debug('controller', id);
        
        return jumplink.events.getById(id)
        .then(function(event) {
            
            event = jumplink.events.parse(event);
            
            event.startTimeAt = moment(event.startAt).format('HH:mm');
            event.startAt = moment(event.startAt).minute(0).hour(0).format('YYYY-MM-DD');
            
            event.endTimeAt = moment(event.endAt).format('HH:mm');
            event.endAt = moment(event.endAt).minute(0).hour(0).format('YYYY-MM-DD');
                        
            event.active = event.active === true;
            jumplink.utilities.setCheckboxValue('#eventActive', event.active);
            
            event.showTimes = event.showTimes === true;
            
            /**
             * validate prices
             * used to update old prices with missing eachAdditionalUnit value
             */
            if(!jumplink.utilities.isArray(event.prices)) {
                event.prices = [jumplink.events.getDefaultPrice()];
            }
            event.prices.forEach(function(price) {
                price.eachAdditionalUnit = price.eachAdditionalUnit === true;
            });
            
            /**
             * validate prices
             * used to update old prices with missing eachAdditionalUnit value
             */
            if(!jumplink.utilities.isArray(event.notifications)) {
                event.notifications = [jumplink.events.getDefaultNotification()];
            }
            
            controller.event = event;
                                    
            controller.debug('getEvent done', controller.event);
            
            return controller.event;
        })
        .then(function(event) {
            return jumplink.events.getByTitle(controller.event.title)
            .then(function(events) {
                controller.similarEvents = events;
            });
        })
        .catch(function(error) {
            var title = 'Ereignis konnte nicht geladen werden';
            alertify.alert(title, error.message, function(){
            
            });
            controller.debug('error', error);
        });
    };
    
    controller.updateEvent = function(event) {        
        return jumplink.events.update(controller.id, controller.event, controller.uploadedImages)
        .then(function() {
            controller.uploadedImages = [];
            var message = 'Ereignis erfolgreich aktualisiert';
            var notification = alertify.notify(message, 'success' ,5, function(){
                // console.log('dismissed');
            });
            
            controller.debug(message);
            return getEvent(controller.id);
        })
        .catch(function(error) {
            console.error('error', error);
            var title = 'Ereignis konnte nicht aktualisiert werden';
            alertify.alert(title, error.message, function(){
            
            });
        });
    };
    
    controller.createEvent = function() {
        jumplink.events.add(controller.event, controller.uploadedImages)
        .then(function(result) {
            // remove uploadedImages images
            controller.uploadedImages = [];
            
            controller.id = result.id;
            var message = 'Ereignis mit der ID ' + controller.id + ' erfolgreich eingetragen';
            controller.debug(message, result);            
            var notification = alertify.notify(message, 'success', 5);
            
            return getEvent(controller.id);
        })
        .catch(function(error) {
            console.error('error', error);
            var title = 'Ereignis konnte nicht angelegt werden';
            alertify.alert(title, error.message);
        });
    };
    
    controller.duplicateEvent = function(event) {
        controller.id = undefined;
    };
    
    controller.addPrice = function(event, env) {
        if(!jumplink.utilities.isArray(controller.event.prices)) {
            controller.event.prices = [];
        }
        controller.event.prices.push(jumplink.events.getDefaultPrice());
    };
    
    controller.removePrice = function(event, env) {
        if(!jumplink.utilities.isArray(controller.event.prices)) {
            controller.event.prices = [];
        }
        if(controller.event.prices.length > 1) {
            controller.event.prices.splice(-1,1);
        }
    };
    
    controller.addNotification = function(event, env) {
        if(!jumplink.utilities.isArray(controller.event.notifications)) {
            controller.event.notifications = [];
        }
        controller.event.notifications.push(jumplink.events.getDefaultNotification());
    };
    
    controller.removeNotification = function(event, env) {
        if(!jumplink.utilities.isArray(controller.event.notifications)) {
            controller.event.notifications = [];
        }
        if(controller.event.notifications.length > 1) {
            controller.event.notifications.splice(-1,1);
        }
    };
    
    controller.calcExampleTotal = function(priceObj) {
        var quanity = priceObj.min + 1;
        var total = jumplink.events.calcEventTotal(controller.event, quanity);
        return total;
    };
    

    var ready = function() {
        /**
         *  Set default values or get event by id
         */
        if(controller.id) {
            getEvent(controller.id)
            .then(function() {
                controller.debug('ready');
            });
        } else {
            controller.event = jumplink.events.getDefaultValues(controller.calendars, controller.types);
        }
        
        // save or create event with strg + s
        $(window).unbind('keydown').bind('keydown', function(event) {
            if (event.ctrlKey || event.metaKey) {
                switch (String.fromCharCode(event.which).toLowerCase()) {
                // ctrl-s
                case 's':
                    event.preventDefault();
                    controller.debug('ctrl-s');
                    if(controller.id) {
                        controller.updateEvent();
                    } else {
                        controller.createEvent();
                    }
                    break;
                case 'f':
                    // event.preventDefault();
                    controller.debug('ctrl-f');
                    break;
                case 'g':
                    // event.preventDefault();
                    controller.debug('ctrl-g');
                    break;
                }
            }
        });
    
    };
    
    // Use MutationObserver instead of deprecated DOMSubtreeModified
    var observer = new MutationObserver(function(mutationsList) {
        // Check if component is ready (has any child elements)
        if($el.children().length > 0) {
            observer.disconnect(); // Stop observing once component is ready
            setTimeout(function() {
                ready();
            }, 0);
        }
    });
    
    // Start observing the element for child changes
    observer.observe(el, {
        childList: true,
        subtree: true
    });
    
    // Also call ready immediately in case component is already rendered
    setTimeout(function() {
        if($el.children().length > 0) {
            observer.disconnect();
            ready();
        }
    }, 0);

    return controller;
  }
};