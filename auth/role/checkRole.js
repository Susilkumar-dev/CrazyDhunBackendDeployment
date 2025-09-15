const express=require('express')
const checkRole = (role) => {
    return (req, res, next) => {
        if (req.user && req.user.role === role) {
            next();
        } else {
            return res.status(403).json({ message: 'Not authorized for this role' });
        }
    };
};

module.exports = checkRole;