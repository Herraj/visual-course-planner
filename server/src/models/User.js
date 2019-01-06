const promisify = require('util').promisify;
const db = require('../../../dbconnection');
db.query = promisify(db.query);

class User {

  async checkUser(email) {
    let rows = [];
    try {
      rows = await db.query("SELECT * FROM user WHERE email = ?", [email]);
    } catch (err) {
      throw err;
    }

    if (rows.length > 0){
      return true;
    } else {
      return false;
    }

  }

  async insertUser(newUser) {
    
    db
      .query("INSERT INTO user SET ?", newUser)
      .then(

        console.log("user inserted")
      )
      .catch(err => {
        throw err;
      });  
  }

}

module.exports = User;
