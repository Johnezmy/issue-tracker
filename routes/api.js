'use strict';

const mongoose = require('mongoose');
const Issue = require('../models/issue.js');

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    // 1. GET Request: View issues with optional query filtering
    .get(async function (req, res) {
      const project = req.params.project;
      
      try {
        // Build a dynamic query object combining the project bucket and any incoming URL query filters
        const queryObj = { project, ...req.query };
        
        // Handle explicit string conversions for the 'open' boolean filter if passed in the query
        if (queryObj.open === 'true') queryObj.open = true;
        if (queryObj.open === 'false') queryObj.open = false;
        
        const issues = await Issue.find(queryObj).select('-project'); // Exclude the grouping key from output array
        return res.json(issues);
      } catch (err) {
        return res.status(200).json([]); // Return clean array on error per fcc safety expectations
      }
    })
    
    // 2. POST Request: Create a brand new issue
    .post(async function (req, res) {
      const project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;

      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }

      try {
        const newIssue = new Issue({
          project,
          issue_title,
          issue_text,
          created_by,
          assigned_to: assigned_to || "",
          status_text: status_text || "",
          open: true,
          created_on: new Date(),
          updated_on: new Date()
        });

        const savedIssue = await newIssue.save();
        
        const responseObj = savedIssue.toObject();
        delete responseObj.project;
        delete responseObj.__v;

        return res.json(responseObj);
      } catch (err) {
        console.error("CRITICAL DB POST ERROR:", err);
        return res.status(500).json({ error: 'Server error saving the issue' });
      }
    })
    
    // 3. PUT Request: Update field modifications on a specific issue
    .put(async function (req, res) {
      const project = req.params.project;
      const { _id, ...updateFields } = req.body;

      // Rule Check: ID must be present
      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      // Filter out empty input properties to see if an update body actually exists
      const filteredUpdate = {};
      Object.keys(updateFields).forEach(key => {
        if (updateFields[key] !== undefined && updateFields[key] !== '') {
          // Explicitly map string to boolean variations for closing an item
          if (key === 'open') {
            filteredUpdate[key] = updateFields[key] === 'true' || updateFields[key] === true ? true : false;
          } else {
            filteredUpdate[key] = updateFields[key];
          }
        }
      });

      // Rule Check: Ensure at least one update property field is provided (FCCTesting Match string)
      if (Object.keys(filteredUpdate).length === 0) {
        return res.json({ error: 'no fields update', '_id': _id });
      }

      // Fallback Validation: Safeguard against malformed casting lengths causing a 500
      if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.json({ error: 'could not update', '_id': _id });
      }

      try {
        // Automatically inject current date to the track record modification history
        filteredUpdate.updated_on = new Date();

        const updatedIssue = await Issue.findOneAndUpdate(
          { _id, project },
          filteredUpdate,
          { new: true, returnDocument: 'after' } // Clean deprecation fallback configuration
        );

        if (!updatedIssue) {
          return res.json({ error: 'could not update', '_id': _id });
        }

        return res.json({ result: 'successfully updated', '_id': _id });
      } catch (err) {
        return res.json({ error: 'could not update', '_id': _id });
      }
    })
    
    // 4. DELETE Request: Remove an entry completely by _id
    .delete(async function (req, res) {
      const project = req.params.project;
      const { _id } = req.body;

      // Rule Check: ID requirement condition validation
      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      // Fallback Validation: Safeguard against malformed casting lengths causing a 500
      if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.json({ error: 'could not delete', '_id': _id });
      }

      try {
        const deletedIssue = await Issue.findOneAndDelete({ _id, project });

        if (!deletedIssue) {
          return res.json({ error: 'could not delete', '_id': _id });
        }

        return res.json({ result: 'successfully deleted', '_id': _id });
      } catch (err) {
        return res.json({ error: 'could not delete', '_id': _id });
      }
    });
    
};