## Timelord Monitor

Timelord monitor provides a web GUI allows user check the status of the timelord service, also it will provide the basic statistics of BitcoinHD1 block-chain.

## How to run it?

Timelord monitor is developed by using React/Next framework. In order to run the service, you need to install nodejs on your server. Please refer to [nodejs official website](https://nodejs.org) to get the instructions about how to install it on your system.

After the nodejs is installed on your system, please follow the instructions below:

1. Clone the repo to your local computer: `git clone https://github.com/bhdone/timelord-monitor`
2. Change the dir to the project root: `cd timelord-monitor`
3. Install required packages: `npm i`
4. Modify `next.config.js` under the project root, change the entry `apiUrl` to the prefix url you have already setup for your timelord service
5. Build it: `npm run build`
6. Run: `npm run start`

Timelord monitor will listen to `127.0.0.1:3000`.
