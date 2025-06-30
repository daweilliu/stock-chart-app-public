import { Injectable } from '@angular/core';

declare const window: any;

@Injectable({
  providedIn: 'root',
})
export class VerticalLinePluginService {
  private currentVerticalLines: any[] = [];

  async loadVerticalLinePlugin(): Promise<any> {
    console.log('🔧 Loading dashed vertical line plugin...');
    try {
      // Check if plugin is already loaded
      if (
        (window as any).DashedVertLine ||
        (window as any).DashedVerticalLine
      ) {
        console.log('✅ Dashed plugin already loaded from global scope');
        return (
          (window as any).DashedVertLine || (window as any).DashedVerticalLine
        );
      }

      // Load the dashed vertical line script
      const pluginUrl = 'assets/plugins/vertical-line/dashed-vertical-line.js';
      console.log('📥 Loading dashed plugin script from:', pluginUrl);
      await this.loadScript(pluginUrl);

      // Return the plugin class from global scope
      const plugin =
        (window as any).DashedVertLine || (window as any).DashedVerticalLine;
      if (plugin) {
        console.log('✅ Dashed plugin loaded successfully:', plugin);
        return plugin;
      } else {
        console.warn(
          '⚠️ Dashed plugin script loaded but class not found in global scope'
        );
        return null;
      }
    } catch (error) {
      console.error('❌ Failed to load dashed vertical line plugin:', error);
      return null;
    }
  }

  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = (error) => reject(error);
      document.head.appendChild(script);
    });
  }

  async createVerticalLines(
    chart: any,
    series: any,
    times: (string | number)[]
  ): Promise<any[]> {
    console.log('🎯 Creating vertical lines for times:', times);
    console.log('📊 Chart:', !!chart, 'Series:', !!series);

    // Clear existing lines first
    this.removeVerticalLines(chart);

    try {
      // Load the dashed vertical line plugin
      const VerticalLineClass = await this.loadVerticalLinePlugin();

      if (VerticalLineClass) {
        console.log('✅ Using dashed vertical line plugin');

        const newVerticalLines: any[] = [];

        times.forEach((time, index) => {
          console.log(
            `📍 Creating dashed vertical line ${index + 1}/${
              times.length
            } at time:`,
            time
          );

          // Create a white dashed vertical line
          const verticalLine = new VerticalLineClass(chart, series, time, {
            color: 'rgba(255, 255, 255, 0.9)', // Bright white with slight transparency
            width: 1, // Thin line
            dashed: true,
            dashLength: 5,
            dashGap: 3,
            showLabel: false,
          });

          // Add the vertical line to the chart
          if (chart.addVisualElement) {
            chart.addVisualElement(verticalLine);
          }
          newVerticalLines.push(verticalLine);
        });

        this.currentVerticalLines = newVerticalLines;
        console.log(
          `✅ Created ${newVerticalLines.length} dashed vertical lines`
        );
        return newVerticalLines;
      }
    } catch (error) {
      console.error(
        '❌ Failed to create dashed vertical lines, falling back to markers:',
        error
      );
    }

    // Fallback: Create enhanced markers that simulate vertical lines
    console.log('⚠️ Using marker-based fallback for vertical lines');
    const verticalLineMarkers: any[] = [];

    times.forEach((time, index) => {
      console.log(
        `📍 Creating fallback vertical line marker ${index + 1}/${
          times.length
        } at time:`,
        time
      );

      // Create multiple very small white markers to simulate a vertical line
      const baseMarker = {
        time: time,
        color: '#ffffff', // White color to match the desired appearance
        shape: 'circle' as const,
        text: '·', // Very small dot character
        size: 0.2, // Small size
      };

      // Create many markers for vertical coverage - make it look like a dashed line
      for (let i = 0; i < 15; i++) {
        const markerType =
          i % 3 === 0 ? 'aboveBar' : i % 3 === 1 ? 'inBar' : 'belowBar';
        const markerChar =
          i % 4 === 0 ? '|' : i % 4 === 1 ? '·' : i % 4 === 2 ? '•' : '∘';

        verticalLineMarkers.push({
          ...baseMarker,
          position: markerType as 'aboveBar' | 'inBar' | 'belowBar',
          text: markerChar,
          size: 0.15 + (i % 3) * 0.05, // Vary size slightly
        });
      }
    });

    // Set markers on the series
    if (verticalLineMarkers.length > 0) {
      series.setMarkers(verticalLineMarkers);
      console.log(
        `✅ Created ${verticalLineMarkers.length} fallback markers as vertical lines`
      );
    }

    return verticalLineMarkers;
  }

  removeVerticalLines(chart: any) {
    console.log('🧹 Removing existing vertical lines');

    // Remove plugin-based vertical lines
    if (this.currentVerticalLines.length > 0) {
      this.currentVerticalLines.forEach((line) => {
        try {
          if (chart.removeVisualElement) {
            chart.removeVisualElement(line);
          }
        } catch (error) {
          console.warn('⚠️ Failed to remove vertical line:', error);
        }
      });
      this.currentVerticalLines = [];
    }
  }

  getCurrentVerticalLines() {
    return this.currentVerticalLines;
  }
}
