function foursquare() {
    const config = require('config');
    const secrets = config.get('foursquare');
    const node_foursquare = require('node-foursquare')(secrets);
    var users = [];
    var token;

    this.getSelf = function (redirect) {
        node_foursquare.Users.getUser('self', token, function (error, jsonResponse) {
            redirect(error, jsonResponse);
        });
    };
    this.getRecentCheckins = function (redirect) {
        node_foursquare.Users.getCheckins('self', null, token, function (error, jsonResponse) {
            redirect(error, jsonResponse);
        });
    };
    this.getCheckinsForUser = function (userId) {
        var index = finduser(userId);
        if (index !== -1) {
            return users[index].checkins;
        }
    };
    this.getUsers = function (redirect) {
        redirect(users);
    };
    this.redirect = function (theredirect, redirect) {
        node_foursquare.getAccessToken({
            code: theredirect
        }, function (error, accessToken) {
            if (error) {
                redirect(error);
            }
            else {
                token = accessToken;
                redirect();
            }
        });
    };
    this.getAuthClientRedirectUrl = function () {
        return node_foursquare.getAuthClientRedirectUrl();
    };
    this.newUser = function (user, redirect) {
        var current = {
            'id': user.id,
            'firstName': user.firstName,
            'lastName': user.lastName,
            'checkins': []
        };
        if (finduser(current) == -1) {
            users.push(current);
        }
        redirect(current);
    };
    this.addCheckin = function (user, json, redirect) {
        var index = finduser(user.id);
        if (index >= 0) {
            var checkins = json.checkins.items;
            for (var i = 0; i < checkins.length; ++i) {
                var checkin = checkins[i];
                var thecheckin = {
                    "id": checkin.id,
                    "datetime": checkin.createdAt,
                    "venue": checkin.venue.name,
                    "source": checkin.source.name
                };
                users[index].checkins.push(thecheckin);
            }
        }
        else redirect()
    };
    var finduser = function (userId) {
        for (var i = 0; i < users.length; ++i) {
            if (users[i].id === userId) {
                return i;
            }
        }
        return -1;
    };
}

module.exports = foursquare;