// JumpLink object
window.jumplink = window.jumplink || {};
window.jumplink.templates = {};
window.jumplink.pages = {};


// debugging https://github.com/visionmedia/debug
window.jumplink.debug = window.jumplink.debug || {};
window.jumplink.debug.templates = debug('theme:templates');


// rivets model
window.jumplink.model = {};


window.jumplink.templates.init = function(dataset, data) {
  if(typeof(window.jumplink.templates[dataset.namespace]) === 'function' ) {
    window.jumplink.templates[dataset.namespace](dataset, data);
    $(document).trigger('jumplink.initTemplateReady', [dataset, data]);
  } else {
    window.jumplink.debug.templates('No javascript for template:', dataset.namespace);
  }
};

/**
 * To test if the jumplink.newPageReady was called at the first
 */
window.jumplink.firstNewPageReadyEvent = true;


window.jumplink.templates.prepairTemplate = function(dataset) {
    
    // console.log('newPageReady');
    var data = window.jumplink.utilities.parseDatasetJsonStrings(dataset);

    window.jumplink.model.dataset = dataset;
    
    rivets.bind($('#barba-wrapper'), window.jumplink.model);

    window.jumplink.utilities.closeAllModals();
    jumplink.initDataApi();
    jumplink.resetNav();
    jumplink.utilities.setBodyId(dataset.namespace);
    
    jumplink.initMomentDataApi();
    
    if(typeof(Prism) !== 'undefined') {
        Prism.highlightAll();
    }

    // preload images again if failed in barba or this is the first page request
    // window.jumplink.loadImagesByNamespace();
    
    // window.jumplink.loadVideos();
    
    // window.jumplink.showHideNewsletterForm(dataset, data);
    
    // window.jumplink.initDataAttributes(dataset);
    
    //  window.jumplink.setNavActive(dataset, data);
    
    
    jumplink.utilities.hyphenate();
    
    jumplink.debug.templates('dataset', dataset, 'data', data);
    
    // window.jumplink.utilities.loadImages();
    
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
 * init no-barba template like I am not a robot captcha (url /challenge)
 */
window.jumplink.templates['no-barba'] = function (dataset, data) {
  // disable barba
  console.warn('disable barba');
  Barba.Pjax.preventCheck = function() {
    return false;
  };
};

/**
 * init templates/page.browser-browser-detection.liquid
 * e.g. /pages/browser-detection
 */
window.jumplink.templates['system-browser-detection'] = function (dataset, data) {
  window.jumplink.initBrowserDetectionTemplate('#browser-info');
};

/**
 * Barba.js template
 */
window.jumplink.templates['index'] = function (dataset, data) {
    console.log('init home');
    jumplink.setNavActive('home');
    jumplink.cache.$barbaWrapper.css( 'padding-top', jumplink.utilities.getNavHeight()+'px');
    initProductList();
    jumplink.initCarousel('home-slideshow');
};

/**
 * Barba.js template
 */
var initTemplateDoItYourself = function (dataset, data) {
    console.log('init do it yourself');
    jumplink.setNavActive('do-it-yourself');
    jumplink.setNavActive('kreative-werkstatt');
    jumplink.cache.$barbaWrapper.css( 'padding-top', jumplink.utilities.getNavHeight()+'px');
    jumplink.initCarousel('do-it-yourself-slideshow'); 
};

/**
 * Barba.js template
 */
var initTemplateKurse = function (dataset, data) {
    console.log('init kurse');
    jumplink.setNavActive('kurse');
    jumplink.setNavActive('kreative-werkstatt');
    jumplink.cache.$barbaWrapper.css( 'padding-top', jumplink.tutilities.getNavHeigh()+'px');
};

/**
 * Barba.js template
 */
var initTemplateWorkshops = function (dataset, data) {
    console.log('init workshops');
    jumplink.setNavActive('workshops');
    jumplink.setNavActive('kreative-werkstatt');
    jumplink.cache.$barbaWrapper.css( 'padding-top', jumplink.tutilities.getNavHeigh()+'px');
};


/**
 * Barba.js template
 */
var initTemplateKunstwerke = function (dataset, data) {
    console.log('init kunstwerke', dataset);
    jumplink.setNavActive('kunstwerke');
    jumplink.cache.$barbaWrapper.css( 'padding-top', jumplink.tutilities.getNavHeigh()+'px');
    initProductList();
    initProductCarousel();
};

var initTemplateSprachkurse = function (dataset, data) {
    console.log('init sprachkurse');
    jumplink.setNavActive('kontakt');
    jumplink.cache.$barbaWrapper.css( 'padding-top', jumplink.tutilities.getNavHeigh()+'px');
    
};

var initTemplateKontakt = function (dataset, data) {
    console.log('init kontakt');
    jumplink.setNavActive(dataset.namespace);
    jumplink.cache.$barbaWrapper.css( 'padding-top', jumplink.tutilities.getNavHeigh()+'px');
    jumplink.initLeadlet('main');
};

var initTemplateUeber = function (dataset, data) {
    console.log('init über');
    jumplink.setNavActive('ueber');
    jumplink.setNavActive('kreative-werkstatt');
    jumplink.cache.$barbaWrapper.css( 'padding-top', jumplink.tutilities.getNavHeigh()+'px');
};

var initTemplateSprachunterrichtKurse = function (dataset, data) {
    console.log('init über');
    jumplink.setNavActive('sprachkurse');
    jumplink.setNavActive('sprachunterricht');
    jumplink.cache.$barbaWrapper.css( 'padding-top', jumplink.tutilities.getNavHeigh()+'px');
};

var initTemplateSprachunterrichtNachhilfe = function (dataset, data) {
    console.log('init über');
    jumplink.setNavActive('nachhilfe');
    jumplink.setNavActive('sprachunterricht');
    jumplink.cache.$barbaWrapper.css( 'padding-top', jumplink.tutilities.getNavHeigh()+'px');
};

var initTemplateSprachunterrichtKinder = function (dataset, data) {
    console.log('init über');
    jumplink.setNavActive('fuer_kinder');
    jumplink.setNavActive('sprachunterricht');
    jumplink.cache.$barbaWrapper.css( 'padding-top', jumplink.tutilities.getNavHeigh()+'px');
};

var initTemplateDefault = function (dataset, data) {
    console.log('init default');
    jumplink.setNavActive(dataset.namespace);
    jumplink.cache.$barbaWrapper.css( 'padding-top', jumplink.tutilities.getNavHeigh()+'px');
};