/**
 * Main app controller
 * https://github.com/jormagar/drawer-sample
 * @author Jorge Macías García
 * @controller index.js
 * @params {object} args
 */
(function controller(args) {

  'use strict';

  const DRAWER = Alloy.CFG.Drawer;
  const ITEMS = DRAWER.Items;

  const configuration = args.configuration;

  const Controller = {};

  let ActiveController = null;
  let ActiveTab = 0;

  //Exported functions
  $.onScrollTab = onScrollTab;
  $.onLogout = onLogout;

	/**
	 * @method onCreateController
	 */
  (function onCreateController() {
    Ti.API.debug('index.js_onCreateController');

    init();
    addListener();
    setLayout();
    $[OS_IOS ? 'nav' : 'win'].open();
  })();

  /**
   * @method init
   */
  function init() {
    Ti.API.debug('index.js_init');

    Object.keys(ITEMS).forEach(function (key) {
      //Add only main controllers
      if (ITEMS[key].category === 'main') {
        Controller[key] = null;
      }
    });
  }

	/**
	 * @method addListener
	 */
  function addListener() {
    Ti.API.debug('index.js_addListener');

    $.addListener($.win, 'open', onOpen);

    if (OS_IOS) {
      $.addListener($.win, 'swipe', onSwipe);
      $.addListener($.menu, 'click', onHomeIconItemSelected);
    }
  }

	/**
	 * Set window layout
	 * @method setLayout
	 */
  function setLayout() {

    createMenuController();

    //Drawer created by code due to alloy xml unstabillity
    if (OS_ANDROID) {
      setDrawerLayout();
    }

    createController(ITEMS.Home);
  }

	/**
	 * @method setDrawerLayout
	 */
  function setDrawerLayout() {
    Ti.API.debug('index.js_setDrawerLayout');

    $.toolbar = Ti.UI.createToolbar({
      barColor: Alloy.CFG.Color.primary,
      title: L('appname'),
      titleTextColor: Alloy.CFG.Color.text.primary,
      extendBackground: true,
      theme: 'Theme.Material'
    });

    $.win.activity.supportToolbar = $.toolbar;

    $.drawer = Ti.UI.Android.createDrawerLayout({
      leftView: Controller.Menu.getView(),
      centerView: Ti.UI.createView(),
      toolbar: $.toolbar
    });

    $.addListener($.drawer, 'open', Controller.Menu.setHeader);

    $.win.add($.drawer);
  }

  /**
	 * Creación del menú
	 * @method createMenuController
	 */
  function createMenuController() {
    Ti.API.debug('index.js_createMenuController');

    Controller.Menu = Alloy.createController(DRAWER.path, {
      drawer: DRAWER
    });

    Controller.Menu.on('itemclick', onMenuItemClick);
    Controller.Menu.on('hide', onHideDrawer);
  }

	/**
	 * Creación genérica de controlador
	 * @method createController
	 * @param {object} params Parametros de controlador
	 */
  function createController(params) {
    Ti.API.debug('index.js_createController');
    Ti.API.debug('params: ' + JSON.stringify(params));

    const CATEGORY = {
      MAIN: 'main',
      OPENABLE: 'openable'
    };

    const id = params.id;
    const name = params.name;
    const label = params.label;
    const path = params.path;
    const icon = params.icon;
    const category = params.category;
    const on = params.on;
    let actions = params.actions;
    const args = params.args;

    if (category === CATEGORY.MAIN) {
      Ti.API.debug('DRAWER LABEL : ' + label);
      $.win.title = L(label);

      Ti.API.debug('Window Title ' + $.win.title);

      if (Controller[name] === null) {
        Controller[name] = Alloy.createController(path, args);
      }

      const centerView = OS_IOS ? $.win : $.drawer.centerView;

      Helper.Fade.setContent(centerView, Controller[name].getView(), true, {
        controller: Controller[name],
        e: 'ready'
      });

      setActions(actions, args);

      if (OS_ANDROID && $.win.activity.actionBar) {
        $.win.activity.actionBar.title = L(label);
      } else if (OS_IOS) {
        $.win.setTitle(L(label));
      }

      if (on) {
        Object.keys(on).forEach(function (e) {
          Controller[name].on(e, $[on[e]]);
        });
      }

      ActiveController && resetControllers([ActiveController]);

      ActiveController = name;
    } else if (OS_IOS) {
      $.nav.openWindow(Alloy.createController(path, args).getView());
    } else if (OS_ANDROID) {
      Alloy.createController(path, args).getView().open();
    }
  }

  function setActions(actions, args) {
    if (args.hasOwnProperty('controllers') &&
      Array.isArray(args.controllers) &&
      args.controllers[0].hasOwnProperty('actions')) {

      actions = args.controllers[0].actions;
    }

    if (actions) {
      Ti.API.debug('Actions: ' + JSON.stringify(actions));

      Helper.ActionBar.showActions($, 'win', actions.map(getActions));
    }

  }

  function getActions(action) {
    return {
      icon: action.icon,
      type: action.type,
      callback: onActionClick.bind(null, action.name)
    };
  }

  /**
   * @method onActionClick
   * @param {string} action Event to fire
   * @param {object} e Titanium event
   */
  function onActionClick(action, e) {
    Ti.API.debug('onActionClick ' + JSON.stringify(action) + ' ' + JSON.stringify(e));
    alert('Action clicked: ' + action);
  }

  function hasAttribute(obj, key) {
    return key.split(".").every(function (x) {
      if (typeof obj != "object" || obj === null || !x in obj)
        return false;
      obj = obj[x];
      return true;
    });
  }

  function getAttribute(obj, key) {
    return key.split(".").reduce(function (o, x) {
      return (typeof o == "undefined" || o === null) ? o : o[x];
    }, obj);
  }

	/**
	 * @method onMenuItemClick
	 * @param {object} e Event
	 */
  function onMenuItemClick(e) {
    Ti.API.debug('index.js_onMenuItemClick');

    Ti.API.debug('e: ' + JSON.stringify(e));

    //Drawer action item
    if (ITEMS[e.key].category === 'action') {
      $[ITEMS[e.key].path]();
    } else {
      //Prepare args fusion
      ITEMS[e.key].args = Object.assign(ITEMS[e.key].args || {}, {
        configuration: configuration
      });

      //Drawer main or openable item
      createController(ITEMS[e.key]);
    }

    closeDrawer();
  }

	/**
	 * @method closeDrawer
	 */
  function closeDrawer() {
    Ti.API.debug('index.js_closeDrawer');

    if (OS_IOS) {
      Controller.Menu.close();
    } else if (OS_ANDROID) {
      $.drawer.toggleLeft();
    }
  }

	/**
	 * @method onHideDrawer
	 * @param {object} e Evento
	 */
  function onHideDrawer(e) {
    Ti.API.debug('index.js_onHideDrawer');

    closeDrawer();
  }

	/**
	 * @method onOpen
	 * @param {object} e
	 */
  function onOpen(e) {
    Ti.API.debug('index.js_onOpen');

    //It is fired every time drawer is opened
    //Possible bug
    $.removeListener($.win, 'open', onOpen);

    if (OS_ANDROID) {
      //Set home bar actions manually on first execution
      setActions(null, ITEMS.Home.args);
      
      $.win.activity.actionBar.displayHomeAsUp = true;
      $.win.activity.actionBar.onHomeIconItemSelected = onHomeIconItemSelected;
    }
  }

	/**
	 * @method onHomeIconItemSelected
	 * @param {object} e
	 */
  function onHomeIconItemSelected(e) {
    Ti.API.debug('index.js_onHomeIconItemSelected');

    openDrawer();
  }

  /**
   * @method  onScrollTab
   * @param   {Object}    e Evento
   */
  function onScrollTab(e) {
    Ti.API.debug('onScrollTab ' + e.index);
    ActiveTab = e.index;

    const actions = ITEMS[ActiveController].args.controllers[ActiveTab].actions;
    
    Helper.ActionBar.showActions($, 'win', actions.map(getActions));
  }

  function onLogout(e) {
    alert('logout');
  }

	/**
	 * @method onSwipe
	 * @param  {object} e
	 */
  function onSwipe(e) {
    Ti.API.debug('index.js_onSwipe');

    const threshold = 16;

    if (e.direction === 'right' && e.x < threshold) {
      openDrawer();
    }
  }

	/**
	 * @method openDrawer
	 */
  function openDrawer() {
    Ti.API.debug('index.js_openDrawer');

    if (OS_IOS) {
      Controller.Menu.open();
    } else if (OS_ANDROID) {
      $.drawer.toggleLeft();
    }
  }

	/**
	 * Clean controllers
	 * @method resetControllers
	 * @param  {object}            list Controller list
	 */
  function resetControllers(list) {
    Ti.API.debug('index.js_resetControllers');

    list.forEach(function (key) {
      if (Controller[key]) {
        Controller[key].reset();
        Controller[key] = null;
      }
    });
  }

	/**
   * Clean controller
	 * @method reset
	 */
  function reset() {
    Ti.API.debug('index.js_reset');

    $.removeListener();
    $.off();
    $.destroy();
  }

})(arguments[0] || {});
