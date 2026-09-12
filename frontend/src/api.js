import axios from "axios";

import {
  normalizeImage,
} from "./imageProcessor";

import {
  beginLoading,
  endLoading,
} from "./loaderStore";

export const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://backend-dun-three-20.vercel.app/api";

export const api =
  axios.create({
    baseURL: API_BASE,
  });

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem(
        "sid_token"
      );

    if (token) {
      config.headers =
        config.headers || {};

      config.headers.Authorization =
        `Bearer ${token}`;
    }

    if (
      config.skipGlobalLoader !==
      true
    ) {
      config.__loaderToken =
        beginLoading("api");
    }

    return config;
  },
  (error) => {
    endLoading(
      error?.config
        ?.__loaderToken
    );

    return Promise.reject(
      error
    );
  }
);

api.interceptors.response.use(
  (response) => {
    endLoading(
      response.config
        ?.__loaderToken
    );

    return response;
  },
  (error) => {
    endLoading(
      error?.config
        ?.__loaderToken
    );

    if (
      error.response?.status === 401
    ) {
      localStorage.removeItem(
        "sid_token"
      );

      localStorage.removeItem(
        "sid_user"
      );

      if (
        window.location.pathname !==
        "/login"
      ) {
        window.location.href =
          "/login";
      }
    }

    return Promise.reject(
      error
    );
  }
);

export const errorMessage = (
  error
) =>
  error.response?.data?.message ||
  error.message ||
  "Something went wrong";

function presetForCategory(category) {
  switch (category) {
    case "school-logo":
      return "logo";

    case "student-photo":
      return "student";

    case "principal-signature":
      return "signature";

    default:
      return null;
  }
}

export async function uploadImage(
  file,
  category,
  preset
) {
  const resolvedPreset =
    preset ||
    presetForCategory(category);

  const uploadFile =
    resolvedPreset
      ? await normalizeImage(
          file,
          resolvedPreset
        )
      : file;

  const body =
    new FormData();

  body.append(
    "image",
    uploadFile
  );

  body.append(
    "category",
    category
  );

  const response =
    await api.post(
      "/uploads/image",
      body
    );

  return response.data.data.fileId;
}
