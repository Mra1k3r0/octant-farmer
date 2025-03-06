# Octant Farmer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/Mra1k3r0/octant-farmer/blob/master/LICENSE)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green)

An automated tool for maintaining AFK sessions on the Octant platform.

## Features

- Automatic login to Octant accounts
- AFK session management
- Continuous session pinging
- Colorful console logging
- Multi-account support
- Error handling and recovery

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Mra1k3r0/octant-farmer.git
   cd octant-farmer

   ```

2. Install dependencies:

```shellscript
npm install
```

3. Set up your accounts:
   Rename the example accounts file and edit it with your credentials:

```shellscript
mv accounts_example.txt accounts.txt
```

Edit `accounts.txt` with your Octant credentials in the format:

```plaintext
email:password
```

One account per line. Lines starting with # are treated as comments.

## Usage

Run the application:

```shellscript
npm start
```

Or directly with Node:

```shellscript
node index.js
```

The application will:

1. Read accounts from `accounts.txt`
2. Log in to each account
3. Start AFK sessions
4. Continuously ping to maintain the sessions

Press `Ctrl+C` to gracefully stop all sessions.

## Configuration

The ping interval can be modified in the code. By default, it's set to 1000ms (1 second).

To change the ping interval, modify the following line in `index.js`:

```javascript
service.startPinging(1000); // Ping every second
```

## Project Structure

| File                   | Description                                            |
| ---------------------- | ------------------------------------------------------ |
| `index.js`             | Main application file with the OctantAFK class         |
| `logger.js`            | Utility for colorful console logging                   |
| `error_handler.js`     | Error handling and file operations                     |
| `accounts_example.txt` | Example account credentials file                       |
| `accounts.txt`         | Your actual account credentials (not included in repo) |

## Requirements

- Node.js 18.x or newer

## Disclaimer

This tool is for educational purposes only. Use at your own risk and in accordance with Octant's terms of service.

## License

This project is licensed under the [MIT License](https://github.com/Mra1k3r0/octant-farmer/tree/master?tab=MIT-1-ov-file) - see the LICENSE file for details.

---

Created by [mra1k3r0](https://github.com/mra1k3r0)
