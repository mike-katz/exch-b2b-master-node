import { UploadedFile } from "express-fileupload";
import httpStatus from "http-status";
import moment from "moment";

import S3bucket from "@/service/s3bucket.service";
import ApiError from "@/utils/ApiError";
import messages from "@/utils/messages";

// need to change bucket name
async function uploadFileInBucket(
  file: UploadedFile,
  isProposal = false
): Promise<string> {
  const allowedFileTypes: string[] = [
    "image/png",
    "image/jpeg",
    "application/pdf",
    "image/jpg",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  const MAX_SIZE = 25_000_000;
  if (!allowedFileTypes.includes(file.mimetype)) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      code: messages.INVALID_FILE_TYPE,
    });
  }
  if (file.size > MAX_SIZE) {
    throw new ApiError(httpStatus.BAD_REQUEST, {
      code: messages.INVALID_FILE_SIZE,
    });
  }

  const name = `${moment().format()}_${file.name}`;
  const fileName: string = name.replace(" ", "-");
  const uploadFile: { data: { Key: string } } = await S3bucket.uploadFile(
    file.data,
    fileName,
    isProposal,
    file.mimetype
  );
  return uploadFile.data.Key;
}

export default uploadFileInBucket;
