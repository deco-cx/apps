import type { WorkflowContext, WorkflowGen } from "@deco/deco";
import type { Props as NotifyReviewerProps } from "../actions/notify/reviewer.ts";
import { dayjs } from "../deps/deps.ts";
import type { AppManifest } from "../mod.ts";
import { getRandomItem } from "../sdk/random.ts";
import type { ProjectUser } from "../types.ts";

const DELAY = 1000 * 60 * 5;

interface Props extends NotifyReviewerProps {
  reviewers: ProjectUser[];
}

export default function workflow() {
  return function* (
    ctx: WorkflowContext<AppManifest>,
    args: Omit<Props, "messageId">,
  ): WorkflowGen<void> {
    let reviewer = args.reviewer;
    let reviewers = args.reviewers.filter((user) =>
      user.githubUsername !== reviewer.githubUsername
    );

    while (reviewer) {
      yield ctx.log(
        `Waiting for reviewer. ${reviewer.githubUsername}`,
      );
      yield ctx.log(
        `Reviewers in wait list: ${
          reviewers.map((user) => user.githubUsername)
        }`,
      );

      const sleepUntil = yield ctx.callLocalActivity<number>(() => {
        const now = dayjs();
        const weekDay = now.day();
        const isSatOrSun = weekDay === 0 || weekDay === 6;
        console.log({ weekDay, isSatOrSun, hours: now.toDate() });
        // if weekend is saturday or sunday, wait until next monday
        if (isSatOrSun) {
          const nextMonday = now
            .add(weekDay === 0 ? 1 : 2, "day")
            .set("hour", 11)
            .set("minute", 0)
            .set("second", 0);
          console.log(nextMonday.toDate());
          return nextMonday.toDate().getTime() - now.toDate().getTime();
        }

        const hours = now.hour();
        console.log({ hours });

        return DELAY;
      });

      yield ctx.sleep(sleepUntil);

      const actionProps = {
        channelId: args.channelId,
        reviewer,
      };

      yield ctx.callLocalActivity(async () => {
        return await ctx.state.invoke["github-bot"].actions.notify.reviewer(
          actionProps,
        );
      });

      yield ctx.sleep(DELAY * 3);

      yield ctx.callLocalActivity(async () => {
        return await ctx.state.invoke["github-bot"].actions.notify.reviewer(
          actionProps,
        );
      });

      const { newReviewer, newReviewers } = yield ctx.callLocalActivity(() => {
        const newReviewer = getRandomItem(reviewers);
        const newReviewers = reviewers.filter((user) =>
          user.githubUsername !== newReviewer.githubUsername
        );
        return { newReviewer, newReviewers };
      });

      reviewer = newReviewer;
      reviewers = newReviewers;
    }
  };
}
