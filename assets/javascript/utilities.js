// JumpLink object
window.jumplink = window.jumplink || {};


/**
 * Parse jsonstrings in datasets of the .barba-container
 * 
 * @see theme.liquid for .barba-container  
 */
window.jumplink.parseDatasetJsonStrings = function (dataset) {
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
jumplink.getNavHeight = function () {
    return jumplink.cache.$mainNavbar.outerHeight(true);
};

jumplink.setBodyId = function (namespace) {
    jumplink.cache.$body.attr('id', namespace);
};

/**
 * Just get the digits of a string, useful to remove px pixel from css value
 * 
 * @see http://stackoverflow.com/a/1100653/1465919
 */
window.jumplink.justDigits = function (str) {
  var num = str.replace(/[^-\d\.]/g, '');
  if(isNaN(num)) {
    return 0;
  } else {
    return Number(num);
  }
};

/**
 * Detect if current device is a touch device
 * 
 * @see https://github.com/Modernizr/Modernizr/blob/master/feature-detects/touchevents.js
 */
window.jumplink.isTouchDevice = function () {
  return ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;
};

window.jumplink.isFunction = function (value) {
  return typeof(value) === 'function';
};

/**
 * Detect if current device has localStorage support
 */
window.jumplink.hasLocalStorage = function() {
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
window.jumplink.featureTest = function ( property, value, noPrefixes ) {
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
window.jumplink.rand = function (min, max) {
  return Math.floor(Math.random()*(max-min+1)+min);
};


// Do not use window.alert!
(function(proxied) {
  window.alert = function() {
    // do something here
    return proxied.apply(this, arguments);
  };
})(console.log);

/**
 * featureTest( 'position', 'sticky' )
 * @see https://github.com/filamentgroup/fixed-sticky/blob/master/fixedsticky.js
 */
window.jumplink.featureTest = function ( property, value, noPrefixes ) {
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
 * Detect if current device is a touch device
 * 
 * @see https://github.com/Modernizr/Modernizr/blob/master/feature-detects/touchevents.js
 */
window.jumplink.isTouchDevice = function () {
  if(platform.name === 'Epiphany') {
    return false;
  }
  return ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;
};

/**
 * @see http://jquery.eisbehr.de/lazy/
 * TODO update barba cache after image was loaded
 */
window.jumplink.loadImages = function(loadAll, customSelector$) {
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
        jumplink.replaceNoImage();
      }
  });
}


/**
 * Replace no images
 * Useful to replace Shopify Images with a custom placeholder image
 */
window.jumplink.replaceNoImageSrc = function() {
  var $images = $('[src*="no-image-"]');
  $images.each(function(index) {
    var $this = $(this);
    $this.attr('src', window.product.noImageSrc);
  });
};

window.jumplink.replaceNoImageBackground = function() {
  var $images = $('[style*="no-image-"]');
  $images.each(function(index) {
    var $this = $(this);
    $this.attr('style', 'background-image: url(' + window.product.noImageSrc + ');');
  });
};

window.jumplink.replaceNoImage = function() {
  jumplink.replaceNoImageSrc();
  jumplink.replaceNoImageBackground();
};

/**
 * Get hash from address bar
 */
window.jumplink.getHash = function () {
  return window.location.hash;
};

/**
 * Change hash from address bar
 */
window.jumplink.updateHash = function (hash) {
  return window.location.hash = hash;
};

/**
 * Remove hash from address bar
 */
window.jumplink.removeHash = function () {
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
window.jumplink.initModalHistoryBack = function (modalSelector) {

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
window.jumplink.getGravatar = function (emailOrHash, classes, withHash, placeholder) {
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

  //console.log("getGravatar", emailOrHash, classes, withHash, placeholder, src);

  var $image = $('<img>').attr({src: src}).addClass(classes);
  return $image;
};

/**
 * 
 */
window.jumplink.initGravatarElements = function (selector, classes) {
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

    //console.log("data", data);

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
window.jumplink.sameHeightElements = function ($elements, defaultHeight) {
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
window.jumplink.initSmoothPageScroll = function () {
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
window.jumplink.closeAllModals = function () {
  jumplink.cache.$body.removeClass('modal-open').removeAttr('style');
};
