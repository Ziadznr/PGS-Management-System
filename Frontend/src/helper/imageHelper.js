// src/helper/imageHelper.js
import { SERVER_URL } from "./config";

export const resolveImage = (photo) => {
  if (!photo) return "/defaultPhoto.png";
  if (photo.startsWith("http")) return photo;
  return `${SERVER_URL}${photo}`;
};
