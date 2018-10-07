const request = require('request');
var base_url = "http://localhost:3000/v1/api/auth";
require('../server/app');

describe("should check if server is alive and get auth url", () => {

  it("returns status code 200", function(done) {
    request.get(base_url, function(error, response, body) {
      body = JSON.parse(body);
      expect(response.statusCode).toBe(200);
      expect(body.url).toBeTruthy();
      done();
    });
  });
});
