function getCoordinates() {
  var promiseTest = new Promise(function(resolve, reject) {
    if (1 + 1 === 2) {
      resolve('pass')
    } else {
      reject('fail')
    }
  })
  return promiseTest.then(data => data);
}

async function getAsyncData() {
  var data = await getCoordinates()
  console.log(data);
  return data;
}

getAsyncData()