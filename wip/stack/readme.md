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

Now lets create our `ExampleView`:

```js
var ExampleView = Backbone.View.extend({
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

This should allow for enough flexibility in building out our stack.
Speaking of which, this code would currently crash hard, so lets see how we can get a minimal rendering working in the stack.


