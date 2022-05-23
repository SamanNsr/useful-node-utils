const httpStatus = require('http-status');
const axios = require('axios').default;
// const AxiosLogger = require("axios-logger");
const logger = require('../config/logger');
const systemConfig = require('../config/config');
const Misc = require('../services/misc.service');
const { miscTypes } = require('../config/consts');
const {
  xhrGlobalOptions: globalOptions,
  authenticationService,
} = require('../config/externals');

const ApiHandler = (config) => {
  const instance = axios.create(config);
  // instance.interceptors.request.use(AxiosLogger.requestLogger);
  // instance.interceptors.response.use(AxiosLogger.responseLogger);
  const request = async (options, data, onUploadProgress) => {
    const { method } = options;
    const innerOptions = {
      ...globalOptions,
      ...options,
      headers: {
        ...globalOptions.header,
        ...options.headers,
      },
    };

    let tokens;
    try {
      tokens = await Misc.getMiscDataByType(miscTypes.SERVICE_AUTH_DATA);
    } catch (e) {}
    if (tokens && tokens.access)
      innerOptions.headers.Authorization = `Bearer ${tokens.access}`;

    if (data) innerOptions.data = data;

    const normalizedMethodName = method.toLowerCase();

    if (
      !innerOptions.headers['Content-Type'] &&
      (normalizedMethodName === 'put' || normalizedMethodName === 'post')
    )
      innerOptions.headers['Content-Type'] = 'application/json';

    return new Promise((resolve, reject) => {
      instance
        .request({
          ...innerOptions,
          onUploadProgress: (progress) => {
            if (onUploadProgress) onUploadProgress(progress);
          },
        })
        .then((res) => resolve(res.data))
        .catch(async (err) => {
          try {
            if (err.response.data.code === httpStatus.UNAUTHORIZED) {
              const { request } = ApiHandler(authenticationService.config);
              const refreshToken = (
                await Misc.getMiscDataByType(miscTypes.SERVICE_AUTH_DATA)
              ).refresh;
              const body = { refreshToken };
              request(authenticationService.refreshTokens, body)
                .then(async (res) => {
                  await Misc.updateMiscDataByType(
                    miscTypes.SERVICE_AUTH_DATA,
                    res
                  );
                  logger.info(
                    `${systemConfig.service.normalizedName} Refreshed tokens Successfully`
                  );
                  await request(options, data, onUploadProgress).then((res) =>
                    resolve(res.data)
                  );
                })
                .catch((err) => reject(err));
            } else {
              reject(err.response.data);
            }
          } catch (err) {
            reject(err);
          }
        });
    });
  };

  return {
    request,
  };
};

module.exports = ApiHandler;
