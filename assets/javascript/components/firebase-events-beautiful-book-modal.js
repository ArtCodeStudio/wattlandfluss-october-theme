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
    
    var $el = $(el);
    var $modal = $el.find('#firebase-events-beautiful-book-modal');
        
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
        controller.debug('onQuantityChanged', controller.form.quantity);
        controller.form.total = jumplink.events.calcEventTotal(controller.event, controller.form.quantity);
        controller.validation = validate(controller.validation, ['quantity']);
    };
    
    controller.onFormChanged = function(event) {
        var $form = $(event.target);
        var name = $form.attr('name');
        controller.debug('onInputhanged', name);
        controller.validation = validate(controller.validation, [name]);
    };
    
    /**
     * Aks for booking this event by send a octobercms request with the informations from the form.
     * The PHP funtion `onReguestEvent` is defined in the layout file
     * 
     * @see https://octobercms.com/docs/ajax/javascript-api
     */
    controller.onBook = function() {
        controller.debug('onBook');
        controller.validation = validate(controller.validation, ['quantity', 'name', 'lastname', 'email', 'phone', 'street', 'zip']);
        // var validator = $form.parsley();
        
        if(controller.validation.valid) {
            
            var data = controller.form;
            data.date = moment(controller.form.date).format('DD.MM.YYYY');
            data.event = controller.event;
            
            // use the october cms javascript api function
            $.request('onReguestEvent', {
                data: data,
                success: function(data) {
                    this.success(data).done(function() {
                        controller.debug('reuqest success', data);
                        
                        var message = 'Anfrage erfolgreich abgeschickt.';
                        var notification = alertify.notify(message, 'success' ,5, function(){
                            
                        });
                        
                        controller.hide();
                        
                    });
                }
            });
        } else {
            var message = 'Bitte überprüfen Sie Ihr Eingabeformular';
            var notification = alertify.notify(message, 'error' ,5, function(){
                
            });
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