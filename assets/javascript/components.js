// rivets.js components
// debugging https://github.com/visionmedia/debug
window.jumplink.debug = window.jumplink.debug || {};
window.jumplink.debug.components = debug('theme:components');

/**
 * Single file of the preview-files component
 */
rivets.components['spinner'] = {

  template: function() {
    // return $('template#spinner').html();
    return jumplink.templates.spinner;
  },

  initialize: function(el, data) {
    var controller = this;
    controller.debug = debug('rivets:spinner');
    controller.debug('initialize', el, data);
    var $el = $(el);
    controller.name = data.name;    
    
    if(data.colorClass) {
        $el.find('[data-color="bg"]').addClass('bg-' + data.colorClass);
        $el.find('[data-color="bg-before"]').addClass('bg-' + data.colorClass + '-before');
    }
    
    return controller;
  }
};

/**
 * 
 */
rivets.components['firebase-user'] = {

  template: function() {
    // return $('template#firebase-user').html();
    return jumplink.templates['firebase-user'];
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
    // return $('template#firebase-signin-form').html();
    return jumplink.templates['firebase-signin-form'];
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
    // return $('template#firebase-signout-form').html();
    return jumplink.templates['firebase-signout-form'];
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
    // return $('template#global-modal').html();
    return jumplink.templates['global-modal'];
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
 * @html:
 * <select
 *      label="'label'"
 *      description="'description'"
 *      values="values"
 *      on-change="onSelectChanged"
 * >
 * 
 * @parent controller:
 * controller.values = [
 *      {id:1, label: 'Watt', value: 'Watt'},
 *      {id:2, label: 'Land', value: 'Land'},
 *      {id:3, label: 'Fluss', value: 'Fluss'},
 *      {id:4, label: 'Spezial', value: 'Spezial'},
 * ];
 * 
 * controller.onSelectChanged = function(selectedValue) {
        controller.debug('onSelectChanged', selectedValue);
    };
 */
rivets.components['rv-select'] = {
  template: function() {
    // return $('template#rv-select').html();
    return jumplink.templates['rv-select'];
  },
  initialize: function(el, data) {
    var controller = this;
    controller.debug = debug('rivets:rv-select');
    controller.debug('initialize', el, data);
    var $el = $(el);
    var $select = $el.find('select');
    
    controller.label = data.label || '';
    controller.description = data.description || '';
    controller.values = data.values;
    controller.id = data.id ? 'rv-select-'+data.id : Date.now();
    
    var onChange = function() {
        if (jumplink.utilities.isFunction(data.onChange)) {
            data.onChange(controller.selected);
        }
    }
    
    controller.selected = controller.values[0];
    onChange();
    

    
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
        controller.debug('set', value);
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
        onChange();
        controller.debug('select', value );
    });

    return controller;
  }
};

rivets.components['rv-checkbox'] = {
  template: function() {
    // return $('template#rv-checkbox').html();
    return jumplink.templates['rv-checkbox'];
  },
  initialize: function(el, data) {
    var controller = this;
    controller.debug = debug('rivets:rv-checkbox');
    controller.debug('initialize', el, data);
    var $el = $(el);
    var $checkbox = $el.find('input[type="checkbox"]');
    
    controller.ready = false;
    controller.label = data.label;
    controller.description = data.description;
    controller.values = data.values;
    controller.id = data.id ? 'rv-checkbox-'+data.id : Date.now();
    controller.checked = data.default;
    jumplink.utilities.setCheckboxValue($checkbox, controller.checked);
        
    $checkbox.change(function() {
        controller.checked = $checkbox.is(":checked");
        controller.debug('changed', controller.checked);
        if (jumplink.utilities.isFunction(data.onChange)) {
            data.onChange(controller.checked);
        }
    });
    
    // WORKAROUND
    setTimeout(function() {
        controller.ready = true;
    }, 200);
    
    
    return controller;
  }
}

rivets.components['rv-img'] = {
  template: function() {
    // return $('template#rv-img').html();
    return jumplink.templates['rv-img'];
  },
  initialize: function(el, data) {
    var controller = this;
    controller.debug = debug('rivets:rv-img');
    
    var $el = $(el);
    controller.src = data.src;
    controller.alt = data.alt;
    controller.style = '';
    controller.ready = false;
    controller.loaded = false;
    
    if(data.ratio) {
        controller.ratio = data.ratio.split(':');
        controller.ratio[0] = Number(controller.ratio[0]);
        controller.ratio[1] = Number(controller.ratio[1]);
        controller.heightInPercent = (controller.ratio[1] / controller.ratio[0] * 100);
        controller.style = 'padding-top: ' + controller.heightInPercent + '%;';
    }
    
    if(data.width && data.height) {
        controller.ratio = [];
        controller.ratio[0] = Number(data.width);
        controller.ratio[1] = Number(data.height);
        controller.heightInPercent = (controller.ratio[1] / controller.ratio[0] * 100);
        controller.style = 'padding-top: ' + controller.heightInPercent + '%;';
    }
    
    var options = {
        scrollDirection: data.scrollDirection || 'vertical',
        effect: data.effect || "fadeIn",
        effectTime: Number(data.effectTime || 600),
        threshold: Number(data.threshold || 0),
        visibleOnly: data.visibleOnly === true || data.visibleOnly === 'true',
        bind: 'event',
        delay: Number(data.delay || -1),
        /**  called before an elements gets handled */
        beforeLoad: function(element) {
            controller.loaded = false;
            controller.debug('[beforeLoad]', element, controller);
            if (jumplink.utilities.isFunction(data.beforeLoad)) {
                data.beforeLoad($el, controller);
            }
        },
        
        /**  called after an element was successfully handled */
        afterLoad: function(element) {
            controller.loaded = true;
            $el.find('spinner').remove();
            controller.debug('[afterLoad]', element, controller);
            // controller.style = 'padding-top: ' + controller.heightInPercent + '%;';
            if (jumplink.utilities.isFunction(data.afterLoad)) {
                data.afterLoad($el, controller);
            }
        },
        
        /** called whenever an element could not be handled */
        onError: function(element) {
            controller.debug('[onError] image "' + controller.src + '" could not be loaded');
            if (jumplink.utilities.isFunction(data.onError)) {
                data.onError($el, controller);
            }
        },
        
        /**  called once all elements was handled */
        onFinishedAll: function() {
            controller.loaded = true;
            controller.debug('[onFinishedAll]', controller);
            if (jumplink.utilities.isFunction(data.onFinishedAll)) {
                data.onFinishedAll($el, controller);
            }
        },
    };
    
    controller.debug('initialize', el, data, controller);
    
    setTimeout(function() {
        controller.ready = true;
    }, 100);    
    
    /**
     * For lazy loading options see https://github.com/eisbehr-/jquery.lazy#configuration-parameters
     */
    setTimeout(function() {
        var $img = $el.find('.lazy');
                
        $img.Lazy(options);
        
        controller.debug('init Lazy', options, $img, $img.data());

        
        if(data.ratio) {
            // controller.style = 'padding-top: ' + controller.heightInPercent + '%;';
        }
    
    }, 200);
    

    
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
        }, 200);
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

rivets.components['firebase-calendar-form'] = {

  template: function() {
    // return $('template#firebase-calendar-form').html();
    return jumplink.templates['firebase-calendar-form'];
  },

  initialize: function(el, data) {
    var controller = this;
    controller.debug = debug('rivets:firebase-calendar-form');
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
    }
    
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
    }
    
    /**
     *  Set default values or get event by id
     */
    if(controller.id) {
        getCalendar(controller.id);
    } else {
        // WORKAROUND to set the current valuesafter rivets view is initialized?
        setTimeout(function() {
            setDefaultValues();
        }, 200);
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
            controller.debug('no images are set, init image object with empty array!')
            calendar.images = [];
        }
        
        calendar.images.push.apply(calendar.images, controller.uploadedImages);
        
        // remove uploadedImages images
        controller.uploadedImages = [];
        
        return calendar;
    }
    
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
    }
      
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

/**
 * Component to list the events in a table for the backend
 */
rivets.components['firebase-events-table'] = {

  template: function() {
    // return $('template#firebase-events-table').html();
    return jumplink.templates['firebase-events-table'];
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
    
    controller.sort = function(event, controller) {
        var $this = $(event.target);
        var data = $this.data();
        // data.sortProperty
        
        if(!data.sortDirection) {
            data.sortDirection = 'asc'
        } else {
            if(data.sortDirection === 'asc') {
                data.sortDirection = 'desc';
            } else {
                data.sortDirection = 'asc';
            }
        }
        $this.data('sortDirection', data.sortDirection);
        
        controller.debug('sort', data);
        
        controller.events.sort(function(a, b) {
            var result = 0;
            switch(data.sortProperty) {
                default:
                    if(a[data.sortProperty] < b[data.sortProperty]) {
                        result = -1;
                    }
                    if(a[data.sortProperty] > b[data.sortProperty]) {
                        result = 1;
                    }
                break;
            }
            if(data.sortDirection === 'desc') {
                result = result * -1;
            }
            return result;
        });
    };
   
    
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
 * Component to list the events in a table for the backend
 */
rivets.components['firebase-calendars-table'] = {

  template: function() {
    // return $('template#firebase-calendars-table').html();
    return jumplink.templates['firebase-calendars-table'];
  },

  initialize: function(el, data) {
    var controller = this;
    controller.debug = debug('rivets:firebase-calendars-table');
    controller.debug('initialize', el, data);
    var $el = $(el);
    var db = firebase.firestore();
    var dbCalendars = db.collection('customerDomains').doc(jumplink.firebase.config.customerDomain).collection('calendars');
    controller.calendars = [];

    var getCalendars = function() {
         dbCalendars.get()
        .then((querySnapshot) => {
            controller.debug('calendars', controller.calendars, querySnapshot);
            controller.calendars = [];
            querySnapshot.forEach((doc) => {
                var calendar = doc.data();
                calendar.id = doc.id;
                controller.calendars.push(calendar);
            });
        })
        .catch(function(error) {  
            jumplink.utilities.showGlobalModal({
                title: 'Kalender konnte nicht geladen werden',
                body: error.message,
            });
            controller.debug('error', error);
        });
    }
   
    
    controller.delete = function(event, controller) {
        var $this = $(event.target);
        var id = $this.data('id');
        controller.debug('delete', $this.data());
        
        dbCalendars.doc(id).delete()
        .then(function() {
            var message = 'Kalender erfolgreich gelöscht';
            controller.debug(message);
            getCalendars();
        }).catch(function(error) {
            var message = error.message;
            jumplink.utilities.showGlobalModal({
                title: 'Kalender konnte nicht gelöscht werden',
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
    
    getCalendars();
    return controller;
  }
};

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
    
    controller.ready = false;
    controller.containerClass = data.containerClass || 'container';
    controller.title = data.title;
    controller.type = data.type;
    controller.calendar = data.calendar;
    controller.excludeCalendar = data.excludeCalendar;
    controller.showGallery = data.showGallery === true || data.showGallery === 'true' || data.showGallery === 1;
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
    }
    
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
                break;
            // properties they will just pushed without grouping
            case 'none':
            default:
                events.push(event);
                break;
                
        }
        return event;
    }
    

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
            case 'all':
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
            case 'all':
            default:
                // all calendars
                ref = ref;
                break;
        }
        
        // get events only in future
        if(controller.type !== 'variable') {
            switch(controller.startTime) {
                case 'future':
                    var now = new Date();
                    controller.debug('get events in future from', now);
                    ref = ref.where('startAt', ">=", now);
                    break;
                case 'past':
                    var now = new Date();
                    controller.debug('get events from the past in reference to', now);
                    ref = ref.where('startAt', "<", now);
                    break;
                case 'all':
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

    }
    
    getEvents()
    .then(function() {
        controller.ready = true;
    });
    
    return controller;
  }
};

/**
 * Component to show the images of all events
 */
rivets.components['firebase-events-beautiful-gallery'] = {

  template: function() {
    // return $('template#firebase-events-beautiful-gallery').html();
    return jumplink.templates['firebase-events-beautiful-gallery'];
  },

  initialize: function(el, data) {
    var controller = this;
    controller.debug = debug('rivets:firebase-events-beautiful-gallery');
    controller.debug('initialize', el, data);
    var $el = $(el);
    var $imagesWrapper = $el.find('.images-row');

    controller.ready = false;
    controller.containerClass = data.containerClass || 'container';
    controller.title = data.title;
    controller.type = data.type;
    controller.calendar = data.calendar;
    controller.style = data.style;
    controller.events = data.events;
    controller.headerTitle = data.headerTitle;
    controller.headerText = data.headerText;
    
    controller.images = [];
    
    var getImagesFromEvents = function(events) {
        var images = [];
        events.forEach(function(event) {
            controller.debug('event', event);
            /** converts images to the photoswipe format */
            event.images.forEach(function(image, index) {        
                /** path to image */
                image.src = image.downloadURL;
                /** path to small image placeholder, large image will be loaded on top */
                image.msrc = image.downloadURL;
                if (image.customMetadata) {
                    /** image width */
                    image.w = image.customMetadata.width || 800;
                    /** image height */
                    image.h = image.customMetadata.height || 600;
                } else {
                    /** image width */
                    image.w = 800;
                    /** image height */
                    image.h = 600;
                }
                /** image caption */
                image.title = image.metadata.name;
                image.index = index;
                // image.ratio = image.w + ':' + image.h;
    
                images.push(image);
            });
        });
        return images;
    }
    
    // triggers when user clicks on thumbnail
    controller.onThumbnailsClick = function(e) {
        e = e || window.event;
        e.preventDefault ? e.preventDefault() : e.returnValue = false;

        var $target = $(e.target || e.srcElement).parent().parent(); // parent to get the rivets rv-img component root element
        var data = $target.data();

        controller.debug('[onThumbnailsClick] $target', $target, $target, data);

        if(data.index >= 0) {
            // open PhotoSwipe if valid index found
            openPhotoSwipe(data.index);
        }
        return false;
    };

    var openPhotoSwipe = function(index) {
        $.event.trigger('rivets:photoswipe:open', [$imagesWrapper, index, controller.images]);
    };
    
    // WORKAROUND
    setTimeout(function() {
     controller.ready = true;     
    }, 100);
    
    setTimeout(function() {
        $imagesWrapper.masonry({
          // options...
          itemSelector: '.image-col',
          // columnWidth: 200
        });
    }, 300);

    
    controller.images = getImagesFromEvents(controller.events);
    controller.debug('images', controller.images);

    return controller;
  }
};



rivets.components['firebase-events-beautiful-toolbar'] = {
  template: function() {
    // return $('template#firebase-events-beautiful-toolbar').html();
    return jumplink.templates['firebase-events-beautiful-toolbar'];
  },

  initialize: function(el, data) {
    var controller = this;
    controller.debug = debug('rivets:firebase-events-beautiful-toolbar');
    controller.debug('initialize', el, data);
    var $el = $(el);
    controller.type = data.type;
    controller.calendar = data.calendar;
    controller.style = data.style;
    controller.events = data.events;
    
    controller.onSelectEventChanged = function(selectedEvent) {
        controller.debug('onSelectEventChanged', selectedEvent);
    };
    
    
    controller.selectEventValues = [
        {id:1, label: 'Watt', value: 'Watt'},
        {id:2, label: 'Land', value: 'Land'},
        {id:3, label: 'Fluss', value: 'Fluss'},
        {id:4, label: 'Spezial', value: 'Spezial'},
    ];
    
    return controller;
  }
}

/**
 * Component to show the events in frontend for the visitors
 */
rivets.components['firebase-event-beautiful'] = {
  template: function() {
    // return $('template#firebase-event-beautiful').html();
    return jumplink.templates['firebase-event-beautiful'];
  },

  initialize: function(el, data) {
    var controller = this;
    controller.debug = debug('rivets:firebase-event-beautiful');
    controller.debug('initialize', el, data);
    var $el = $(el);

    controller.ready = false;
    controller.title = data.title;
    controller.active = data.active;
    controller.calendar = data.calendar;
    controller.type = data.type;
    controller.limit = data.limit;
    controller.containerClass = data.containerClass || 'container';
    controller.event = data.event;
    controller.index = data.index;
    controller.style = data.style; // choose template 'fix' | 'variable' | 'custom'
    controller.color = 'black';
    controller.number = jumplink.utilities.rand(1, 4);
    controller.imageFilename = 'path-0' + controller.number + '.svg';
    controller.detailPage = data.detailPage; // For more info links
    
    if(controller.event.images.length) {
        var image = controller.event.images[0];
        controller.imageSrc = image.downloadURL;
        controller.imageAlt = image.metadata.name;
        if (image.customMetadata) {
            controller.imageW = image.customMetadata.width || 800;
            controller.imageH = image.customMetadata.height || 600;
        }
    }
    
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
        var data = $this.data();
        controller.debug('requests', controller.event, data);
    };
    
    controller.show = function(event, controller) {
        var $this = $(event.target);
        var data = $this.data();
        controller.debug('show', controller.event, data);
        Barba.Pjax.goTo(controller.detailPage + '#'+data.id);
    }
    
    var checkHash = function() {
        var hash = jumplink.utilities.getHash();
        controller.debug('[checkHash] hash', hash);
        if(hash === '#'+controller.event.id) {
            controller.debug('[checkHash] TODO scroll to event', $el.offset().top);
            
            $('html, body').animate({
                scrollTop: $el.offset().top
            }, 500);
        }
    }
    
    // WORKAROUND
    setTimeout(function() {
        controller.ready = true;
        setTimeout(function() {
            checkHash();
            jumplink.utilities.hyphenate();
        }, 200);
        
    }, 200);

    return controller;
  }
}

rivets.components['walking-path'] = {

  template: function() {
    // return $('template#walking-path').html();
    return jumplink.templates['walking-path'];
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
    controller.containerClass = data.containerClass || 'container';
    
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
    // return $('template#file-upload').html();
    return jumplink.templates['file-upload'];
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
        controller.debug('[addFilesToUpload]', files);
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
                var img = new Image;
                // load image to get width and height
                img.onload = function() {
                    previewFile = {
                        dataURL: reader.result,
                        name: file.name,
                        size: file.size,
                        width: img.width,
                        height: img.height,
                    }
                    controller.debug('[previewFiles] img.onload', previewFile);
                    controller.previewFiles.push(previewFile);
                }
                img.src = reader.result;
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
                var currentPreviewFiles;
                var currentDroppedFiles;
                
                uploadedFile.id = docRef.id;
                addUploadedFile(uploadedFile);
                        
                
                // remove file from upload stack
                var droppedFileIndex = getIndexByName(controller.droppedFiles, file);
                if(droppedFileIndex !== -1) {
                    controller.debug('droppedFileIndex', droppedFileIndex);
                    currentDroppedFile = controller.droppedFiles.splice(droppedFileIndex, 1);
                }
                
                /**
                 * remove file from preview stack
                 * and get width and height from preview image to store in database
                 */
                var previewFileIndex = getIndexByName(controller.previewFiles, file);
                if(previewFileIndex !== -1) {
                     currentPreviewFiles = controller.previewFiles.splice(previewFileIndex, 1);
                     controller.debug('currentPreviewFiles', currentPreviewFiles);
                     uploadedFile.customMetadata = {
                        width: currentPreviewFiles[0].width,
                        height: currentPreviewFiles[0].height,
                     }
                }
                
                var message = 'Bild ' + uploadedFile.metadata.name + ' erfolgreich eingetragen';
                controller.debug(message, uploadedFile);

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
    // return $('template#uploaded-files').html();
    return jumplink.templates['uploaded-files'];
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
    // return $('template#uploaded-file').html();
    return jumplink.templates['uploaded-file'];
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
    // return $('template#preview-files').html();
    return jumplink.templates['preview-files'];
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
    // return $('template#preview-file').html();
    return jumplink.templates['preview-file'];
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

/**
 * Component to open a photoswipe gallery
 * 
 * @events
 *  * rivets:photoswipe:open (event, $imgWrapper, index, images)
 */
rivets.components['rv-photoswipe'] = {

  template: function() {
    // return $('template#rv-photoswipe').html();
    return jumplink.templates['rv-photoswipe'];
  },

  initialize: function(el, data) {
    var controller = this;
    controller.debug = debug('rivets:rv-photoswipe');
    controller.debug('initialize', el, data);
    var $el = $(el);
    
    // photoswipe element
    var $pswp = $el.find('.pswp');
    var pswp;
    var $imagesWrapper;
    
    /** define options (if needed) @see http://photoswipe.com/documentation/options.html */
    var options = {
         // history & focus options are disabled on CodePen        
        history: false,
        focus: false,
        index: 0,

        /** If set to false: background opacity and image scale will be animated (image opacity is always 1). */
        // showHideOpacity: true,
        
        /** Initial zoom-in transition duration in milliseconds. Set to 0 to disable. */
        // showAnimationDuration: 0,
        
        /** The same as the previous option, just for closing (zoom-out) transition. */
        // hideAnimationDuration: 0
        
        /** Background (.pswp__bg) opacity. Should be a number from 0 to 1, e.g. 0.7. */
        bgOpacity: 1,
        
        /** Spacing ratio between slides. For example, 0.12 will render as a 12% of sliding viewport width (rounded). */
        spacing: 0.12,
        
        /** Allow swipe navigation to next/prev item when current item is zoomed. Option is always false on devices that don't have hardware touch support. */
        allowPanToNext: true,
        
        /** Maximum zoom level when performing spread (zoom) gesture. 2 means that image can be zoomed 2x from original size.  */
        maxSpreadZoom: 2,
        
        // getDoubleTapZoom
        
        loop: true,
        pinchToClose: true,
        closeOnScroll: true,
        closeOnVerticalDrag: true,
        mouseUsed: false,
        escKey: true,
        arrowKeys: true,
        history: true,
        galleryUID: 1,
        galleryPIDs: true,
        errorMsg: '<div class="pswp__error-msg"><a href="%url%" target="_blank">Das Bild</a> konnte nicht geladen werden.</div>',
        preload: [1,1],
        //mainClass: '',
        // getNumItemsFn: function(){},
        focus: true,
        isClickableElement: function(el) {
            return el.tagName === 'A';
        },
        
        /**
         * Controls whether PhotoSwipe should expand to take up the entire viewport.
         * If false, the PhotoSwipe element will take the size of the positioned parent of the template.
         * Take a look at the FAQ for more information.
         */
        modal: true,
        
        /**
         * Function should return an object with coordinates from which initial zoom-in animation will start (or zoom-out animation will end).
         */
        getThumbBoundsFn: function(index) {
            controller.debug('[getThumbBoundsFn] index', index, '$imagesWrapper', $imagesWrapper);
            // find thumbnail element
            var $thumbnail = $imagesWrapper.find('[data-index="'+ index +'"]');
            controller.debug('[getThumbBoundsFn] $thumbnail', $thumbnail);
            // get window scroll Y
            var pageYScroll = window.pageYOffset || document.documentElement.scrollTop; 
            // optionally get horizontal scroll
            // get position of element relative to viewport
            var rect = $thumbnail[0].getBoundingClientRect();
            controller.debug('[getThumbBoundsFn] rect', rect);
            // w = width
            return {x:rect.left, y:rect.top + pageYScroll, w:rect.width};
            // Good guide on how to get element coordinates:
            // http://javascript.info/tutorial/coordinates
        },
        
        /**
         * Size of top & bottom bars in pixels,
         * 
         * "bottom" parameter can be 'auto' (will calculate height of caption)
         * option applies only when mouse is used,
         * or width of screen is more than 1200px
         * (Also refer to `parseVerticalMargin` event)
         */
        barsSize: {top:44, bottom:'auto'}, 
        
        // Adds class pswp__ui--idle to pswp__ui element when mouse isn't moving for 4000ms
        timeToIdle: 4000,
        
        // Same as above, but this timer applies when mouse leaves the window
        timeToIdleOutside: 1000,
        
        // Delay until loading indicator is displayed
        loadingIndicatorDelay: 1000,
        
        // Function builds caption markup
        addCaptionHTMLFn: function(item, captionEl, isFake) {
            // item      - slide object
            // captionEl - caption DOM element
            // isFake    - true when content is added to fake caption container
            //             (used to get size of next or previous caption)
        
            if(!item.title) {
                captionEl.children[0].innerHTML = '';
                return false;
            }
            captionEl.children[0].innerHTML = item.title;
            return true;
        },
        
        // Buttons/elements
        closeEl:true,
        captionEl: true,
        fullscreenEl: true,
        zoomEl: true,
        shareEl: false,
        counterEl: true,
        arrowEl: true,
        preloaderEl: true,
        
        // Tap on sliding area should close gallery
        tapToClose: false,
        
        // Tap should toggle visibility of controls
        tapToToggleControls: true,
        
        /**
         * Mouse click on image should close the gallery,
         * only when image is smaller than size of the viewport
         */
        clickToCloseNonZoomable: true,
        
        /**
         * Element classes click on which should close the PhotoSwipe.
         * In HTML markup, class should always start with "pswp__", e.g.: "pswp__item", "pswp__caption".
         * "pswp__ui--over-close" class will be added to root element of UI when mouse is over one of these elements
         * By default it's used to highlight the close button.
         */
        closeElClasses: ['item', 'caption', 'zoom-wrap', 'ui', 'top-bar'], 
        
        /**
         * Separator for "1 of X" counter
         */
        indexIndicatorSep: ' / ',
        
        /**
         * Share buttons
         * Available variables for URL:
         * {{url}}             - url to current page
         * {{text}}            - title
         * {{image_url}}       - encoded image url
         * {{raw_image_url}}   - raw image url
         */
        shareButtons: [
            {id:'facebook', label:'Share on Facebook', url:'https://www.facebook.com/sharer/sharer.php?u={{url}}'},
            {id:'twitter', label:'Tweet', url:'https://twitter.com/intent/tweet?text={{text}}&url={{url}}'},
            {id:'pinterest', label:'Pin it', url:'http://www.pinterest.com/pin/create/button/?url={{url}}&media={{image_url}}&description={{text}}'},
            {id:'download', label:'Download image', url:'{{raw_image_url}}', download:true}
        ],
        
        

        /**
         * Next 3 functions return data for share links
         * 
         * functions are triggered after click on button that opens share modal,
         * which means that data should be about current (active) slide
         */
        getImageURLForShare: function( shareButtonData ) {
            // `shareButtonData` - object from shareButtons array
            // 
            // `pswp` is the gallery instance object,
            // you should define it by yourself
            // 
            return pswp.currItem.src || '';
        },
        
        getPageURLForShare: function( shareButtonData ) {
            return window.location.href;
        },
        getTextForShare: function( shareButtonData ) {
            return pswp.currItem.title || '';
        },
        
        /**
         * Parse output of share links
         */
        parseShareButtonOut: function(shareButtonData, shareButtonOut) {
            // `shareButtonData` - object from shareButtons array
            // `shareButtonOut` - raw string of share link element
            return shareButtonOut;
        }
        
    };
    
    var open = function(index) {
        options.index = index;
        pswp = new PhotoSwipe( $pswp[0], PhotoSwipeUI_Default, controller.images, options);
        pswp.init();
    };
    
    controller.next = function(event, controller) {
        pswp.next();
    }
    
    controller.prev = function(event, controller) {
        pswp.prev();
    }
    
    controller.close = function(event, controller) {
        pswp.close();
    }
    
    controller.toggleZoom = function(event, controller) {
        pswp.toggleDesktopZoom();
    }

    controller.toggleFullscreen = function(event, controller) {
        var _fullscrenAPI = pswp.ui.getFullscreenAPI();

		if(_fullscrenAPI.isFullscreen()) {
			_fullscrenAPI.exit();
		} else {
			_fullscrenAPI.enter();
		}
		
        pswp.ui.updateFullscreen();
    }
    
    
    $(document).bind('rivets:photoswipe:open', function (event, $imgWrapper, index, images) {
        controller.debug('[rivets:photoswipe:open]', event, index, images);
        $imagesWrapper = $imgWrapper;
        controller.images = images;
        open(index);
    });
    
    return controller;
  }
};