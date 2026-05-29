/**
 * firebase-events-beautiful-toolbar
 */
rivets.components['firebase-events-beautiful-toolbar'] = {
  template: function() {
    return jumplink.templates['firebase-events-beautiful-toolbar'];
  },

  initialize: function(el, data) {
    var controller = this;
    controller.debug = window.debug('rivets:firebase-events-beautiful-toolbar');
    controller.debug('initialize', el, data);
    var $el = $(el);
    var $collapse = $el.find('.collapse');

    controller.type = data.type;
    controller.calendar = data.calendar;
    controller.style = data.style;
    controller.events = data.events;
    
    controller.date;
    controller.quantity = 1;
    controller.total = 0;
    
    controller.name = '';
    controller.lastname = '';
    controller.email = '';
    controller.phone = '';
    controller.street = '';
    controller.zip = '';

    controller.collapsed = false;

    // Inline-Feedback für die Buchung (zuverlässiger als ein alertify-Toast,
    // der hinter der sticky Toolbar untergehen kann)
    controller.sending = false;
    controller.bookingMessage = '';
    controller.bookingSuccess = false;
    
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
        
        return jumplink.events.validate(validation, controller, keys);
    };
    
    var collapse = function(action) {
        $collapse.collapse(action);
    };
        
    controller.onSelectEventChanged = function(selectedEvent) {
        controller.event = controller.events[selectedEvent.index];
        controller.debug('onSelectEventChanged', controller.event);
        controller.total = jumplink.events.calcEventTotal(controller.event, controller.quantity);
        controller.validation = jumplink.events.getValidationsForEvent(controller.event);
        controller.validation = validate(controller.validation, ['quantity']);
    };
        
    controller.onDateChanged = function(dates) {
        controller.debug('onDateChanged', dates);
        controller.date = dates[0];
    };
    
    /**
     * Liest die Teilnehmerzahl direkt aus dem sichtbaren Eingabefeld.
     * rivets synchronisiert ein geleertes number-Feld nicht zuverlässig zurück,
     * daher lesen wir den Rohwert aus dem DOM und normalisieren ihn (leer -> '').
     */
    var syncQuantityFromDom = function() {
        var $inputs = $el.find('input[name="quantity"]');
        var $visible = $inputs.filter(':visible').first();
        var $q = $visible.length ? $visible : $inputs.first();
        if ($q.length) {
            var raw = $q.val();
            controller.quantity = (raw === '' || raw === null || typeof raw === 'undefined') ? '' : Number(raw);
        }
        return controller.quantity;
    };

    /**
     * Stellt sicher, dass beim Laden immer der Standardwert (1) im Feld steht.
     * Fängt die gelegentliche rivets-Render-Race ab, bei der das number-Feld
     * nach einem frischen Reload leer bleibt.
     */
    var ensureQuantityDefault = function() {
        if (!jumplink.utilities.isNumber(controller.quantity) || controller.quantity < 1) {
            controller.quantity = 1;
        }
        $el.find('input[name="quantity"]').each(function() {
            if (this.value === '' || this.value === null) {
                this.value = controller.quantity;
            }
        });
    };

    controller.onQuantityChanged = function(event) {
        if (event && event.target) {
            var raw = event.target.value;
            controller.quantity = (raw === '' || raw === null) ? '' : Number(raw);
        }
        controller.debug('onQuantityChanged', controller.quantity);
        controller.bookingMessage = ''; // altes Feedback zurücksetzen
        controller.total = jumplink.events.calcEventTotal(controller.event, controller.quantity);
        controller.validation = validate(controller.validation, ['quantity']);
    };
    
    controller.onFormChanged = function(event) {
        var $form = $(event.target);
        var name = $form.attr('name');
        controller.debug('onInputhanged', name);
        controller.bookingMessage = ''; // altes Feedback zurücksetzen
        controller.validation = validate(controller.validation, [name]);
    };
    
    controller.toggleCollapse = function(event) {
        collapse('toggle');
    };
    
    /**
     * Buchungsanfrage absenden – validiert das Formular und sendet die Daten
     * über jumplink.events.requestBooking() an die lokale JumpLink.Events-API.
     */
    controller.onBook = function() {
        controller.debug('onBook');
        // Teilnehmerzahl aus dem DOM übernehmen, falls das change-Event (z. B. bei
        // geleertem Feld) den Model-Wert nicht aktualisiert hat.
        syncQuantityFromDom();
        controller.validation = validate(controller.validation, ['quantity', 'name', 'lastname', 'email', 'phone', 'street', 'zip']);
        // var validator = $form.parsley();
        
        if(controller.validation.valid) {
            var form = {
                date: controller.date.format('DD.MM.YYYY'),
                quantity: controller.quantity,
                total: controller.total,
                name: controller.name,
                lastname: controller.lastname,
                email: controller.email,
                phone: controller.phone,
                street: controller.street,
                zip: controller.zip,
            };

            controller.sending = true;
            controller.bookingMessage = '';
            collapse('show'); // sicherstellen, dass das Feedback sichtbar ist

            // lokale API (Plugin) oder bestehender Layout-Handler – je nach Flag
            jumplink.events.requestBooking(form, controller.event)
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
            collapse('show');
        }
    };

    controller.selectEventValues = [];
    
    controller.events.forEach(function(event, i) {
        controller.selectEventValues.push({
            index: i,
            label: event.title,
            value: event.id,
        });
    });
    
    // Hinweis: Früher schloss ein globaler $(document).click das Accordion bei
    // JEDEM Klick außerhalb der Toolbar – inkl. Klicks im Datepicker-Popup (an
    // body gehängt) – und ein $el.click("show") mit fehlerhaftem
    // event.stopPropagation() (event war undefiniert -> ReferenceError in
    // Firefox) sollte das verhindern. Das brach das Absenden. Entfernt:
    // Öffnen/Schließen läuft ausschließlich über den Toggle- und den
    // Absenden-Button.

    $collapse.on('hide.bs.collapse', function () {
        controller.collapsed = false;
        controller.debug('hide.bs.collapse', controller.collapsed);
    });
    
    $collapse.on('show.bs.collapse', function () {
        controller.collapsed = true;
        controller.debug('show.bs.collapse', controller.collapsed);
    });
            
    // Use MutationObserver instead of deprecated DOMSubtreeModified
    var observer = new MutationObserver(function(mutationsList) {
        // Check if component is ready (has any child elements)
        if($el.children().length > 0) {
            observer.disconnect(); // Stop observing once component is ready
            setTimeout(function() {
                controller.onSelectEventChanged({index: 0});
                controller.onDateChanged([moment()]);
                controller.validation = jumplink.events.getValidationsForEvent(controller.event);
                ensureQuantityDefault();
            }, 0);
        }
    });

    // Start observing the element for child changes
    observer.observe(el, {
        childList: true,
        subtree: true
    });
    
    // Also call immediately in case component is already rendered
    setTimeout(function() {
        if($el.children().length > 0) {
            observer.disconnect();
            controller.onSelectEventChanged({index: 0});
            controller.onDateChanged([moment()]);
            controller.validation = jumplink.events.getValidationsForEvent(controller.event);
            ensureQuantityDefault();
        }
    }, 0);
        
    return controller;
  }
};
