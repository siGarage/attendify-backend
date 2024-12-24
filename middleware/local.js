export default function(req, res, next) {
    if(['::1', '::ffff:127.0.0.1', '127.0.0.1'].includes(req.socket.remoteAddress)) {
        next();
    } else {
        return res.status(401).send('No access to this route!');
    }
};