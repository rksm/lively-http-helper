/*global require, module, console, setTimeout*/

var lang = require('lively.lang'),
    http = require('http'),
    util = require('util');

function withResponseBodyDo(res, callback) {
  var data = "";
  res.on('data', function(d) { data += d });
  res.on('end', function(err) { callback(err, data); });
}

function request(method, server, path, data, headers, callback) {
  callback = lang.fun.once(callback);
  if (typeof data === 'function' && !callback) { callback = data; data = null }
  if (typeof headers === 'function' && !callback) { callback = headers; headers = null }
  var req = http.request({
    hostname: server.hostname || "localhost",
    port: server.port || 9999,
    path: path,
    method: method,
    headers: headers
  }, function(res) {
    var data = '';
    res.on('data', function(d) { data += d.toString(); });
    res.on('end', function() { res.body = data; callback && callback(null, res); });
    res.on("error", function(err) { callback(new Error("response error: " + (err.stack || err))); });
  });
  req.on("error", function(err) { callback(new Error("request error: " + (err.stack || err))); });
  if (data) req.write(typeof data === 'object' ? JSON.stringify(data) : data);
  req.end();
  return req;
}

module.exports = {
  withResponseBodyDo: withResponseBodyDo,
  GET: request.bind(null, 'GET'),
  PUT: request.bind(null, 'PUT'),
  DEL: request.bind(null, 'DELETE'),
  POST: request.bind(null, 'POST')
}
