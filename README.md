[![Build Status](https://travis-ci.org/Kuzirashi/node-server-manager.png?branch=master)](https://travis-ci.org/Kuzirashi/node-server-manager)


#Node Server Manager is a tool written in node.js
------------
...to get various information about server and, in future, give server administrators more control over server.

## Requirements

Application requires node.js, rest of dependencies would be installed automatically. After you've installed node.js, you can get application installed using following commands in terminal:
~~~~ bash
git clone https://github.com/Kuzirashi/node-server-manager.git
cd node-server-manager
npm install
~~~~
Now, you can run test to check if everything works:
~~~~ bash
npm test
~~~~

## How to run

After you've installed everything, go to directory with application and run it with command:
~~~~ bash
node app.js
~~~~
Then, open your browser and go to following URL: [http://localhost:7777](http://localhost:7777) or [http://localhost:3000](http://localhost:3000) - both should be working at this moment, but port 3000 is preferred.