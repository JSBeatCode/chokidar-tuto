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
    startOver: false,
    unlinks: {
        switch: false,
        list: [],
        cnt:0 
    },
    add: {
        switch: false,
        list: [],
        // cnt:0
    },
    change: {
        switch: false,
        list: [],
        cnt:0
    }
}

let loadPath = [];
let cnt = 0;
let loop = 0;
watcher.on('ready', async ()=> {
    console.log('Ready to watch files')
    state.startOver = true;
    console.log(state)
}).on('add', async (path) => {
    if(state.startOver === true){
        if(state.add.switch === false) {
            state.add.list = new Array();
            await recursiveFile('C:/Users/jsd/programming/nodejs/chokidar-tuto/watch-folder', 'add')
            cnt = state.add.list.length - loadPath.length
            state.add.switch = true
        }
        await funcLoadPath(path, 'add')
        console.log('debug2 : ', loop, cnt)
        console.log('debug3-1', state.add.list)
        console.log('debug3-2', loadPath)
        if(
            loop === (cnt-1)
            ){
            loop = 0
            cnt = 0
            state.add.list = new Array()
            state.add.switch = false
            console.log('add program update')
        } else {
            loop++;
        }
    } else {
        funcLoadPath(path, 'add')
        console.log(path, 'File is added')
    }
})
.on('unlink', async (path) => {
    if(state.startOver === true) {
        if(state.unlinks.switch === false){
            const unlinks = Object.fromEntries(watcher._pendingUnlinks);
            const keys = Object.keys(unlinks)
            state.unlinks.list = keys;
            state.unlinks.switch = true;
            // console.log('removed', state.unlinks.list)
        }
        state.unlinks.cnt++;
        console.log('debug3 : ' + state.unlinks.cnt + '/' + state.unlinks.list.length)
        if(state.unlinks.cnt === state.unlinks.list.length){
            state.unlinks.list = new Array();
            state.unlinks.switch = false;
            state.unlinks.cnt = 0;
            console.log('unlink program update!')
        }
        await funcLoadPath(path, 'unlink')
    } else {
        funcLoadPath(path, 'unlink')
        console.log(path, 'File is removed')
    }
}).on('change', path => {
    console.log(path, 'File is changed');
}).on('error', error => {
    console.log(error)
});

async function funcLoadPath(path, type){
    switch(type){
        case 'add':
            loadPath.push(path); break;
        case 'unlink':
            loadPath = loadPath.filter((v,i,a)=>{
                return v !== path
            }); 
            break;
    }
    loadPath = loadPath.filter((v,i,a) => {
        return a.indexOf(v) === i
    })
}
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