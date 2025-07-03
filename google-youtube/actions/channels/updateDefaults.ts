import { AppContext } from "../../mod.ts";
import type { PrivacyStatus } from "../../utils/types.ts";

export interface Props {
  /**
   * @title Privacy Status
   * @description Default privacy status for new videos
   */
  privacyStatus?: PrivacyStatus;

  /**
   * @title License
   * @description Default license for new videos
   */
  license?: "youtube" | "creativeCommon";

  /**
   * @title Embeddable
   * @description Whether new videos can be embedded on other sites
   */
  embeddable?: boolean;

  /**
   * @title Public Stats Viewable
   * @description Whether video statistics are publicly viewable
   */
  publicStatsViewable?: boolean;

  /**
   * @title Auto Levels
   * @description Whether new videos should be automatically published to Google+ timeline
   */
  autoLevels?: boolean;

  /**
   * @title Default Comment Setting
   * @description Whether comments are allowed by default on new videos
   */
  defaultCommentSetting?: "enabled" | "disabled" | "moderatedWithLinkedAccount";

  /**
   * @title Category ID
   * @description Default category for new videos
   */
  categoryId?: string;

  /**
   * @title Tags
   * @description Default tags for new videos
   */
  tags?: string[];

  /**
   * @title Default Language
   * @description Default language for new videos
   */
  defaultLanguage?: string;

  /**
   * @title Enable Auto Share
   * @description Whether automatic publishing to social feed is enabled
   */
  enableAutoShare?: boolean;
}

export interface UpdateChannelDefaultsResult {
  success: boolean;
  message: string;
  defaults?: unknown;
}

/**
 * @name UPDATE_CHANNEL_DEFAULTS
 * @title Configure Channel Defaults
 * @description Updates default settings for new videos uploaded to the channel
 */
export default async function action(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<UpdateChannelDefaultsResult> {
  const {
    privacyStatus,
    license,
    embeddable,
    publicStatsViewable,
    autoLevels,
    defaultCommentSetting,
    categoryId,
    tags,
    defaultLanguage,
    enableAutoShare,
  } = props;

  try {
    const getResponse = await ctx.client["GET /channels"](
      {
        part: "brandingSettings",
        mine: true,
      },
      {
        headers: ctx.tokens?.access_token
          ? { Authorization: `Bearer ${ctx.tokens.access_token}` }
          : {},
      },
    );

    if (!getResponse.ok) {
      ctx.errorHandler.toHttpError(
        getResponse,
        `Failed to get channel data: ${getResponse.statusText}`,
      );
    }

    const channelData = await getResponse.json();

    if (!channelData.items || channelData.items.length === 0) {
      ctx.errorHandler.toHttpError(
        new Error("Channel not found"),
        "Channel not found",
      );
    }

    const channelId = channelData.items[0].id;
    const currentChannel = channelData.items[0];

    const brandingSettings = {
      ...currentChannel.brandingSettings || {},
    };

    if (!brandingSettings.channel) {
      brandingSettings.channel = {};
    }

    if (!brandingSettings.defaults) {
      brandingSettings.defaults = {};
    }

    if (privacyStatus !== undefined) {
      brandingSettings.defaults.privacyStatus = privacyStatus;
    }

    if (license !== undefined) {
      brandingSettings.defaults.license = license;
    }

    if (embeddable !== undefined) {
      brandingSettings.defaults.embeddable = embeddable;
    }

    if (publicStatsViewable !== undefined) {
      brandingSettings.defaults.publicStatsViewable = publicStatsViewable;
    }

    if (autoLevels !== undefined) {
      brandingSettings.defaults.autoLevels = autoLevels;
    }

    if (defaultCommentSetting !== undefined) {
      brandingSettings.defaults.commentingStatus = defaultCommentSetting;
    }

    if (categoryId !== undefined) {
      brandingSettings.defaults.categoryId = categoryId;
    }

    if (tags !== undefined) {
      brandingSettings.defaults.tags = tags;
    }

    if (defaultLanguage !== undefined) {
      brandingSettings.defaults.defaultLanguage = defaultLanguage;
    }

    if (enableAutoShare !== undefined) {
      brandingSettings.defaults.enableAutoShare = enableAutoShare;
    }

    const requestBody = {
      id: channelId,
      brandingSettings,
    };

    const updateResponse = await ctx.client["PUT /channels"](
      { part: "brandingSettings" },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ctx.tokens?.access_token}`,
        },
        body: requestBody,
      },
    );

    if (!updateResponse.ok) {
      ctx.errorHandler.toHttpError(
        updateResponse,
        `Failed to update channel defaults: ${updateResponse.statusText}`,
      );
    }

    const updatedChannelData = await updateResponse.json();

    return {
      success: true,
      message: "Channel defaults updated successfully",
      defaults: updatedChannelData.brandingSettings?.defaults,
    };
  } catch (error) {
    ctx.errorHandler.toHttpError(
      error,
      "Failed to process channel defaults update",
    );
  }
}
