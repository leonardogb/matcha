var database = require('./database');
var bcrypt    = require('bcrypt');


  database.query("CREATE DATABASE IF NOT EXISTS db_matcha", function (err, result)
  {
    if (err) throw err;
    console.log("Database created");
  });

  var select = "USE db_matcha";
  database.query(select, function(err, result)
  {
    if (err) throw err;
    console.log("Database db_matcha selected");
  });

  var sql = "CREATE TABLE IF NOT EXISTS users (\
    `id` INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY, \
    `login` VARCHAR(30) NOT NULL, \
    `prenom` VARCHAR(50) NOT NULL, \
    `nom` VARCHAR(30) NOT NULL, \
    `passwd` CHAR(128) NOT NULL, \
    `mail` CHAR(255) NOT NULL, \
    `cle` CHAR(128) DEFAULT NULL, \
    `active` TINYINT(1) UNSIGNED DEFAULT 0, \
    `genre` ENUM('Masculin', 'Féminin') DEFAULT 'Masculin',\
    `age` INT(3) UNSIGNED NOT NULL DEFAULT 18,\
    `orientation` ENUM('Hétérosexuel', 'Homosexuel', 'Bisexuel') NOT NULL DEFAULT 'Bisexuel',\
    `bio` VARCHAR(255),\
    `img0` VARCHAR(100) DEFAULT '/img/no-img.png' NOT NULL,\
    `img1` VARCHAR(100) DEFAULT '/img/no-img.png' NOT NULL,\
    `img2` VARCHAR(100) DEFAULT '/img/no-img.png' NOT NULL,\
    `img3` VARCHAR(100) DEFAULT '/img/no-img.png' NOT NULL,\
    `img4` VARCHAR(100) DEFAULT '/img/no-img.png' NOT NULL,\
    `ville` VARCHAR(255),\
    `lat` FLOAT,\
    `lon` FLOAT,\
    `location` VARCHAR(255) DEFAULT NULL,\
    `popularite` INT(4) DEFAULT 0,\
    `puntos` INT(4) DEFAULT 0,\
    `complet` BOOLEAN DEFAULT FALSE,\
    `visite` DATE)";
  database.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table users created");
  });

  var askAdmin = function(callback) {
    
    database.query("SELECT `login` FROM users WHERE `login`='admin'", function(err, rows, fields) {
      if(err) {
          throw err;
      }
      callback(rows);
    });
    
    //database.end();
  }

  askAdmin(function(rows) {
    if (rows.length == 0)
    {
      var passAdmin = bcrypt.hashSync('lgarcia-', 10);

      var insertAdmin = "INSERT INTO users (\
        `login`, passwd, mail, active)\
        VALUES ('admin', '" + passAdmin + "', 'lgarcia-@student.le-101.fr', 1)";
      database.query(insertAdmin, function (err, result)
      {
        if (err) throw err;
        console.log("admin added to users");
      });
    }
  });

  var sql2 = `CREATE TABLE IF NOT EXISTS tags (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tag VARCHAR(30))`;
  database.query(sql2, function (err, result) {
    if (err) throw err;
    console.log("Table tags created");
  });

  var sql3 = `CREATE TABLE IF NOT EXISTS usertags (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_user INT(6) NOT NULL,
    id_tag INT(6) NOT NULL)`;
  database.query(sql3, function (err, result) {
    if (err) throw err;
    console.log("Table usertags created");
  });

  var sql4 = `CREATE TABLE IF NOT EXISTS likes (
    id INT(3) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_user INT(6) NOT NULL,
    id_user_like INT(6) NOT NULL)`;
  database.query(sql4, function (err, result) {
    if (err) throw err;
    console.log("Table likes created");
  });

  var sql5 = `CREATE TABLE IF NOT EXISTS historique (
    id INT(3) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(30) NOT NULL,
    visited VARCHAR(30) NOT NULL)`;
  database.query(sql5, function (err, result) {
    if (err) throw err;
    console.log("Table likes created");
  });

  var sql6 = `CREATE TABLE IF NOT EXISTS messages (
    id INT(3) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_user INT(3) NOT NULL,
    id_dst INT(3) NOT NULL,
    message VARCHAR(500) NOT NULL,
    date_msg DATETIME NOT NULL)`;
  database.query(sql6, function (err, result) {
    if (err) throw err;
    console.log("Table messages created");
  });
  
  var sql7 = `CREATE TABLE IF NOT EXISTS notifications (
    id INT(3) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_user INT(3) NOT NULL,
    notif VARCHAR(255) NOT NULL,
    date_notif DATETIME NOT NULL)`;
  database.query(sql7, function (err, result) {
    if (err) throw err;
    console.log("Table notification created");
  });
  
  var sql8 = `CREATE TABLE IF NOT EXISTS faux (
    id INT(3) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    complainant INT(3) NOT NULL,
    reported INT(3) NOT NULL,
    date_report DATETIME NOT NULL)`;
  database.query(sql8, function (err, result) {
    if (err) throw err;
    console.log("Table faux created");
  });

  var sql9 = `CREATE TABLE IF NOT EXISTS block (
    id INT(3) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    complainant INT(3) NOT NULL,
    reported INT(3) NOT NULL,
    date_report DATETIME NOT NULL)`;
  database.query(sql9, function (err, result) {
    if (err) throw err;
    console.log("Table block created");
  });
    //database.end();

