/**
 * Component to create or update events in firebase
 * types:
 *  * fix (event with date)
 * * variable (event without date)
 */
rivets.components['firebase-event-form'] = {

  template: function() {
    // return $('template#firebase-event-form').html();
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
    var $eventStartAt = $(el).find('#eventStartAt');
    
    controller.typeChanged = function(type) {
        controller.debug('typeChanged', type);
        controller.event.type = type.value;
    };
    
    controller.calendarChanged = function(calendar) {
        controller.debug('typeChanged', calendar);
        controller.event.calendar = calendar.value;
    };
    
    controller.showTimesChanged = function(showTimes) {
        controller.debug('showTimesChanged', showTimes);
        controller.event.showTimes = showTimes;
    };    
    
    // if id is set the event will be updated otherwise it will be created
    controller.id = data.id;
    
    controller.titleEdit = 'Ereignis bearbeiten';
    controller.titleCreate = 'Ereignis anlegen';
    
    // to store uploaded Images in event
    controller.uploadedImages = [];
    
    // start values of a event to have it not undefined, will be replaced in next steps
    controller.event = {
        active: true,
        title: '',
        subtitle: '',
        description: '',
        equipment: '',
        showTimes: true,
        startAt: '',
        startTimeAt: '',
        endTimeAt: '',
        price: 0.0,
        pricetext: '',
        type: '',
        calendar: '',
        offer: '',
        note: '',
        images: [],
    };
    
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
    
    /**
     * init wysiwyg for description input
     * @see https://github.com/KennethanCeyer/pg-calendar/wiki/Documentation
     */
    $eventDesc.summernote({
        placeholder: 'Deine neue Beschreibung',
        height: 200,
        toolbar: [
            ['style', ['bold', 'italic', 'underline', 'clear']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['Misc', ['undo', 'redo', 'codeview', 'fullscreen']],
        ],
        callbacks: {
            onChange: function(contents, $editable) {
                console.log('onChange:', contents, $editable);
                controller.event.description = contents;
                controller.debug('onChange', contents, controller.event);
            }
        }
    });
    
    $eventNote.summernote({
        placeholder: 'Notiz',
        height: 200,
        toolbar: [
            ['style', ['bold', 'italic', 'underline', 'clear']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['Misc', ['undo', 'redo', 'codeview', 'fullscreen']],
        ],
        callbacks: {
            onChange: function(contents, $editable) {
                console.log('onChange:', contents, $editable);
                controller.event.note = contents;
                controller.debug('onChange', contents, controller.event);
            }
        }
    });
    
    /**
     * init date picker
     * @see https://www.pigno.se/barn/PIGNOSE-Calendar/
     */
    $eventStartAt.pignoseCalendar({
        lang: 'de',
        minDate: moment().format('YYYY-MM-DD'), // min day is today
        // date: controller.event.startAt,
        format: 'YYYY-MM-DD',
        buttons: true,
        apply: function(date, context) {
            controller.debug('select date', date);
            controller.event.startAt = date[0].format('YYYY-MM-DD');
        }
    });
    
    // watch for upload event from :file-upload component
    $(document).bind('rivets:file-upload:complete', function (event, files) {
        controller.debug('rivets:file-upload:complete', files);
    });
    
    /**
     * Sets the default values for an event e.g. if you want to create a new one
     */
    var setDefaultValues = function () {
        controller.debug('setDefaultValues', controller.id);
        
        controller.event.active = true;
        jumplink.utilities.setCheckboxValue('#eventActive', controller.event.active);
        
        // start at and date picker
        // var today = moment().format('YYYY-MM-DD');
        // $eventStartAt.pignoseCalendar('set', today);
        // controller.event.startAt = today;
        
        // start and end time
        controller.event.startTimeAt = '14:00';
        controller.event.endTimeAt = '16:00';
        
        // title, subtitle
        controller.event.title = '';
        controller.event.subtitle = '';
        
        // description
        controller.event.description = '';
        $eventDesc.summernote('code', controller.event.description);
        
        $eventNote.summernote('code', controller.event.note);
        
        controller.event.equipment = '';
        
        // price
        controller.event.price = 25;
        controller.event.pricetext = '';
        
        
        controller.debug('set default values', controller.event);
    }
    
    /**
     *  Get event by id and set it to the forms
     */
    var getEvent = function (id) {
        controller.debug('controller', id);
        
        dbEvents.doc(id).get()
        .then(function(docRef) {                        
            controller.debug('getEvent start', docRef.data());
            var event = docRef.data();
             
            event.startTimeAt = moment(event.startAt).format('HH:mm');
            event.startAt = moment(event.startAt).minute(0).hour(0).format('YYYY-MM-DD');
            
            event.endTimeAt = moment(event.endAt).format('HH:mm');
            event.endAt = moment(event.endAt).minute(0).hour(0).format('YYYY-MM-DD');
            
            // update description for wysiwyg
            $eventDesc.summernote('code', event.description);
            
            $eventNote.summernote('code', event.note);
            
            var selectedType = jumplink.utilities.setSelectedValue('#eventType select', event.type);
            // var selectedType = controller.setType(event.type);
            controller.debug('selectedType', selectedType);
            
            var selectedCalendar = jumplink.utilities.setSelectedValue('#eventCalendar select', event.calendar);
            controller.debug('selectedCalendar', selectedCalendar);
            
            event.active = event.active === true;
            jumplink.utilities.setCheckboxValue('#eventActive', event.active);
            
            event.showTimes = event.showTimes === true;
            jumplink.utilities.setCheckboxValue('#eventShowTimes input', event.showTimes);
            
            controller.event = event;
            
            $eventStartAt.pignoseCalendar('set', controller.event.startAt);
            $eventStartAt.val(controller.event.startAt);
            
            controller.debug('getEvent done', controller.event);
            
            return controller.event;
        })
        .catch(function(error) {  
            jumplink.utilities.showGlobalModal({
                title: 'Ereignis konnte nicht geladen werden',
                body: error.message,
            });
            controller.debug('error', error);
        });
    }
    
    /**
     *  Set default values or get event by id
     */
    if(controller.id) {
        getEvent(controller.id);
    } else {
        // WORKAROUND to set the current valuesafter rivets view is initialized?
        setTimeout(function() {
            setDefaultValues();
        }, 0);
    }
    
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
            // startTimeAt: controller.event.startTimeAt,
            endAt: moment(controller.event.startAt),
            price: Number(controller.event.price),
            pricetext: controller.event.pricetext || null,
            type: controller.event.type,
            calendar: controller.event.calendar,
            note: controller.event.note || null,
            offer: controller.event.offer || null,
            images: controller.event.images,
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
            controller.debug('no images are set, init image object with empty array!')
            newEvent.images = [];
        }
        
        newEvent.images.push.apply(newEvent.images, controller.uploadedImages);
        
        // remove uploadedImages images
        controller.uploadedImages = [];
        
        return newEvent;
    }
    
    controller.updateEvent = function(event, controller) {
        
        var updateEvent =  formatControllerEventForFirestore();
        
        controller.debug('updateEvent', controller.id, updateEvent);
        
        dbEvents.doc(controller.id).update(updateEvent)
        .then(function() {
            var message = 'Ereignis erfolgreich aktualisiert';
            jumplink.utilities.showGlobalModal({
                title: 'Erfolgreich angelegt',
                body: message,
            });
            controller.debug(message);
            return getEvent(controller.id);
        })
        .then(function(event) {
            return event;
        })
        .catch(function(error) {
            controller.debug('error', error);
            jumplink.utilities.showGlobalModal({
                title: 'Konnte nicht angelegt werden',
                body: error.message,
            });
        });
    }
      
    controller.createEvent = function(event) {

        var newEvent = formatControllerEventForFirestore();
        
        controller.debug('createEvent', newEvent, data, jumplink.firebase.config.customerDomain);
        
        dbEvents.add(newEvent)
        .then(function(docRef) {
            controller.id = docRef.id;
            var message = 'Ereignis mit der ID ' + controller.id + ' erfolgreich eingetragen';
            controller.debug(message, docRef);
            
            jumplink.utilities.showGlobalModal({
                title: 'Erfolgreich angelegt',
                body: message,
            });
            return getEvent(controller.id);
        })
        .then(function(event) {
            return event;
        })
        .catch(function(error) {
            controller.debug('error', error);
            jumplink.utilities.showGlobalModal({
                title: 'Ereignis konnte nicht angelegt werden',
                body: error.message,
            });
        });
    };
    
    controller.duplicateEvent = function(event) {
        controller.id = undefined;
    }

    return controller;
  }
};