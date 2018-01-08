// JumpLink object
window.jumplink = window.jumplink || {};
window.jumplink.templates = {};
window.jumplink.pages = {};


// debugging https://github.com/visionmedia/debug
window.jumplink.debug = window.jumplink.debug || {};
window.jumplink.debug.templates = debug('theme:templates');


window.jumplink.templates.init = function(dataset, data) {
  if(typeof(window.jumplink.templates[dataset.namespace]) === 'function' ) {
    window.jumplink.templates[dataset.namespace](dataset, data);
    $(document).trigger('jumplink.initTemplateReady', [dataset, data]);
  } else {
    window.jumplink.debug.templates('No javascript for template:', dataset.namespace);
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
    jumplink.cache.$barbaWrapper.css( 'padding-top', jumplink.getNavHeight()+'px');
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
    jumplink.cache.$barbaWrapper.css( 'padding-top', jumplink.getNavHeight()+'px');
    jumplink.initCarousel('do-it-yourself-slideshow'); 
};

/**
 * Barba.js template
 */
var initTemplateKurse = function (dataset, data) {
    console.log('init kurse');
    jumplink.setNavActive('kurse');
    jumplink.setNavActive('kreative-werkstatt');
    jumplink.cache.$barbaWrapper.css( 'padding-top', jumplink.getNavHeight()+'px');
};

/**
 * Barba.js template
 */
var initTemplateWorkshops = function (dataset, data) {
    console.log('init workshops');
    jumplink.setNavActive('workshops');
    jumplink.setNavActive('kreative-werkstatt');
    jumplink.cache.$barbaWrapper.css( 'padding-top', jumplink.getNavHeight()+'px');
};


/**
 * Barba.js template
 */
var initTemplateKunstwerke = function (dataset, data) {
    console.log('init kunstwerke', dataset);
    jumplink.setNavActive('kunstwerke');
    jumplink.cache.$barbaWrapper.css( 'padding-top', jumplink.getNavHeight()+'px');
    initProductList();
    initProductCarousel();
};

var initTemplateSprachkurse = function (dataset, data) {
    console.log('init sprachkurse');
    jumplink.setNavActive('kontakt');
    jumplink.cache.$barbaWrapper.css( 'padding-top', jumplink.getNavHeight()+'px');
    
};

var initTemplateKontakt = function (dataset, data) {
    console.log('init kontakt');
    jumplink.setNavActive(dataset.namespace);
    jumplink.cache.$barbaWrapper.css( 'padding-top', jumplink.getNavHeight()+'px');
    jumplink.initLeadlet('main');
};

var initTemplateUeber = function (dataset, data) {
    console.log('init über');
    jumplink.setNavActive('ueber');
    jumplink.setNavActive('kreative-werkstatt');
    jumplink.cache.$barbaWrapper.css( 'padding-top', jumplink.getNavHeight()+'px');
};

var initTemplateSprachunterrichtKurse = function (dataset, data) {
    console.log('init über');
    jumplink.setNavActive('sprachkurse');
    jumplink.setNavActive('sprachunterricht');
    jumplink.cache.$barbaWrapper.css( 'padding-top', jumplink.getNavHeight()+'px');
};

var initTemplateSprachunterrichtNachhilfe = function (dataset, data) {
    console.log('init über');
    jumplink.setNavActive('nachhilfe');
    jumplink.setNavActive('sprachunterricht');
    jumplink.cache.$barbaWrapper.css( 'padding-top', jumplink.getNavHeight()+'px');
};

var initTemplateSprachunterrichtKinder = function (dataset, data) {
    console.log('init über');
    jumplink.setNavActive('fuer_kinder');
    jumplink.setNavActive('sprachunterricht');
    jumplink.cache.$barbaWrapper.css( 'padding-top', jumplink.getNavHeight()+'px');
};

var initTemplateDefault = function (dataset, data) {
    console.log('init default');
    jumplink.setNavActive(dataset.namespace);
    jumplink.cache.$barbaWrapper.css( 'padding-top', jumplink.getNavHeight()+'px');
};