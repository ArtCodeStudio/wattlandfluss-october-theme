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
    controller.debug = window.debug('rivets:firebase-event-beautiful');
    controller.debug('initialize', el, data);
    var $el = $(el);

    controller.ready = false;
    controller.title = data.textTitle;
    controller.active = data.active;
    controller.calendar = data.calendar;
    controller.type = data.type;
    controller.limit = data.limit;
    controller.containerClass = data.containerClass || 'container';
    controller.showBookButton = data.showBookButton;
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
    
    controller.show = function(event, controller) {
        var $this = $(event.target);
        var data = $this.data();
        controller.debug('show', controller.event, data);
        Barba.Pjax.goTo(controller.detailPage + '#'+data.id);
    };
    
    controller.bookByEvent = function(event, controller) {
        var $this = $(event.target);
        var data = $this.data();
        controller.debug('bookByEvent', controller.event, data);
        $.event.trigger('rivets:firebase-events-beautiful-book-modal', [true, controller.event.title, controller.event]);
    };
    
    var checkHash = function() {
        var hash = jumplink.utilities.getHash();
        controller.debug('[checkHash] hash', hash);
        if(hash === '#'+controller.event.id) {
            controller.debug('[checkHash] TODO scroll to event', $el.offset().top);
            
            $('html, body').animate({
                scrollTop: $el.offset().top
            }, 500);
        }
    };
    
    // WORKAROUND
    setTimeout(function() {
        controller.ready = true;
    }, 0);
    
    var ready = function(mutationsList) {
        checkHash();
        jumplink.utilities.hyphenate();
        observer.disconnect();
    };
    
    observer = new MutationObserver(ready);
    observer.observe(el, {
      childList: true
    });

    return controller;
  }
};
