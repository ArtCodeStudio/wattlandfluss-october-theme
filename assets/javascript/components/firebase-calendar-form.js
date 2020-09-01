/**
 * firebase-calendar-form
 */
rivets.components['firebase-calendar-form'] = {

  template: function() {
    // return $('template#firebase-calendar-form').html();
    return jumplink.templates['firebase-calendar-form'];
  },

  initialize: function(el, data) {
    var controller = this;
    controller.debug = window.debug('rivets:firebase-calendar-form');
    controller.debug('initialize', el, data);
    
    var $el = $(el);
    var db = firebase.firestore();
    var $calendarDesc = $(el).find('#calendarDesc');
    var $calendarNote = $(el).find('#calendarNote');
    
    var dbCalendars = db.collection('customerDomains').doc(jumplink.firebase.config.customerDomain).collection('calendars');

    
    // if id is set the event will be updated otherwise it will be created
    controller.id = data.id;
    
    controller.titleEdit = 'Kalender bearbeiten';
    controller.titleCreate = 'Kalender anlegen';
    
    // to store uploaded Images in event
    controller.uploadedImages = [];
    
    // start values of a event to have it not undefined, will be replaced in next steps
    controller.calendar = {
        active: true,
        name: '',
        title: '',
        subtitle: '',
        description: '',
        note: '',
        type: '',
        images: [],
    };
    
    // TODO save types in own db
    controller.types = [
        {id:1, label: 'Veranstaltungen', value: 'events'},
        // {id:2, label: 'Zimmerreservierung', value: 'room-reservation'},
    ];
    
    /**
     * init wysiwyg for description input
     * @see https://github.com/KennethanCeyer/pg-calendar/wiki/Documentation
     */
    $calendarDesc.summernote({
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
                controller.calendar.description = contents;
                controller.debug('onChange', contents, controller.calendar);
            }
        }
    });
    
    $calendarNote.summernote({
        placeholder: 'Deine neue Notiz',
        height: 200,
        toolbar: [
            ['style', ['bold', 'italic', 'underline', 'clear']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['Misc', ['undo', 'redo', 'codeview', 'fullscreen']],
        ],
        callbacks: {
            onChange: function(contents, $editable) {
                console.log('onChange:', contents, $editable);
                controller.calendar.note = contents;
                controller.debug('onChange', contents, controller.calendar);
            }
        }
    });
    
    /**
     * Sets the default values for an event e.g. if you want to create a new one
     */
    var setDefaultValues = function () {
        controller.debug('setDefaultValues', controller.id);
        
        controller.calendar.active = true;
        jumplink.utilities.setCheckboxValue('#calendarActive', controller.calendar.active);
                
        // title, subtitle
        controller.calendar.name = '';
        controller.calendar.title = '';
        controller.calendar.subtitle = '';
        
        // description
        controller.calendar.description = '';
        $calendarDesc.summernote('code', controller.calendar.description);
        
        // note
        controller.calendar.note = '';
        $calendarNote.summernote('code', controller.calendar.note);
        
        controller.debug('set default values', controller.calendar);
    };
    
    /**
     *  Get event by id and set it to the forms
     */
    var getCalendar = function (id) {
        controller.debug('controller', id);
        
        dbCalendars.doc(id).get()
        .then(function(docRef) {                        
            controller.debug('getCalendar', docRef.data());
            var calendar = docRef.data();

            
            // update description for wysiwyg
            $calendarDesc.summernote('code', calendar.description);
            
            $calendarNote.summernote('code', calendar.note);
            
            var selectedType = jumplink.utilities.setSelectedValue('#calendarType select', calendar.type);
            // var selectedType = controller.setType(event.type);
            controller.debug('selectedType', selectedType);
            
            calendar.active = calendar.active === true;
            jumplink.utilities.setCheckboxValue('#calendarActive', calendar.active);
            
            controller.calendar = calendar;
            
            controller.debug('getCalendar done', controller.calendar);
            
            return controller.calendar;
        })
        .catch(function(error) {  
            jumplink.utilities.showGlobalModal({
                title: 'Kalender konnte nicht geladen werden',
                body: error.message,
            });
            controller.debug('error', error);
        });
    };
    
    /**
     *  Set default values or get event by id
     */
    if(controller.id) {
        getCalendar(controller.id);
    } else {
        // WORKAROUND to set the current valuesafter rivets view is initialized?
        setTimeout(function() {
            setDefaultValues();
        }, 0);
    }    
    
    /**
     * create a new event object to store in firebase datastore database
     */
    var formatControllerCalendarForFirestore = function() {
        controller.calendar.type = jumplink.utilities.getSelectedValue('#calendarType select');
        
        var calendar = {
            active: controller.calendar.active,
            name: controller.calendar.name,
            title: controller.calendar.title,
            subtitle: controller.calendar.subtitle,
            description: controller.calendar.description,
            type: controller.calendar.type,
            note: controller.calendar.note || null,
            images: controller.calendar.images,
        };
        
        
        // Merge old images with new uploaded images
        if(!jumplink.utilities.isArray(calendar.images)) {
            controller.debug('no images are set, init image object with empty array!');
            calendar.images = [];
        }
        
        calendar.images.push.apply(calendar.images, controller.uploadedImages);
        
        // remove uploadedImages images
        controller.uploadedImages = [];
        
        return calendar;
    };
    
    controller.updateCalendar = function(event, controller) {
        
        var updateCalendar = formatControllerCalendarForFirestore();
        
        controller.debug('updateCalendar', controller.id, updateCalendar);
        
        dbCalendars.doc(controller.id).update(updateCalendar)
        .then(function() {
            var message = 'Kalender erfolgreich aktualisiert';
            jumplink.utilities.showGlobalModal({
                title: 'Erfolgreich angelegt',
                body: message,
            });
            controller.debug(message);
            return getCalendar(controller.id);
        })
        .then(function(calendar) {
            return calendar;
        })
        .catch(function(error) {
            controller.debug('error', error);
            jumplink.utilities.showGlobalModal({
                title: 'Fehler',
                body: error.message,
            });
        });
    };
      
    controller.createCalendar = function(event) {

        var calendar = formatControllerCalendarForFirestore();
        
        controller.debug('createCalendar', calendar, data, jumplink.firebase.config.customerDomain);
        
        dbCalendars.add(calendar)
        .then(function(docRef) {
            controller.id = docRef.id;
            var message = 'Kalender mit der ID ' + controller.id + ' erfolgreich eingetragen';
            controller.debug(message, docRef);
            
            jumplink.utilities.showGlobalModal({
                title: 'Kalender angelegt',
                body: message,
            });
            return getCalendar(controller.id);
        })
        .then(function(calendar) {
            return calendar;
        })
        .catch(function(error) {
            controller.debug('error', error);
            jumplink.utilities.showGlobalModal({
                title: 'Kalender konnte nicht angelegt werden',
                body: error.message,
            });
        });
    };

    return controller;
  }
};
