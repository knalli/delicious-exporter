import dns from "dns";
import url from "url";
import ping from "net-ping";
import request from "request";
import Semaphore from "semaphore";

const noop = () => true;

class UrlVerifier {

  constructor({verbose = false}) {
    this.verbose = verbose;
    this.pingSession = ping.createSession();
    this.semaphore = Semaphore(10);
  }

  verify(string) {
    return new Promise((resolve, reject) => {
      this.semaphore.take(() => {
        this._verify(string).then(result => {
          resolve(result);
          this.semaphore.leave();
        }, (err) => {
          reject(err);
          this.semaphore.leave();
        });
      });
    });
  }

  _verify(string) {
    return new Promise((resolve) => {
      const result = {
        valid: false,
        dns: false,
        //ping: false,
        available: false,
      };
      const target = this.parseUrl(string);
      if (target.hostname) {
        result.valid = true;
        Promise.all([
                      // 1. resolve host -> ip
                      //   if this fails, the host is broken eventually
                      this.resolveHostIp(target.hostname)
                          .then((ip) => {
                            result.dns = true;
                            return ip;
                          })
                          //.then(this.testPingAddress)
                          //.then(() => result.ping = true)
                          .catch(noop),
                      // 2. try a standard get
                      this.testRequestGet(string)
                          .then(() => result.available = true)
                          .catch((err) => result.notAvailableReason = err),
                    ])
               .then(() => resolve(result));
      } else {
        // invalid url found?
        resolve(result);
      }
    });
  }

  parseUrl(string) {
    return url.parse(string);
  }

  resolveHostIp(hostname) {
    return new Promise((resolve, reject) => {
      if (this.verbose) {
        console.log(`DNS: Lookup for ${hostname}...`);
      }
      dns.lookup(hostname, (err, result) => {
        if (err) {
          if (this.verbose) {
            console.log(`DNS: Lookup for ${hostname}... FAILED: ${err.message}`);
          }
          reject(err);
        } else {
          if (this.verbose) {
            console.log(`DNS: Lookup for ${hostname}... RESULT: ${result}`);
          }
          resolve(result);
        }
      });
    });
  }

  testPingAddress(address) {
    return new Promise((resolve, reject) => {
      if (this.verbose) {
        console.log(`PING: Try ${address}...`);
      }
      this.pingSession.pingHost(address, (err, target) => {
        if (err) {
          if (this.verbose) {
            console.log(`PING: Try ${address}.. FAILED: ${err.message}`);
          }
          reject(err);
        } else {
          if (this.verbose) {
            console.log(`PING: Try ${address}.. RESULT: ${target}`);
          }
          resolve(target);
        }
      })
    });
  }

  testRequestGet(url) {
    return new Promise((resolve, reject) => {
      request(url, {timeout: 30000, followRedirect: true, rejectUnauthorized: false}, (err) => {
        if (err) {
          if (this.verbose) {
            console.error(url, err.errno, err.code, err.host, err.reason, err.connect);
          }
          if (err.code === 'ENOTFOUND') {
            reject('not found');
          } else if (err.code === 'ECONNREFUSED') {
            reject('connection refused');
          } else if (err.code === 'ECONNRESET') {
            reject('connection reset');
            //} else if (err.code === 'ETIMEDOUT') {
            //  reject('timed out');
          } else if (err.reason && err.reason.indexOf('is not in the cert\'s altnames')) {
            reject('ssl invalid');
          } else {
            reject(`errno=${err.errno}, code=${err.code}, reason='${err.reason}', connected=${err.connect}`);
          }
        } else {
          resolve(url);
        }
      });
    });
  }

}

export default UrlVerifier;
