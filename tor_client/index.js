const { spawn } = require('child_process');

class Tor {
  constructor() {
    this.isReady = false;
    this.debug = false;
    this.tor = null;
  }

  startDebuger() {
    this.debug = true;
  }

  terminate() {
    if (this.isReady) {
      this.tor.kill('SIGINT');
      this.isReady = false;
      this.tor = null;
      if (this.debug)
        console.log('tor is down.');
    } else if (this.debug) {
      console.log('tor: attempt to terminate before starting.');
    }
  }

  /**
   * Returns promise of executing tor
   */
  startTor() {
    if (this.tor === null) {
      return new Promise((resolve, reject) => {
        if (this.debug) console.log('starting tor...');

        const tor = spawn('tor');

        tor.stdout.on('data', data => {
          var data = data.toString('utf8');
          if (data.includes("100%: Done")) {
            if (this.debug) console.log('tor is up');
            
            this.isReady = true;
            this.tor = tor;
            resolve(tor);
          }
        });
      }).catch(err => {
        console.log(err);
      });
    } else if (this.debug) {
      console.log('attempt to start while tor is active');
    }
  }
}

module.exports = Tor;