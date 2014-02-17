Node Server Manager is a tool written in node.js
------------
...to get various information about server and, in future, give server administrators better control over their server.

### Requirements

Application requires node.js installed on your machine and following node modules:

* simple-enum

After you've installed node.js, you can install node modules using:
~~~~ bash
npm install module-name
~~~~

### How to use

After you've downloaded files you have to open system's console, go to directory with application and run it with command:
~~~~ bash
node app.js
~~~~
Then, open your browser and go to following URL: [http://localhost:7777](http://localhost:7777).
You will see an input box and a button. Type server's ip and press "Get Online Players List".
If data you've provided is correct, you should see a list of online players with their levels.
