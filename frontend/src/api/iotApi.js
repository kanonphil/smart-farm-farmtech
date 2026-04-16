import { axiosInstance } from './axiosInstance';

export const ledOn = async (brightness = 1.0) => {
  const response = await axiosInstance.post('/api/actuator/led/on', null, {
    params: { brightness },
  });
  return response.data;
};

export const ledOff = async () => {
  const response = await axiosInstance.post('/api/actuator/led/off');
  return response.data;
};

export const buzzerOn = async (freq = 440) => {
  const response = await axiosInstance.post('/api/actuator/buzzer/on', null, {
    params: { freq },
  });
  return response.data;
};

export const buzzerOff = async () => {
  const response = await axiosInstance.post('/api/actuator/buzzer/off');
  return response.data;
};

export const fanOn = async (speed = 1.0) => {
  const response = await axiosInstance.post('/api/actuator/fan/on', null, {
    params: { speed },
  });
  return response.data;
};

export const fanOff = async () => {
  const response = await axiosInstance.post('/api/actuator/fan/off');
  return response.data;
};

export const getStatus = async () => {
  const response = await axiosInstance.get('/api/actuator/status');
  return response.data;
};

export const setMode = async (mode) => {
  const response = await axiosInstance.post('/api/actuator/mode', null, {
    params: { mode },
  });
  return response.data;
};