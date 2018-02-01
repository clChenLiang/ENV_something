'use strict'
const co = require('co');
function *for_loog(fun) {
    for (let i = 0; i < 50;) {
        // setTimeout(() => {
            yield fun(i);
        // }, 1000);
        i++;
    };
    // return yield ;
    console.log('finish the for_loop');
}

co(for_loog(function *(a) {
    return setTimeout(() => {
        console.log(a);
    }, Math.floor(Math.random()*1200)); 
}));

console.log('finish the module');