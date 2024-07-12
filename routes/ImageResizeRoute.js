var express = require('express'); //서버를 생성한다. ?
var router = express.Router(); // 라우터 분리 ?
const fs = require('fs');
const sharp = require('sharp');
const LRU = require('lru-cache');
const path = require('path');

let image_path = '';
console.log(process.env.DEV_ADOPTED_ENV);
if (process.env.DEV_ADOPTED_ENV == 'DEVELOPER_PC') {
    image_path = 'C:/danawa/web/cache/WEB/images/prodBlog/';
} else {
    image_path = '/home/ayeobi/service/www/KluboImg/';
}
sharp.cache(false);

const options = {
    max: 500,
    maxSize: 5000,
    ttl: 1000 * 60 * 5, // 5분
    sizeCalculation: (value, key) => {
        return 1;
    },
    /* 데이터가 삭제된 후 호출 */
    dispose: (value, key) => {}
};

const cache = new LRU(options);

// shrink=130:130
router.get('/:filePath(*)', async (req, res) => {
    try {
        const aSizeList = typeof req.query.shrink !== 'undefined' ? req.query.shrink.split(':') : [];
        const imageFilePath = image_path + req.params.filePath;

        // fs.exists(imageFilePath, async function (exists) {
        fs.stat(imageFilePath, async function (error, stats) {
            if (error) {
                res.writeHead(404, { 'Content-Type': 'image/jpg' });
                res.end('');
            } else {
                const fileName = path.parse(imageFilePath).name;
                let cache_key = `${fileName}_${parseInt(stats.mtimeMs)}`;

                let change_width = 0;
                let change_height = 0;
                if (aSizeList.length > 0) {
                    change_width = Number(aSizeList[0]);
                    change_height = Number(aSizeList[1]);

                    if (isNaN(change_height) || aSizeList[1] == '') {
                        change_width = 0; // 높이값 없는 경우 원본 이미지 노출
                    }

                    if (change_height == 0) {
                        // 높이값이 0인 경우 넓이 값으로 적용
                        change_height = change_width;
                    }
                    cache_key += `${change_width}_${change_height}`;
                }

                if (cache.has(cache_key)) {
                    var buf_data = JSON.stringify(cache.get(cache_key));
                    var buf = Buffer.from(JSON.parse(buf_data));

                    res.writeHead(200, { 'Content-Type': 'image/jpg' });
                    res.end(buf);
                } else {
                    const img_sharp = sharp(imageFilePath, { animated: true });
                    const metadata = await img_sharp.metadata();

                    if (change_width > 0 && change_height > 0) {
                        img_sharp // 압축할 이미지 경로
                            .resize(change_width, change_height) // 비율을 유지하며 가로 크기 줄이기
                            .withMetadata(); // 이미지의 exif데이터 유지
                    }
                    img_sharp.toBuffer((err, buffer) => {
                        if (err) throw err;
                        cache.set(cache_key, buffer.toJSON().data);
                        res.writeHead(200, { 'Content-Type': `image/${metadata.format}` });
                        res.end(buffer);
                    });
                }
            }
        });
    } catch (error) {
        console.log(error);
        res.writeHead(500, { 'Content-Type': 'image/jpg' });
        res.end('');
    }
});

process.on('uncaughtException', (err) => {
    console.error('죽지마 ㅠㅠ');
    console.error(err);
});
// Create Model & Export
module.exports = router;
