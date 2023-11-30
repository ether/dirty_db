import {describe, it} from "vitest";
import {TMP_PATH} from "./config";
import fs, {createWriteStream} from "fs";

describe('test-node-failure',  () =>{
    const file = `${TMP_PATH}/chain.dirty`;
    fs.existsSync(file) && fs.unlinkSync(file);

    it('should allow .on load to chain to constructor', async function () {
        let path = "test.txt"
        let _writeStream = createWriteStream(path, {
            encoding: 'utf-8',
            flags: 'a',
        });
            let _queue = new Map();
            let key = 'key';

            const cbs = _queue.get(key) || [];
            _queue.set(key, cbs);
        _writeStream.cork();
        for (const [key, _] of _queue) {
            _queue.delete(key);
            const data = `${JSON.stringify({key, val: "test"})}\n`;
            _writeStream.write(data, (err) => {
                console.log(err)
            });
        }
        _writeStream.uncork();
        });
});
