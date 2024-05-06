import Router from 'next/router';
import { apiURL } from '@utils/api-url';
import axios from 'axios';
import { ApiResponseMeta } from '@interfaces/service';

export interface Data {
  error?: string;
  _meta?: ApiResponseMeta;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
}

let isChangingRoute = false;
let isRedirectingToLogin = false;

Router.events.on('routeChangeStart', (route) => {
  isChangingRoute = true;
});

Router.events.on('routeChangeComplete', (route) => {
  isRedirectingToLogin = false;
  isChangingRoute = false;
  if (route === '/login') {
    isRedirectingToLogin = false;
  }
});

export const handleError = (error) => {
  /*let s = '';
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    s += `Server responded with ${error.response.status} ${error.response.data.message}`;
  } else if (error.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    s += `Server did not respond`;
  } else {
    // Something happened in setting up the request that triggered an Error
    s += `Unknown error: ${error.message}`;
  }
  s += ` for url ${error.config.url}`;
  */
  // console.error(s);

  // FIXME: we should have a logged in guard?
  if (error.response.status === 401 && Router.pathname !== '/login' && !isRedirectingToLogin) {
    isRedirectingToLogin = true;
    Router.push('/login');
  }

  throw error;
};

const options = {
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
};

const get = <T>(url: string) => axios.get<T>(apiURL(url), options).catch(handleError);

const post = <T>(url: string, data: any) => {
  return axios.post<T>(apiURL(url), data, options).catch(handleError);
};

const remove = <T>(url: string) => {
  return axios.delete<T>(apiURL(url), options).catch(handleError);
};

const patch = <T>(url: string, data: any) => {
  return axios.patch<T>(apiURL(url), data, options).catch(handleError);
};

export const apiService = { get, post, patch, delete: remove };
