// rivets.js components
// debugging https://github.com/visionmedia/debug
window.jumplink.debug = window.jumplink.debug || {};
window.jumplink.debug.components = debug('theme:components');

/**
 * 
 */
rivets.components['firebase-user'] = {

  template: function() {
    return $('template#firebase-user').html();
  },

  initialize: function(el, data) {
    var controller = this;
    controller.debug = debug('rivets:firebase-user');
    controller.debug('initialize', el, data);
    
    controller.user = null;
  
    
    firebase.auth().onAuthStateChanged(function(user) {
        controller.signinErrorMessage = null;
        if (user) {
            // User is signed in.
            controller.debug('onAuthStateChanged signed in', user);
            controller.user = user;
            
        } else {
            // User is signed out.
            controller.debug('onAuthStateChanged signed out');
            controller.user = null;
        }
    });
    

    return controller;
  }
};

/**
 * 
 */
rivets.components['firebase-signin-form'] = {

  template: function() {
    return $('template#firebase-signin-form').html();
  },

  initialize: function(el, data) {
    var controller = this;
    controller.debug = debug('rivets:firebase-signin-form');
    controller.debug('initialize', el, data);
    
    controller.user = data.user;

    controller.signinForm = {
        login: '',
        password: '',
    };
    
    controller.signinErrorMessage = null;    
  
    controller.signInWithEmailAndPassword = function(event, controller) {
        //  var $element = $(event.target);
        controller.debug('signInWithEmailAndPassword', controller.signinForm);
        
        firebase.auth().signInWithEmailAndPassword(controller.signinForm.login, controller.signinForm.password)
        .then(function() {
             controller.signinErrorMessage = null;
        })
        .catch(function(error) {
          // Handle Errors here.
          controller.debug('signInWithEmailAndPassword error', error);
          controller.signinErrorMessage = error.message;
        });
    };

    return controller;
  }
};

/**
 * 
 */
rivets.components['firebase-signout-form'] = {

  template: function() {
    return $('template#firebase-signout-form').html();
  },

  initialize: function(el, data) {
    var controller = this;
    controller.debug = debug('rivets:firebase-signout-form');
    controller.debug('initialize', el, data);

    controller.user = data.user;
    
    controller.signinErrorMessage = null;
    
  
    controller.signOut = function(event, controller) {
        //  var $element = $(event.target);
        controller.debug('signOut', controller.user, data);
        
        firebase.auth().signOut().then(function() {
          controller.user = null;
          controller.signinErrorMessage = null;
        }).catch(function(error) {
          // An error happened.
          controller.signinErrorMessage = error.message;
        });

    };

    return controller;
  }
};

/**
 * A modal component for alerts, do you need to use this component in dom only once
 * and you can call by tigger a global event:
 * @example $.event.trigger('rivets:modal', [true, data]);
 * 
 * The data param should have title, body, ..
 * 
 * @events
 *  * rivets:global-modal (event, show, data)
 */
rivets.components['global-modal'] = {

  template: function() {
    return $('template#global-modal').html();
  },

  initialize: function(el, data) {
    var controller = this;
    controller.debug = debug('rivets:modal');
    controller.debug('initialize', el, data);
    
    controller.data = {
        title: '',
        body: '',
    };
    
    var $el = $(el);
    var $modal = $el.find('#modal');
    
    /**
     * WORKAROUND global event to show / hide this modal 
     * 
     */
    $(document).bind('rivets:global-modal', function (event, show, data) {
        if(show) {
            controller.data = data;
            controller.debug('show', event, show, data, controller.data);
            controller.show(event, controller);
        } else {
            controller.hide(event, controller);
        }
        
    });
    
    $modal.modal({
        show: false,
        focus: false,
        keyboard: true,
        backdrop: true,
    });
    
    controller.toggle = function(event, controller, show) {
        controller.debug('toggle', event, controller, show);
        // $modal.modal('toggle');
        $modal.modal('show');
    };
    
    controller.show = function(event, controller) {
        controller.debug('show', controller.data);
       $modal.modal('show');
    };
    
    controller.hide = function(event, controller) {
       $modal.modal('hide');
    };

    return controller;
  }
};

/**
 * Component with some utilities fpr a select with generated select options 
 */
rivets.components['rv-select'] = {
  template: function() {
    return $('template#rv-select').html();
  },
  initialize: function(el, data) {
    var controller = this;
    controller.debug = debug('rivets:rv-select');
    controller.debug('initialize', el, data);
    var $el = $(el);
    var $select = $el.find('select');
    
    controller.label = data.label;
    controller.values = data.values;
    controller.id = Date.now();
    controller.selected = controller.values[0];
    
    /**
     * Get the selected value of a select option DOM element
     */
    controller.get = function() { 
        $selected = $select.children('option:selected');
        if($selected.length) {
            var data = $selected.data();
            if(data.index >= 0) {
                var value = controller.values[data.index];
                controller.debug('get', value );
                return value;
            }
        }
        return null;
    };
    
    /**
     * set a value
     */
    controller.set = function(value) {
        $select.val(value).change();
        controller.debug('set', value );
        return controller.get();
    };
    
    controller.values.forEach(function(value, i) {
        var $option = $('<option>', {
            'data-index': i,
            'data-id': value.id,
            value: value.value,
            text : value.label,
        });
        
        // select first element by default
        if(i === 0) {
            $option.attr('selected', true);
        }
        
        $select.append($option);
    });
    
    $select.on('change', function() {
        var $this = $(this);
        var value = controller.get();
        controller.selected = value;
        data.selected = controller.selected;
        data.onChange(data.selected);
        controller.debug('select', value );
    });

    return controller;
  }
}

/**
 * Component to create or update events in firebase
 * types:
 *  * fix (event with date)
 * * variable (event without date)
 */
rivets.components['firebase-event-form'] = {

  template: function() {
    return $('template#firebase-event-form').html();
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
    
    // if id is set the event will be updated otherwise it will be created
    controller.id = data.id;
    
    // to store uploaded Images in event
    controller.uploadedImages = [];
    
    // start values of a event to have it not undefined, will be replaced in next steps
    controller.event = {
        title: '',
        subtitle: '',
        description: '',
        equipment: '',
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
        select: function(date, context) {
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
        
        // start at and date picker
        var today = moment().format('YYYY-MM-DD');
        $eventStartAt.pignoseCalendar('set', today);
        controller.event.startAt = today;
        
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
            controller.debug('getEvent', docRef.data());
            var event = docRef.data();
             
            event.startTimeAt = moment(event.startAt).format('HH:mm');
            event.startAt = moment(event.startAt).minute(0).hour(0).format('YYYY-MM-DD');
            
            event.endTimeAt = moment(event.endAt).format('HH:mm');
            event.endAt = moment(event.endAt).minute(0).hour(0).format('YYYY-MM-DD');
            
            // update description for wysiwyg
            $eventDesc.summernote('code', event.description);
            
            $eventNote.summernote('code', event.note);
            
            var selectedType = setSelectedValue('#eventType select', event.type);
            // var selectedType = controller.setType(event.type);
            controller.debug('selectedType', selectedType);
            
            var selectedCalendar = setSelectedValue('#eventCalendar select', event.calendar);
            controller.debug('selectedCalendar', selectedCalendar);
            
            controller.event = event;
            
            $eventStartAt.pignoseCalendar('set', controller.event.startAt);
            
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
        }, 200);
    }
    
    /**
     * Get the selected value of a select option DOM element
     */
    var getSelectedValue = function(selector) { 
        $selected = $(selector + ' option:selected');
        return $selected.val();
    };
    
    /**
     * set a value (not by the value attribute but by the text content of the option) on a select dom element
     */
    var setSelectedValue = function(selector, value) {
        // var selector = selector + ' option:contains("' + value + '")';
        //controller.debug('setSelectedValue', selector, value);
        //$selected = $(selector);
        //$selected.attr('selected','selected');
        
        $select = $(selector);
        $select.val(value).change();
        return getSelectedValue(selector);
    };
    
    /**
     * create a new event object to store in firebase datastore database
     */
    var formatControllerEventForFirestore = function() {
        // WORKAROUND for select element
        controller.event.type = getSelectedValue('#eventType select');
        // controller.event.type = controller.getType().value;
        controller.event.calendar = getSelectedValue('#eventCalendar select');
        
        // WORKAROUND otherwise rivets seems to hold the old data setted before :(
        controller.event.startAt = $('#eventStartAt').val();
        
        var newEvent = {
            title: controller.event.title,
            subtitle: controller.event.subtitle,
            description: controller.event.description,
            equipment: controller.event.equipment,
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
      
    controller.createEvent = function(event, controller) {

        var newEvent = formatControllerEventForFirestore();
        
        controller.debug('createEvent', newEvent, data, jumplink.firebase.config.customerDomain);
        
        dbEvents.add(newEvent)
        .then(function(docRef) {
            var message = 'Ereignis mit der ID ' + docRef.id + ' erfolgreich eingetragen';
            jumplink.utilities.showGlobalModal({
                title: 'Erfolgreich angelegt',
                body: message,
            });
            controller.debug(message, docRef);
            controller.id = docRef.id;
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

    return controller;
  }
};

/**
 * Component to list the events in a table for the backend
 */
rivets.components['firebase-events-table'] = {

  template: function() {
    return $('template#firebase-events-table').html();
  },

  initialize: function(el, data) {
    var controller = this;
    controller.debug = debug('rivets:firebase-event-table');
    controller.debug('initialize', el, data);
    var $el = $(el);
    var db = firebase.firestore();
    var dbEvents = db.collection('customerDomains').doc(jumplink.firebase.config.customerDomain).collection('events');
    controller.events = [];

    var getEvents = function() {
         dbEvents.get()
        .then((querySnapshot) => {
            //ycontroller.events = querySnapshot.data();
            controller.debug('events', controller.events, querySnapshot);
            controller.events = [];
            querySnapshot.forEach((doc) => {
                var event = doc.data();
                event.id = doc.id;
                controller.events.push(event);
            });
        })
        .catch(function(error) {  
            jumplink.utilities.showGlobalModal({
                title: 'Ereignis konnte nicht geladen werden',
                body: error.message,
            });
            controller.debug('error', error);
        });
    }
   
    
    controller.delete = function(event, controller) {
        var $this = $(event.target);
        var id = $this.data('id');
        controller.debug('delete', $this.data());
        
        dbEvents.doc(id).delete()
        .then(function() {
            var message = 'Ereignis erfolgreich gelöscht';
            controller.debug(message);
            getEvents();
        }).catch(function(error) {
            var message = error.message;
            jumplink.utilities.showGlobalModal({
                title: 'Ereignis konnte nicht gelöscht werden',
                body: error.message,
            });
            controller.debug(message, error);
        });
        
    };
    
    controller.edit = function(event, controller) {
        var $this = $(event.target);
        controller.debug('edit', $this.data());
        var id = $this.data('id');
        var href = $this.data('href').replace(':id', id);
        Barba.Pjax.goTo(href);
    };
    
     getEvents();
    return controller;
  }
};

/**
 * Component to show the events in frontend for the visitors
 */
rivets.components['firebase-events-beautiful-next'] = {

  template: function(a, b) {
    controller = this;
    console.log('firebase-events-beautiful-next template', a, b);
    console.log(this);
    return $('template#firebase-events-beautiful-next').html();
  },

  initialize: function(el, data) {
    var controller = this;
    controller.debug = debug('rivets:firebase-event-table');
    controller.debug('initialize', el, data);
    var $el = $(el);
    var db = firebase.firestore();
    var dbEvents = db.collection('customerDomains').doc(jumplink.firebase.config.customerDomain).collection('events');
    controller.title = data.title;
    controller.type = data.type;
    controller.event = {};

    var getEvent = function() {
         dbEvents.where('type', "==", data.type).orderBy("startAt").limit(1).get()
        .then((querySnapshot) => {
            //ycontroller.events = querySnapshot.data();
            controller.debug('event', controller.events, querySnapshot);
            querySnapshot.forEach((doc) => {
                var event = doc.data();
                event.id = doc.id;
                controller.event = event;
            });
        })
        .catch(function(error) {  
            jumplink.utilities.showGlobalModal({
                title: 'Ereignis konnte nicht geladen werden',
                body: error.message,
            });
            controller.debug('error', error);
        });
    }
    
    
    controller.requests = function(event, controller) {
        var $this = $(event.target);
        controller.debug('edit', $this.data());
        var id = $this.data('id');
        var href = $this.data('href').replace(':id', id);
        Barba.Pjax.goTo(href);
    };
        
    getEvent();
    return controller;
  }
};

/**
 * Component to show the events in frontend for the visitors
 */
rivets.components['firebase-events-beautiful'] = {

  template: function() {
    return $('template#firebase-events-beautiful').html();
  },

  initialize: function(el, data) {
    var controller = this;
    controller.debug = debug('rivets:firebase-events-beautiful');
    controller.debug('initialize', el, data);
    var $el = $(el);
    var db = firebase.firestore();
    var dbEvents = db.collection('customerDomains').doc(jumplink.firebase.config.customerDomain).collection('events');
    
    controller.containerClass = data.containerClass;
    controller.title = data.title;
    controller.type = data.type;
    controller.calendar = data.calendar;
    controller.style = data.style;
    
    controller.events = [];
    

    var getEvents = function() {
        // delete old getted events
        controller.events = [];
        var ref;
        
        switch(controller.calendar) {
            case 'Watt':
            case 'Land':
            case 'Fluss':
            case 'Spezial':
                ref = dbEvents.where('type', "==", data.type).where('calendar', "==", controller.calendar).orderBy("startAt");
                break;
            default:
                // all calendars
                ref = dbEvents.where('type', "==", data.type).orderBy("startAt");
                break;
        }
        
         ref.get()
        .then((querySnapshot) => {
            //ycontroller.events = querySnapshot.data();
            controller.debug('event', querySnapshot);
            querySnapshot.forEach((doc) => {
                var event = doc.data();
                event.id = doc.id;
                controller.events.push(event);
            });
        })
        .catch(function(error) {
            controller.debug('error', error);
            jumplink.utilities.showGlobalModal({
                title: 'Ereignis konnte nicht geladen werden',
                body: error.message,
            });
        });

    }
    
    getEvents();
    return controller;
  }
};

/**
 * Component to show the events in frontend for the visitors
 */
rivets.components['firebase-event-beautiful'] = {
  template: function() {
    return $('template#firebase-event-beautiful').html();
  },

  initialize: function(el, data) {
    var controller = this;
    controller.debug = debug('rivets:firebase-event-beautiful');
    controller.debug('initialize', el, data);
    var $el = $(el);

    controller.title = data.title;
    controller.containerClass = data.containerClass;
    controller.event = data.event;
    controller.index = data.index;
    controller.style = data.style; // choose template 'fix' | 'variable' | 'custom'
    controller.color = 'black';
    controller.number = jumplink.utilities.rand(1, 4);
    controller.imageFilename = 'path-0' + controller.number + '.svg';
    
    switch(controller.event.calendar) {
        case 'Watt':
            controller.color = 'warning';
            break;
        case 'Land':
            controller.color = 'success';
            break;
        case 'Fluss':
            controller.color = 'info';
            break;
        case 'Spezial':
            controller.color = 'gradient';
            break;
    }
    
    controller.requests = function(event, controller) {
        var $this = $(event.target);
        controller.debug('requests', controller.event);
    };
        

    return controller;
  }
}

rivets.components['walking-path'] = {

  template: function() {
    return $('template#walking-path').html();
  },

  initialize: function(el, data) {
    var controller = this;
    controller.debug = debug('rivets:walking-path');
    controller.debug('initialize', el, data);
    var $el = $(el);
    
    controller.svg = '';
    controller.path = data.path;
    controller.color = data.color;
    controller.filename = data.filename;
    controller.class = controller.filename + ' walking-path-wrapper';
    
    // randomly flip the svg horizontal
    if(jumplink.utilities.rand(0, 1) === 1) {
        controller.class = controller.class + ' flip-h';
    }
    
    var loadSvg = function() {
        $.get(data.path + '/' + data.filename, function(data) {
          var svg = new XMLSerializer().serializeToString(data.documentElement);
          controller.svg = svg.replace('bg-color', 'fill-' + controller.color);
        });
    }
    
    controller.containerClass = data.containerClass;

    loadSvg();
    return controller;
  }
};

/**
 * File uploader with drag and drop
 * @see https://css-tricks.com/drag-and-drop-file-uploading/
 * 
 * @events
 * * rivets:file-upload:uploaded (event, file)
 * * rivets:file-upload:complete (event, files)
 */
rivets.components['file-upload'] = {

  template: function() {
    return $('template#file-upload').html();
  },

  initialize: function(el, data) {
    var controller = this;
    controller.debug = debug('rivets:file-upload');
    controller.debug('initialize', el, data);
    var $el = $(el);
    
    var db = firebase.firestore();
    var dbImages = db.collection('customerDomains').doc(jumplink.firebase.config.customerDomain).collection('images');
    
    var storage = firebase.storage();
    var storageEventsImagesRef =  storage.ref().child(jumplink.firebase.config.customerDomain + '/events/images');
    
    var fileReader  = new FileReader();
    
    var $form = $el.find('.file-upload-box');
    var $input = $form.find('input[type="file"]');
    var $label = $form.find('label');
    
    var $restart = $form.find('.box__restart');
    
    controller.droppedFiles = [];
    controller.previewFiles = [];
    controller.uploadedFiles = data.uploadedFiles;
    controller.isDragover = false;
    controller.isUploading = false;
    controller.hasFocus = false;
    
    var addUploadedFile = function(file) {
        if(!jumplink.utilities.isArray(controller.uploadedFiles)) {
            controller.uploadedFiles = [];
        }
        controller.uploadedFiles.push(file);
        data.uploadedFiles = controller.uploadedFiles; // make the files public
        $.event.trigger('rivets:file-upload:uploaded', [file]);
    }
    
    var addFilesToUpload = function(files) {
        var files = Array.from(files);
        controller.debug('addFiles', files);
        controller.droppedFiles = files;
        previewFiles(files);
    };
    
    var getIndexByName = function(files, file) {
        var index = -1;
        files.forEach(function(currentFile, i) {
            controller.debug('[getIndexByName] currentFile', currentFile.name, file.name);
            if(currentFile.name === file.name) {
                index = i;
                return index;
            }
        });
        
        controller.debug('[getIndexByName]', file.name, index);
        return index;
    }
    
    var previewFiles = function(files) {
        files.forEach(function(file) {
            var reader = new FileReader();
            reader.onload = function(e) {
                previewFile = {
                    dataURL: reader.result,
                    name: file.name,
                    size: file.size,
                }
                controller.previewFiles.push(previewFile);
            }
            reader.readAsDataURL(file);
        });
    }


    /**
     * Upload files to firebase storage and add it to firebase datastore
     */
    var uploadFiles = function (ref, files) {
        return Promise.all(files.map(function(file, fileIndex) {
            var uploadedFile;
            
            // store file to fiebase storage
            return ref.child(file.name)
            .put(file)
            .then(function(snapshot) {
                uploadedFile = {
                    downloadURL: snapshot.downloadURL,
                    state: snapshot.state,
                    metadata: {
                        name: snapshot.metadata.name,
                        downloadURLs: snapshot.metadata.downloadURLs,
                        md5Hash: snapshot.metadata.md5Hash,
                        size: snapshot.metadata.size,
                        updated: snapshot.metadata.size,
                        timeCreated: snapshot.metadata.timeCreated,
                        contentType: snapshot.metadata.contentType,
                        generation: snapshot.metadata.generation,
                    }
                };

                controller.debug('uploadedFile', uploadedFile);
                
                // add image to db
                return dbImages.add(uploadedFile);
            })
            .then(function(docRef) {
                uploadedFile.id = docRef.id;
                addUploadedFile(uploadedFile);
                
                var message = 'Bild ' + uploadedFile.metadata.name + ' erfolgreich eingetragen';
                controller.debug(message, uploadedFile);
                
                // remove file from upload stack
                var droppedFileIndex = getIndexByName(controller.droppedFiles, file);
                if(droppedFileIndex !== -1) {
                    controller.droppedFiles.splice(droppedFileIndex, 1);
                }
                
                // remove file from preview stack
                var previewFileIndex = getIndexByName(controller.previewFiles, file);
                if(previewFileIndex !== -1) {
                     controller.previewFiles.splice(previewFileIndex, 1);
                }

                return uploadedFile;
            });
        }))
        .then(function(files) {
            $.event.trigger('rivets:file-upload:complete', [files]);
            controller.isUploading = false;
        });
    }

    // letting the server side to know we are going to make an Ajax request
    $form.append('<input type="hidden" name="ajax" value="1" />');

    // automatically submit the form on file select
    $input.on('change', function(e) {
        addFilesToUpload(e.target.files);
        $form.trigger('submit');
    });

    // drag&drop files 
    $form
    .on('drag dragstart dragend dragover dragenter dragleave drop', function(e) {
        // preventing the unwanted behaviours
        e.preventDefault();
        e.stopPropagation();
    })
    .on('dragover dragenter', function() {
        // $form.addClass('is-dragover');
        controller.isDragover = true;
    })
    .on('dragleave dragend drop', function() {
        // $form.removeClass('is-dragover');
        controller.isDragover = false;
    })
    .on('drop', function(e) {
        var droppedFiles = e.originalEvent.dataTransfer.files; // the files that were dropped
        addFilesToUpload(droppedFiles);
        $form.trigger('submit'); // automatically submit the form on file drop
    });
    
    // if the form was submitted
    $form.on('submit', function(e) {
        // preventing the duplicate submissions if the current one is in progress
        if (controller.isUploading) {
            return false;
        }

        // $form.addClass('is-uploading').removeClass('is-error');
        controller.isUploading = true;
        e.preventDefault();

        // request
        controller.debug('request', controller.droppedFiles);
        
        uploadFiles(storageEventsImagesRef, controller.droppedFiles)
        .then(function(snapshots) {
          controller.debug('Uploaded a blob or file!', snapshots);
        })
        .catch(function(error) {  
            jumplink.utilities.showGlobalModal({
                title: 'Fehler',
                body: error.message,
            });
            controller.debug('error', error);
        });
    });


    // restart the form if has a state of error/success

    $restart
    .on('click', function(e) {
        e.preventDefault();
        // $form.removeClass('is-error is-success');
        $input.trigger('click');
    });

    // Firefox focus bug fix for file input
    $input
    .on('focus', function() {
        // $input.addClass('has-focus');
        controller.hasFocus = true;
    })
    .on('blur', function() {
        $input.removeClass('has-focus');
        controller.hasFocus = false;
    });

    return controller;
  }
};

/**
 * Component to show uploaded files or files added to a event
 */
rivets.components['uploaded-files'] = {

  template: function() {
    return $('template#uploaded-files').html();
  },

  initialize: function(el, data) {
    var controller = this;
    controller.debug = debug('rivets:uploaded-files');
    controller.debug('initialize', el, data);
    var $el = $(el);
    controller.files = data.files;
    controller.label = data.label || 'Files';
    
    /**
     * Called if clicked delete button on uploaded-file component template
     */
    controller.delete = function(event, file) {
        var $this = $(event.target);
        controller.debug('[delete]');
        var index = controller.files.indexOf(file);
        if(index !== -1) {
        	controller.files.splice(index, 1);
        }
    }
    
    return controller;
  }
};

/**
 * Single file of the uploaded-files component
 */
rivets.components['uploaded-file'] = {

  template: function() {
    return $('template#uploaded-file').html();
  },

  initialize: function(el, data) {
    var controller = this;
    controller.debug = debug('rivets:uploaded-file');
    controller.debug('initialize', el, data);
    var $el = $(el);
    controller.file = data.file;
    
    /**
     * Called if clicked delete button in this component template
     */
    controller.delete = function(event, controller) {
        controller.debug('[delete]');
        data.onDelete(event, controller.file);
    }
    
    
    return controller;
  }
};

/**
 * Component to show files they will be uploaded, similar to uploaded-files but shown before the upload is complete
 */
rivets.components['preview-files'] = {

  template: function() {
    return $('template#preview-files').html();
  },

  initialize: function(el, data) {
    var controller = this;
    controller.debug = debug('rivets:preview-files');
    controller.debug('initialize', el, data);
    var $el = $(el);
    controller.files = data.files;
    controller.label = data.label || 'Files';
        
    return controller;
  }
};

/**
 * Single file of the preview-files component
 */
rivets.components['preview-file'] = {

  template: function() {
    return $('template#preview-file').html();
  },

  initialize: function(el, data) {
    var controller = this;
    controller.debug = debug('rivets:preview-file');
    controller.debug('initialize', el, data);
    var $el = $(el);
    controller.file = data.file;
    
    return controller;
  }
};