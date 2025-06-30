// Type declarations for vertical line plugin
declare module '/assets/plugins/vertical-line/vertical-line.js' {
  export class VerticalLine {
    constructor(options: {
      time: string | number;
      color?: string;
      width?: number;
      style?: 'solid' | 'dashed' | 'dotted';
      opacity?: number;
      showLabel?: boolean;
    });
  }
}
