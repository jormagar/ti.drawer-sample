# bottomNavigation

La finalidad de este widget es el uso de una navegación inferior multiplataforma de apariencia nativa ya que Titanium no incorpora el componente Bottom Navigation para Android y en iOS se utilizan tabs.

## Uso

```xml
<Alloy autoStyle="true">
	<Window id="win" class="orientation white-bg">
		<ActionBar homeButtonEnabled="true" displayHomeAsUp="true" platform="android"/>
		<Widget id="tabs" src="es.upv.asic.bottomNavigation"/>
	</Window>
</Alloy>
```

```javascript
  // Declaración de la configuración de los tabs
  const TAB_CONFIG = {
    lazyLoad: false,
    cell: {
      icon: {
        fontFamily: 'Glyphter'
      },
      android: {
        background: Alloy.CFG.Color.main,
        default: Alloy.CFG.Color.whiteDark,
        active: Alloy.CFG.Color.white,
        border: Alloy.CFG.Color.grayLight
      },
      ios: {
        background: Alloy.CFG.Color.main,
        default: Alloy.CFG.Color.whiteDark,
        active: Alloy.CFG.Color.white,
        border: Alloy.CFG.Color.grayLight
      }
    }
  };

  /**
   * Creación de los tabs
   * @method  createTabs
   */
  function createTabs() {
    $.tabs.init({
      config: TAB_CONFIG,
      tabs: generateTabs()
    });
  }

  /**
   * Genera los tabs
   * @method  generateTabs
   * @returns {object}       Lista de tabs
   */
  function generateTabs() {
    console.log('generateTabs on myActvity.js');
    var tabs;

    tabs = [];

    // Mis asistencias (Historial de fichajes)
    tabs.push({
      label: L('my_signings', 'Mis fichajes'),
      icon: 'B',
      controller: getControllerParams('history', {
        title: history.title,
        url: history.url.replace('{p_idioma}', Alloy.Globals.intranetLang),
        ttl: history.ttl,
        configuration: configuration
      })
    });
    // Mis actividades inscritas
    tabs.push({
      label: L('enrolled_activity', 'Mis actividades'),
      icon: 'A',
      controller: getControllerParams('enrolledActivity', {
        configuration: configuration
      })
    });

    return tabs;
  }

```

## Licencia

[MIT](http://vjpr.mit-license.org/)
