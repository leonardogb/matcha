var database = require("../config/database");
database.query("USE db_matcha");

var likesM = {
  addVisit: function (user, userVisited) {
    return new Promise(function (resolve, reject) {
      database.query(
        "INSERT INTO historique (username, visited) VALUES (?, ?)",
        [user, userVisited],
        function (err, result) {
          if (err) reject(err);
          if (result.affectedRows == 1) resolve(true);
          else resolve(false);
        }
      );
    });
  },
  getNbVisits: function (userVisited) {
    return new Promise(function (resolve, reject) {
      database.query(
        "SELECT COUNT(*) AS count FROM historique WHERE visited = ?",
        userVisited,
        function (err, response) {
          if (err) reject(err);
          resolve(response[0].count);
        }
      );
    });
  },
};

module.exports = likesM;
