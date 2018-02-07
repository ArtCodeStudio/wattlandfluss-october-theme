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
}

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
}

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
}

/**
 * 
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
     * @example $.event.trigger('rivets:modal', [true, data]);
     */
    $(document).bind('rivets:modal', function (event, show, data) {
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
}

/**
 * 
 */
rivets.components['firebase-event-create-form'] = {

  template: function() {
    return $('template#firebase-event-create-form').html();
  },

  initialize: function(el, data) {
    var controller = this;
    controller.debug = debug('rivets:firebase-event-create-form');
    controller.debug('initialize', el, data);
    
    var $el = $(el);
    var db = firebase.firestore();
    var $newEventDesc = $(el).find('#newEventDesc');
    var $newEventStartAt = $(el).find('#newEventStartAt');
    
    controller.newEvent = {
        title: '',
        subtitle: '',
        description: '',
        startAt: moment().format('YYYY-MM-DD'),
        startTimeAt: '',
        endTimeAt: '',
        price: "0,0",
        type: '',
    };
    
    controller.types = [
        {id:1, label: 'Watt'},
        {id:2, label: 'Land'},
        {id:3, label: 'Fluss'},
        {id:4, label: 'Spezial'},
    ];
    
    // init wysiwyg for descriptom input
    $newEventDesc.summernote({
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
                controller.newEvent.description = contents;
                controller.debug('onChange', contents, controller.newEvent);
            }
        }
    });
    
    
    // init date picker
    $newEventStartAt.pignoseCalendar({
        lang: 'de',
        minDate: moment().format('YYYY-MM-DD'), // min day is today
        select: function(date, context) {
            controller.debug('select', date);
            controller.newEvent.startAt = moment(date).format('YYYY-MM-DD');
        }
    });
    
    var showGlobalModal = function (data) {
        $.event.trigger('rivets:modal', [true, data]);
    }
    
    var getSelectedValue = function(selector) { 
        $selected = $(selector + ' option:selected');
        return $selected.text();
    };
    
    // init pickadate for startAt
  
    controller.createEvent = function(event, controller) {
        //  var $element = $(event.target);
        // WORKAROUND
        controller.newEvent.type = getSelectedValue('#newEventType');
        controller.debug('createEvent', controller.newEvent, data, jumplink.firebase.config.customerDomain);
        
        // Add a second document with a generated ID.
        db.collection('customerDomains').doc(jumplink.firebase.config.customerDomain).collection('events').add(controller.newEvent)
        .then(function(docRef) {
            console.log("Document written with ID: ", docRef.id);
            var message = 'Ereignis mit der ID ' + docRef.id + ' erfolgreich eingetragen';
            
            showGlobalModal({
                title: 'Erfolgreich angelegt',
                body: message,
            });
            
            controller.debug(message, docRef);
        })
        .catch(function(error) {            
            showGlobalModal({
                title: 'Konnte nicht angelegt werden',
                body: error.message,
            });
            
            controller.debug('error', error);
        });
    };

    return controller;
  }
}