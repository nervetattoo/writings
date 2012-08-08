window.Stack = Backbone.View.extend({
    views : [],
    template : '',

    events : {
        'click .go-back': 'pop'
    },

    initialize : function()
    {
        this.template = [
            '<div class="wrapper">',
                '<div class="header">',
                    '<h3></h3>', '<a class="go-back">Go back</a>',
                '</div>',
                '<div class="body"></div>',
            '</div>'
        ].join('');
    },

    push : function(view, heading)
    {
        heading = (heading || 'Default heading');
        var wrapper = $(this.template).attr('data-index', this.views.length);
        wrapper.find('h3').text(heading)
        wrapper.css('z-index', 100 + this.views.length);

        var stackedView = new view({
            el: wrapper.find('.body')
        });
        this.views.push({
            view : stackedView,
            wrapper : wrapper
        });
        this.$el.append(wrapper);
        stackedView.render();
        wrapper.addClass('animated fadeInUp');
        return stackedView;
    },

    pop : function()
    {
        var child = this.views.pop();
        child.wrapper.addClass('animated fadeOutDown');
        _.delay(function() { child.wrapper.remove(); }, 140);
        return this;
    }
});

window.DefaultView = Backbone.View.extend({
    template : 'Default template',

    initialize : function(options)
    {
        if (options.hasOwnProperty('template'))
            this.template = options.template;
    },

    render : function()
    {
        this.$el.html(this.template);
        return this;
    }
});

var stack = new Stack({
    el: $('#stack')
}).render();

$('#add-views li').on('click', function()
{
    var view = $(this).data('view');
    stack.push(window[view]);
});
