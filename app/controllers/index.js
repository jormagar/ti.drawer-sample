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

  const ACTIONS = {};

	/*ACTIONS[DRAWER.Home.name] = [
	  [{
		icon: '/images/baseline_filter_list_black_24.png',
		callback: onActionClick.bind(null, 'calendar:action:filter')
	  }, {
		icon: '/images/baseline_date_range_black_24.png',
		callback: onActionClick.bind(null, 'calendar:action:selectday')
	  }], //CALENDAR
	  [], // CITA
	  [], // TUI
	  []  // SERVICIOS
	];*/

  const configuration = args.configuration;

  const Controller = {};
  const Actions = {};

  let ActiveController = null;
  let ActiveTab = 0;

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
      Controller[key] = null;
      Actions[key] = [];
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

    createController({
      controller: ITEMS.Home,
      args: {
        title: ITEMS.Home.label
      }
    });
  }

	/**
	 * @method setDrawerLayout
	 */
  function setDrawerLayout() {
    Ti.API.debug('index.js_setDrawerLayout');

    $.toolbar = Ti.UI.createToolbar({
      barColor: Alloy.CFG.Color.primary,
      title: L('app_title'),
      titleTextColor: Alloy.CFG.Color.white,
      extendBackground: true
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

    const MAIN_CATEGORY = 'main';

    const name = params.controller.name;
    const path = params.controller.path;
    const label = params.controller.label;
    const category = params.controller.category

    const args = Object(params.args);

    if (category === MAIN_CATEGORY) {
      $.win.title = L(label);

      if (Controller[name] === null) {
        Controller[name] = Alloy.createController(path, args);
      }

      const centerView = OS_IOS ? $.win : $.drawer.centerView;

      Helper.Fade.setContent(centerView, Controller[name].getView(), true, {
        controller: Controller[name],
        e: 'ready'
      });

      ActiveController && resetControllers([ActiveController]);

      ActiveController = name;
    } else if (OS_IOS) {
      $.nav.openWindow(Alloy.createController(path, args).getView());
    } else if (OS_ANDROID) {
      Alloy.createController(path, args).getView().open();
    }
  }

	/**
	 * @method onMenuItemClick
	 * @param {object} e Event
	 */
  function onMenuItemClick(e) {
    Ti.API.debug('index.js_onMenuItemClick');

    Ti.API.debug('e: ' + JSON.stringify(e));

    createController({
      controller: ITEMS[e.key],
      args: {
        title: ITEMS[e.key].label
      }
    });

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
      $.win.activity.actionBar.displayHomeAsUp = true;
      $.win.activity.actionBar.onHomeIconItemSelected = onHomeIconItemSelected;
    }
  }

	/**
	 * onHomeIconItemSelected
	 * @method onHomeIconItemSelected
	 * @param {object} e
	 */
  function onHomeIconItemSelected(e) {
    Ti.API.debug('index.js_onHomeIconItemSelected');

    openDrawer();
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
