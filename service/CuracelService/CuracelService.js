const sdk = require("api")("@curacel-grow/v1.0#1pds01apln0191ab");
const axios = require("axios");

class CuracelService {
  constructor(apiKey) {
    sdk.auth(apiKey);
    this.baseUrl = process.env.CURACEL_BASE_URL;
  }

  async listProductTypes() {
    return sdk.listProductTypes();
  }

  async listAvailableInsuranceProducts(options) {
    try {
      const { data } = await sdk.getProducts(options);
      return data;
    } catch (error) {
      throw error;
    }
  }

  async fetchSingleInsuranceProduct(productDetails) {
    try {
      const { data } = await sdk.getProductDetail(productDetails);
      return data;
    } catch (error) {
      throw error;
    }
  }

  async createNewCustomer(customerData) {
    try {
      //   const response = await axios.post(
      //     `${this.baseURL}/customers`,
      //     customerData,
      //     {
      //       headers: {
      //         Authorization: `Bearer ${this.apiKey}`,
      //         "Content-Type": "application/json",
      //       },
      //     }
      //   );
      //   return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getCustomers() {
    const config = {
      method: "get",
      maxBodyLength: Infinity,
      url: "https://api.playbox.grow.curacel.co/api/v1/customers",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
    };

    try {
      const response = await axios.request(config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getDebitNotes() {
    const config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `${this.baseURL}/debit-notes?page=1&per_page=15&status=pending&insurer=magna culpa consequat adipisicing`,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
    };

    try {
      const response = await axios.request(config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getDebitNoteDetails() {
    const config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `${this.baseURL}/debit-notes/voluptate reprehenderit sit dolor`,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
    };

    try {
      const response = await axios.request(config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = CuracelService;
