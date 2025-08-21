import api from './api';

const invoiceAPI = {
  download: async (reservationId) => {
    const response = await api.get(`/invoice/${reservationId}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default invoiceAPI;
