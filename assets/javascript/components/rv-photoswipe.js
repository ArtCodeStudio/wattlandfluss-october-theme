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
    };
    
    controller.prev = function(event, controller) {
        pswp.prev();
    };
    
    controller.close = function(event, controller) {
        pswp.close();
    };
    
    controller.toggleZoom = function(event, controller) {
        pswp.toggleDesktopZoom();
    };

    controller.toggleFullscreen = function(event, controller) {
        var _fullscrenAPI = pswp.ui.getFullscreenAPI();
		if(_fullscrenAPI.isFullscreen()) {
			_fullscrenAPI.exit();
		} else {
			_fullscrenAPI.enter();
		}
        pswp.ui.updateFullscreen();
    };
    
    $(document).bind('rivets:photoswipe:open', function (event, $imgWrapper, index, images) {
        controller.debug('[rivets:photoswipe:open]', event, index, images);
        $imagesWrapper = $imgWrapper;
        controller.images = images;
        open(index);
    });
    
    return controller;
  }
};