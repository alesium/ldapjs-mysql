
///--- Helpers

function _array(arg) {
    if (!arg) {
        arg = [];
    }
    if (!Array.isArray(arg)) {
        arg = [arg];
    }
    return arg;
}


function buildChain(pre, chain) {
    return pre.concat(db.setup).concat(chain);
}

///--- Exports

module.exports = {

    bind: function bind(pre) {
        var chain = [salt.bind].concat(db.bind());

        return buildChain(_array(pre), chain);
    },

    changelog: db.changelog,

};

