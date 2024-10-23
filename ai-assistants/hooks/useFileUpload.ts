import { invoke } from "../runtime.ts";

const state = {
  describeImage: invoke["ai-assistants"].actions.describeImage,
  awsUploadImage: invoke["ai-assistants"].actions.awsUploadImage,
  transcribeAudio: invoke["ai-assistants"].actions.transcribeAudio,
};

export const useFileUpload = () => state;
