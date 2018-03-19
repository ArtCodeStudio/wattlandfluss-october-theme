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
            
    var getEvents = function() {
        return jumplink.events.get(controller.type, controller.active, controller.calendar, controller.startTime, controller.excludeCalendar, controller.groupBy, controller.limit)
        .then(function(events) {
            controller.events = events;
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
        return jumplink.events.getById(id)
        .then((event) => {
            controller.debug('event', event);
            controller.events = [event];
        })
        .catch(function(error) {
            controller.debug('error', error);
            jumplink.utilities.showGlobalModal({
                title: 'Ereignis konnte nicht geladen werden',
                body: error.message,
            });
        });
    };
    
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
