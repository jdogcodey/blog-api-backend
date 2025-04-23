# Blog API

Following along with The Odin Project, this is the Blog API. In this project the aim is to make a backend Express server which can access a database and output to two separate front end applications for authentication etc.

Aims for this project:

  Create an Express server that takes in JS requests, authenticates them and then serves them data from a psql db with prisma ORM.

Rough ToDo:

  Plan the Prisma models (done)

  Set up the directory and git (done)

  Install the relevant dependencies and establish the file structure (done)

  Set up prisma models, separately the psql db and connect the two (done)

  Test storing data to the db

  Set up express app (done)

  Add Router and set up initial route (done)

  Add Controller and add initial controller (done)

  Test app running and set up correctly (done)

  / route shows homepage (done)

  Set up JWT authentication

  Create /user/new GET

  /user/new POST

  /log-in GET

  /log-in POST

  /user/:profileID: GET

  /user/:profileID: POST - Test authentication - has to be same user as the profileId

  /user/:profileId:/edit GET - Needs authentication and userID has to be same as profileId

  /posts GET - If not logged in, redirects to log-in, if logged in then shows posts

  /posts/:postId: POST - Creates a particular post, assign user etc.

  /posts/:postId: GET - shows a particular post

  /posts/:postId: PUT - Check matching user

  /posts/:postId:/:commentId: POST - Adds comment to the post and redirects to the GET for post
