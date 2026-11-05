// Reference implementation for the Track A file evaluation.
// Routes using these handlers must run the authentication middleware first.
import httpStatusCodes from "http-status-codes";
import Configuration from "../models/configration.js";
import TrackImage from "../models/trackImage.js";
import GeoFence from "../models/geoFence.js";
import ApiResponse from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiErrors.js";

const track = { model: TrackImage, as: "track" };
const geoFences = { model: GeoFence, as: "geoFences" };

function configurationNotFound() {
  return new ApiError(httpStatusCodes.NOT_FOUND, "Configuration Not Found", httpStatusCodes.NOT_FOUND);
}

export async function addNewConfiguration(req, res, next) {
  try {
    const { trackId, configurationName, direction, polygons } = req.body;
    if (!trackId || !configurationName || !direction) {
      throw new ApiError(httpStatusCodes.BAD_REQUEST, "All Fields are required", httpStatusCodes.BAD_REQUEST);
    }

    await Configuration.create({ trackId, configurationName, direction, polygons, userId: req.user.id });
    return ApiResponse.result(res, { status: "Config Added successfully" }, httpStatusCodes.OK);
  } catch (error) {
    return next(error);
  }
}

export async function getAllConfigurations(req, res, next) {
  try {
    const configurations = await Configuration.findAll({
      where: { userId: req.user.id },
      include: [track, geoFences],
    });
    if (configurations.length === 0) {
      throw configurationNotFound();
    }
    return ApiResponse.result(res, configurations, httpStatusCodes.OK);
  } catch (error) {
    return next(error);
  }
}

export async function getSingleConfiguration(req, res, next) {
  try {
    const configuration = await Configuration.findOne({
      where: { id: req.params.configurationId, userId: req.user.id },
      include: [track],
    });
    if (!configuration) {
      throw configurationNotFound();
    }
    return ApiResponse.result(res, configuration, httpStatusCodes.OK);
  } catch (error) {
    return next(error);
  }
}

export async function updateConfiguration(req, res, next) {
  try {
    const { configurationName, polygons, direction } = req.body;
    const [updated] = await Configuration.update(
      { configurationName, polygons, direction },
      { where: { id: req.params.configurationId, userId: req.user.id } },
    );
    if (updated === 0) {
      throw configurationNotFound();
    }
    return ApiResponse.result(res, { status: "Configutration updated successfully" }, httpStatusCodes.OK);
  } catch (error) {
    return next(error);
  }
}

export async function deleteConfiguration(req, res, next) {
  try {
    const deleted = await Configuration.destroy({
      where: { id: req.params.configurationId, userId: req.user.id },
    });
    if (deleted === 0) {
      throw configurationNotFound();
    }
    return ApiResponse.result(res, { status: "Configutration deleted successfully" }, httpStatusCodes.OK);
  } catch (error) {
    return next(error);
  }
}
