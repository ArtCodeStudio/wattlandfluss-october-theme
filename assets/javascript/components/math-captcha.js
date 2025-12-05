/**
 * Math Captcha Component
 *
 * A honeypot-style captcha that displays a math problem with a hidden number.
 * Users see "X + Y = ?" while bots see "X + Y + Z = ?"
 * The hidden number is rendered transparently to fool automated form fillers.
 *
 * The component works both with the Winter CMS AJAX framework and without it.
 * If the framework is missing (e.g. after a Barba swap), a lightweight
 * fallback posts the form to the handler manually.
 */
rivets.components['math-captcha'] = {

    template: function() {
        return jumplink.templates['math-captcha'];
    },

    initialize: function(el) {
        var controller = this;
        controller.debug = window.debug('rivets:math-captcha');
        controller.debug('initialize', el);

        var $el = $(el);
        var $form = null;
        var initialized = false;
        var submitInFlight = false;

        // Challenge data
        controller.num1 = 0;
        controller.num2 = 0;
        controller.numHidden = 0;
        controller.token = '';
        controller.answer = '';

        // UI state
        controller.loaded = false;
        controller.error = null;

        /**
         * Read a CSRF token from multiple possible locations.
         */
        var getCsrfToken = function() {
            var token = null;

            token = $('meta[name="csrf-token"]').attr('content');
            if (token) return token;

            token = $('input[name="_token"]').val();
            if (token) return token;

            token = $('script[data-request-token]').data('request-token');
            if (token) return token;

            if (typeof $.oc !== 'undefined' && $.oc.requestToken) {
                return $.oc.requestToken;
            }

            $('form').each(function() {
                var formToken = $(this).find('input[name="_session_key"], input[name="_token"]').val();
                if (formToken) {
                    token = formToken;
                    return false;
                }
            });

            return token || '';
        };

        /**
         * Extract a readable error message from an AJAX response.
         */
        var extractErrorMessage = function(xhr, fallback) {
            fallback = fallback || 'Fehler beim Senden des Formulars.';

            if (!xhr) {
                return fallback;
            }

            // JSON error response
            if (xhr.responseJSON) {
                if (typeof xhr.responseJSON.error === 'string') {
                    return xhr.responseJSON.error;
                }
                if (typeof xhr.responseJSON.message === 'string') {
                    return xhr.responseJSON.message;
                }
            }

            // Text response
            if (xhr.responseText) {
                try {
                    var parsed = JSON.parse(xhr.responseText);
                    if (parsed && parsed.error) {
                        return parsed.error;
                    }
                } catch (parseErr) {
                    // ignore
                }
            }

            return fallback;
        };

        /**
         * Build headers for manual Winter AJAX calls.
         */
        var buildWinterHeaders = function(handler, partials) {
            return {
                'X-WINTER-REQUEST-HANDLER': handler,
                'X-WINTER-REQUEST-PARTIALS': partials || '',
                'X-Requested-With': 'XMLHttpRequest',
                'X-XSRF-TOKEN': getCsrfToken()
            };
        };

        /**
         * Fetch a new math challenge from the server.
         */
        controller.fetchChallenge = function() {
            controller.loaded = false;
            controller.error = null;
            controller.answer = '';

            controller.debug('fetchChallenge: requesting new challenge');

            var csrfToken = getCsrfToken();
            controller.debug('fetchChallenge: CSRF token', csrfToken ? 'found' : 'missing');

            // Always use a direct AJAX call to avoid triggering form ajaxDone loops
            $.ajax({
                url: window.location.href,
                type: 'POST',
                dataType: 'json',
                headers: buildWinterHeaders('onGetMathChallenge'),
                data: {
                    _token: csrfToken
                },
                success: function(data) {
                    controller.debug('fetchChallenge: received (fallback)', data);
                    if (data && typeof data === 'object' && data.num1 !== undefined && data.num2 !== undefined && data.token) {
                        controller.num1 = data.num1;
                        controller.num2 = data.num2;
                        controller.numHidden = data.numHidden;
                        controller.token = data.token;
                        controller.loaded = true;
                        controller.error = null;
                        return;
                    }
                    controller.error = 'Unerwartete Antwort vom Server.';
                    controller.loaded = true;
                },
                error: function(xhr) {
                    controller.debug('fetchChallenge: error (fallback)', xhr);
                    controller.error = extractErrorMessage(xhr, 'Fehler beim Laden der Sicherheitsfrage.');
                    controller.loaded = true;
                }
            });
        };

        /**
         * Submit the contact form through Winter AJAX or a small manual fallback.
         */
        var submitForm = function() {
            if (!$form || submitInFlight) {
                return;
            }

            submitInFlight = true;
            controller.error = null;

            var handler = $form.attr('data-request') || $form.data('request') || 'onSubmitContact';

            var extractPartials = function(updateVal) {
                if (!updateVal) return '';
                if (typeof updateVal === 'object') {
                    return Object.keys(updateVal).join('&');
                }
                if (typeof updateVal === 'string') {
                    // Try to extract quoted partial keys: 'partial': 'selector'
                    var matches = updateVal.match(/'([^']+)'/g);
                    if (matches) {
                        return matches
                            .map(function(m) { return m.replace(/'/g, ''); })
                            // skip selectors like ".confirm-container"
                            .filter(function(val) { return val && val[0] !== '.' && val[0] !== '#'; })
                            .join('&');
                    }
                    // Fallback: trim braces and split by comma/colon heuristics
                    return updateVal.replace(/[{}]/g, '').split(':')[0].trim();
                }
                return '';
            };

            var partialsHeader = extractPartials($form.data('requestUpdate') || $form.attr('data-request-update'));

            var showError = function(jqXHR) {
                var msg = extractErrorMessage(jqXHR);
                controller.error = msg;
                $('.confirm-container').html('<div class="alert alert-danger" role="alert">' + msg + '</div>');
                controller.debug('submitForm: error', msg, jqXHR);
            };

            var showSuccess = function(data) {
                // If server sent HTML instead of JSON, treat as error
                if (typeof data === 'string') {
                    controller.debug('submitForm: unexpected HTML response', data);
                    showError({ responseText: data });
                    return;
                }

                if (data && data['.confirm-container']) {
                    $('.confirm-container').html(data['.confirm-container']);
                } else {
                    $('.confirm-container').html('<div class="alert alert-success" role="alert">Nachricht abgeschickt.</div>');
                }
            };

            var refreshAfter = function() {
                submitInFlight = false;
                controller.fetchChallenge();
            };

            // Always use a direct AJAX call to avoid HTML responses from mis-detected requests
            $.ajax({
                url: $form.attr('action') || window.location.href,
                type: 'POST',
                dataType: 'json',
                data: $form.serialize(),
                headers: buildWinterHeaders(handler, partialsHeader),
                success: function(response) {
                    controller.debug('submitForm: success (ajax)', response);
                    showSuccess(response);
                },
                error: function(xhr) {
                    controller.debug('submitForm: error (ajax)', xhr);
                    showError(xhr);
                },
                complete: refreshAfter
            });
        };

        /**
         * Wire the form submit to our handler to keep Barba and Winter aligned.
         */
        var bindForm = function() {
            if (!$form || !$form.length) {
                controller.debug('bindForm: no parent form found');
                return;
            }

            // Avoid double binding
            $form.off('.math-captcha');

            // Listen for submit and route it through our handler
            $form.on('submit.math-captcha', function(event) {
                event.preventDefault();
                event.stopPropagation();
                submitForm();
                return false;
            });

            // We refresh the captcha after submit completion (see submitForm refreshAfter)
        };

        /**
         * Ready function - called when component is rendered (only once).
         */
        var ready = function() {
            if (initialized) {
                controller.debug('ready: already initialized, skipping');
                return;
            }
            initialized = true;

            $form = $el.closest('form');

            if (!$form.length) {
                console.warn('[math-captcha] No parent form found!');
                return;
            }

            controller.debug('ready: parent form found with handler', $form.attr('data-request'));

            bindForm();
            controller.fetchChallenge();
        };

        // Use MutationObserver to detect when component is rendered
        var observer = new MutationObserver(function() {
            if ($el.children().length > 0) {
                observer.disconnect();
                setTimeout(ready, 0);
            }
        });

        observer.observe(el, {
            childList: true,
            subtree: true
        });

        // Also call ready immediately in case component is already rendered
        setTimeout(function() {
            if ($el.children().length > 0) {
                observer.disconnect();
                ready();
            }
        }, 0);

        return controller;
    }
};
