/**
 * rv-img
 */
rivets.components['rv-img'] = {
  template: function() {
    // return $('template#rv-img').html();
    return jumplink.templates['rv-img'];
  },
  initialize: function(el, data) {
    var controller = this;
    // console.debug = window.debug('rivets:rv-img');
    var $el = $(el);
    var observer;
    controller.src = data.src;
    controller.alt = data.alt;
    controller.style = '';
    controller.loaded = false;
        
    // default
    if(jumplink.utilities.isUndefined(data.visibleOnly)) {
        data.visibleOnly = false;
    }
    if(jumplink.utilities.isString(data.visibleOnly)) {
        data.visibleOnly = data.visibleOnly === 'true' || data.visibleOnly === '1';
    }
    if(jumplink.utilities.isNumber(data.visibleOnly)) {
        data.visibleOnly = data.visibleOnly === 1;
    }
    
    if(!jumplink.utilities.isNumber(data.delay)) {
        data.delay = -1;
    }
    if(jumplink.utilities.isString(data.delay)) {
        data.delay = Number(data.delay);
    }
    
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
        visibleOnly: data.visibleOnly,
        bind: 'event',
        delay: data.delay,
        /**  called before an elements gets handled */
        beforeLoad: function(element) {
            controller.loaded = false;
            // $el.off('DOMSubtreeModified');
            // console.debug('[beforeLoad]', element, controller);
            if (jumplink.utilities.isFunction(data.beforeLoad)) {
                data.beforeLoad($el, controller);
            }
        },
        
        /**  called after an element was successfully handled */
        afterLoad: function(element) {
            controller.loaded = true;
            // console.debug('[afterLoad]', element, controller);
            // controller.style = 'padding-top: ' + controller.heightInPercent + '%;';
            if (jumplink.utilities.isFunction(data.afterLoad)) {
                data.afterLoad($el, controller);
            }
        },
        
        /** called whenever an element could not be handled */
        onError: function(element) {
            controller.loaded = false;
            // console.debug('[onError] image "' + controller.src + '" could not be loaded');
            if (jumplink.utilities.isFunction(data.onError)) {
                data.onError($el, controller);
            }
        },
        
        /**  called once all elements was handled */
        onFinishedAll: function() {
            controller.loaded = true;
            // $el.find('spinner').hide();
            // console.debug('[onFinishedAll]', controller);
            if (jumplink.utilities.isFunction(data.onFinishedAll)) {
                data.onFinishedAll($el, controller);
            }
        },
    };
    
    // console.debug('initialize', el, data, controller, options);
        
    /**
     * For lazy loading options see https://github.com/eisbehr-/jquery.lazy#configuration-parameters
     */
    var ready = function(mutationsList) {
        //console.debug('ready mutationsList', mutationsList);
        var $img = $el.find('.lazy');  
        if($img.length) {
            var data = $img.data();
            if(!data.src) {
                // console.warn('component was not rendered correctly! Do a WORKAROUND. data:', data);
                rivets.bind($img, controller); // WORKAROUND
                jumplink.utilities.triggerResize();
            }
            $img.Lazy(options);
            // console.debug('init Lazy', options, $img, $img.data());
        } else {
            
        }
    }  

    // Use MutationObserver instead of deprecated DOMSubtreeModified
    observer = new MutationObserver(function(mutationsList) {
        // Check if .lazy element was added
        var $img = $el.find('.lazy');
        if($img.length) {
            observer.disconnect(); // Stop observing once we found the element
            setTimeout(function() {
                ready(mutationsList);
            }, 0);
        }
    });
    
    // Start observing the element for child changes
    observer.observe(el, {
        childList: true,
        subtree: true
    });
    
    // Also call ready immediately in case element is already rendered
    setTimeout(function() {
        var $img = $el.find('.lazy');
        if($img.length) {
            observer.disconnect();
            ready();
        }
    }, 0);
            
    return controller;
  }
};