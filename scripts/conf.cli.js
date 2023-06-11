// starfall-cli config
// https://github.com/cenfun/starfall-cli

module.exports = {

    build: {
        cssExtract: 'string',
        before: (item) => {

            if (item.production) {
                item.devtool = false;
            }

            return 0;
        }
    }

};
