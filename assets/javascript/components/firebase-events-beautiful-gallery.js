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
    var observer;
    var $imagesWrapper = $el.find('.images-row');

    controller.ready = false;
    controller.containerClass = data.containerClass || 'container';
    controller.title = data.textTitle;
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
    };
    
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
    
    controller.ready = true;
        
    controller.images = getImagesFromEvents(controller.events);
    controller.debug('images', controller.images);
    
    var ready = function(mutationsList) {
        $imagesWrapper.masonry({
          itemSelector: '.image-col',
        });
        observer.disconnect();
    };
    
    observer = new MutationObserver(ready);
    observer.observe(el, {
      attributes: true,
      childList: true
    });

    return controller;
  }
};
