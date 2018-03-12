// rivets.js binders

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
        console.warn('[pignose-calendar] unbind TODO!', this);
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


/**
 * TODO support select
 */
rivets.binders.value = {
    publishes: true,
    priority: 3000,
    
    bind: function(el) {
        this.$el = $(el);
        this.$el.on('change', this.publish);
    },

    unbind: function(el) {
        this.$el.off('change');
        delete this.$el;
    },

    routine: function(el, newValue) {
        if (newValue) {
            var oldValue = this.getValue(el);
            if(oldValue !== newValue) {
                this.$el.val(newValue);
            }
        }
    },

    getValue: function(el) {
        var value;
        var type = this.$el.prop("type");
        switch(type) {
            case 'number':
                value = parseFloat(this.$el.val()) || 0;
            break;
            case 'text':
            case 'date':
            case 'time':
                value = this.$el.val().toString();
                break;   
            default:
                value = this.$el.val().toString();
                break;   
        }
        return value; 
    }
};



/**
 * 
 */
rivets.binders.checked = {

    bind: function(el) {
        this.$el = $(el);
        this.$el.on('change', this.publish);
    },

    unbind: function(el) {
        this.$el.off('change');
        delete this.$el;
    },

    routine: function(el, newValue) {
        if (newValue) {
            var oldValue = this.getValue(el);
            if(oldValue !== newValue) {
                this.$el.prop('checked', newValue);
            }
        }
    },

    getValue: function(el) {
        var value = this.$el.is(":checked");
        return value; 
    }
};