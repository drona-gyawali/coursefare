
# Course Selling Backend

This is a **Course Selling Backend** application built with Node.js and Express. It supports **Admin** and **User** roles with different privileges and integrates payment processing and caching for performance.

---

## Features

### Admin
- Register and login.
- Create new courses.
- Update existing courses.
- Delete courses.
- View courses created by themselves.

### User
- Register and login.
- View all available courses (global).
- Purchase courses by making payments.(only support stripe )
- View all purchased courses.

### Additional Features
- Authentication and authorization with JWT.
- Payment processing for course purchases.
- Redis caching enabled for optimized performance.
- Email notification processing via background jobs with bullmq + redis
- Ratelimiter to protect against resource starvation
- Caching to make Apis response blazing fast
---

### Install Packages
`
npm install
`

### Run server
 `
 npm run start
 `

 ### Run testcase
 `
 npm test
 `
 ### Run linter
 `
 npm run lint:fix 
 `

 ### Run worker 
 `
 npm run worker
 `
 
---

>> Note: Before running the server make sure to configure mongodb and redis through .env file
>> because Server  will not run until the  redis and database fully configured.

---


