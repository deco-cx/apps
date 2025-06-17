import { AppContext } from "../mod.ts";
import { validateDocumentId } from "../utils/docUtils.ts";
import { PERMISSION_ROLES, PERMISSION_TYPES } from "../utils/constant.ts";

export interface Props {
  /**
   * @description The ID of the document to share
   * @title Document ID
   */
  documentId: string;

  /**
   * @description Email address of the user to share with
   * @title User Email
   */
  emailAddress?: string;

  /**
   * @description Domain to share with (for domain-wide sharing)
   * @title Domain
   */
  domain?: string;

  /**
   * @description Permission role to grant
   * @title Role
   */
  role: "reader" | "commenter" | "writer" | "owner";

  /**
   * @description Type of permission
   * @title Permission Type
   */
  type: "user" | "group" | "domain" | "anyone";

  /**
   * @description Whether to send notification email
   * @title Send Notification
   */
  sendNotificationEmail?: boolean;

  /**
   * @description Custom message to include in notification
   * @title Message
   */
  message?: string;
}

export interface ShareResponse {
  permissionId: string;
  success: boolean;
  message?: string;
}

/**
 * @title Share Document
 * @description Shares a Google Docs document with specified users or groups with defined permissions
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ShareResponse> => {
  const {
    documentId,
    emailAddress,
    domain,
    role,
    type,
    sendNotificationEmail = true,
    message,
  } = props;

  if (!documentId) {
    ctx.errorHandler.toHttpError(
      new Error("Document ID is required"),
      "Document ID is required",
    );
  }

  if (!validateDocumentId(documentId)) {
    ctx.errorHandler.toHttpError(
      new Error("Invalid document ID format"),
      "Invalid document ID format",
    );
  }

  if (!role || !Object.values(PERMISSION_ROLES).includes(role)) {
    ctx.errorHandler.toHttpError(
      new Error("Valid role is required (reader, commenter, writer, owner)"),
      "Valid role is required",
    );
  }

  if (!type || !Object.values(PERMISSION_TYPES).includes(type)) {
    ctx.errorHandler.toHttpError(
      new Error(
        "Valid permission type is required (user, group, domain, anyone)",
      ),
      "Valid permission type is required",
    );
  }

  if (type === "user" && !emailAddress) {
    ctx.errorHandler.toHttpError(
      new Error("Email address is required for user permissions"),
      "Email address is required for user permissions",
    );
  }

  if (type === "domain" && !domain) {
    ctx.errorHandler.toHttpError(
      new Error("Domain is required for domain permissions"),
      "Domain is required for domain permissions",
    );
  }

  try {
    const shareRequest: {
      role: string;
      type: string;
      sendNotificationEmail: boolean;
      emailAddress?: string;
      domain?: string;
      message?: string;
    } = {
      role,
      type,
      sendNotificationEmail,
    };

    if (emailAddress && (type === "user" || type === "group")) {
      shareRequest.emailAddress = emailAddress;
    }

    if (domain && type === "domain") {
      shareRequest.domain = domain;
    }

    if (message && sendNotificationEmail) {
      shareRequest.message = message;
    }

    const response = await ctx.client
      ["POST /v1/documents/:documentId/permissions"]({
        documentId,
      }, {
        body: shareRequest,
      });

    if (!response.ok) {
      ctx.errorHandler.toHttpError(
        response,
        `Error sharing document: ${response.statusText}`,
      );
    }

    const result = await response.json();

    const shareResponse: ShareResponse = {
      permissionId: result.id,
      success: true,
      message: type === "anyone"
        ? "Document is now publicly accessible"
        : `Document shared with ${
          emailAddress || domain || "specified recipients"
        }`,
    };

    return shareResponse;
  } catch (error) {
    ctx.errorHandler.toHttpError(
      error,
      `Failed to share document: ${documentId}`,
    );
  }
};

export default action;
