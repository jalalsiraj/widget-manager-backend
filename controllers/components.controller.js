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

const updateComponent = async function (req, res) {
    const updateData = req?.body ? req.body : null;
    const componentId = req?.params?.id ? req.params.id : null;
    if (componentId, updateData) {
        let [updateErr, updatedComponent] = await to(Components.findByIdAndUpdate(componentId, { $set: { ...updateData } }, { new: true, runValidators: true }));
        if (updateErr) {
            console.log("Error while updating component")
            return ReE(res, { message: "Failed to fetch components", error: updateErr.message }, 422);
        } else if (updatedComponent) {
            return ReS(res, { message: "Components updated successfully successfully", component: updatedComponent }, 200);
        }
    }

}

const createComponent = async function (req, res) {
    const componentData = req?.body ? req?.body : null;
    if (componentData) {
        let [createComponentErr, component] = await to(Components.create(componentData));
        if (createComponentErr) {
            console.log("Error while creating components")
            return ReE(res, { message: "Failed to create component", error: createComponentErr.message }, 422);
        } else if (component) {
            return ReS(res, { message: "Components loaded successfully", component: component }, 200);
        }
    }
}

const deleteComponent = async function (req, res) {
    const componentId = req?.params?.id ? req.params.id : null;
    if (componentId) {
        let [deleteErr, deletedComponent] = await to(Components.findByIdAndDelete(componentId));
        if (deleteErr) {
            console.log("Error while deleting the widget", deleteErr);
            return ReE(res, { message: "Failed to delete the widget", error: deleteErr.message }, 422);
        } else if (deletedComponent) {
            return ReS(res, { message: "Component deleted successfully" }, 200)
        }
    }
}


router.get('/', getAllComponents);
router.post('/', createComponent);
router.put('/:id', updateComponent);
router.delete('/:id', deleteComponent);
module.exports = { router };