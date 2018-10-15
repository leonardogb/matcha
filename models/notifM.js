var database = require('../config/database');

database.query('USE db_matcha');

var notifM = {
    addNotif: function(id_user, notif)
    {
        return new Promise((resolve, reject) => {
            database.query("INSERT INTO notifications (id_user, notif, date_notif) VALUES (?, ?, NOW())", [id_user, notif], (err, resp) => {
                if (err) reject(err);
                //console.log(resp);
                if (resp.affectedRows == 1)
                    resolve(true);
                else
                    resolve(false);
            });
        });
    },
};

module.exports = notifM;