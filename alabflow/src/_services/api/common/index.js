import axios from "axios";

const apiInstance = axios.create({
  baseURL: (process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL : 'http://10.1.252.81:28137/') + 'api/'
});


export default apiInstance;
