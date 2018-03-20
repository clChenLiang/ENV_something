'use strict';
let yObj = {
    a: yield getA(),
    b: yield getB(),
    c: yield getC()
};

function *getA(params) {
    let a = 3;
    return yield a;
};
function *getB(params) {
    return 4;
}
function getC(params) {
    return 5
}

console.log(yObj);