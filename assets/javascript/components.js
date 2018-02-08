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
 * Component to create or update events in firebase
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
    var $eventStartAt = $(el).find('#eventStartAt');
    
    // if id is set the event will be updated otherwise it will be created
    controller.id = data.id;
    
    controller.event = {
        title: '',
        subtitle: '',
        description: '',
        equipment: '',
        startAt: '',
        startTimeAt: '',
        endTimeAt: '',
        price: "0,0",
        type: '',
        calendar: '',
    };
    
    controller.calendars = [
        {id:1, label: 'Watt'},
        {id:2, label: 'Land'},
        {id:3, label: 'Fluss'},
        {id:4, label: 'Spezial'},
    ];
    
    controller.types = [
        {id:1, label: 'öffentliche Führung'},
        {id:2, label: 'Führung Anfragen'},
    ];
    
    /**
     * init wysiwyg for description input
     * @see https://summernote.org/
     */
    $eventDesc.summernote({
        placeholder: 'Deine neue Beschreibung',
        height: 200,
        toolbar: [
            // [groupName, [list of button]]
            ['style', ['bold', 'italic', 'underline', 'clear']],
            // ['font', ['strikethrough', 'superscript', 'subscript']],
            // ['fontsize', ['fontsize']],
            // ['color', ['color']],
            ['para', ['ul', 'ol', 'paragraph']],
            // ['height', ['height']]
            ['Misc', ['undo', 'redo']],
        ],
        callbacks: {
            onChange: function(contents, $editable) {
                console.log('onChange:', contents, $editable);
                controller.event.description = contents;
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
        controller.event.title = 'Dein Fußabdruck im Meer';
        controller.event.subtitle = 'Wattwanderung im Sinne der Nachhaltigkeit - wie man die Natur genießt, ohne sie zu stören.';
        
        // description
        controller.event.description = '<p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.</p>';
        $eventDesc.summernote('code', controller.event.description);
        
        controller.event.equipment = 'festes Schuhwerk, wetterfeste Kleidung';
        
        // price
        controller.event.price = 25;
        
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
            
            var selectedType = setSelectedValue('#eventType', event.type);
            controller.debug('selectedType', selectedType);
            
            var selectedCalendar = setSelectedValue('#eventCalendar', event.calendar);
            controller.debug('selectedCalendar', selectedCalendar);
            
            controller.event = event;
            
            $eventStartAt.pignoseCalendar('set', controller.event.startAt);
            /*
            this is not working:
            controller.title = event.title;
            controller.subtitle = event.subtitle;
            controller.description = event.description;
            controller.equipment = event.equipment;
            controller.startAt = event.startAt;
            controller.startTimeAt = event.startTimeAt;
            controller.endTimeAt = event.endTimeAt;
            controller.price = event.price;
            controller.type = event.type;
            controller.calendar = event.calendar;
            */
            
            controller.debug('getEvent done', controller.event);
        })
        .catch(function(error) {  
            showGlobalModal({
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
    
    var showGlobalModal = function (data) {
        $.event.trigger('rivets:global-modal', [true, data]);
    }
    
    var getSelectedValue = function(selector) { 
        $selected = $(selector + ' option:selected');
        return $selected.text();
    };
    
    /**
     * set a value (not by the value attribute but by the text content of the option) on a select dom element
     */
    var setSelectedValue = function(selector, value) {
        var selector = selector + ' option:contains("' + value + '")';
        controller.debug('setSelectedValue', selector, value);
        $selected = $(selector);
        $selected.attr('selected','selected');
        return $selected.text();
    };
    
    var formatControllerEventForFirestore = function() {
        // WORKAROUND for select element
        controller.event.type = getSelectedValue('#eventType');
        controller.event.calendar = getSelectedValue('#eventCalendar');
        
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
            type: controller.event.type,
            calendar: controller.event.calendar,
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
        
        return newEvent;
    }
    
    controller.updateEvent = function(event, controller) {
        
        var updateEvent =  formatControllerEventForFirestore();
        
        controller.debug('updateEvent', controller.id, updateEvent);
        
        dbEvents.doc(controller.id).update(updateEvent)
        .then(function() {
            var message = 'Ereignis erfolgreich aktualisiert';
            showGlobalModal({
                title: 'Erfolgreich angelegt',
                body: message,
            });
             controller.debug(message);
        })
        .catch(function(error) {  
            showGlobalModal({
                title: 'Konnte nicht angelegt werden',
                body: error.message,
            });
            controller.debug('error', error);
        });
    }
      
    controller.createEvent = function(event, controller) {

        var newEvent = formatControllerEventForFirestore();
        
        controller.debug('createEvent', newEvent, data, jumplink.firebase.config.customerDomain);
        
        dbEvents.add(newEvent)
        .then(function(docRef) {
            var message = 'Ereignis mit der ID ' + docRef.id + ' erfolgreich eingetragen';
            showGlobalModal({
                title: 'Erfolgreich angelegt',
                body: message,
            });
            controller.debug(message, docRef);
        })
        .catch(function(error) {  
            showGlobalModal({
                title: 'Ereignis konnte nicht angelegt werden',
                body: error.message,
            });
            controller.debug('error', error);
        });
    };

    return controller;
  }
};

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
            showGlobalModal({
                title: 'Ereignis konnte nicht geladen werden',
                body: error.message,
            });
            controller.debug('error', error);
        });
    }
    getEvents();
    
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
            showGlobalModal({
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
        
    return controller;
  }
};
