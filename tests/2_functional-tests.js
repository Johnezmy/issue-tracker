const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  
  let testIssue1; // Used to store an ID for update/delete tests

  suite('Routing Tests - POST requests to /api/issues/{project}', function() {
    
    test('Create an issue with every field: POST request to /api/issues/{project}', function(done) {
      chai.request(server)
        .post('/api/issues/test_project')
        .send({
          issue_title: 'Fix error',
          issue_text: 'Functional test issue text',
          created_by: 'Chai',
          assigned_to: 'Dev',
          status_text: 'In Progress'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, 'Fix error');
          assert.equal(res.body.issue_text, 'Functional test issue text');
          assert.equal(res.body.created_by, 'Chai');
          assert.equal(res.body.assigned_to, 'Dev');
          assert.equal(res.body.status_text, 'In Progress');
          assert.property(res.body, '_id');
          testIssue1 = res.body; // Save for later tests
          done();
        });
    });

    test('Create an issue with only required fields: POST request to /api/issues/{project}', function(done) {
      chai.request(server)
        .post('/api/issues/test_project')
        .send({
          issue_title: 'Required Fields Only',
          issue_text: 'Text description',
          created_by: 'Chai'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, 'Required Fields Only');
          assert.equal(res.body.assigned_to, '');
          assert.equal(res.body.status_text, '');
          done();
        });
    });

    test('Create an issue with missing required fields: POST request to /api/issues/{project}', function(done) {
      chai.request(server)
        .post('/api/issues/test_project')
        .send({
          created_by: 'Chai'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'required field(s) missing');
          done();
        });
    });

  });

  suite('Routing Tests - GET requests to /api/issues/{project}', function() {

    test('View issues on a project: GET request to /api/issues/{project}', function(done) {
      chai.request(server)
        .get('/api/issues/test_project')
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          done();
        });
    });

    test('View issues on a project with one filter: GET request to /api/issues/{project}', function(done) {
      chai.request(server)
        .get('/api/issues/test_project')
        .query({ created_by: 'Chai' })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.equal(res.body[0].created_by, 'Chai');
          done();
        });
    });

    test('View issues on a project with multiple filters: GET request to /api/issues/{project}', function(done) {
      chai.request(server)
        .get('/api/issues/test_project')
        .query({ created_by: 'Chai', issue_title: 'Fix error' })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.equal(res.body[0].created_by, 'Chai');
          assert.equal(res.body[0].issue_title, 'Fix error');
          done();
        });
    });

  });

  suite('Routing Tests - PUT requests to /api/issues/{project}', function() {

    test('Update one field on an issue: PUT request to /api/issues/{project}', function(done) {
      chai.request(server)
        .put('/api/issues/test_project')
        .send({
          _id: testIssue1._id,
          issue_title: 'Updated Title'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, 'successfully updated');
          assert.equal(res.body._id, testIssue1._id);
          done();
        });
    });

    test('Update multiple fields on an issue: PUT request to /api/issues/{project}', function(done) {
      chai.request(server)
        .put('/api/issues/test_project')
        .send({
          _id: testIssue1._id,
          issue_title: 'Brand New Title',
          issue_text: 'Updated descriptive text'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, 'successfully updated');
          done();
        });
    });

 test('Update an issue with no fields to update: PUT request to /api/issues/{project}', function(done) {
  chai.request(server)
    .put('/api/issues/test_project')
    .send({
      _id: testIssue1._id
    })
    .end(function(err, res) {
      assert.equal(res.status, 200);
      // Change 'no fields update' to match your API string:
      assert.equal(res.body.error, 'no update field(s) sent'); 
      assert.equal(res.body._id, testIssue1._id);
      done();
    });
});

    test('Update an issue with no fields to update: PUT request to /api/issues/{project}', function(done) {
      chai.request(server)
        .put('/api/issues/test_project')
        .send({
          _id: testIssue1._id
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'no fields update');
          assert.equal(res.body._id, testIssue1._id);
          done();
        });
    });

    test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', function(done) {
      chai.request(server)
        .put('/api/issues/test_project')
        .send({
          _id: '60c72b2f9b1d8b00155a0000', // valid format, fake id
          issue_title: 'Fix'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'could not update');
          done();
        });
    });

  });

  suite('Routing Tests - DELETE requests to /api/issues/{project}', function() {

    test('Delete an issue: DELETE request to /api/issues/{project}', function(done) {
      chai.request(server)
        .delete('/api/issues/test_project')
        .send({ _id: testIssue1._id })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, 'successfully deleted');
          done();
        });
    });

    test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', function(done) {
      chai.request(server)
        .delete('/api/issues/test_project')
        .send({ _id: '60c72b2f9b1d8b00155a0000' })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'could not delete');
          done();
        });
    });

    test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', function(done) {
      chai.request(server)
        .delete('/api/issues/test_project')
        .send({})
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'missing _id');
          done();
        });
    });

  });

});