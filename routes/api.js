/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

var expect = require("chai").expect;
var MongoClient = require("mongodb");
var ObjectId = require("mongodb").ObjectID;



async function databaseConnect() {
  var dbConnection = await MongoClient.connect(process.env.DATABASE, { useUnifiedTopology: true });
  //console.log("successful db connection")
  var db = dbConnection.db("issue-tracker");
  return db;
}

async function findInDatabase(project, database) {
  var result = await database.collection("projects").findOne({ name: project });
  return result;
}

async function setProjectDocument(project, database){
  var result = await database.collection("projects").insertOne({ name: project, issues: [] });
  return result;
}

async function updateIssues(issues, project, database) {
  var result = await database.collection("projects").updateOne({ name: project }, { $set: { issues: issues } });
  return result;
}

async function setIssuesAfterArrayFoundOrCreated(res, project, newIssue) {
  var database = await databaseConnect();

  var projectFound = await findInDatabase(project, database);
  if (projectFound === null) {
      await setProjectDocument(project, database);
      projectFound = await findInDatabase(project, database);
  }
  

  projectFound.issues = [...projectFound.issues, newIssue];

    
  var update = await updateIssues(projectFound.issues, project, database)
  var latestIssues = await findInDatabase(project, database);
  res.send([latestIssues.issues[latestIssues.issues.length - 1]]);
}

async function deleteTestProject(database){
  var result = await database.collection("projects").deleteOne({name: "test"})
  return result;
}

async function searchAndDeleteIssue(newIssuesArray, project, id, database) {
  var projectFound = await findInDatabase(project, database)
  newIssuesArray = projectFound.issues.filter(item => {
    return item._id.toString() !== id;
  });

  var result = updateIssues(newIssuesArray, project, database)
  return result;
}
              
async function get(res, project, query){
  var issuesArray = [];
  try {
    var database = await databaseConnect();
    var projectFound = await findInDatabase(project, database);
    if (query === {}) {
      res.json(projectFound.issues);
    } else {
      issuesArray = projectFound.issues;
      
      for (var key in query) {
        issuesArray = issuesArray.filter(item => {
          if (key === "open" && typeof query[key] === "string") {
            if (query[key] === "true") {
              query[key] = true;
            } else {
              query[key] = false;
            }
          }
          if (key === "created_on" || key === "updated_on") {
            return (
              item[key].toISOString().substring(0, 19) ===
              query[key].toString().substring(0, 19)
            );
          } else {
            return item[key] === query[key];
          }
        });
      }
      
      res.json(issuesArray);
    }
  } catch (error) {
    console.log(error)
    res.status(400);
    res.send("could not search in database");
  }
}

async function post(res, project, newIssue){
  try{
    await setIssuesAfterArrayFoundOrCreated(res, project, newIssue)
  } catch (error) {
    console.log(error)
    res.status(400);
    res.send("could not create issue in database");
  }
}

async function put(res, project, date, id, queryArray, issuesArray, issueArray, newIssueArray, newIssuesArray, newObject, newIssueObjectsArray){
  try{
    var database = await databaseConnect();
    var issues = await findInDatabase(project, database)
    
    issuesArray = issues.issues;
    issuesArray.map((d, i) => {
      issueArray = [
        Object.keys(issuesArray[i]),
        Object.values(issuesArray[i])
      ];

      newIssueArray = [];

      if (id === issueArray[1][0].toString()) {
        issueArray[0].map((issueKey, issueIndex) => {
          queryArray.map(queryItemArray => {
            if (issueKey === queryItemArray[0]) {
              newIssueArray.push(queryItemArray);
            } else if (issueKey === "updated_on") {
              newIssueArray.push([issueArray[0][issueIndex], date]);
            } else {
              newIssueArray.push([
                issueArray[0][issueIndex],
                issueArray[1][issueIndex]
              ]);
            }
          });
        });

      } else {
        issueArray[0].map((issueKey, issueIndex) => {
          newIssueArray.push([
            issueArray[0][issueIndex],
            issueArray[1][issueIndex]
          ]);
        });
      }
      newIssuesArray.push(newIssueArray);
    });

    newIssuesArray.map(issueInArray => {
      newObject = {};
      issueInArray.map(keyAndValueArray => {
        newObject[keyAndValueArray[0]] = keyAndValueArray[1];
      });
      newIssueObjectsArray.push(newObject);
    });

    await updateIssues(newIssueObjectsArray, project, database)
    res.status(200).send("successfully updated");
    
  } catch (error) {
    console.log(error)   
    res.status(400);
    res.send("could not update " + id);
  }
}

async function deleteFunction(res, project, deleteTest, id, newIssuesArray) {
  try{
    var database = await databaseConnect();
    if (deleteTest === true) {
      await deleteTestProject(database);
      res.status(200);
      res.send("test project was deleted")
    } else if (deleteTest !== true){
      await searchAndDeleteIssue(newIssuesArray, project, id, database)
      res.status(200);
      res.send("deleted " + id)
    }  
  } catch (error) {
    console.log(error)
    res.status(400);
    res.send("could not delete " + id);
  }
} 

//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

module.exports = function(app) {
  app
    .route("/api/issues/:project")
  
    .get(function(req, res) {
      var project = req.params.project;
      var query = req.query;
      
      if (project === null) {
        res.status(400);
        res.send("project not found");
      }
    
      get(res, project, query);
    })

    .post(function(req, res) {
      var project = req.params.project,
        issueTitle = req.body.issue_title,
        issueText = req.body.issue_text,
        createdBy = req.body.created_by;
      var assignedTo = req.body.assigned_to,
        statusText = req.body.status_text;

      var date = new Date();
      var allIssues = [];
      var newIssue = {
        _id: ObjectId(),
        issue_title: issueTitle,
        issue_text: issueText,
        created_by: createdBy,
        assigned_to: assignedTo,
        status_text: statusText,
        created_on: date,
        updated_on: date,
        open: true
      };

      if (assignedTo === undefined) {
        assignedTo = "";
      } else if (statusText === undefined) {
        statusText = "";
      }
    
      if (
        project === null || project === undefined || project === "" ||
        issueTitle === undefined || issueTitle === null || issueTitle === "" ||
        issueText === undefined || issueText === null || issueText === "" || 
        createdBy === undefined || createdBy === null || createdBy === ""
      ) {
        res.status(400);
        res.send("invalid data");
      } else {
        post(res, project, newIssue);
      }
    })

  .put(function(req, res) {
      var project = req.params.project;
      var id = req.query._id;
      var issuesArray = [];
      var issueArray = [];
      var queryArray = [];
      var newIssueArray = [];
      var newIssuesArray = [];
      var newIssueObjectsArray = [];
      var date = new Date();
      var newObject = {};
    
      if (project === null) {
        res.status(400);
        res.send("could not update " + id);
      } else if (id === null || id === undefined) {
        res.status(400);
        res.send("could not update " + id);
      } else {

        for (var key in req.query) {
          if (req.query.hasOwnProperty(key) && key !== "_id" && key !== "created_on" && key !== "updated_on") {
            if (req.query[key] === undefined || req.query[key] === null || req.query[key] === '""' || req.query[key] === "''" || req.query[key] === "") {
              if (key === "open" && (req.query[key] !== true || req.query[key] !== false)) {
                res.status(400);
                res.send("could not update " + id);
              } else if (key === "issue_title" || key === "issue_text" || key === "created_by") {
                res.status(400);
                res.send("could not update " + id);
              } else {
                queryArray.push([key, undefined]);
              }
            } else {
              queryArray.push([key, req.query[key]]);
            }
          }
        }

        if(queryArray.length < 1 && (id !== null && id !== undefined)){
          res.status(400);
          res.send("no updated field sent");
        } else {

          put(res, project, date, id, queryArray, issuesArray, issueArray, newIssueArray, newIssuesArray, newObject, newIssueObjectsArray);
          }
      }

})
    .delete(function(req, res, next) {
      var project = req.params.project;
      var id = req.query._id;
      var deleteTestId = req.query.delete_id;
      var newIssuesArray = [];
      var deleteTest = false;
      if (project === null) {
        res.status(400);
        res.send("project not found");
      } else if (deleteTestId === process.env.DELETE_TEST) {
        deleteTest = true;
        deleteFunction(res, project, deleteTest, id, newIssuesArray)
      } else if (id === null || id === undefined) {
        res.status(400);
        res.send("_id error");
      } else {
        deleteFunction(res, project, deleteTest, id, newIssuesArray)
      }     
    });

};
