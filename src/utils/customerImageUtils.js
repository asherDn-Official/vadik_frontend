export const getCustomerProfilePictureSrc = (profilePictureUrl, updatedAt) => {
  if (!profilePictureUrl) {
    return "";
  }

  const isLocalPreview =
    typeof profilePictureUrl === "string" &&
    (profilePictureUrl.startsWith("data:") ||
      profilePictureUrl.startsWith("blob:"));

  if (isLocalPreview || !updatedAt) {
    return profilePictureUrl;
  }

  const version = new Date(updatedAt).getTime();
  if (Number.isNaN(version)) {
    return profilePictureUrl;
  }

  const separator = profilePictureUrl.includes("?") ? "&" : "?";
  return `${profilePictureUrl}${separator}v=${version}`;
};
