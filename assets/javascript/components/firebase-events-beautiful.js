/**
 * Component to show the events in frontend for the visitors
 */
rivets.components['firebase-events-beautiful'] = {

  template: function() {
    // return $('template#firebase-events-beautiful').html();
    return jumplink.templates['firebase-events-beautiful'];
  },

  initialize: function(el, data) {
    var controller = this;
    controller.debug = debug('rivets:firebase-events-beautiful');
    controller.debug('initialize', el, data);
    var $el = $(el);
    var db = firebase.firestore();
    var dbEvents = db.collection('customerDomains').doc(jumplink.firebase.config.customerDomain).collection('events');
    
    data.getEventByUrlIdParam = data.getEventByUrlIdParam === true || data.getEventByUrlIdParam === 'true' || data.getEventByUrlIdParam === 1 || data.getEventByUrlIdParam === '1';
    
    controller.ready = false;
    controller.containerClass = data.containerClass || 'container';
    controller.title = data.title;
    controller.type = data.type;
    controller.calendar = data.calendar;
    controller.excludeCalendar = data.excludeCalendar;
    controller.showGallery = data.showGallery === true || data.showGallery === 'true' || data.showGallery === 1;
    controller.showToolbar = data.showToolbar === true || data.showToolbar === 'true' || data.showToolbar === 1;
    controller.galleryTitle = data.galleryTitle;
    controller.galleryText = data.galleryText;
    controller.groupBy = data.groupBy; // group events e.g. by 'title' | 'subtitle' | 'handle' or not with 'none'
    controller.detailPage = data.detailPage; // For more info links
    
    // start time of the orders in the future, from the past or all
    controller.startTime = data.startTime || 'future'; // 'future' | 'past' | 'all'
    controller.style = data.style;
    data.limit = Number(data.limit);
    if(data.limit === 0) {
        data.limit = 100;
    }
    controller.limit = data.limit;
    
    /**
     * if active is not set it is true
     * String will be casted to boolean
     * active can be true | false | 'all'
     */
    if(jumplink.utilities.isUndefined(data.active)) {
        data.active = true;
    } else if(data.active === 'true') {
        data.active = true;
    } else if(data.active === 'false') {
        data.active = false;
    }
    controller.active = data.active;
    
    controller.events = [];
    
    var getEventByProperty = function(events, property, value) {
        var foundEvent = null;
        events.forEach(function(event) {
            if(event[property] && event[property] === value) {
                foundEvent = event;
                return foundEvent;
            }
        });
        return foundEvent;
    };
    
    var pushEventGroupedByProperty = function(events, event, groupBy) {
        
        switch(groupBy) {
            // supported properties
            case 'title':
            case 'subtitle':
            case 'handle':
                var allreadyPushedEvent = getEventByProperty(events, groupBy, event[groupBy]);
                if(allreadyPushedEvent === null) {
                    // push event as new event to default list
                    events.push(event);
                    return event;
                }
                // check if event has allready a groupedEvents array otherwise create it
                if(!jumplink.utilities.isArray(allreadyPushedEvent.groupedEvents)) {
                    allreadyPushedEvent.groupedEvents = [];
                }
                // push event to existing event
                allreadyPushedEvent.groupedEvents.push(event);
                return allreadyPushedEvent;
            // properties they will just pushed without grouping
            // case 'none':
            default:
                events.push(event);
                break;
                
        }
        return event;
    };
    

    var getEvents = function() {
        // delete old getted events
        controller.events = [];
        var ref = dbEvents;
        
        // set type filter
        switch (controller.type) {
            case 'fix':
            case 'variable':
                ref = ref.where('type', "==", data.type);
                break;
            // case 'all':
            default:
                // all types
                ref = ref;
                break;
        }
        
        switch(controller.active) {
            case true:
            case false:
                ref = ref.where('active', "==", controller.active);
                break;
            case 'all':
                ref = ref;
                break;
        }
        
        // set calendar filter
        switch (controller.calendar) {
            case 'Watt':
            case 'Land':
            case 'Fluss':
            case 'Spezial':
                ref = ref.where('calendar', "==", controller.calendar);
                break;
            // case 'all':
            default:
                // all calendars
                ref = ref;
                break;
        }
        
        // get events only in future
        if(controller.type !== 'variable') {
            var now = new Date();
            switch(controller.startTime) {
                case 'future':
                    controller.debug('get events in future from', now);
                    ref = ref.where('startAt', ">=", now);
                    break;
                case 'past':
                    controller.debug('get events from the past in reference to', now);
                    ref = ref.where('startAt', "<", now);
                    break;
                // case 'all':
                default:
                    controller.debug('get events from the past and in the future');
                    ref = ref;
                    break;
            }
        }
        
        
        /**
         * Only set limit if no exclude is set otherwise limit is not working
         * If excludes is set we have a client site limit implement with a counter (search for 'count')
         */
        if (controller.excludeCalendar === 'none' && controller.limit >= 1) {
            controller.debug('set limit of orders to', controller.limit);
            ref = ref.limit(controller.limit);
        }

        
        // set order
        ref = ref.orderBy("startAt");
        
        return ref.get()
        .then((querySnapshot) => {
            //ycontroller.events = querySnapshot.data();
            controller.debug('event', querySnapshot);
            var count = 0;
            querySnapshot.forEach((doc) => {
                // own client site limit to make excludeCalendar working
                if(count <= controller.limit) {
                    var event = doc.data();
                    event.id = doc.id;
                    if(event.calendar !== controller.excludeCalendar) {
                        count++;
                        pushEventGroupedByProperty(controller.events, event, controller.groupBy);
                    }
                }
            });
        })
        .catch(function(error) {
            controller.debug('error', error);
            jumplink.utilities.showGlobalModal({
                title: 'Ereignis konnte nicht geladen werden',
                body: error.message,
            });
        });
    };
    
    /*
     * e.g. https://watt-land-fluss.de/event?id=I9YnPGqMpVKR9Q8qmjEI
     */
    var getEventByID = function(id) {
        controller.events = [];
        
        if(!id) {
            var url = new URL(window.location.href);
            id = url.searchParams.get('id');
        }
        controller.debug('getEventByID', id);
        return dbEvents.doc(id).get()
        .then((doc) => {
            if (doc.exists) {
                var event = doc.data();
                event.id = doc.id;
                controller.debug('event', event);
                pushEventGroupedByProperty(controller.events, event, controller.groupBy);
            } else {
                console.error("No such document!");
            }
        })
        .catch(function(error) {
            controller.debug('error', error);
            jumplink.utilities.showGlobalModal({
                title: 'Ereignis konnte nicht geladen werden',
                body: error.message,
            });
        });
    }
    
    if(data.getEventByUrlIdParam) {
        getEventByID()
        .then(function() {
            controller.debug('events', controller.events);
            controller.ready = true;
        });
    } else {
        getEvents()
        .then(function() {
            controller.ready = true;
        });
    }

    
    return controller;
  }
};
