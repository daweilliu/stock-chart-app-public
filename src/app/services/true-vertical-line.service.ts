import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TrueVerticalLineService {
  private chartContainer: HTMLElement | null = null;
  private verticalLineOverlay: HTMLElement | null = null;
  private currentLines: HTMLElement[] = [];

  setChartContainer(container: HTMLElement) {
    this.chartContainer = container;
    this.setupOverlay();
  }

  private setupOverlay() {
    if (!this.chartContainer) return;

    // Create overlay container for vertical lines
    this.verticalLineOverlay = document.createElement('div');
    this.verticalLineOverlay.style.position = 'absolute';
    this.verticalLineOverlay.style.top = '0';
    this.verticalLineOverlay.style.left = '0';
    this.verticalLineOverlay.style.width = '100%';
    this.verticalLineOverlay.style.height = '100%';
    this.verticalLineOverlay.style.pointerEvents = 'none';
    this.verticalLineOverlay.style.zIndex = '10';
    
    // Make chart container relative positioned
    if (this.chartContainer.style.position !== 'relative') {
      this.chartContainer.style.position = 'relative';
    }
    
    this.chartContainer.appendChild(this.verticalLineOverlay);
  }

  createVerticalLines(chart: any, times: (string | number)[]): Promise<any[]> {
    console.log('🎯 Creating TRUE vertical lines for times:', times);
    
    if (!this.chartContainer || !this.verticalLineOverlay) {
      console.error('❌ Chart container or overlay not set up');
      return Promise.resolve([]);
    }

    // Clear existing lines
    this.clearVerticalLines();

    const newLines: HTMLElement[] = [];

    times.forEach((time, index) => {
      console.log(`📍 Creating TRUE vertical line ${index + 1}/${times.length} at time:`, time);
      
      // Get the x coordinate for this time
      const timeScale = chart.timeScale();
      const x = timeScale.timeToCoordinate(time);
      
      if (x !== null) {
        // Create a vertical line element
        const lineElement = document.createElement('div');
        lineElement.style.position = 'absolute';
        lineElement.style.left = `${x}px`;
        lineElement.style.top = '0';
        lineElement.style.width = '1px';
        lineElement.style.height = '100%';
        lineElement.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        lineElement.style.borderLeft = '1px dashed rgba(255, 255, 255, 0.8)';
        lineElement.style.pointerEvents = 'none';
        lineElement.style.zIndex = '15';
        
        // Add to overlay
        if (this.verticalLineOverlay) {
          this.verticalLineOverlay.appendChild(lineElement);
          newLines.push(lineElement);
        }
        
        console.log(`✅ Created TRUE vertical line at x=${x} for time=${time}`);
      } else {
        console.warn(`⚠️ Could not get coordinate for time=${time}`);
      }
    });

    this.currentLines = newLines;
    console.log(`🎉 Created ${newLines.length} TRUE vertical lines`);
    
    // Update line positions when chart is scrolled or resized
    this.setupPositionUpdater(chart, times);
    
    return Promise.resolve(newLines);
  }

  private setupPositionUpdater(chart: any, times: (string | number)[]) {
    // Update line positions when the chart's visible range changes
    const updatePositions = () => {
      if (!this.chartContainer || !this.verticalLineOverlay) return;
      
      const timeScale = chart.timeScale();
      
      this.currentLines.forEach((lineElement, index) => {
        const time = times[index];
        const x = timeScale.timeToCoordinate(time);
        
        if (x !== null) {
          lineElement.style.left = `${x}px`;
          lineElement.style.display = 'block';
        } else {
          // Hide line if time is not visible
          lineElement.style.display = 'none';
        }
      });
    };

    // Listen for chart updates
    chart.timeScale().subscribeVisibleTimeRangeChange(updatePositions);
    
    // Initial position update
    setTimeout(updatePositions, 100);
  }

  clearVerticalLines() {
    console.log('🧹 Clearing TRUE vertical lines');
    
    this.currentLines.forEach(line => {
      if (line.parentNode) {
        line.parentNode.removeChild(line);
      }
    });
    
    this.currentLines = [];
  }

  getCurrentVerticalLines() {
    return this.currentLines;
  }
}
