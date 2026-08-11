# Regent Portal Backend Guide

This folder contains an Express 5 API backed by MongoDB through Mongoose. It manages admins, teachers, students, books, tests, test content, grading, and submission history through 27 HTTP endpoints, organized as thin routes → controllers → services/models.

## 1. How the backend starts

The startup path is:

1. `server.js` loads environment variables from `.env`.
2. It calls `connectDB()` from `config/db.js` to connect to MongoDB.
3. Once connected, it imports the Express application from `app.js` and starts listening on `PORT`, defaulting to `3000`.

`app.js` itself no longer connects to the database — it only builds and exports the Express app. This lets `app.js` be imported directly in tests against an isolated database without touching the real `MONGO_URI`.

Useful commands from this folder:

```bash
npm install
npm run dev
npm test
```

- `npm start` runs `node server.js`.
- `npm run dev` and `npm run server` run the server with Nodemon.
- `npm test` runs the contract test suite (Node's built-in test runner + Supertest) against an in-memory MongoDB instance started by `mongodb-memory-server`. See [Section 11](#11-tests).

Required environment variables:

```env
MONGO_URI=mongodb_connection_string
JWT_SECRET=secret_used_to_sign_login_tokens
PORT=3000
NODE_ENV=development
```

`MONGO_URI` and `JWT_SECRET` are required for the main application. `PORT` and `NODE_ENV` have defaults.

## 2. Request flow

A normal request passes through `app.js` in this order:

1. `express.json()` parses JSON request bodies.
2. A logger prints the request method, URL, and origin.
3. Custom CORS middleware checks the origin and handles `OPTIONS` preflight requests.
4. `/assets` serves files from `server/assets`.
5. The built frontend in `client/dist` is exposed as static content.
6. The API routers handle matching `/api/...` requests. Each router only wires an HTTP method and path to a controller function — no business logic lives in `routes/` anymore.
7. Health-check routes answer `/api/health` and `/`.
8. A final logger reports unmatched requests, but it does not send a 404 response.

The production CORS allowlist is hard-coded in `app.js`. In non-production environments, requests from other origins are also allowed.

Within a controller, the flow is: parse/validate the request → call a model or service → send the response. Complex, reusable logic (test-content file loading, answer grading) lives in `services/` so controllers stay focused on HTTP concerns.

## 3. Folder map

```text
server/
├── server.js                 Connects to MongoDB, then starts the HTTP listener
├── app.js                    Builds and exports the Express app (no DB connection)
├── config/
│   └── db.js                 Connects Mongoose to MongoDB
├── models/                   MongoDB/Mongoose document definitions
├── routes/                   Thin routers: method + path -> controller function
├── controllers/               Request/response handling per resource
│   ├── authController.js      Login
│   ├── adminController.js     Admin create/list/delete
│   ├── studentController.js   Student create/list/delete
│   ├── teacherController.js   Teacher create/list/delete, favorites, submissions-for-teacher
│   ├── bookController.js      Book listing
│   ├── testController.js      Test metadata and reading/listening/question content
│   └── submissionController.js Submission debug endpoints, grading, submission queries
├── services/                  Reusable domain logic used by controllers
│   ├── gradingService.js      Answer-key loading, normalization, and grading
│   └── testContentService.js  Filesystem loading for passages/audio/question files
├── test/                      Node test runner + Supertest contract tests
│   ├── setup.js                Shared in-memory MongoDB + app bootstrap helpers
│   └── *.test.js                Contract tests per resource/domain
├── utils/
│   └── generateToken.js      Creates three-hour JWTs
├── assets/
│   ├── Books/                Test passages and question definitions
│   └── QTemplates/           Reusable question-format examples
├── backup/                   MongoDB metadata/export support files
├── adminsetup.json           Importable admin seed with a bcrypt hash
├── check_database.js         Database inspection script
├── fixBookData.js            One-off book/test repair script
└── package.json              Scripts and dependencies
```

## 4. Application setup files

### `server.js`

This is the process entry point. It loads `.env`, connects to MongoDB via `connectDB()`, then imports the configured application and listens on the configured port.

### `app.js`

This is the composition root of the backend. It:

- installs JSON parsing, request logging, and CORS;
- serves the test assets and optionally the built frontend;
- mounts every API router;
- defines health checks.

It does **not** connect to the database — that happens in `server.js` before the app is required, so `app.js` can be imported directly by tests against an isolated database.

There is no centralized authentication middleware, validation middleware, error handler, or final 404 response.

### `config/db.js`

`connectDB()` calls `mongoose.connect(process.env.MONGO_URI)`. If the connection fails, it logs the error and terminates the process.

### `utils/generateToken.js`

Creates a JWT containing:

```js
{ userId, userType }
```

The token expires after three hours. Login returns this token, but the current backend never verifies it on later requests.

## 5. Data models

### `models/Admin.js`

An admin has:

- unique, required `username`;
- required `password`.

A pre-save hook hashes changed passwords with bcrypt and a salt factor of 10.

### `models/Teacher.js`

A teacher has:

- required `name`;
- unique, required `username`;
- required, bcrypt-hashed `password`;
- `favoritedStudents`, an array of references to `Student` documents.

### `models/Student.js`

A student has:

- required `name`;
- required `nickname`;
- unique, required `username`;
- required, bcrypt-hashed `password`;
- a legacy-style `givenAnswers` array containing a test reference and answer strings.

The active submission API uses the separate `TestSubmission` model rather than `givenAnswers`.

When students are deleted through Mongoose query deletion methods, model hooks also delete their `TestSubmission` records.

### `models/Book.js`

A book has a unique `name` and an array of tests. Each test entry stores:

- `testId`, referencing a `Test`;
- `testName`, a display name.

This model provides the book-to-test navigation used by `GET /api/books`.

### `models/Test.js`

A test is stored in the `tests` collection and has:

- `uid`, a generated unique string;
- required `title`;
- required `belongsTo`, identifying its book;
- `sources`, describing passage JSON or audio paths;
- `answers`, a flexible map containing reading and listening answer keys.

The combination of `title` and `belongsTo` is unique, so different books can each contain a test called `Test 1`.

### `models/TestSubmission.js`

A submission stores:

- references to `Student` and `Test`;
- `testType`, restricted to `reading` or `listening`;
- submitted answers;
- correct answers;
- per-question results;
- percentage score;
- total question count and correct count;
- submission and automatic Mongoose timestamps.

Indexes support student/test lookup and newest-first submission queries.

## 6. API routes

All routes below are currently public because no route verifies the JWT. Each route file below only maps a method/path to a controller function; the described behavior lives in the referenced controller (and, for test content and grading, in `services/`).

### Login: `routes/loginRoutes.js` → `controllers/authController.js`

- `POST /api/user/login`
  - Expects `username`, `password`, and `userType`.
  - For `userType: "Teacher"`, it checks the `Admin` collection first, then `Teacher`.
  - For `userType: "Student"`, it checks `Student`.
  - Compares the password with bcrypt and returns user information plus a JWT.
  - An admin signs in through the `"Teacher"` branch, but the response identifies that user as `"Admin"`.

### Account creation: `routes/createRoutes.js` → `adminController` / `studentController` / `teacherController`

- `POST /api/create/createadmin`
- `POST /api/create/createstudent`
- `POST /api/create/createteacher`

These check for duplicate usernames in their own collection, create the document, and rely on model hooks to hash passwords.

### Account deletion: `routes/deleteRoutes.js` → `adminController` / `studentController` / `teacherController`

- `DELETE /api/delete/deleteadmin/:id`
- `DELETE /api/delete/deletestudent/:id`
- `DELETE /api/delete/deleteteacher/:id`

Student deletion also triggers cleanup of that student's submissions.

### User lookup: `routes/lookupRoutes.js` → `studentController` / `teacherController` / `adminController`

- `GET /api/lookup/lookupstudents`
  - Returns each student's name, nickname, and username.
- `GET /api/lookup/lookupteachers`
  - Returns each teacher's name and username.
- `GET /api/lookup/lookupadmins`
  - Returns admin usernames.

Password fields are excluded from these responses.

### Books: `routes/lookupBooks.js` → `controllers/bookController.js`

- `GET /api/books`
  - Returns all books.
  - Populates each embedded `tests.testId` reference with its complete `Test` document.

### Test content: `routes/getTestContent.js` → `controllers/testController.js` (+ `services/testContentService.js`)

- `GET /api/tests/:id/reading`
  - Finds the test in MongoDB.
  - Keeps source paths ending in `.json`.
  - Reads each passage file from `assets` via `testContentService.loadReadingSources`.
  - Returns passage content and the reading answer key.

- `GET /api/tests/:id/listening`
  - Keeps source paths ending in `.mp3`.
  - Returns audio source metadata and the listening answer key.
  - Audio files are expected to be fetched separately through `/assets/...`.

- `GET /api/tests/:id/questions/:part?testType=reading`
  - Builds a question-file path from `belongsTo`, test title, type, and part via `testContentService.loadQuestionFile`.
  - Example: `assets/Books/Book19/Test1/questions/Reading/part1.json`.
  - Reads and returns the question-template JSON.

### Raw test lookup: `routes/getTestByID.js` → `controllers/testController.js`

- `GET /api/test/:testId`
  - Returns the complete MongoDB `Test` document, including its sources and answer map.

### Test grading and submission: `routes/submitTest.js` → `controllers/submissionController.js` (+ `services/gradingService.js`)

- `GET /api/submit/test`
  - Simple route check.
- `POST /api/submit/test-submission`
  - Debug endpoint returning a hard-coded sample result without saving it.
- `POST /api/submit/submit`
  - Expects `testId`, `testType`, `studentId`, and `answers`.
  - Loads the answer key from the `Test` document via `gradingService.loadCorrectAnswers`.
  - Normalizes grouped table-completion keys such as `8-9_0` via `gradingService.normalizeTableCompletionAnswers`.
  - Grades scalar and multi-answer questions via `gradingService.gradeAnswers`.
  - Calculates a percentage.
  - Saves a `TestSubmission`.
  - Returns the score and per-question results.

Despite an old comment saying `POST /api/tests/submit`, the actual mounted URL is `POST /api/submit/submit`.

### Teacher features: `routes/teacherRoutes.js` → `controllers/teacherController.js`

- `GET /api/teachers/:teacherId/favorites`
  - Returns the teacher's favorited student IDs.
- `POST /api/teachers/:teacherId/favorites`
  - Expects `studentId` and toggles it in the favorites array.
- `GET /api/teachers/submissions/student/:studentId`
  - Returns a student's submissions.
  - Searches all `Book` documents to add book and test display names.

The more specific `/submissions/student/...` route still works even though it follows `/:teacherId/favorites`, because the path shapes do not match each other.

### Submission lookup: `routes/submissions.js` → `controllers/submissionController.js`

- `GET /api/submissions/submission/:submissionId`
  - Returns one complete submission and populates the test title.
- `GET /api/submissions/student/:studentId`
  - Returns all submissions for one student, newest first.
- `GET /api/submissions/student/:studentId/test/:testId?testType=reading`
  - Returns the most recent submission for that student, test, and type.
- `GET /api/submissions/:testId`
  - Returns all submissions for a test with student names and formatted answers.
  - A code comment labels this route “teachers only,” but it has no authorization check.

### Health checks

- `GET /api/health`
- `GET /`

Both return API status, current time, and environment. If a built frontend contains an `index.html`, the earlier static middleware may answer `/` before the root health route runs.

## 7. Test assets

`assets/Books` is file-based test content organized like this:

```text
Books/
└── Book19/
    └── Test1/
        ├── passages/
        │   ├── passage1.json
        │   ├── passage2.json
        │   └── passage3.json
        └── questions/
            ├── Reading/
            │   ├── part1.json
            │   ├── part2.json
            │   └── part3.json
            └── Listening/
                ├── part1.json
                └── ...
```

The repository currently has content for Books 17, 18, and 19:

- 36 passage JSON files;
- 84 reading/listening question JSON files;
- five reusable examples under `assets/QTemplates`.

Question files describe UI formats such as multiple choice, true/false/not-given, summaries, letter boxes, and paragraph assignments. Some question files also contain `correctAnswers`, although active grading uses the answer map in MongoDB.

No audio files were found in the current `assets` tree, even though test source records may reference `.mp3` paths.

## 8. Maintenance and unused files

### `check_database.js`

A command-line diagnostic script. It connects to MongoDB, lists tests, reports whether reading/listening answers exist, performs a special check for Book 19 Test 1, then closes the connection.

Run it with:

```bash
node check_database.js
```

Unlike the main application, it falls back to local MongoDB at `mongodb://localhost:27017/regentportal`.

### `fixBookData.js`

A one-off data repair script that:

1. creates two basic tests if no tests exist;
2. finds `Book 19`;
3. replaces its test list with references to the first two tests returned by MongoDB;
4. prints the populated result.

This script mutates production data and should be reviewed before running. MongoDB does not guarantee that the first two tests returned are the intended Book 19 tests.

### `backup/`

Contains MongoDB metadata/export support files. Nothing in the running application imports this folder.

### `adminsetup.json`

Contains an importable admin record with the username `admin` and a bcrypt password hash. It is not loaded by the application at runtime. Although the password is hashed, this file and the default-password hint in `models/Admin.js` should not be treated as secret-free seed data.

## 9. Important issues and design notes

### Authentication is generated but not enforced

Login creates JWTs, but there is no middleware that reads `Authorization` or `x-auth-token`, verifies the token, or checks roles. As a result, anyone who can reach the API can currently:

- list users;
- create or delete accounts;
- change teacher favorites;
- view student submissions;
- submit attempts for any student ID.

### Correct answers are exposed

Correct answers are returned by the reading, listening, raw-test, grading, and submission-detail APIs. The question JSON files can also contain answer keys and are directly reachable through the public `/assets` static route. A student client can therefore retrieve answers before submitting a test.

### Admin login has a role mismatch

Admins log in by sending `userType: "Teacher"`. The response identifies the account as an admin, but the JWT is signed with the original `"Teacher"` value. If authorization middleware is added later, it must correct this behavior rather than trusting the current token role.

### Book naming is inconsistent

Different code uses both `Book 19` and `Book19`:

- the `Test` model default is `Book 19`;
- `fixBookData.js` searches for `Book 19`;
- `check_database.js` searches for `Book19`;
- asset folders use `Book19`.

Because the question endpoint inserts `test.belongsTo` directly into a file path, a test storing `Book 19` will look in a different folder from the existing `Book19` assets.

### Submission grading has edge cases

- `Object.keys(answers)` is logged before `answers` is validated, so a missing `answers` value produces a server error instead of a clean 400 response.
- Multi-answer questions can add more than one mark while `totalQuestions` only counts answer-map keys. This can produce a score above 100, conflicting with the schema's maximum of 100.
- Scalar comparisons are case-sensitive, while one branch of array-answer comparison is case-insensitive.
- `originalAnswers` is passed when saving, but it is not declared in the `TestSubmission` schema and is discarded under Mongoose's default strict behavior.
- The submitted `studentId` format is checked, but the route does not confirm that the student exists.

### File access is synchronous

The content routes use `existsSync` and `readFileSync`. This is simple, but each read blocks Node's event loop. Async file reads or preloaded/cached content would scale better.

### Error handling is decentralized

Each route catches its own errors. There is no common error middleware, request schema validation, invalid-ObjectId handling, or final JSON 404 handler. Some invalid IDs therefore become generic 500 responses.

### Cleanup opportunities

Several files contain unused imports, extensive debug logging, stale comments, or duplicate submission-formatting logic. The installed `cors`, `mongodb`, and `bootstrap` packages are also unused by server code. These issues do not prevent startup, but they make behavior harder to follow and add unnecessary dependencies or log noise.

## 10. End-to-end examples

### Student test flow

1. The student logs in through `POST /api/user/login`.
2. The frontend loads books from `GET /api/books`.
3. It selects a test and requests reading or listening metadata.
4. It loads each question part from the question endpoint.
5. It submits answers to `POST /api/submit/submit`.
6. The backend grades the answers and saves a `TestSubmission`.
7. The frontend retrieves submission history or a specific result.

### Teacher review flow

1. The teacher logs in through the same login endpoint.
2. The frontend loads students through the lookup endpoint.
3. Favorites are read or toggled through `/api/teachers/:teacherId/favorites`.
4. Student history is loaded through a teacher or submission endpoint.
5. All attempts for a test can be loaded through `GET /api/submissions/:testId`.

The login tokens returned in steps 1 are currently informational from the backend's perspective because subsequent routes do not validate them.

## 11. Tests

`test/` contains contract tests that pin down the current, observable behavior of every mounted endpoint (status codes, response shapes, and a few documented quirks) so that future refactors or feature work can be verified quickly.

- `test/setup.js` starts a `mongodb-memory-server` instance, connects Mongoose to it, and then requires `app.js` — never the real `MONGO_URI`.
- Each `test/*.test.js` file uses Node's built-in `node:test` runner and `supertest` to exercise one route group (auth, users, books, test content, submissions).
- Run the suite with `npm test` from this folder. It needs to spawn a local `mongod` process and bind a local port, so it will not run under a network- or process-restricted sandbox.
- Two intentionally-preserved quirks are called out inline in the tests:
  - `GET /` is shadowed by the built frontend's `index.html` because static file serving is registered before the health route.
  - `POST /api/submit/submit` returns `500` (not `400`) when `answers` is missing, because the handler logs `Object.keys(answers).length` before validating required fields.

These tests do not cover authentication/authorization gaps or response-shape cleanup — those are called out as follow-up work in [Section 9](#9-important-issues-and-design-notes), not fixed here, so the current frontend contract keeps working unchanged.
