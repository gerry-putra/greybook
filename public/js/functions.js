
const isInArray = function (obj, arr) {
    for(let i = 0; i < arr.length; i++) {
        if(arr[i]._id.equals(obj)) {
            return true;
        }
    }
    return false;
}

module.exports.isInArray    = isInArray;