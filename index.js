const axios = require('axios');
const fs = require('fs');
const Logger = require('./logger');
const { handleApiError, readFile, parseAccounts } = require('./error_handler');

/**
 * OctantAFK class to handle AFK service
 */
class OctantAFK {
  constructor(credentials) {
    this.credentials = credentials;
    this.token = null;
    this.sessionId = null;
    this.pingCount = 0;
    this.pingInterval = null;
    this.pingDelay = 1000; // Default to 1 second

    // Create axios instance with default config
    this.client = axios.create({
      timeout: 30000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Linux; Android 10; RMX2151) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/134.0.6998.39 Webvium Dev/2.9-dev Mobile Safari/537.36',
      },
    });
  }

  /**
   * Login to Octant
   * @returns {Promise<string>} Authentication token
   */
  async login() {
    try {
      // Reduced logging - no login attempt message

      const loginResponse = await this.client.post(
        'https://gateway.octant.sh/api/auth/login',
        {
          email: this.credentials.email,
          password: this.credentials.password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Origin: 'https://gateway.octant.sh',
            Referer: 'https://gateway.octant.sh/auth/login?intent=auth&target=Octant%2FHosting',
            'sec-ch-ua': 'Not A;Brand";v="99", "Chromium";v="101"',
            'sec-ch-ua-mobile': '?1',
            'sec-ch-ua-platform': '"Android"',
          },
        }
      );

      this.token = loginResponse.data.token;

      if (!this.token) {
        throw new Error('No token received from login response');
      }

      // No success message - will be combined later
      return this.token;
    } catch (error) {
      Logger.error(`Login failed for ${this.credentials.email}!`);
      handleApiError(error, this.credentials.email);
      throw error;
    }
  }

  /**
   * Complete authentication via callback
   * @returns {Promise<void>}
   */
  async completeAuth() {
    try {
      // Reduced logging - no auth attempt message

      await this.client.get(`https://hosting.octant.sh/auth/callback?token=${this.token}`, {
        headers: {
          Referer: 'https://gateway.octant.sh/',
          'sec-ch-ua': 'Not A;Brand";v="99", "Chromium";v="101"',
          'sec-ch-ua-mobile': '?1',
          'sec-ch-ua-platform': '"Android"',
        },
        maxRedirects: 5,
      });

      // No success message - will be combined later
    } catch (error) {
      Logger.error(`Authentication callback failed for ${this.credentials.email}!`);
      handleApiError(error, this.credentials.email);
      throw error;
    }
  }

  /**
   * Start AFK session
   * @returns {Promise<string>} Session ID
   */
  async startAfkSession() {
    try {
      // Reduced logging - no start attempt message

      const afkResponse = await this.client.post(
        'https://hosting.octant.sh/api/afk/start',
        {}, // Empty body
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Cookie: `octant_token=${this.token}`,
            Origin: 'https://hosting.octant.sh',
            Referer: 'https://hosting.octant.sh/dashboard/afk',
            'sec-ch-ua': 'Not A;Brand";v="99", "Chromium";v="101"',
            'sec-ch-ua-mobile': '?1',
            'sec-ch-ua-platform': '"Android"',
            'sec-fetch-dest': 'empty',
          },
        }
      );

      this.sessionId = afkResponse.data.sessionId;

      if (!this.sessionId) {
        throw new Error('No sessionId received from AFK start response');
      }

      // No success message - will be combined later
      return this.sessionId;
    } catch (error) {
      Logger.error(`Failed to start AFK session for ${this.credentials.email}!`);
      handleApiError(error, this.credentials.email);
      throw error;
    }
  }

  /**
   * Ping AFK session
   * @returns {Promise<boolean>} Ping result
   */
  async pingAfkSession() {
    try {
      const pingResponse = await this.client.post(
        'https://hosting.octant.sh/api/afk/ping',
        { sessionId: this.sessionId },
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Cookie: `octant_token=${this.token}`,
            Origin: 'https://hosting.octant.sh',
            Referer: 'https://hosting.octant.sh/dashboard/afk',
            'sec-ch-ua': 'Not A;Brand";v="99", "Chromium";v="101"',
            'sec-ch-ua-mobile': '?1',
            'sec-ch-ua-platform': '"Android"',
            'sec-fetch-dest': 'empty',
          },
        }
      );

      this.pingCount++;

      // Restored raw response logging with colorized JSON
      const responseStr = JSON.stringify(pingResponse.data);
      Logger.json(`[${this.credentials.email}] Ping #${this.pingCount} raw response:`, responseStr);

      // Check if response is an object with a success property
      if (typeof pingResponse.data === 'object' && pingResponse.data !== null) {
        if (pingResponse.data.success === true) {
          // Log every successful ping as requested
          Logger.status(`[${this.credentials.email}] Ping #${this.pingCount} successful`);
          return true;
        } else {
          Logger.warn(
            `[${this.credentials.email}] Ping #${this.pingCount} failed: ${JSON.stringify(pingResponse.data)}`
          );
          return false;
        }
      } else if (pingResponse.data === true) {
        // Log every successful ping as requested
        Logger.status(`[${this.credentials.email}] Ping #${this.pingCount} successful`);
        return true;
      } else {
        // Always log unexpected results
        Logger.warn(
          `[${this.credentials.email}] Ping #${this.pingCount} unexpected: ${JSON.stringify(pingResponse.data)}`
        );
        return false;
      }
    } catch (error) {
      Logger.error(`[${this.credentials.email}] Ping #${this.pingCount} failed!`);
      handleApiError(error, this.credentials.email);
      return false;
    }
  }

  /**
   * Start continuous pinging
   * @param {number} interval - Ping interval in milliseconds
   * @returns {Promise<void>}
   */
  startPinging(interval = 1000) {
    this.pingDelay = interval;
    this.pingCount = 0;

    // No starting message - will be combined

    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    this.pingInterval = setInterval(async () => {
      await this.pingAfkSession();
    }, interval);

    // No success message - will be combined
  }

  /**
   * Stop continuous pinging
   */
  stopPinging() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
      // No stopping message - will be handled in main
    }
  }

  /**
   * Initialize the AFK service
   * @returns {Promise<boolean>} Success status
   */
  async initialize() {
    try {
      Logger.info(`Initializing bot for ${this.credentials.email}...`);

      await this.login();
      await this.completeAuth();
      await this.startAfkSession();

      Logger.success(
        `Bot ready for ${this.credentials.email} (Session: ${this.sessionId.substring(0, 8)}...)`
      );
      return true;
    } catch (error) {
      Logger.error(`Failed to initialize bot for ${this.credentials.email}!`);
      return false;
    }
  }
}

/**
 * Main function to run the AFK service
 */
async function main() {
  try {
    Logger.log('╔════════════════════════════════════════════════════════╗', '#4B0082');
    Logger.log('║                                                        ║', '#4B0082');
    Logger.log('║                   OCTANT AFK BOT                       ║', '#9370DB');
    Logger.log('║                                                        ║', '#4B0082');
    Logger.log('╚════════════════════════════════════════════════════════╝', '#4B0082');

    // Read accounts from file
    let accountsData;
    try {
      accountsData = await readFile('./accounts.txt');
    } catch (error) {
      Logger.error('Failed to read accounts.txt file!');

      // Create a sample accounts.txt file
      const sampleContent =
        '# Format: email:password\nmyemail@gmail.com:pass1234\n# Add more accounts below';

      try {
        await new Promise((resolve, reject) => {
          fs.writeFile('./accounts.txt', sampleContent, 'utf8', (err) => {
            if (err) reject(err);
            else resolve();
          });
        });

        Logger.info('Created a sample accounts.txt file. Please edit it and run the script again.');
      } catch (writeError) {
        Logger.error('Failed to create sample accounts.txt file!');
      }

      return;
    }

    const accounts = parseAccounts(accountsData);

    if (accounts.length === 0) {
      Logger.error('No valid accounts found in accounts.txt!');
      Logger.info('Please add accounts in the format email:password, one per line.');
      return;
    }

    Logger.info(`Found ${accounts.length} account(s). Starting initialization...`);

    // Initialize AFK services for each account
    const afkServices = [];

    for (const account of accounts) {
      const afkService = new OctantAFK(account);
      const initialized = await afkService.initialize();

      if (initialized) {
        afkServices.push(afkService);
      }
    }

    if (afkServices.length === 0) {
      Logger.error('No bots could be initialized. Exiting.');
      return;
    }

    // Start pinging for all initialized services
    for (const service of afkServices) {
      service.startPinging(1000); // Ping every second
    }

    Logger.success(`${afkServices.length} bot(s) running. Press Ctrl+C to stop.`);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      Logger.info('Shutting down bots...');

      for (const service of afkServices) {
        service.stopPinging();
      }

      Logger.success('All bots stopped. Goodbye! See you next time!');
      process.exit(0);
    });
  } catch (error) {
    Logger.error('An unexpected error occurred:');
    Logger.error(error.message);
    process.exit(1);
  }
}

// Run the main function
main();
