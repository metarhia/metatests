'use strict';

const fs = require('fs');

const common = require('metarhia-common');
const metasync = require('metasync');

const walk = (path, callback) => {
  const files = [];
  fs.readdir(
    path,
    (err, flist) => {
      if (err) {
        console.log('Cant read directory: ' + path);
        return;
      }
      metasync.each(flist, (fileName, end) => {
        const filePath = path + '/' + fileName;
        fs.stat(filePath, (err, stats) => {
          if (err) {
            const msg = 'Cant read file: ' + filePath;
            console.log(msg);
            end(new Error('msg'));
            return;
          }
          const mtime = common.nowDateTime(stats.mtime);
          if (!stats.isFile()) {
            end();
            return;
          }
          const size = common.bytesToSize(stats.size);
          files.push({ fileName, filePath, size, mtime });
          end();
        });
      }, () => {
        files.sort(common.sortCompareByName);
        callback(null, files);
      });
    }
  );
};

module.exports = walk;
