// The contents of this file will be executed before any of
// your view controllers are ever executed, including the index.
// You have access to all functionality on the `Alloy` namespace.
//
// This is a great place to do any initialization for your app
// or create any global variables/functions that you'd like to
// make available throughout your app. You can easily make things
// accessible globally by attaching them to the `Alloy.Globals`
// object. For example:
//
// Alloy.Globals.someGlobalFunction = function(){};
global.Helper = {
    Fade: require('fade')
};

global.AvImageview = require('av.imageview');

//AV.IMAGEVIEW Constants
Alloy.Globals.CONTENT_MODE_FIT = global.AvImageview.CONTENT_MODE_ASPECT_FIT;
Alloy.Globals.CONTENT_MODE_FILL = global.AvImageview.CONTENT_MODE_ASPECT_FILL;

Alloy.Globals.UI = (function getUIValues() {
  
    const DRAWER_PERCENTAGE = 0.822222222222;
    const RATIO_16_9 = 9 / 16;
  
    const Values = {
      Size: null,
      Design: null
    };
  
    const Size = {
      width: OS_IOS ? Ti.Platform.displayCaps.getPlatformWidth() : (Ti.Platform.displayCaps.getPlatformWidth() / (Ti.Platform.displayCaps.dpi / 160)),
      height: OS_IOS ? Ti.Platform.displayCaps.getPlatformHeight() : (Ti.Platform.displayCaps.getPlatformHeight() / (Ti.Platform.displayCaps.dpi / 160))
    };
  
    if (Size.width > Size.height) {
      let aux = Size.width;
      Size.width = Size.height;
      Size.height = aux;
    }
  
    const DRAWER_WIDTH = Size.width * DRAWER_PERCENTAGE;
  
    Values.Design = {
      DRAWER_WIDTH: DRAWER_WIDTH,
      DRAWER_WIDTH_NEGATIVE: -DRAWER_WIDTH,
      DRAWER_HEADER_HEIGHT: DRAWER_WIDTH * RATIO_16_9
    };
  
    return Values;
  })();

  //Menu collection
  Alloy.Collections.menu = new Backbone.Collection();