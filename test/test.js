let LoadSql = require('../lib/index.js').default;
let loader = new LoadSql(`${__dirname}/sql/`);

describe('testing', function () {
  it('reads a sql file', async () => {
    let resp = await loader.load('sample');
    console.log('resp: ', resp);
  });
});