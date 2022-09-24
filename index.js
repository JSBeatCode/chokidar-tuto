const express = require('express');
const app = express();
const port = 3000;
const http = require('http');

const chokidar = require('chokidar');

const watcher = chokidar.watch('watch-folder', {
    persistent: true,
    ignoreInitial: false, // ignore files on server start
    ignored: ['watch-folder/ignore.txt'] // ignore the file if the filename is ignore.txt
})

watcher.on('ready', ()=> {
    console.log('Ready to watch files')
})

watcher.on('add', path => {
    console.log(path, 'File is added')
})

// watcher.on('raw', (events, path, details) => {
    // console.log(path, 'File is raw ' + events)
// })

watcher.on('unlink', path => {
    console.log(path, 'File is removed');
})

watcher.on('change', path => {
    console.log(path, 'File is changed');
})

watcher.on('error', error => {
    console.log(error)
})