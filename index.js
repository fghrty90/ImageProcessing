const express = require("express");
//const compression = require('compression');

/* express 객체 생성 */
const app = express();

const ImageResizeRoute = require("./routes/ImageResizeRoute");

//app.use(compression());
app.use(ImageResizeRoute);

let port = 8083;
if (process.env.DEV_ADOPTED_ENV == "DEVELOPER_PC") {
    port = 4000;
} else {
    port = 8083;
}
app.listen(port, () => {
    console.log(`Listening to port ${port}...`);
});
