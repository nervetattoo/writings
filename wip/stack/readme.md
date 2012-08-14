# The eZ Exceed stack

I'm going to walk you through creating a stack component in javascript, using Backbone to handle the view part.
This describes the major component in the editorial interface my team is building on top of eZ Publish, eZ Exceed.
You should have knowledge of `Backbone` plus the jQuery API before reading this.

## Whats in a stack?

Wikipedia describes a stack as "In computer science, a stack is a last in, first out (LIFO) abstract data type and linear data structure."
This is exactly what we have made as well. Its a navigational pattern we chose based on its simplicity and the fact that iOS'
navigation bar is an implementation of a stack that many, many users have gotten used to by now.

In eZ Exceed our stack looks and operates like this: VIDEO

## Requirements

Lets first nail some requirements to how the stack should work:

1. You should be apple to `push` a new `view` onto the stack
2. The stack should be responsible for rendering the `view` and itself
3. You should not destruct individual views as you would normally do, instead:
4. You should call on the `stack` to `pop` its last view
5. The `stack` must implement some way to navigate up the stack behind the scenes
6. Only the last item should have a visible body
7. Every views header should always be visible

### API

Based on our requirements we can draw out a very simple API:

```js
// We should get a stack object first (you might want two stacks in a split view)
var stack = new Stack({
    el : $('body')
});

// Lets add something to it
stack.push(UserSignInView);

// Lets remove something from the view
stack.pop();
```

Thats really the simplicity we are aiming at, not a lot of hocus pocus aye?
Now lets look at implementing this!

A simple bootstrapping can look like this:

```js
var stack = new Stack({el: $('#stack')}).render();

$('#add-to-stack').on('click', function()
{
    stack.push(ExampleView);
});
```

Now lets create our `DefaultView` that we will be pushing onto the stack:

```js
var DefaultView = Backbone.View.extend({
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
```

This should allow for enough flexibility while building out our stack.
Speaking of which, this code would currently crash hard, so lets see how we can get a minimal rendering working in the stack.

## Lets get stacking

```js
push : function(view, heading)
{
    var view = new view();
    this.$el.append(view.render().el);
    return view;
},

pop : function()
{
    this.$('>:last-child').remove();
}
```

Thats the absolute simplest implementation we can do in order to push, and its completely unusable but for summing up the gist of what we are doing.
Lets flesh it out into a usable state:

```js
views : [],
push : function(view, heading)
{
    // Lets default a heading
    heading = (heading || 'Stack item ' + this.views.length);

    // Wrap incoming view in some markup known to us
    var wrapper = $('<div class="wrapper"><header/><section/></div>');
    wrapper.find('header').text(heading);

    // Feed the view a root node inside our wrapper
    view = new view({
	el: wrapper.find('section')
    });

    // Take care of references to view and wrapper
    this.views.push({
	view: view,
	wrapper: wrapper
    });

    this.$el.append(wrapper);
    return view.render();
},
pop : function()
{
    var child = this.views.pop();
    child.wrapper.remove();
    return this;
}
```

At this point we have a working stack that allows any object conforming to `Backbone.View`
to be pushed onto it.
Next up is to handle going back between views, lets do some refactoring of the Stack as well:

```js
// Use a simple string template for the markup
initialize : function()
{
    // Normally you would want to do this using templating
    // We use Handlebars for this
    this.template = [
	'<div class="wrapper">',
	    '<header>',
		'<h3></h3>', '<button type="button" class="go-back">Go back</button>',
	    '</header>',
	    '<section></section>',
	'</div>'
    ].join('');
},
events : {
    'click .go-back': 'pop'
},
push : function(view, heading)
{
    // Replace the wrapper setup with this
    var wrapper = this.wrapper({heading: heading});
},
wrapper : function(options)
{
    var wrapper = $(this.template);
    wrapper.find('h3').text(options.heading);
    return wrapper;
}
```

### Making it look ok

Right now this looks far from impressive, so lets get the basics right.
Its quite simple:

* `<header>` should always be visible, but toned down for inactive items
* `<section>` and `Go back` should only be visible for the active view (last)
* The stack headings should look like an accordion

This CSS should work in CSS 3 supporting browsers:

```css
#stack {
    height: 500px;
    border: 1px solid #999;
}
.wrapper header {
    background: #FF8500;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.4);
    border-bottom: 1px solid white;
    height: 24px;
    opacity: .7;
}
.wrapper:last-child header {
    opacity: 1;
    border-bottom: none;
}

.wrapper header h3 {
    padding: 0 5px;
    float: left;
    display: block;
}
.wrapper header .go-back {
    float: right;
    margin: 1px 10px 0 0;
    padding: 0 4px;
    height: 22px;
    cursor: pointer;
    display: none;
}

.wrapper section {
    display: none;
    margin: 5px;
}

.wrapper:last-child header .go-back,
.wrapper:last-child section { display: block; }
```

This is naive because the `:last-child` selector does not work in Our Old Friend, but it serves the purpose.


### Bonus #1: Adding animations

We will add some simple animations using [Animate.css](http://daneden.me/animate/) to make visual feedback better.
Make sure you download and include the CSS file and we can make some small changes to our javascript:

Change the end of `push` to:

```js
wrapper.addClass('animated fadeInUp');
return view;
```

And change the end of `pop` to:

```js
child.wrapper.addClass('animated fadeOutDown');
_.delay(function() { child.wrapper.remove(); }, 140);
return this;
```

### Bonus #2: Acting on go-back

Part of the point of the stack is to centralize on a navigation controller and to write DRYer code.
One important feature we solve by using a stack is when we need to go out into a different view to find a piece
of information that is to be used where we currently are.
An example is your favorite editor when you are opening a file through your file browser.
The file browser is reused in a myriad of applications on your computer, you can't put code in it
that tells `Editor X` to open a file! What you instead want is the file browser to just speak out loud that a file was clicked "Open" on.

We consider opening a file to be equivalent of triggering the "Go back" action with a return value, this fits snuggly with Backbones events
and we can extend on what we've got to make this highly flexible and powerfull by creating and trigging
an event on the file browser view, lets just call it `closed` and pass along the data of the view!

```js
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
```

So how does this one line actually help _at all_? Well, first we need to listen to the new event when we `push` the secondary view:

```js
function updateMyself(model, collection)
{
    // `model` and `collection` was that of the rendered view and we can in most cases
    // read the `model.id` in cases where we need to act on a single selected element
};
Stack.push(MyView).on('closed', updateMyself);
```
