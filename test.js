const express = require('express');
const app = express();
const port = 3000;
const http = require('http');
const fs = require('fs');
var path = require('path');


const chokidar = require('chokidar');

const watcher = chokidar.watch('watch-folder', {
    persistent: true,
    ignoreInitial: false, // ignore files on server start
    ignored: ['watch-folder/ignore.txt'] // ignore the file if the filename is ignore.txt
})

const state = {
    unlinks: {
        switch: false,
        list: [],
        cnt:0 
    },
    add: {
        switch: false,
        list: [],
        cnt:0
    },
    change: {
        switch: false,
        list: [],
        cnt:0
    }
}

watcher.on('ready', async ()=> {
    console.log('Ready to watch files')
    await recursiveFile('C:/Users/jsd/programming/nodejs/chokidar-tuto/watch-folder', 'change')

    console.log(state)
}).on('add', path => {
    // console.log(watcher)
    console.log(path, 'File is added')
})
// .on('raw', (events, path, details) => {
    // console.log(path, 'File is raw ' + events)
// })
.on('unlink', path => {
    if(state.unlinks.switch === false){
        const unlinks = Object.fromEntries(watcher._pendingUnlinks);
        const keys = Object.keys(unlinks)
        state.unlinks.list = keys;
        state.unlinks.switch = true;
        console.log('removed', state.unlinks.list)
    }
    state.unlinks.cnt++;
    // console.log(state.unlinks.cnt + '/' + state.unlinks.list.length)
    if(state.unlinks.cnt === state.unlinks.list.length){
        state.unlinks.list = new Array();
        state.unlinks.switch = false;
        state.unlinks.cnt = 0;
        console.log('program update!')
    }
    console.log(path, 'File is removed');
}).on('change', path => {
    console.log(path, 'File is changed');
}).on('error', error => {
    console.log(error)
});


async function recursiveFile(dir, type){
    const fileList = fs.readdirSync(dir)
        for(let i=0; i<fileList.length; i++) {
            const subDir = path.join(dir, fileList[i]);
            const stat = fs.lstatSync(subDir)
            if(stat.isFile()){
                switch(type){
                    case 'add':
                        state.add.list.push(fileList[i]);
                    case 'change':
                        state.change.list.push(fileList[i]);
                }
            } else {
                recursiveFile(subDir, type);
            }

        }

}