// rivets.js binders


window.jumplink.debug = window.jumplink.debug || {};
window.jumplink.debug.binders = debug('theme:binders');

/**
 * pignose-calendar
 * @see https://www.pigno.se/barn/PIGNOSE-Calendar/
 */
rivets.binders['pignose-calendar'] = {
    bind: function(el) {
        var self = this;
        
        this.$el = $(el);
        this.options = this.$el.data('options') || {};
        
        switch(this.options.minDate) {
            case 'today':
                this.options.minDate = moment().subtract(1, 'days');
                break;
        }
        
        this.options.select = this.publish;
        this.options.apply = this.publish;
        
        self.$el.pignoseCalendar(this.options);
    },

    unbind: function(el) {
        window.jumplink.debug.binders('[pignose-calendar] unbind TODO!', this);
        delete this.$el;
    },

    routine: function(el, value) {
        if (value) {
            this.$el.pignoseCalendar('set', value);
            this.$el.val(value);
        }
    },

    getValue: function(el) {
        var value = this.$el.val();
        return value; 
    }
};

/**
 * summernote
 * @see https://summernote.org/
 */
rivets.binders.summernote = {
    bind: function(el) {
        this.$el = $(el);
        this.options = this.$el.data('options') || {};
        
        this.options.callbacks = {
            onChange: this.publish
        };
        
        this.$el.summernote(this.options);
    },

    unbind: function(el) {
        this.$el.summernote('destroy');
    },

    routine: function(el, newValue) {
        if (newValue) {
            var oldValue = this.getValue(el);
            if(oldValue !== newValue) {
                this.$el.summernote('code', newValue);
            }
        }
    },

    getValue: function(el) {
        var value = this.$el.summernote('code');
        return value; 
    }
};


rivets.binders.html = function (el, value) {
  $(el).html(value ? value : '');
};


/**
 * TODO support select
 */
rivets.binders.value = {
    publishes: true,
    priority: 3000,
    
    bind: function(el) {
        this.$el = $(el);
        this.type = this.$el.prop("type");
        this.tagName = this.$el.prop('tagName');
        this.$el.on('change', this.publish);
    },

    unbind: function(el) {
        this.$el.off('change');
        delete this.$el;
        delete this.type;
        delete this.tagName;
    },

    routine: function(el, newValue) {
        if (newValue) {
            var oldValue = this.getValue(el);
            if(oldValue !== newValue) {
                switch(this.tagName) {
                    case 'INPUT':
                        this.$el.val(newValue);
                        break;
                }
                
            }
        }
    },

    getValue: function(el) {
        var value;
        var type = this.$el.prop("type");
        var tagName = this.$el.prop('tagName');
        
        switch(this.tagName) {
            case 'INPUT':
                switch(this.type) {
                    case 'number':
                        value = parseFloat(this.$el.val()) || 0;
                    break; 
                    default:
                        value = this.$el.val().toString();
                        break;   
                }
                break;
        }
        

        return value; 
    }
};



/**
 * TODO not working with rv-checkbox component
 */
rivets.binders.checked = {
    publishes: true,
    priority: 2000,
    
    bind: function(el) {
        
        this.initTemplateSelector = function(el) {
            if(this.type === 'checkbox') {
                this.$checkbox = this.$el;
            } else {
                this.$checkbox = this.$el.find('input[type="checkbox"]');
            }
        };
        
        this.$el = $(el);
        this.type = this.$el.prop("type");
        this.initTemplateSelector(el);
        this.$el.on('change', this.publish);
        
    },

    unbind: function(el) {
        this.$el.off('change');
        delete this.$el;
        delete this.type;
        delete this.$checkbox;
    },

    routine: function(el, newValue) {
        newValue = newValue === true;
        
        /**
         * If this binder is ussed on a component it could be that the component template
         * was not ready at the time this binder was called, so we check here if the element was found and if not we try it again
         */
        if(!this.$checkbox.length) {
            this.initTemplateSelector(el);
        }
        
        this.$checkbox.prop('checked', newValue);
    },

    getValue: function(el) {
        var value = this.$checkbox.is(":checked");
        return value;
    }
};

rivets.binders.selected = {

    bind: function(el) {
        
        this.initTemplateSelector = function(el) {
            if(this.tagName === 'SELECT') {
                this.$select = this.$el;
            } else {
                this.$select = this.$el.find('select');
            }
        };
        
        this.$el = $(el);
        this.tagName = this.$el.prop('tagName');
        this.initTemplateSelector(el);
        this.$el.on('change', this.publish);
    },

    unbind: function(el) {
        this.$el.off('change');
        delete this.$el;
        delete this.tagName;
        delete this.$select;
    },

    routine: function(el, newValue) {
        window.jumplink.debug.binders('[selected] this.$select', this.$select, 'newValue', newValue);
        
        /**
         * If this binder is ussed on a component it could be that the component template
         * was not ready at the time this binder was called, so we check here if the element was found and if not we try it again
         */
        if(!this.$select.length) {
            this.initTemplateSelector();
        }
        
        if(!newValue) {
            newValue = jumplink.utilities.getFirstSelectValue(this.$select);
        }
        
        var oldValue = this.getValue(el);
        window.jumplink.debug.binders('[selected] newValue', newValue, 'oldValue', oldValue);
        if(oldValue !== newValue) {
            jumplink.utilities.setSelectedValue(this.$select, newValue);
        }
    },

    getValue: function(el) {
        if(!this.$select.length) {
            this.initTemplateSelector();
        }
        var value = jumplink.utilities.getSelectedValue(this.$select);
        window.jumplink.debug.binders('[selected] getValue', value);
        return value; 
    }
};