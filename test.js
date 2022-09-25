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
    filePath: 'C:/Users/jsd/programming/nodejs/chokidar-tuto/watch-folder',
    startOver: false,
    unlinks: {
        switch: false,
        list: [],
        cnt:0 
    },
    add: {
        switch: false,
        list: [],
        loop: 0,
        cnt:0
    },
    change: {
        switch: false,
        list: [],
        loop: 0,
        cnt:0
    },
    loadPath: [],
    // cnt: 0,
    // loop: 0,
}


watcher.on('ready', async ()=> {
    console.log('Ready to watch files')
    state.startOver = true;
    console.log(state)
}).on('add', async (path) => {
    if(state.startOver === true){
        const timeSet = await getTimeSet(state.filePath)
        // console.log('jsdno0 debug10', timeSet)
            setTimeout(async ()=>{
                if(state.add.switch === false) {
                    state.add.list = new Array();
                    await recursiveFile(state.filePath, 'add')
                    // console.log('jsdno0 debug4', state.add.list.length +'/'+ state.loadPath.length)
                    state.add.cnt = state.add.list.length - state.loadPath.length
                    // console.log('jsdno0 debug1', state.cnt)
                    state.add.switch = true
                }
                await funcLoadPath(path, 'add')
                console.log('jsdno0 debug1', state.add.loop, state.add.cnt)
                if(state.add.loop === (state.add.cnt-1)){
                    state.add.loop = 0
                    state.add.cnt = 0
                    state.add.list = new Array()
                    state.add.switch = false
                    console.log('add program update')
                } else {
                    state.add.loop++;
                }
            }, timeSet)
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
        // console.log('jsdno debug5 : ' + state.unlinks.cnt + '/' + state.unlinks.list.length)
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
}).on('change', async path => {
    if(state.startOver === true){
        console.log(watcher)
        const timeSet = await getTimeSet(state.filePath)
        console.log('jsdno0 debug10 change', timeSet, state.change.switch)
            setTimeout(async ()=>{
                console.log('change program update')
            }, timeSet)
    } else {
        funcLoadPath(path, 'change')
        console.log(path, 'File is changed')
    }
}).on('error', error => {
    console.log(error)
});

async function getTimeSet(filePath) {
    
    let arrFiles = [];
    arrFiles = await archive(filePath, arrFiles);
    // console.log('jsdno0 debug9', arrFiles)
    let totalSize = 0;
    for(let i = 0; i < arrFiles.length; i++) {
        try {
            totalSize += fs.statSync(arrFiles[i]).size;
        } catch (err) {
            console.log(err);
        }
    }
    // console.log('jsdno0 debug8', totalSize)
    return ((totalSize <= 0) ? (1 * 1000) : ((totalSize/10) * 1000));
    // const stats = fs.statSync(filePath);
    // const fileSizeInBytes = stats.size;
    // const fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024)
    // // console.log('jsdno0 debug6', fileSizeInBytes, fileSizeInMegabytes)
    
    // const size = await getFolderSize.loose(filePath);
    // console.log(size)

    // return ((fileSizeInBytes <= 0) ? (1 * 1000) : ((fileSizeInBytes * 1000) <= 1000 ? (1 * 1000) : (fileSizeInBytes * 1000)));
}

async function archive(dir, arrFiles){
    let result = arrFiles || [];
    const fileList = fs.readdirSync(dir);
    for(let i=0; i<fileList.length; i++) {
        const subDir = path.join(dir, fileList[i]);
        const stat = fs.lstatSync(subDir)
        if(stat.isFile()){
            result.push(subDir);
        } else {
            archive(subDir);
        }
    }
    return result;
}

async function funcLoadPath(path, type){
    switch(type){
        case 'add':
            state.loadPath.push(path); break;
        case 'unlink':
            state.loadPath = state.loadPath.filter((v,i,a)=>{
                return v !== path
            }); 
            break;
    }
    state.loadPath = state.loadPath.filter((v,i,a) => {
        return a.indexOf(v) === i
    })
}
// let arrFiles = null; 
async function recursiveFile(dir, type){
    const fileList = fs.readdirSync(dir)
    // arrFiles = ((arrFiles !== null) ? arrFiles : [])
        for(let i=0; i<fileList.length; i++) {
            const subDir = path.join(dir, fileList[i]);
            const stat = fs.lstatSync(subDir)
            if(stat.isFile()){
                switch(type){
                    case 'add':
                        state.add.list.push(fileList[i]); break;
                    case 'change':
                        state.change.list.push(fileList[i]);  break;
                }
                // arrFiles.push(fileList[i])
            } else {
                await recursiveFile(subDir, type);
            }

        }
        // return arrFiles;
}

// process.send('ready')