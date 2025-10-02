const Widgets = require('../models/widgets');
const Components = require('../models/components');
const { to, ReE, ReS } = require('../global-functions');
const router = require('express').Router({ mergeParams: true });

const getAllWidgets = async function (req, res) {
    const searchText = req?.query?.searchText ? req?.query?.searchText : null;
    const whereClause = searchText ? { $or: [{ name: { $regex: searchText, $options: "i" } }, { description: { $regex: searchText, $options: "i" } }] } : {};
    let [getWidgetsErr, widgets] = await to(Widgets.find(whereClause).limit(10).sort({ name: 1 }));
    if (getWidgetsErr) {
        return ReE(res, { message: "Failed to fetch widgets", error: getWidgetsErr.message }, 422);
    } else if (widgets) {
        return ReS(res, { message: "Widgets fetched successfully", widgets }, 200);
    }
}

const createWidget = async function (req, res) {
    const widgetData = req?.body ? req.body : null;
    if (widgetData) {
        let componentIds = [];
        if (widgetData?.components?.length) {
            const components = widgetData.components;
            componentIds = [...((components.filter((component) => component?._id)).map(comp => comp && comp._id))];
            const newComponents = components.filter((component) => !component?._id);
            if (newComponents?.length) {
                let [cmpCreateErr, createdComponents] = await to(Components.insertMany(newComponents));
                if (cmpCreateErr) {
                    console.log("error in creating components", cmpCreateErr);
                    return ReE(res, { message: "Error while creating Components", error: cmpCreateErr.message }, 422);
                } else if (createdComponents) {
                    componentIds = [...componentIds, ...(createdComponents.map((newComp) => newComp && newComp._id))];
                }
            }
        }
        let [createWidgetErr, createdWidget] = await to(Widgets.create({
            ...widgetData,
            components: componentIds
        }));
        if (createWidgetErr) {
            console.log("Error in creating widget", createWidgetErr);
            return ReE(res, { message: "Error while creating widget", error: createWidgetErr.message }, 422);
        } else if (createdWidget) {
            const widgetDetails = await createdWidget.populate({
                path: "components",
                options: {
                    limit: 30,
                    sort: { name: 1 }
                }
            });
            return ReS(res, { message: "Widget created successfully", widgetData: widgetDetails }, 200);
        }
    }
}

const updateWidget = async function (req, res) {
    const updateData = req?.body ? req.body : null;
    const widgetId = req?.params?.id ? req.params.id : null;
    if (updateData && widgetId) {
        let componentIds = [...((updateData.components.filter((component) => component?._id)).map(comp => comp && comp._id))];
        const newComponents = updateData.components.filter((component) => !component?._id);
        //creating new components if available
        if (newComponents?.length) {
            let [cmpCreateErr, createdComponents] = await to(Components.insertMany(newComponents));
            if (cmpCreateErr) {
                console.log("error in creating components", cmpCreateErr);
                return ReE(res, { message: "Error while creating Components", error: cmpCreateErr.message });
            } else if (createdComponents) {
                componentIds = [...componentIds, ...(createdComponents.map((newComp) => newComp && newComp._id))];
                console.log("Component ids after creation", componentIds);
            }
        }
        // checking for existing components having changes and updating
        if (updateData.components.some((component) => component && component.isModified)) {
            const modifiedComponents = updateData.components.filter((component) => component && component.isModified);
            for (let component of modifiedComponents) {
                let [compUpdateErr, updateComponent] = await to(Components.findByIdAndUpdate(component._id, { $set: component }));
                if (compUpdateErr) {
                    return ReE(res, { message: "Error while updating existing component", error: compUpdateErr.message }, 422);
                }
            }
        }

        let [updateErr, updatedWidget] = await to(Widgets.findByIdAndUpdate(widgetId, { $set: { ...updateData, components: componentIds } }, { new: true, runValidators: true }));
        if (updateErr) {
            console.log("Error while updating widget");
            return ReE(res, { message: "Error while updating widget", error: updateErr.message }, 422);
        }
        else if (updatedWidget) {
            const widgetDetails = await updatedWidget.populate({
                path: "components",
                options: {
                    limit: 30,
                    sort: { name: 1 }
                }
            });
            // console.log("populated widgets", widgetDetails);
            return ReS(res, { message: "Widget updated successfully", widgetData: widgetDetails }, 200);
        }

    }
}

const getOneWidget = async function (req, res) {
    const widgetId = req?.params?.id ? req.params.id : null;
    if (widgetId) {
        let [widgetErr, widgetDetails] = await to(Widgets.findById(widgetId).populate({
            path: 'components',
            limit: 30,
            sort: { name: 1 }
        }));
        if (widgetErr) {
            console.log("Error whilw getting widget details", widgetErr);
            return ReE(res, { message: "Failed to get widget details", error: widgetErr.message }, 422);
        } else if (widgetDetails) {
            return ReS(res, { message: "Widget details fetched successfully", widgetDetails }, 200);
        }
    }
}

const deleteWidget = async function (req, res) {
    const widgetId = req?.params?.id ? req.params.id : null;
    if (widgetId) {
        let [deleteWidgetErr, deletedWidget] = await to(Widgets.findByIdAndDelete(widgetId));
        if (deleteWidgetErr) {
            console.log("Error while deleting the widget", deleteWidgetErr);
            return ReE(res, { message: "Failed to delete the widget", error: deleteWidgetErr.message }, 422);
        } else if (deletedWidget) {
            return ReS(res, { message: "Widget deleted successfully" }, 200)
        }
    }
}

router.get('/', getAllWidgets);
router.post('/', createWidget);
router.put('/:id', updateWidget);
router.get('/:id', getOneWidget);
router.delete('/:id', deleteWidget);

module.exports = { router };