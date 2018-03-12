// JumpLink object
window.jumplink = window.jumplink || {};
window.jumplink.utilities = window.jumplink.utilities || {};

/**
 * Show global modal with rivets.js
 * Needs the global-modal component in dom
 */
jumplink.utilities.showGlobalModal = function (data) {
    $.event.trigger('rivets:global-modal', [true, data]);
};

jumplink.utilities.cloneArray = function (array) {
    return array.slice(0);
};

jumplink.utilities.triggerResize = function () {
    window.dispatchEvent(new Event('resize'));
};

jumplink.utilities.triggerResize = function () {
    window.dispatchEvent(new Event('resize'));
};

/**
 * run Hyphenopoly
 * @see https://github.com/mnater/Hyphenopoly
 */
jumplink.utilities.hyphenate = function() {
    if(Hyphenopoly && Hyphenopoly.elementsReady) {
        setTimeout(function () {
            Hyphenopoly.evt(["timeout"]);
        }, Hyphenopoly.c.timeout);
    }
}

  /**
   * Covert adhesive keys like 
   *
   *  products_freeshipping_color: #1084f6 , like products_freeshipping_enabled: true
   *
   * to:
   * 
   *  products: {
   *    freeshipping: {
   *      color: #1084f6,
   *      enabled: true
   *    }
   *  }
   *
   * Used internally to convert the shopify theme settings to better usable javascript objects.
   */
jumplink.utilities.adhesiveKeyObjectToNestedObject = function (adhesiveKeyObject, separator = '_') {
    var nestedObject = {};
    for (var adhesiveKey in adhesiveKeyObject) {
      // skip loop if the property is from prototype
      if (!adhesiveKeyObject.hasOwnProperty(adhesiveKey)) {
        continue;
      }
      var object = adhesiveKeyObject[adhesiveKey];
      var keys = adhesiveKey.split(separator);
      var childObject;
      for (var i in keys) {
        var key = keys[i];       
        if(i <= 0) {
          // back to root object
          childObject = nestedObject;
        }

        // if there are more childs create tree element
        if( Number(i) < keys.length - 1) {
          if(typeof(childObject[key]) !== 'object') {
            childObject[key] = {};
          }
          childObject = childObject[key];
        } else {
          // on the end set the value
          childObject[key] = object;
        }
      }
    }
    return nestedObject;
};


/**
 * Check if element is visible after scrolling
 * 
 * @see https://stackoverflow.com/a/488073/1465919
 * @example
 * 
 * var isElementInView = window.jumplink.utilities.isElementInView($('#flyout-left-container'), false);
 * if (isElementInView) {
 *     console.log('in view');
 * } else {
 *     console.log('out of view');
 * }
 */
jumplink.utilities.isElementInView = function(element, fullyInView) {
    var pageTop = $(window).scrollTop();
    var pageBottom = pageTop + $(window).height();
    var elementTop = $(element).offset().top;
    var elementBottom = elementTop + $(element).height();

    if (fullyInView === true) {
        return ((pageTop < elementTop) && (pageBottom > elementBottom));
    } else {
        return ((elementTop <= pageBottom) && (elementBottom >= pageTop));
    }
};


/**
 * Get the selected value of a select option DOM element
 */
jumplink.utilities.getSelectedValue = function(selector) { 
    $selected = $(selector + ' option:selected');
    return $selected.val();
};

/**
 * set a value (not by the value attribute but by the text content of the option) on a select dom element
 */
jumplink.utilities.setSelectedValue = function(selector, value) {
    $select = $(selector);
    $select.val(value).change();
    return window.jumplink.utilities.getSelectedValue(selector);
};

jumplink.utilities.setCheckboxValue = function(selector, value) {
    $(selector).prop('checked', value);
};

jumplink.utilities.getCheckboxValue = function(selector) {
    $(selector).is(':checked');
};


/**
 * Gibt den Staffelpreis (der für die Anzahl der Personen passt) zurück
 */
jumplink.utilities.getEventScalePriceByQuantity = function(event, quanity) {
    var result = null;
    
    event.prices.forEach(function(priceObj) {
        if(quanity >= priceObj.min && quanity <= priceObj.max) {
            result = priceObj;
        }
    });
    return result;
};

/**
 * Gesamtpreis eines Events berechnen
 */
jumplink.utilities.calcEventTotal = function (event, quantity) {
    var priceObj = jumplink.utilities.getEventScalePriceByQuantity(event, quantity);
    var total = 0;
    if(priceObj === null) {
        var error = new Error('Kein Staffelpreis gefunden, TODO handle error');
        console.error(error);
        return null;
    }
    
    // Wenn nur jede zusätzliche Person gezählt werden soll
    if(priceObj.eachAdditionalUnit) {
        quantityToCalc = quantity - (priceObj.min - 1);
    } else {
        quantityToCalc = quantity;
    }
    
    total = priceObj.fixprice + (priceObj.price * quantityToCalc);
    
    return total;
};


/**
 * Parse jsonstrings in datasets of the .barba-container
 * 
 * @see theme.liquid for .barba-container  
 */
jumplink.utilities.parseDatasetJsonStrings = function (dataset) {
  var data = {};
  if(typeof(dataset.productJsonString) === 'string') {
    data.product = JSON.parse(dataset.productJsonString);
    // metafields needed to be set manually, its not allawed in shopify to get all as json
    data.product.metafields = {
      global: JSON.parse(dataset.productMetafieldsGlobalJsonString),
    };
  }

  // if it was already parsed
  if(typeof(dataset.productJsonString) === 'object' && typeof(dataset.productMetafieldsGlobalJsonString) === 'object') {
    data.product = dataset.productJsonString;
    data.product.metafields = dataset.productMetafieldsGlobalJsonString;
  }

  if(typeof(dataset.cartJsonString) === 'string') {
    data.cart = JSON.parse(dataset.cartJsonString);
  }

  if(typeof(dataset.cartJsonString) === 'object') {
    data.cart = dataset.cartJsonString;
  }
  return data;
};

/**
 * Get the height of the main navbar, useful to set the page padding if the navbar is fixed
 */
jumplink.utilities.getNavHeight = function () {
    return jumplink.cache.$mainNavbar.outerHeight(true);
};

jumplink.utilities.setBodyId = function (namespace) {
    jumplink.cache.$body.attr('id', namespace);
};

/**
 * Just get the digits of a string, useful to remove px pixel from css value
 * 
 * @see http://stackoverflow.com/a/1100653/1465919
 */
jumplink.utilities.justDigits = function (str) {
  var num = str.replace(/[^-\d\.]/g, '');
  if(isNaN(num)) {
    return 0;
  } else {
    return Number(num);
  }
};

jumplink.utilities.isFunction = function (value) {
  return typeof(value) === 'function';
};

/**
 * Check if variable is an Array
 * @see https://stackoverflow.com/a/4775737/1465919
 */
jumplink.utilities.isArray = function (value) {
    return Object.prototype.toString.call( value ) === '[object Array]';
};

/**
 * Check whether variable is number or string in JavaScript
 * @see https://stackoverflow.com/a/1421988/1465919
 */
jumplink.utilities.isNumber = function(n) {
    return !isNaN(parseFloat(n)) && !isNaN(n - 0);
};

/**
 * heck if type is Object
 * @see https://stackoverflow.com/a/4775737/1465919
 */
jumplink.utilities.isObject = function (obj) {
    return obj && typeof obj === 'object';
};

/**
 * Check if type is Boolean
 * @see https://stackoverflow.com/a/28814615/1465919
 */
jumplink.utilities.isBoolean = function (boolean) {
    return typeof(boolean) == typeof(true);
};

/**
 * Check if value is undefined
 */
jumplink.utilities.isUndefined = function (value) {
    return typeof(value) === 'undefined';
};

/**
 * Detect if current device has localStorage support
 */
jumplink.utilities.hasLocalStorage = function() {
  var mod = 'modernizr';
  if(typeof(jumplink._hasLocalStorage) === 'boolean') {
    return jumplink._hasLocalStorage;
  }
  if(typeof(localStorage) === 'undefined') {
    jumplink._hasLocalStorage = false;
    return jumplink._hasLocalStorage;
  }
  try {
    localStorage.setItem(mod, mod);
    localStorage.removeItem(mod);
    jumplink._hasLocalStorage = true;
    return jumplink._hasLocalStorage;
  } catch(e) {
    jumplink._hasLocalStorage = false;
    return jumplink._hasLocalStorage;
  }
};

/**
 * featureTest( 'position', 'sticky' )
 * @see https://github.com/filamentgroup/fixed-sticky/blob/master/fixedsticky.js
 */
jumplink.utilities.featureTest = function ( property, value, noPrefixes ) {
  // Thanks Modernizr! https://github.com/phistuck/Modernizr/commit/3fb7217f5f8274e2f11fe6cfeda7cfaf9948a1f5
  var prop = property + ':',
    el = document.createElement( 'test' ),
    mStyle = el.style;

  if( !noPrefixes ) {
    mStyle.cssText = prop + [ '-webkit-', '-moz-', '-ms-', '-o-', '' ].join( value + ';' + prop ) + value + ';';
  } else {
    mStyle.cssText = prop + value;
  }
  return mStyle[ property ].indexOf( value ) !== -1;
};

/**
 * Generate random number between two numbers
 */
jumplink.utilities.rand = function (min, max) {
  return Math.floor(Math.random()*(max-min+1)+min);
};

/**
 * Detect if current device is a touch device
 * 
 * @see https://github.com/Modernizr/Modernizr/blob/master/feature-detects/touchevents.js
 */
window.jumplink.utilities.isTouchDevice = function () {
  if(platform.name === 'Epiphany') {
    return false;
  }
  return ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;
};

/**
 * @see http://jquery.eisbehr.de/lazy/
 * TODO update barba cache after image was loaded
 */
jumplink.utilities.loadImages = function(loadAll, customSelector$) {
  var delay = -1;
  if(loadAll) {
    delay = 0;
  }

  if (!customSelector$) {
    customSelector$ = $('.lazy');
  }

  customSelector$.Lazy({
      // your configuration goes here
      scrollDirection: 'vertical',
      effect: "fadeIn",
      effectTime: 600,
      threshold: 0,
      visibleOnly: true,
      bind: 'event',
      delay: delay,
      beforeLoad: function(element) {
        // called before an elements gets handled
      },
      afterLoad: function(element) {
        window.jumplink.debug.image('afterLoad image', element);
      },
      onError: function(element) {
        window.jumplink.debug.image('error loading image', element);
      },
      onFinishedAll: function() {
        jumplink.utilities.replaceNoImage();
      }
  });
}


/**
 * Replace no images
 * Useful to replace Shopify Images with a custom placeholder image
 */
jumplink.utilities.replaceNoImageSrc = function() {
  var $images = $('[src*="no-image-"]');
  $images.each(function(index) {
    var $this = $(this);
    $this.attr('src', window.product.noImageSrc);
  });
};

jumplink.utilities.replaceNoImageBackground = function() {
  var $images = $('[style*="no-image-"]');
  $images.each(function(index) {
    var $this = $(this);
    $this.attr('style', 'background-image: url(' + window.product.noImageSrc + ');');
  });
};

jumplink.utilities.replaceNoImage = function() {
  jumplink.utilities.replaceNoImageSrc();
  jumplink.utilities.replaceNoImageBackground();
};

/**
 * Get hash from address bar
 */
jumplink.utilities.getHash = function () {
  return window.location.hash;
};

/**
 * Change hash from address bar
 */
jumplink.utilities.updateHash = function (hash) {
  return window.location.hash = hash;
};

/**
 * Remove hash from address bar
 */
jumplink.utilities.removeHash = function () {
  return history.pushState("", document.title, window.location.pathname + window.location.search);
};

/**
 * get hostname an path of address bar
 * @see http://stackoverflow.com/a/736970/1465919
 */
window.jumplink.getUrlLocation = function(href) {
  var l = document.createElement("a");
  l.href = href;
  return l;
};

window.jumplink.getCurrentLocation = function(href) {
  return jumplink.getUrlLocation(window.location);
};

/**
 * Cause back button to close Bootstrap modal windows
 * @see https://gist.github.com/thedamon/9276193
 */
window.jumplink.utilities.initModalHistoryBack = function (modalSelector) {

  if(!modalSelector) {
    modalSelector = ".modal";
  }

  $(modalSelector).on("shown.bs.modal", function()  { // any time a modal is shown
    var urlReplace = "#" + $(this).attr('id'); // make the hash the id of the modal shown
    history.pushState(null, null, urlReplace); // push state that hash into the url
  });

  // If a pushstate has previously happened and the back button is clicked, hide any modals.
  $(window).on('popstate', function() { 
    $(modalSelector).modal('hide');
  });
};

/**
 * Get Image of E-Mail by Gravawtar
 * @see https://stackoverflow.com/questions/705344/loading-gravatar-using-$
 */
window.jumplink.utilities.getGravatar = function (emailOrHash, classes, withHash, placeholder) {
  var src = null;

  if(typeof(emailOrHash) === 'undefined' || emailOrHash === null || !emailOrHash.length) {
    return console.error("Gravatar need an email or hash");
  }

  if(typeof(withHash) === 'undefined' || withHash !== true) {
    emailOrHash = md5(emailOrHash);
  }

  src = '//www.gravatar.com/avatar/' + emailOrHash;

  if(placeholder) {
    src += '?d=' + encodeURI('https:'+placeholder);
  }

  var $image = $('<img>').attr({src: src}).addClass(classes);
  return $image;
};

/**
 * 
 */
window.jumplink.utilities.initGravatarElements = function (selector, classes) {
  if(!classes) {
    classes = "";
  }
  $articles = $(selector);
  $articles.find('gravatar').each(function(index, gravatar) {
    var $gravatar = $(gravatar);
    var emailOrHash = null;
    var withHash = false;
    var placeholder = null;
    var data = $gravatar.data();

    if(data.placeholders) {
      placeholder = data.placeholders[ProductJS.Utilities.rand(0, data.placeholders.length-1)];
    }

    if( data.email ) {
      emailOrHash = $gravatar.data('email');
      withHash = false;
    }

    if( data.hash ) {
      emailOrHash = $gravatar.data('hash');
      withHash = true;
    }

    if(data.replace) {
      $image = jumplink.getGravatar(emailOrHash, classes+" "+$gravatar.attr('class'), withHash, placeholder);    
      $gravatar.replaceWith($image);
    } else {
      $image = jumplink.getGravatar(emailOrHash, classes, withHash, placeholder);    
      $gravatar.empty().append($image);
    }
    
  });
};

/**
 * Set each element of $elements to the height of the heightest element to have all elements with the same height 
 */
window.jumplink.utilities.sameHeightElements = function ($elements, defaultHeight) {
    if(!defaultHeight) {
      defaultHeight = 'auto';
    }
    var t = 0;
    var t_elem;
    // get heightest height
    $elements.each(function () {
        $this = $(this);
        // reset height
        $this.css('min-height', defaultHeight);
        if ( $this.outerHeight() > t ) {
            t_elem=this;
            t=$this.outerHeight();
        }
    });
    
    // set all smaller cards to the height of the heightest card
    $elements.each(function () {
        $this = $(this);
        if($this.outerHeight() != t) {
            $this.css('min-height', t);
        }
    });
};

/**
 * Performs a smooth page scroll to an anchor on the same page.y
 * @see https://css-tricks.com/snippets/jquery/smooth-scrolling/
 */
window.jumplink.utilities.initSmoothPageScroll = function () {
    var pathname = window.location.pathname;
    var selectpathname = pathname.replace('/', '\\/')+"#";
    var selector = "a[href*='"+selectpathname+"']:not([href='#'])";
    
    $(selector).click(function() {
        
        var href = $.attr(this, 'href');
        var index = href.indexOf('#');
        var id = href.substring(index, href.length);
        
        $('html, body').animate({
            scrollTop: $( id ).offset().top
        }, 500);
        return true;
    });
};

/**
 * Close all opend bootstrap modals
 * @see http://v4-alpha.getbootstrap.com/components/modal/
 */
window.jumplink.utilities.closeAllModals = function () {
  jumplink.cache.$body.removeClass('modal-open').removeAttr('style');
};
