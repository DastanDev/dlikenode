const app = require('./index');
//const cors = require('cors');
//const path = require('path')




const server = app.listen(3000, () => {
  console.log(`Express is running on port ${server.address().port}`);
});