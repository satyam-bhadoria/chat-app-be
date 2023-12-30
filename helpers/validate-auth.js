import axios from 'axios';

export const validateAuth = async (token) => {
  try {
    const endpointUrl = `${process.env.ACCOUNT_APP_SERVICE}/internal/v1/auth/validate`;
    console.debug('validate authorization---->', endpointUrl);
    const response = await axios({
      method: 'post',
      url: endpointUrl,
      headers: {
        Authorization: `Bearer ${token}`
      },
    });
    console.debug('response---->', response.data);
    if (response.data.status === 'success') {
      return response.data.result.userId;
    } else {
      throw new Error('Unauthorized access');
    }
  } catch (err) {
    console.log('chat validation failed---->', err.message);
    throw new Error(err.message);
  }
};
