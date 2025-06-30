// Global wrapper for the vertical line plugin
import { VertLine } from "./vertical-line.js";

// Make it available globally
window.VertLine = VertLine;
window.VerticalLine = VertLine; // Alias for compatibility

// Also export for module systems
export { VertLine as VerticalLine, VertLine };
