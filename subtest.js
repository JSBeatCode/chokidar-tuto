const express = require('express');
const app = express();
const port = 3000;
const http = require('http');
const fs = require('fs');
const path = require('path');

const filePath = 
// 'C:/Users/jsd/programming/nodejs/fastify-tutorials'
'C:/Users/jsd/programming/nodejs'

const stats = 
// fs.statSync(filePath);
fs.readdirSync(filePath)

console.log(stats);
