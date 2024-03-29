const ConfigModel = require("../models/Config")

class ConfigService {
  constructor() {
    this.configModel = ConfigModel;
  }

  async getAllConfigs() {
    return await this.configModel.find();
  }

  async getConfigById(id) {
    return await this.configModel.findById(id);
  }

  async getConfig(type) {
    return await this.configModel.findOne({ type });
  }

  async addConfig(config) {
    return await this.configModel.create(config);
  }

  async addConfigs(configs) {
    return await this.configModel.insertMany(configs);
  }

  async clear() {
    return await this.configModel.remove({});
  }
}

module.exports = ConfigService;
