import { Attachment, FileURL } from "../types.ts";

export async function handleAnthropicAttachments(
  attachments: Attachment[],
): Promise<string> {
  const treated_Attachments: string[] = [];

  treated_Attachments.push("\n <Attachments>");

  for (const attachment of attachments) {
    let treated_Attachment = "";

    if (attachment.call_text) {
      treated_Attachment += attachment.call_text;
    }

    if (checkIfFile(attachment)) {
      treated_Attachment += await handleFileAttachments(attachment);
    }

    // Push each treated attachment into the array
    treated_Attachments.push(treated_Attachment);
  }

  treated_Attachments.push("</Attachments>");

  // Join all treated attachments into a single string separated by '\n'
  return treated_Attachments.join("\n");
}

async function handleFileAttachments(attachment: FileURL): Promise<string> {
  let data = "";
  if (!(attachment.fileUrl && attachment.fileType)) {
    throw new Error(`No valid URL or File Type`);
  }
  if (attachment.fileType == ".csv") {
    data = await readCSVFromURL(attachment.fileUrl);
  } else if (attachment.fileType == ".json") {
    data = await readJSONFromURL(attachment.fileUrl);
    console.log(data);
  } else if (
    (attachment.fileType == ".jpeg") ||
    (attachment.fileType == ".png")
  ) {
    data = await fetchImageAsBase64(attachment.fileUrl);
  } else {
    return "File type not supported";
  }
  return data;
}

async function readCSVFromURL(url: string): Promise<string> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`error fetching csv: ${response.status}`);
    }

    const csvData = await response.text();

    return csvData; // Return the full CSV content as a string
  } catch (error) {
    throw new Error(`error fetching csv: ${error}`);
  }
}

async function fetchImageAsBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const blob = await response.blob();

    // Create a FileReader to convert the blob to base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(`Error reading file: ${error}`);

      reader.readAsDataURL(blob);
    });
  } catch (error) {
    throw new Error(`Error fetching or converting image: ${error}`);
  }
}

async function readJSONFromURL(url: string): Promise<string> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Error fetching JSON: ${response.status}`);
    }

    const jsonData = await response.text(); // Retrieve the response as a string

    return jsonData; // Return the JSON data as a string
  } catch (error) {
    throw new Error(`Error fetching JSON: ${error}`);
  }
}

function checkIfFile(attachment: Attachment): attachment is FileURL {
  return attachment.type === "URL";
}
