import { Injectable } from '@angular/core';

export interface PluginConfig {
  name: string;
  path: string;
  enabled: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ChartPluginsService {
  private loadedPlugins = new Map<string, any>();

  async loadPlugin(pluginName: string): Promise<any> {
    if (this.loadedPlugins.has(pluginName)) {
      return this.loadedPlugins.get(pluginName);
    }

    try {
      // Load the plugin module dynamically
      const pluginModule = await import(
        `/assets/plugins/${pluginName}/${pluginName}.js`
      );
      this.loadedPlugins.set(pluginName, pluginModule);
      return pluginModule;
    } catch (error) {
      console.error(`Failed to load plugin: ${pluginName}`, error);
      throw error;
    }
  }

  getAvailablePlugins(): PluginConfig[] {
    return [
      { name: 'tooltip', path: 'tooltip', enabled: true },
      {
        name: 'background-shade-series',
        path: 'background-shade-series',
        enabled: false,
      },
      { name: 'trend-line', path: 'trend-line', enabled: false },
      { name: 'volume-profile', path: 'volume-profile', enabled: false },
      { name: 'delta-tooltip', path: 'delta-tooltip', enabled: false },
      {
        name: 'rectangle-drawing-tool',
        path: 'rectangle-drawing-tool',
        enabled: false,
      },
      { name: 'user-price-alerts', path: 'user-price-alerts', enabled: false },
      {
        name: 'session-highlighting',
        path: 'session-highlighting',
        enabled: false,
      },
      {
        name: 'rounded-candles-series',
        path: 'rounded-candles-series',
        enabled: false,
      },
      {
        name: 'stacked-area-series',
        path: 'stacked-area-series',
        enabled: false,
      },
    ];
  }
}
