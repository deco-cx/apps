import { AppContext } from "../../mod.ts";
import { parseCookie } from "../../utils/vtexId.ts";

interface NewsletterInput {
  email: string;
  isNewsletterOptIn: boolean;
}

const newsletterProfile = async (
  props: NewsletterInput,
  req: Request,
  ctx: AppContext,
): Promise<boolean | null> => {
  const { io } = ctx;
  const { cookie } = parseCookie(req.headers, ctx.account);

  if (!props?.email) {
    console.error("User profile not found or email is missing:", props.email);
    return null;
  }

  const mutation = `
    mutation SubscribeNewsletter($email: String!, $isNewsletterOptIn: Boolean!) {
      subscribeNewsletter(email: $email, isNewsletterOptIn: $isNewsletterOptIn) 
      @context(provider: "vtex.store-graphql@2.x")
    }
  `;

  const variables = {
    email: props.email,
    isNewsletterOptIn: props.isNewsletterOptIn,
  };

  try {
    await io.query<{ subscribeNewsletter: boolean }, unknown>(
      {
        query: mutation,
        operationName: "SubscribeNewsletter",
        variables,
      },
      {
        headers: {
          cookie,
        },
      },
    );

    const result = await ctx.invoke("vtex/loaders/user.ts");
    const newsletterField = result?.customFields?.find((field) =>
      field.key === "isNewsletterOptIn"
    );

    return newsletterField?.value === "true";
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    return null;
  }
};

export default newsletterProfile;
