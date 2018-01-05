// JumpLink object
window.jumplink = window.jumplink || {};

// debugging https://github.com/visionmedia/debug
window.jumplink.debug = window.jumplink.debug || {};
window.jumplink.debug.barba = debug('theme:barba');
window.jumplink.debug.events = debug('theme:events');
window.jumplink.debug.tracking = debug('theme:tracking');
window.jumplink.debug.raven = debug('theme:raven');
window.jumplink.debug.image = debug('theme:image');
window.jumplink.debug.info = debug('theme:info');
window.jumplink.debug.error = debug('theme:error');
window.jumplink.debug.warn = debug('theme:warn');
window.jumplink.debug.browser = debug('theme:browser');

// activate debuggin
localStorage.debug = 'theme:*';


/**
 * Cache JQuery selectors we need in different functions, only working outside of barba templates
 */
jumplink.cacheSelectors = function () {
  console.log('cacheSelectors');
  jumplink.cache = {
    // General
    $html                    : $('html'),
    $body                    : $('body'),
    $htmlBody                : $('html, body'),
    $window                  : $(window),
    $document                : $(document),

    $mainNavbar              : $('#main-navbar'),
    $mainFooter              : $('#main-footer'),
    $leftSidebar             : $('#left-sidebar'),
    $rightSidebar            : $('#right-sidebar'),
    $Sidebars                : $('#right-sidebar, #left-sidebar'),
    // $navTree                 : $('#nav-tree'),

    $barbaWrapper            : $('#barba-wrapper'),
    
    $prevArrowTeplate        : $('#slick-prev-arrow'),
    $nextArrowTeplate        : $('#slick-next-arrow'),
    
    // barba
    lastElementClicked       : null,
    // to scroll to last product
    lastProductDataset       : null,
    lastCollectionDataset       : null
  };
};

/**
 * Move background image on mouse position
 * @see https://codepen.io/chrisboon27/pen/rEDIC
 */
jumplink.movingBackground = function (selectorString, fittWidth, fittHeight) {
    var movementStrength = 20;
    var height = movementStrength / $(window).height();
    var width = movementStrength / $(window).width();
    // $(selectorString).css("background-size", 'calc(100% + 50px) calc(100% + 50px)');
    $(document).mousemove(function(e){
        var pageX = e.pageX - ($(window).width() / 2);
        var pageY = e.pageY - ($(window).height() / 2);
        var newvalueX = width * pageX * -1;// + (25/2);
        var newvalueY = height * pageY * -1;// - (25/2);
        
        if(fittWidth) {
            $(selectorString).css('background-size', 'calc(100% + '+movementStrength*4+'px) auto');
        }
        
        if(fittHeight) {
            $(selectorString).css('background-size', 'auto calc(100% + '+movementStrength*4+'px)');
        }
        
        if(fittWidth && fittHeight) {
            $(selectorString).css('background-size', 'calc(100% + '+movementStrength*4+'px) calc(100% + '+movementStrength*4+'px)');
        }
        $(selectorString).css('background-position', 'calc(50% + '+newvalueX+'px) calc(50% + '+newvalueY+'px)');
        
    });
};


jumplink.initMomentDataApi = function () {

    var $displayFromNow = $('[data-moment-display-from-now]');
    // console.log($displayFromNow);
    $displayFromNow.each(function () {
        $this = $(this);
        var date = moment($this.data('momentDisplayFromNow')).fromNow();
        $this.text(date);
    });
    
    var $displayToNow = $('[data-moment-display-to-now]');
    $displayToNow.each(function () {
        $this = $(this);
        var date = moment($this.data('momentDisplayToNow')).fromNow();
        $this.text(date);
    });
};

jumplink.setLanguage = function () {
    var langCode = jumplink.cache.$html.attr('lang');
    
    if(typeof(moment) !== 'undefined') {
        moment.locale(langCode);
    }
};

/**
 * Init the rightsidebar using simpler-sidebar and transformicons
 * @see http://dcdeiv.github.io/simpler-sidebar/
 * @see http://www.transformicons.com/
 */
jumplink.initRightSidebar = function () {
  // init tree before sidebar to cache tree events in sidebar to close the sidebar
  var closingLinks = '.close-sidebar';
  var align = 'right';
  var trigger = '[data-toggle="sidebar"][data-target="#right-sidebar"]';
  var mask = true;
  var $rightSidebar = jumplink.cache.$rightSidebar;

  $rightSidebar.simplerSidebar({
    attr: "simplersidebar",
    init: "closed",
    top: 0,
    align: align, // sidebar.align
    gap: 64, // sidebar.gap
    animation: {
      duration: 500,
      easing: "swing"
    },
    selectors: {
      trigger: trigger, // opener
      quitter: closingLinks // sidebar.closingLinks
    },
    sidebar: {
      width: 300
    },
    mask: {
      display: mask,
      css: {
        backgroundColor: "black",
        opacity: 0.5,
        filter: "Alpha(opacity=50)",
        'z-index': 998,
      }
    },
    events: {
      on: {
        animation: {
          open: function() {
            console.log('open');
            // icon animation for open
            transformicons.transform($('.sidebar-toggler.tcon')[ 0 ]);
          },
          close: function() {
            console.log('close');
            // icon animation for close
            transformicons.revert($('.sidebar-toggler.tcon')[ 0 ]);
          },
          both: function() {

          },
        }
      },
      callbacks: {
        animation: {
          open: function() {

          },
          close: function() {

          },
          both: function() {
            
          },
          freezePage: true
        }
      }
    }
  });
  
    $rightSidebar.on('swiperight', function(e) { 
        console.log('swiperight');
        jumplink.toggleRightSidebar();
    });
      
  $rightSidebar.show();

  if(jumplink.cache && jumplink.cache.$window && jumplink.cache.$Sidebars) {
    jumplink.cache.$window.resize(function() {
      jumplink.cache.$Sidebars.css( 'padding-top', jumplink.getNavHeight()+'px');
    });
    jumplink.cache.$Sidebars.css( 'padding-top', jumplink.getNavHeight()+'px');
  } else {
    console.error(new Error('jumplink.cache is undefined'));
  }
};

/**
 * Open or close the right sidebar
 */
jumplink.toggleRightSidebar = function () {
  $( '[data-target="#right-sidebar"]' ).click();
};

/**
 * Set all navs and subnavs on navbar to "not active"
 */
jumplink.resetNav = function () {
    jumplink.cache.$mainNavbar.find('li, a').removeClass('active');
    jumplink.cache.$mainFooter.find('a').removeClass('active');
};

/**
 * Find active navs and set them to active
 */
jumplink.setNavActive = function(handle) {
    // jumplink.cache.$mainNavbar.find('li.'+handle+', .dropdown-item.'+handle).addClass('active');
    var $navbarLi = jumplink.cache.$mainNavbar.find('li.'+handle).addClass('active');
    var $navbarA = jumplink.cache.$mainNavbar.find('a.'+handle).addClass('active');
    var $footerA = jumplink.cache.$mainFooter.find('a.'+handle).addClass('active');
};

/**
 * Init a siple carousel using slick
 * @see https://github.com/kenwheeler/slick
 */
jumplink.initCarousel = function(handle) {
    var $slick = $('#'+handle);
    var slickSettings = {
        infinite: true, 
        autoplay: false,
        dots: false,
        arrows: true,
        slidesToShow:3,
        slidesToScroll: 1,
        prevArrow: jumplink.cache.$prevArrowTeplate.html(),
        nextArrow: jumplink.cache.$nextArrowTeplate.html(),
        responsive: [
            {
                // Extra large devices (large desktops, 75em and up)
                breakpoint: 900,
                settings: {
                    arrows: true,
                    slidesToShow:3,
                    slidesToScroll: 1,
                }
            },
            {
                // Large devices (desktops, 62em and up)
                breakpoint: 744,
                settings: {
                    arrows: true,
                    slidesToShow:2,
                    slidesToScroll: 1,
                }
            },
            {
                // Medium devices (tablets, 48em and up)
                breakpoint: 576,
                settings: {
                    arrows: false,
                    slidesToShow:1,
                    slidesToScroll: 1,
                }
            },
            {
                // Small devices (landscape phones, 34em and up)
                breakpoint: 408,
                settings: {
                    arrows: false,
                    slidesToShow:1,
                    slidesToScroll: 1,
                }
            }
        ]
    };
    $slick.slick(slickSettings);
};

/**
 * Init product carousel using slick
 * @see https://github.com/kenwheeler/slick
 */
var initProductCarousel = function() {
    var $slick = $('#product_list_carousel_product_carousel');
    var slickSettings = {
        infinite: true, 
        autoplay: false,
        dots: false,
        arrows: true,
        slidesToShow:4,
        slidesToScroll: 1,
        prevArrow: jumplink.cache.$prevArrowTeplate.html(),
        nextArrow: jumplink.cache.$nextArrowTeplate.html(),
        responsive: [
            {
                // Extra large devices (large desktops, 75em and up)
                breakpoint: 900,
                settings: {
                    arrows: true,
                    slidesToShow:4,
                    slidesToScroll: 1,
                }
            },
            {
                // Large devices (desktops, 62em and up)
                breakpoint: 744,
                settings: {
                    arrows: true,
                    slidesToShow:2,
                    slidesToScroll: 1,
                }
            },
            {
                // Medium devices (tablets, 48em and up)
                breakpoint: 576,
                settings: {
                    arrows: false,
                    slidesToShow:1,
                    slidesToScroll: 1,
                }
            },
            {
                // Small devices (landscape phones, 34em and up)
                breakpoint: 408,
                settings: {
                    arrows: false,
                    slidesToShow:1,
                    slidesToScroll: 1,
                }
            }
        ]
    };
    $slick.slick(slickSettings);
};

/**
 * highlight product on click
 */
var initProductList = function() {
    $(".product-grid-item" ).click(function() {
        console.log('product clicked');
        $('.product-grid-item').removeClass('selected');
        $(this).addClass('selected');
    });
};


/**
 * To test if the jumplink.newPageReady was called at the first
 */
window.jumplink.firstNewPageReadyEvent = true;


window.jumplink.templates.prepairTemplate = function(dataset) {
    
    // console.log('newPageReady');
    var data = window.jumplink.parseDatasetJsonStrings(dataset);

    window.jumplink.closeAllModals();
    jumplink.initDataApi();
    jumplink.resetNav();
    jumplink.setBodyId(dataset.namespace);
    
    jumplink.initMomentDataApi();
    
    jumplink.movingBackground('.background-01', true, false);
    jumplink.movingBackground('.background-01b', false, false);

    if(typeof(Hyphenator) !== 'undefined') {
      Hyphenator.run();
    }
    
    if(typeof(Prism) !== 'undefined') {
        Prism.highlightAll();
    }

  // preload images again if failed in barba or this is the first page request
  // window.jumplink.loadImagesByNamespace();

  // window.jumplink.loadVideos();

  // window.jumplink.showHideNewsletterForm(dataset, data);

  // window.jumplink.initDataAttributes(dataset);

  //  window.jumplink.setNavActive(dataset, data);

  jumplink.debug.templates('dataset', dataset, 'data', data);

  window.jumplink.partials.init(dataset, data);
  window.jumplink.templates.init(dataset, data);

  if(window.jumplink.firstNewPageReadyEvent) {
    $(document).trigger('jumplink.newPageReady', [true, dataset, data]);
    jumplink.firstNewPageReadyEvent = false;
  } else {
    $(document).trigger('jumplink.newPageReady', [false, dataset, data]);
  }
};

/**
 * Init Javascripts insite of barba.js
 * 
 * @note see init() for inits outsite of barba.js 
 */
var initTemplates = function () {

  Barba.Dispatcher.on('linkClicked', function(el) {
    jumplink.cache.lastElementClicked = el;
  });

  Barba.Dispatcher.on('newPageReady', function(currentStatus, oldStatus, container) {
          
    window.jumplink.templates.prepairTemplate(container.dataset);
   
  });
};

/**
 * Barba.js Slide and fade transition
 * Slide for product pages
 * fade for all others
 * 
 * @see http://barbajs.org/demo/nextprev/nextprev.js
 */
var initBarbaTransition = function() {
  var MovePage = Barba.BaseTransition.extend({
    start: function() {
      /**
       * This function is automatically called as soon the Transition starts
       * this.newContainerLoading is a Promise for the loading of the new container
       * (Barba.js also comes with an handy Promise polyfill!)
       */
      this.$oldContainer = $(this.oldContainer);
      this.originalThumb = jumplink.cache.lastElementClicked; // for what is this?
      this.$lastElementClicked = $(jumplink.cache.lastElementClicked);
      this.url = this.$lastElementClicked.attr('href');

      // As soon the loading is finished and the old page is faded out, let's fade the new page
      Promise
        .all([this.newContainerLoading, this.beforeMove()])
        .then(this.scrollTop())
        .then(this.afterMove.bind(this));
    },

    // logic before any effect applies
    beforeMove: function() {

      // if true use slide effect else use fade out effect
      if(this.$oldContainer.data().namespace === 'product' && (this.$lastElementClicked.hasClass('next') || this.$lastElementClicked.hasClass('prev')) ) {
        // slide effekt, in this step do nothing
        var deferred = Barba.Utils.deferred();
        deferred.resolve();
        return deferred.promise;
      } else {
        // fade out
        return this.fadeOut();
      }

    },

    afterMove: function() {
      this.$newContainer = $(this.newContainer);
      
      // var minHeight = jumplink.setBarbaContainerMinHeight(this.newContainer);
      
      if( this.$oldContainer.data().namespace === 'product' && this.$newContainer.data().namespace === 'product' && (!this.url || this.url.indexOf('src=recomatic') === -1) && !this.$lastElementClicked.hasClass('cart-link')) {
        // slide effekt
        return this.slidePages();
      } else {
        // fade out
        return this.fadeIn();
      }
    },

    // slide effect implementation
    slidePages: function() {
      var _this = this;
      var goingForward = true;

      if ( _this.$oldContainer.data().productUrl === _this.$newContainer.data().productNextUrl ) {
        goingForward = false;
      }

      var minHeight = jumplink.setBarbaContainerMinHeight(_this.$newContainer);
      var top = jumplink.getNavHeight();

      jumplink.cache.$html.css({'overflow': 'hidden'});
      jumplink.cache.$body.css({'overflow-x': 'hidden'});

      jumplink.freezeElements(_this.$oldContainer, _this.$newContainer, {
        // 'margin-left': '7.5px',
      });

      TweenLite.set(this.newContainer, {
        visibility: 'visible',
        xPercent: goingForward ? 100 : -100,
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        'padding-top': top,
        'min-height': minHeight,
      });

      TweenLite.to(_this.oldContainer, 0.6, { xPercent: goingForward ? -100 : 100 });
      TweenLite.to(_this.newContainer, 0.6, { xPercent: 0, onComplete: function() {

        TweenLite.set(_this.newContainer, {
          clearProps: 'all',
        });

        TweenLite.set(_this.newContainer, {
          'min-height': minHeight
        });

        jumplink.unfreezeElements();

        jumplink.cache.$html.css({'overflow': ''});
        jumplink.cache.$body.css({'overflow-x': ''});

        _this.done();
      }});

    },

    // fade out effect implementation
    fadeOut: function() {
      /**
       * this.oldContainer is the HTMLElement of the old Container
       */
      return this.$oldContainer.animate({ opacity: 0 }).promise();
    },

    // fade new content in effect
    fadeIn: function() {
      /**
       * this.newContainer is the HTMLElement of the new Container
       * At this stage newContainer is on the DOM (inside our #barba-container and with visibility: hidden-xs-up)
       * Please note, newContainer is available just after newContainerLoading is resolved!
       */
      var _this = this;

      this.$oldContainer.hide();

      // var minHeight = jumplink.setBarbaContainerMinHeight(this.$newContainer);

      this.$newContainer.css({
        visibility : 'visible',
        opacity : 0,
        // 'min-height': minHeight,
      });

      var offset = 0;
      var target = 0;
      var position = { y: window.pageYOffset };
      var $lastPosition = null;

      // scroll to old product in collection if last page was a product
      if( this.$oldContainer.data().namespace === 'product' && this.$newContainer.data().namespace === 'collection') {
        // console.log('scroll to last product');
        $lastPosition = $('#'+jumplink.cache.lastProductDataset.handle);
        if($lastPosition.length >= 1) {
          target = $lastPosition.offset().top - offset;
        }
      }

      // scroll to old collection
      if( this.$oldContainer.data().namespace === 'collection' && this.$newContainer.data().namespace === 'list-collections') {
        // console.log('scroll to last collection');
        $lastPosition = $('#'+jumplink.cache.lastCollectionDataset.handle);
        if($lastPosition.length >= 1) {
          target = $lastPosition.offset().top - offset;
        }
      }

      // scroll to old position or 0
      TweenLite.to(position, 0.4, {
        y: target,
        onUpdate: function() {
          if (position.y === 0) {

          }
          window.scroll(0, position.y);
        },
        onComplete: function() {

        }
      });

      this.$newContainer.animate({ opacity: 1 }, 400, function() {
        /**
         * Do not forget to call .done() as soon your transition is finished!
         * .done() will automatically remove from the DOM the old Container
         */
        _this.done();
      });
    },

    // scroll to top of the page
    scrollTop: function() {
      var deferred = Barba.Utils.deferred();
      var position = { y: window.pageYOffset };

      TweenLite.to(position, 0.4, {
        y: 0,
        onUpdate: function() {
          if (position.y === 0) {
            deferred.resolve();
          }

          window.scroll(0, position.y);
        },
        onComplete: function() {
          deferred.resolve();
        }
      });

      return deferred.promise;
    },

  });
  return MovePage;
}

/**
 * Init barba itself
 */
var initBarba = function () {
    console.log('init barba');

  /*
   * Update Google Google Analytics if page is changed with barba
   * 
   * æsee https://developers.google.com/analytics/devguides/collection/analyticsjs/events
   */
  Barba.Dispatcher.on('initStateChange', function(currentStatus) {
    if(window.ga) {
      ga('set', 'location', currentStatus.url);
      ga('send', 'pageview');
    }

    if(typeof(fbq) === 'function') {
      fbq('track', 'ViewContent');
      //console.log("fbq('track', 'ViewContent');");
    }
    	
  });

  /**
   * Next step, you have to tell Barba to use the new Transition
   */
  Barba.Pjax.getTransition = function() {
    /**
     * Here you can use your own logic!
     * For example you can use different Transition based on the current page or link...
     */
    var MovePage = initBarbaTransition();
    return MovePage;
  };
  
  // activate precache
  Barba.Prefetch.init();
  initTemplates();
  Barba.Pjax.start();
}

/*
 * Init Javascripts outsite of barba.js
 * 
 * @note see initTemplates() for inits insite of barba.js 
 */
var init = function ($) {
    jumplink.cacheSelectors();
    jumplink.setLanguage();
    jumplink.initRightSidebar();
    jumplink.initBrowserDetection();
    initBarba();
}

// run init as soon as jQuery is ready
$(init);