window.Stack = Backbone.View.extend({
    views : [],
    template : '',

    events : {
        'click .go-back': 'pop'
    },

    initialize : function()
    {
        _.bindAll(this);
        this.template = [
            '<div class="wrapper">',
                '<header>',
                    '<h3></h3>', '<button type="button" class="go-back">Go back</button>',
                '</header>',
                '<section></section>',
            '</div>'
        ].join('');
    },

    push : function(view, heading)
    {
        heading = (heading || 'Stack item ' + this.views.length);
        var wrapper = $(this.template).attr('data-index', this.views.length);
        wrapper.find('h3').text(heading)

        var stackedView = new view({
            el: wrapper.find('section')
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
        _.delay(function()
        {
            child.view.trigger('closed', child.model, child.collection);
            child.wrapper.remove();
        }, 140);
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

function speak(model, collection)
{
    console.log(model, collection);
};
$('#add-views button').on('click', function()
{
    var view = $(this).data('view');
    stack.push(window[view]).on('closed', speak);
});
