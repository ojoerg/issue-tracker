/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
//var server = require('../server');
var server = "https://issue-tracker-gitloeti.glitch.me";

chai.use(chaiHttp);

suite('Functional Tests', function() {
  this.timeout(6000);
    suite('POST /api/issues/{project} => object with issue data', function() {
      
      test('Every field filled in', function(done) {
       chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'  
        })

        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
      });
   
      test('Required fields filled in', function(done) {
        chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title2',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
      });
    
      test('Missing required fields', function(done) {
        chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })       /* .then((res) => {
         console.log(res)
       })*/
        .end(function(err, res){
          assert.equal(res.status, 400);
          assert.equal(res.text, 'invalid data');
          done();
        });
      
      });
      
    });


    suite('PUT /api/issues/{project} => text', function() {
      
      test('No body', function(done) {
        chai.request(server)
        .get("/api/issues/test")
        .end(function(error, response) {
          chai.request(server)
          .put('/api/issues/test?_id=' + response.body[0]._id)
          .end(function(err, res){
            assert.equal(res.status, 400);
            assert.equal(res.text, "no updated field sent")
            done();
          });
        })
      });
      
      test('One field to update', function(done) {
        chai.request(server)
        .get("/api/issues/test")
        .end(function(error, response) {
          chai.request(server)
          .put('/api/issues/test?_id=' + response.body[0]._id + '&issue_title=New+Title')
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, "successfully updated")
            done();
          });
        });
      });
     
      test('Multiple fields to update', function(done) {
        chai.request(server)
        .get("/api/issues/test")
        .end(function(error, response) {
          chai.request(server)
          .put('/api/issues/test?_id=' + response.body[0]._id + '&issue_text=changed+text&open=false')
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, "successfully updated")
            done();
          });
        });
      });
      
    });


     
    suite('GET /api/issues/{project} => Array of objects with issue data', function() {
      
      test('No filter', function(done) {
       chai.request(server)
        .get('/api/issues/test')
        .query({})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.isAbove(res.body.length, 1);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
      });
      
      test('One filter', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({
          issue_title: "Title2"
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.equal(res.body.length, 1);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
      });
      
      test('Multiple filters (test for multiple fields you know will be in the db for a return)', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({
          issue_title: "Title2",
          created_by: "Functional Test - Every field filled in"
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.equal(res.body.length, 1);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
      });
   });
   
    suite('DELETE /api/issues/{project} => text', function() {

      test('No _id', function(done) {
        chai.request(server)
        .delete('/api/issues/test')
        .query({})
        .end(function(err, res){
          assert.equal(res.status, 400);
          assert.equal(res.text, "_id error")
          done();
        });
      });
      
      test("Valid _id", function(done) {
        chai.request(server)
          .get("/api/issues/test")
          .end(function(error, response) {
            chai
              .request(server)
              .delete("/api/issues/test")
              .query({
                _id: response.body[0]._id
              })
              .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.text, "deleted " + response.body[0]._id);
                done();
              });
            done();
          });
      });
    });
  
    suite('DELETE project test', function() {

      test('Delete Test', function(done) {
        chai.request(server)
        .delete('/api/issues/test')
        .query({
          delete_id: "FSm7sDcV05cwIzXGSjtQHDjMHMRovrjYI8eU"
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, "test project was deleted")
          done();
        });
      });
      
    });
});
