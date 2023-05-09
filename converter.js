const fs = require('fs');
const path = require('path');
const chardet = require('chardet');
const iconv = require('iconv-lite');
const recursive = require('recursive-readdir');

require('dotenv').config();

function getFiles(path) {
    return new Promise((resolve, reject) => {
            recursive(path, (err, files) => {
            if (err) {
                reject(err);
            } else {
                resolve(files);
            }
        });
    });
}

function convertFiles(files) {
    files.forEach(element => {
        if(path.extname(element) === `${process.env.PG_EXTENSION}`){
            const filePath = (path.join(path.dirname(element), 'conversor.jsp'));

            const buffer = fs.readFileSync(element);
            const encoding = chardet.detect(buffer);

            if(encoding !== 'UTF-8') {
                const content = iconv.decode(buffer, encoding);
                const isoBuffer = iconv.encode(content, 'UTF-8');

                fs.writeFileSync(filePath, isoBuffer);
                fs.unlink(element, (err) => {
                    if(err) {
                        console.log(`Erro ao excluir : ${element}`, err);
                    } else {
                        console.log(`${element} excluido`);
                    }
                });

                fs.rename(filePath, element, (err) => {
                    if (err) {
                        console.log(`Erro ao renomear: ${element}`, err);
                    } else {
                        console.log(`${filePath} renomeado! para ${element}`);
                    }
                });

            } else {
                console.log(`${element} encondig = UTF8`);
            }
        }
    });
}
  
getFiles(`${process.env.PG_URL}`)
    .then((files) => {
        convertFiles(files);
    })
    .catch((err) => {
      console.error('Erro ao percorrer o diretorio: ', err);
    });