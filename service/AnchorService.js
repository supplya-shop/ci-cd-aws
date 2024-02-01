const sdk = require("api")("@getanchor/v1.0#5rfsybljo1h926");

class AnchorService {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  authenticate() {
    return sdk.auth(this.apiKey);
  }

  createCustomer(customerData) {
    return sdk.postApiV1Customers(customerData);
  }

  listAllCustomers() {
    return sdk.listAllCustomer();
  }
}

module.exports = AnchorService;
