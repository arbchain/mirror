const fs = require('fs');
const path = require('path');

const findImports = (dir) => {
    const files = walkSync(dir);
    return (fileName) => {
        const fileNames = Object.keys(files);
        for(const key in files) {
            if(key.indexOf(fileName) > -1) {
                return { contents: files[key]};
            }
        }
        return {error: fileName + 'not Found'};
    }
};

const walkSync = (dir, filelist) => {
    var fs = fs || require('fs'),
        files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function(file) {
        if (fs.statSync(dir + '/' + file).isDirectory()) {
            // console.log('Directory:', dir + '/' + file);
            filelist = walkSync(dir + '/' + file, filelist);
        }
        else {
            if(file.indexOf('.sol') > 0) {
                // console.log('File: ', dir + '/' + file)
                // filelist.push({[file]: fs.readFileSync(dir + '/' + file, 'utf-8')});
                filelist[dir + '/' + file] = fs.readFileSync(dir + '/' + file, 'utf-8')
            }
        }
    });
    return filelist;
};

module.exports = {
    findImports
};
