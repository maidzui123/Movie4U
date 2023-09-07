const jwt = require('jsonwebtoken');

const MiddleWaresController = {
    verifyJWT: (req, res, next) => {
        const token = req.headers.authorization;

        if(!token){
            return res.status(200).json({
                code: 401,
                message: 'Token not found'
            });
        }

        const accessToken = token.split(' ')[1];

        jwt.verify(accessToken, process.env.JWT_SECRET, (err, user) => {
            if(err){
                req.cookies.refreshToken = null;

                return res.status(200).json({
                    code: 403,
                    message: 'Invalid token'
                });
            }
            req.user = user;
            next();
        });
    },

    checkToken: (req, res) => {
        const token = req.query.token;
        if(!token){
            return res.status(200).json({
                code: 401,
                message: 'Token not found'
            });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if(err){
                req.cookies.refreshToken = null;
                return res.status(200).json({
                    code: 403,
                    message: 'Invalid token'
                });
            }
            res.status(200).json({
                code: 200,
                message: 'Token is valid'
            });
        });
    },

    authForUser: (req, res, next) => {
        MiddleWaresController.verifyJWT(req, res, () => {
            if(req.user.status === 1){
                next();
            }else{
                res.status(200).json({
                    code: 403,                    
                    message: 'You are not user'
                });
            }
        });
    },

    authForAdmin: (req, res, next) => {
        MiddleWaresController.verifyJWT(req, res, () => {
            if(req.user.status === 0){
                next();
            }else{
                res.status(200).json({
                    code: 403,
                    message: 'You are not admin'
                });
            }
        });
    },

    authForAdminAndRedirect: (req, res, next) => {
        const refreshToken = req.cookies.refreshToken;
        if(!refreshToken){
            return res.redirect('/');
        }

        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
            if(err){
                return res.redirect('/');
            }
            req.user = user;
            if(req.user.status === 0){
                next()
            }else{
                res.redirect('/');
            }
        });
    },

    authForUserAndRedirect: (req, res, next) => {
        const refreshToken = req.cookies.refreshToken;
        if(!refreshToken){
            return res.redirect('/');
        }

        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
            if(err){
                return res.redirect('/');
            }
            req.user = user;
            if(req.user.status === 1){
                next()
            }else{
                res.redirect('/admin');
            }
        });
    },
}

module.exports = MiddleWaresController;