/**
 * Logger class for colorful console output
 */
class Logger {
    static colors = {
      reset: "\x1b[0m",
      black: "\x1b[30m",
      red: "\x1b[31m",
      green: "\x1b[32m",
      yellow: "\x1b[33m",
      blue: "\x1b[34m",
      magenta: "\x1b[35m",
      cyan: "\x1b[36m",
      white: "\x1b[37m",
      // Bright colors
      brightRed: "\x1b[91m",
      brightGreen: "\x1b[92m",
      brightYellow: "\x1b[93m",
      brightBlue: "\x1b[94m",
      brightMagenta: "\x1b[95m",
      brightCyan: "\x1b[96m",
      brightWhite: "\x1b[97m",
    }
  
    /**
     * Convert hex color to ANSI escape code
     * @param {string} hex - Hex color code
     * @returns {string} ANSI color code
     */
    static hexToAnsi(hex) {
      // Remove # if present
      hex = hex.replace(/^#/, "")
  
      // Parse the hex values
      const r = Number.parseInt(hex.substring(0, 2), 16)
      const g = Number.parseInt(hex.substring(2, 4), 16)
      const b = Number.parseInt(hex.substring(4, 6), 16)
  
      // Return the ANSI escape code
      return `\x1b[38;2;${r};${g};${b}m`
    }
  
    /**
     * Get current timestamp in Asia/Manila timezone
     * @returns {string} Formatted timestamp
     */
    static getTimestamp() {
      // Create a date object with the current time
      const now = new Date()
  
      // Format the date for Asia/Manila timezone (UTC+8)
      const options = {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }
  
      // Format the date string and replace the comma
      const manilaTime = new Intl.DateTimeFormat("en-US", options)
        .format(now)
        .replace(",", "")
        .replace(/(\d+)\/(\d+)\/(\d+)/, "$3-$1-$2") // Convert MM/DD/YYYY to YYYY-MM-DD
  
      return manilaTime
    }
  
    /**
     * Log a message with color and timestamp
     * @param {string} message - Message to log
     * @param {string} color - Color name or hex code
     */
    static log(message, color = "white") {
      const timestamp = this.getTimestamp()
      let colorCode
  
      if (color.startsWith("#")) {
        colorCode = this.hexToAnsi(color)
      } else {
        colorCode = this.colors[color] || this.colors.white
      }
  
      console.log(
        `${this.colors.brightBlue}[${timestamp}]${this.colors.reset} ${colorCode}${message}${this.colors.reset}`,
      )
    }
  
    /**
     * Log an info message
     * @param {string} message - Message to log
     */
    static info(message) {
      this.log(message, "cyan")
    }
  
    /**
     * Log a success message
     * @param {string} message - Message to log
     */
    static success(message) {
      this.log(message, "#00FF00") // Bright green
    }
  
    /**
     * Log a warning message
     * @param {string} message - Message to log
     */
    static warn(message) {
      this.log(message, "#FFA500") // Orange
    }
  
    /**
     * Log an error message
     * @param {string} message - Message to log
     */
    static error(message) {
      this.log(message, "#FF0000") // Bright red
    }
  
    /**
     * Log a debug message
     * @param {string} message - Message to log
     */
    static debug(message) {
      this.log(message, "#808080") // Gray
    }
  
    /**
     * Log a status message
     * @param {string} message - Message to log
     */
    static status(message) {
      this.log(message, "#9370DB") // Medium purple
    }
  
    /**
     * Log a JSON message with special formatting
     * @param {string} message - Message prefix
     * @param {string} jsonString - JSON string to format
     */
    static json(message, jsonString) {
      // Use a bright cyan color for JSON values
      const jsonColor = this.hexToAnsi("#00FFFF")
      const formattedJson = jsonString
        .replace(/"(\w+)":/g, `"${this.colors.brightYellow}$1${this.colors.reset}${jsonColor}":`)
        .replace(/true/g, `${this.colors.brightGreen}true${this.colors.reset}${jsonColor}`)
        .replace(/false/g, `${this.colors.brightRed}false${this.colors.reset}${jsonColor}`)
        .replace(/null/g, `${this.colors.brightMagenta}null${this.colors.reset}${jsonColor}`)
  
      this.log(`${message} ${jsonColor}${formattedJson}${this.colors.reset}`, "white")
    }
  }
  
  module.exports = Logger
  
  