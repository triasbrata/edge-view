"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("../index"));
const path_1 = require("path");
const http_1 = require("http");
index_1.default.mount(path_1.join(__dirname, 'views'));
class Base {
    constructor() {
        this.isModel = true;
        this.foo = true;
    }
}
class User extends Base {
    constructor() {
        super(...arguments);
        this.attributes = {
            username: 'virk',
            email: 'virk@adonisjs.com',
            isAdmin: true,
            profile: {
                avatarUrl: 'foo',
            },
            lastLoginAt: null,
        };
    }
    get username() {
        return this.attributes.username;
    }
    toJSON() {
        return {};
    }
}
const user = new User();
user.parent = user;
http_1.createServer((_req, res) => {
    res.writeHead(200, { 'content-type': 'text/html' });
    res.end(index_1.default.render('welcome', {
        user: user,
    }));
}).listen(3000, () => {
    console.log('Listening on 127.0.0.1:3000');
});
