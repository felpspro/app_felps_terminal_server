import {server} from '#app';
import config from '#config';
server.listen(config.server.port, () => {
    console.log(`🚀 Terminal server running port ${config.server.port}`)
})