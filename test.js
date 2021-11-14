const supertest = require("supertest");
const app = require("./server.js");
const cookieSession = require("cookie-session");
const { TestScheduler } = require("@jest/core");
const { text } = require("express");

// # 1. Users who are logged out are redirected to the registration page when they attempt to go to the petition page.

test("GET /logout users are redirected to /home page", () => {
    return supertest(app)
        .get("/logout")
        .then((res) => {
            expect(res.statusCode).toBe(200);
            expect(res.text).toContain(
                "<header>Sign our Petition to make no more Pay-To-Pee in Germany.</header>"
            );
        });
});

// test("GET /registration works", () => {
//     return supertest(app)
//         .get("/registration")
//         .then((res) => {
//             console.log(res.text, res.headers);
//             expect(res.statusCode).toBe(200);
//         });
// });

// test("GET /registration redirects to /sign when appropriate ", () => {
//     return supertest(app)
//         .get("/registration")
//         .then((res) => {
//             expect(res.statusCode).toBe(200);
//             expect(res.text).toContain(
//                 "bookmark"
//             );
//         });
// });
