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
    controller.debug = debug('rivets:firebase-event-form');
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
    
    var getDefaultPrice = function () {
        return {
            price: 0,
            fixprice: 0,
            unit: 'person',
            min: 1,
            max: 1,
            eachAdditionalUnit: false,
        };
    };
    
    /**
     * Sets the default values for an event e.g. if you want to create a new one
     */
    var setDefaultValues = function () {
        controller.debug('setDefaultValues', controller.id);
        
        controller.event.active = true;
        jumplink.utilities.setCheckboxValue('#eventActive', controller.event.active);

        controller.event.offer = '';
        controller.event.images = [];
        
        // start and end time
        controller.event.startAt = moment().format('YYYY-MM-DD');
        controller.event.showTimes = true;
        controller.event.startTimeAt = '14:00';
        controller.event.endTimeAt = '16:00';
        
        // title, subtitle
        controller.event.title = '';
        controller.event.subtitle = '';
        
        // textareas description and note
        controller.event.description = '';
        controller.event.note = '';
        
        controller.event.equipment = '';
        
        // price
        controller.event.prices = [getDefaultPrice()];
        controller.event.pricetext = '';
        
        
        controller.debug('set default values', controller.event);
    };
    
    /**
     *  Get event by id and set it to the forms
     */
    var getEvent = function (id) {
        controller.debug('controller', id);
        
        return dbEvents.doc(id).get()
        .then(function(docRef) {                        
            controller.debug('getEvent start', docRef.data());
            var event = docRef.data();
             
            event.startTimeAt = moment(event.startAt).format('HH:mm');
            event.startAt = moment(event.startAt).minute(0).hour(0).format('YYYY-MM-DD');
            
            event.endTimeAt = moment(event.endAt).format('HH:mm');
            event.endAt = moment(event.endAt).minute(0).hour(0).format('YYYY-MM-DD');
                        
            event.active = event.active === true;
            jumplink.utilities.setCheckboxValue('#eventActive', event.active);
            
            event.showTimes = event.showTimes === true;
            jumplink.utilities.setCheckboxValue('#eventShowTimes input', event.showTimes);
            
            if(!jumplink.utilities.isArray(event.prices)) {
                event.prices = [getDefaultPrice()];
            }
            
            controller.event = event;
                        
            controller.debug('getEvent done', controller.event);
            
            return controller.event;
        })
        .catch(function(error) {
            var title = 'Ereignis konnte nicht geladen werden';
            alertify.alert(title, error.message, function(){
            
            });
            controller.debug('error', error);
        });
    };
    
    /**
     * create a new event object to store in firebase datastore database
     */
    var formatControllerEventForFirestore = function() {
        // WORKAROUND for select element
        controller.event.type = jumplink.utilities.getSelectedValue('#eventType select');
        // controller.event.type = controller.getType().value;
        controller.event.calendar = jumplink.utilities.getSelectedValue('#eventCalendar select');
        
        var newEvent = {
            active: controller.event.active,
            title: controller.event.title,
            subtitle: controller.event.subtitle,
            description: controller.event.description,
            equipment: controller.event.equipment,
            showTimes: controller.event.showTimes,
            startAt: moment(controller.event.startAt),
            endAt: moment(controller.event.startAt),
            prices: controller.event.prices,
            pricetext: controller.event.pricetext || null,
            type: controller.event.type,
            calendar: controller.event.calendar,
            note: controller.event.note || null,
            offer: controller.event.offer || null,
            images: controller.event.images,
            price: null,
        };

        // split times in hour and minutes
        var startTimes = controller.event.startTimeAt.split(':');
        var endTimes = controller.event.endTimeAt.split(':');
        
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
            controller.debug('no images are set, init image object with empty array!');
            newEvent.images = [];
        }
        
        newEvent.images.push.apply(newEvent.images, controller.uploadedImages);
        
        // remove uploadedImages images
        controller.uploadedImages = [];
        
        return newEvent;
    };
    
    controller.updateEvent = function(event, controller) {
        
        var updateEvent =  formatControllerEventForFirestore();
        
        controller.debug('updateEvent', controller.id, updateEvent);
        
        dbEvents.doc(controller.id).update(updateEvent)
        .then(function() {
            var message = 'Ereignis erfolgreich aktualisiert';
            var notification = alertify.notify(message, 'success' ,5, function(){
                // console.log('dismissed');
            });
            
            
            controller.debug(message);
            return getEvent(controller.id);
        })
        .then(function(event) {
            return event;
        })
        .catch(function(error) {
            controller.debug('error', error);
            var title = 'Konnte nicht angelegt werden';
            alertify.alert(title, error.message, function(){
            
            });
        });
    };

    controller.createEvent = function(event) {

        var newEvent = formatControllerEventForFirestore();
        
        controller.debug('createEvent', newEvent, data, jumplink.firebase.config.customerDomain);
        
        dbEvents.add(newEvent)
        .then(function(docRef) {
            controller.id = docRef.id;
            var message = 'Ereignis mit der ID ' + controller.id + ' erfolgreich eingetragen';
            controller.debug(message, docRef);            
            var notification = alertify.notify(message, 'success' ,5, function(){
                // console.log('dismissed');
            });
            
            return getEvent(controller.id);
        })
        .then(function(event) {
            return event;
        })
        .catch(function(error) {
            controller.debug('error', error);        
            alertify.alert(title, error.message, function(){
            
            });
        });
    };
    
    controller.duplicateEvent = function(event) {
        controller.id = undefined;
    };
    
    controller.addPrice = function(event, env) {
        if(!jumplink.utilities.isArray(controller.event.prices)) {
            controller.event.prices = [];
        }
        controller.event.prices.push(getDefaultPrice());
    };
    
    controller.removePrice = function(event, env) {
        if(!jumplink.utilities.isArray(controller.event.prices)) {
            controller.event.prices = [];
        }
        if(controller.event.prices.length > 1) {
            controller.event.prices.splice(-1,1);
        }
    };
    
    controller.calcExampleTotal = function(priceObj) {
        var quanity = priceObj.min + 1;
        var total = jumplink.utilities.calcEventTotal(controller.event, quanity);
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
            setDefaultValues();
        }
    };
    
    $el.one('DOMSubtreeModified', function() {
        setTimeout(function() {
            ready();
        }, 0);     
    });

    return controller;
  }
};