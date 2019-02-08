// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

$.title.text = L(args.title);

$.reset = function() {
    $.off();
    $.removeListener();
    $.destroy();
}