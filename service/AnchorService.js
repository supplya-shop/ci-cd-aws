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

  async updateCustomer(customerId, updateData) {
    return await sdk.putApiV1CustomersUpdateCustomerid(updateData, {
      customerId,
    });
  }

  async fetchCustomer(customerId) {
    try {
      const result = await sdk.fetchCustomer({ customerId });
      return result.data;
    } catch (error) {
      throw error;
    }
  }

  listAllCustomers() {
    return sdk.listAllCustomer();
  }

  // kycValidation - individual customer
  async kycValidationIndividual(customerId, kycData) {
    return await sdk.kycValidation(kycData, { customerId });
  }

  // business customer
  async kycValidationBusiness(customerId) {
    try {
      await this.authenticate();
      const result = await sdk.kycValidation_1({ customerId });
      return result.data;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = AnchorService;
