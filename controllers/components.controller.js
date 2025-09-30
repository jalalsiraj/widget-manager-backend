const Components = require('../models/components');
const { to, ReE, ReS } = require('../global-functions');
const router = require('express').Router({ mergeParams: true });

const getAllComponents = async function (req, res) {
    const searchText = req?.query?.searchText ? req?.query?.searchText : null;
    const whereClause = searchText ? { $or: [{ name: { $regex: searchText, $options: "i" } }, { description: { $regex: searchText, $options: "i" } }] } : {};
    let [componentsErr, comonents] = await to(Components.find(whereClause).limit(30).sort({ name: 1 }));
    if (componentsErr) {
        console.log("Error while loading components")
        return ReE(res, { message: "Failed to fetch components", error: componentsErr.message }, 422);
    } else if (comonents) {
        return ReS(res, { message: "Components loaded successfully", components: comonents }, 200);
    }
}

router.get('/', getAllComponents);
module.exports = { router };