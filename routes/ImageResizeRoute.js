var express = require("express"); //서버를 생성한다.
var router = express.Router(); // 라우터 분리
const Jimp = require("Jimp");
const fs = require("fs");

let image_path = "";
console.log(process.env.DEV_ADOPTED_ENV);
if (process.env.DEV_ADOPTED_ENV == "DEVELOPER_PC") {
    image_path = "/Users/baggyeongseong/Desktop/Klubo/KluboImg/";
} else {
    image_path = "/home/ayeobi/service/www/KluboImg/";
}

// shrink=130:130
router.get("/:filePath(*)", async (req, res) => {
    try {
        const aSizeList =
            typeof req.query.shrink !== "undefined"
                ? req.query.shrink.split(":")
                : [];
        let imageFilePath = image_path + req.params.filePath;

        fs.exists(imageFilePath, async function (exists) {
            if (exists) {
                const jimpImg = await Jimp.read(imageFilePath);
                if (aSizeList.length > 0) {
                    let change_width = Number(aSizeList[0]);
                    let change_height = Number(aSizeList[1]);

                    if (isNaN(change_height) || aSizeList[1] == "") {
                        change_width = 0; // 높이값 없는 경우 원본 이미지 노출
                    }

                    if (change_height == 0) {
                        // 높이값이 0인 경우 넓이 값으로 적용
                        change_height = change_width;
                    }

                    jimpImg.resize(change_width, change_height);
                }
                res.writeHead(200, { "Content-Type": jimpImg.getMIME() });
                const data = await jimpImg.getBufferAsync(jimpImg.getMIME());
                res.end(data);
            } else {
                res.writeHead(404, { "Content-Type": "image/jpg" });
                res.end("");
            }
        });
    } catch (error) {
        console.log(error);
        res.writeHead(500, { "Content-Type": "image/jpg" });
        res.end("");
    }
});

// Create Model & Export
module.exports = router;
