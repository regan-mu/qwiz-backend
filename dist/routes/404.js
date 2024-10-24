"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const notFound = (req, res) => {
    res.status(405).json({ message: "Method not allowed or path doesn't exist" });
};
exports.default = notFound;
