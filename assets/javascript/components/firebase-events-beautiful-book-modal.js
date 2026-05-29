/**
 * A modal component for alerts, do you need to use this component in dom only once
 * and you can call by tigger a global event:
 * @example $.event.trigger('rivets:firebase-events-beautiful-book-modal', [true, data]);
 * 
 * The data param should have title, body, ..
 * 
 * @events
 *  * rivets:firebase-events-beautiful-book-modal (event, show, data)
 */
rivets.components['firebase-events-beautiful-book-modal'] = {

  template: function() {
    // return $('template#firebase-events-beautiful-book-modal').html();
    return jumplink.templates['firebase-events-beautiful-book-modal'];
  },

  initialize: function(el, data) {
    var controller = this;
    controller.debug = window.debug('rivets:firebase-events-beautiful-book-modal');
    controller.debug('initialize', el, data);
    
    controller.type = data.type;
    controller.calendar = data.calendar;
    controller.style = data.style;
    
    controller.form = {};
    controller.form.date;
    controller.form.quantity = 1;
    controller.form.total = 0;
    
    controller.form.name = '';
    controller.form.lastname = '';
    controller.form.email = '';
    controller.form.phone = '';
    controller.form.street = '';
    controller.form.zip = '';
    
    controller.title;
    controller.event;

    // Inline-Feedback für die Buchung (zuverlässiger als ein alertify-Toast)
    controller.sending = false;
    controller.bookingMessage = '';
    controller.bookingSuccess = false;

    var $el = $(el);
    var $modal = $el.find('#firebase-events-beautiful-book-modal');

    /** Teilnehmerzahl deterministisch aus dem DOM lesen (rivets synct leere
     *  number-Felder nicht zuverlässig). Leer -> ''. */
    var syncQuantityFromDom = function() {
        var $q = $el.find('input[name="quantity"]').filter(':visible').first();
        if (!$q.length) { $q = $el.find('input[name="quantity"]').first(); }
        if ($q.length) {
            var raw = $q.val();
            controller.form.quantity = (raw === '' || raw === null || typeof raw === 'undefined') ? '' : Number(raw);
        }
    };
        
    /**
     * validate form, if keys is undefined all keys will be validated
     * @param validation object with the validation rules
     * @param keys keys you want to validate
     */
    var validate = function(validation, keys) {
        validation.valid = true;
        
        if(jumplink.utilities.isUndefined(keys)) {
            keys = ['quantity', 'name', 'lastname', 'email', 'phone', 'street', 'zip'];
        }
        
        return jumplink.events.validate(validation, controller.form, keys);
    };
        
    controller.onQuantityChanged = function(event) {
        if (event && event.target) {
            var raw = event.target.value;
            controller.form.quantity = (raw === '' || raw === null) ? '' : Number(raw);
        }
        controller.debug('onQuantityChanged', controller.form.quantity);
        controller.bookingMessage = '';
        controller.form.total = jumplink.events.calcEventTotal(controller.event, controller.form.quantity);
        controller.validation = validate(controller.validation, ['quantity']);
    };

    controller.onFormChanged = function(event) {
        var $form = $(event.target);
        var name = $form.attr('name');
        controller.debug('onInputhanged', name);
        controller.bookingMessage = '';
        controller.validation = validate(controller.validation, [name]);
    };
    
    /**
     * Buchungsanfrage absenden – validiert das Formular und sendet die Daten
     * über jumplink.events.requestBooking() an die lokale JumpLink.Events-API.
     */
    controller.onBook = function() {
        controller.debug('onBook');
        syncQuantityFromDom();
        controller.validation = validate(controller.validation, ['quantity', 'name', 'lastname', 'email', 'phone', 'street', 'zip']);

        if(controller.validation.valid) {

            var data = controller.form;
            data.date = moment(controller.form.date).format('DD.MM.YYYY');

            controller.sending = true;
            controller.bookingMessage = '';

            jumplink.events.requestBooking(data, controller.event)
                .then(function(response) {
                    controller.debug('request success', response);
                    controller.sending = false;
                    controller.bookingSuccess = true;
                    controller.bookingMessage = 'Vielen Dank! Ihre Anfrage wurde abgeschickt – wir melden uns in Kürze bei Ihnen.';
                    alertify.notify('Anfrage erfolgreich abgeschickt.', 'success', 5, function(){});
                })
                .catch(function(err) {
                    controller.debug('request error', err);
                    controller.sending = false;
                    controller.bookingSuccess = false;
                    controller.bookingMessage = 'Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder kontaktieren Sie uns telefonisch.';
                    alertify.notify('Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.', 'error', 5, function(){});
                });
        } else {
            controller.bookingSuccess = false;
            controller.bookingMessage = 'Bitte überprüfen Sie Ihre Eingaben (Vorname, Nachname und E-Mail sind erforderlich).';
            alertify.notify('Bitte überprüfen Sie Ihr Eingabeformular', 'error', 5, function(){});
        }
    };
    
    /**
     * global event to show / hide this modal 
     * 
     */
    $(document).bind('rivets:firebase-events-beautiful-book-modal', function (event, show, title, eventObj) {
        if(show) {
            controller.title = title;
            controller.event = eventObj;
            controller.form.date = moment(controller.event.startAt).format('YYYY-MM-DD');
            // frisches Formular: Teilnehmer-Default und altes Feedback zurücksetzen
            if (!jumplink.utilities.isNumber(controller.form.quantity) || controller.form.quantity < 1) {
                controller.form.quantity = 1;
            }
            controller.sending = false;
            controller.bookingMessage = '';
            controller.bookingSuccess = false;
            controller.validation = jumplink.events.getValidationsForEvent(controller.event);
            controller.form.total = jumplink.events.calcEventTotal(controller.event, controller.form.quantity);
            controller.debug('show', show, title, controller.event);
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