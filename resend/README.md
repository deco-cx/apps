
Resend is an email platform that helps developers build and send transactional and marketing emails. It is designed to be easy to use and reliable, with a focus on deliverability. Resend offers a variety of features to help improve email deliverability, including dedicated IPs, email authentication, and spam tracking. Additionally, Resend integrates with React to allow developers to create beautiful email templates.

# Installation

1. Install via decohub
2. Fill the necessary fields
    1. API KEY Resend. To generate your API KEY, simply create your account at [resend](https://resend.com/signup)
    2. Access your page [api keys](https://resend.com/api-keys) and click on <b>"+create api key"</b>, write down your api in a safe place as you will not be able to view it again. [docs](https://resend.com/docs/dashboard/api-keys/introduction)
    3. Field: Sender Options | Default is the sender's name that appears in the email. It is an optional field in which the name can be changed but the domain should only be changed if domain configuration is carried out
    4. Field: Receiver | Default is the value of the default recipients who can receive the email
    5. Field: Subject | Default is the optional default subject field of the sent email
3. Import the app's manifest into your runtime.ts. This will allow you to easily use the action that is exported. Example:

    ```typescript
      // runtime.ts
      import { proxy } from "@deco/deco/web";
      import type { Manifest } from "./manifest.gen.ts";
      import type { Manifest as ManifestVNDA } from "apps/vnda/manifest.gen.ts";
      import type { Manifest as ManifestVTEX } from "apps/vtex/manifest.gen.ts";
      import type { Manifest as ManifestResend } from "apps/resend/manifest.gen.ts";

      export const invoke = proxy<Manifest & ManifestVNDA & ManifestVTEX & ManifestResend>();
    ```

Your setup is complete 🥳✉️

## Fire an example email

1. Create an example island that triggers a function

      ```typescript
        //islands/form.tsx
        const handleSubmit: JSX.GenericEventHandler<HTMLFormElement> = async (e) => {
          e.preventDefault();
        }

        export default function Form(){
          return (
            <form onSubmit={handleSubmit}>
              ...
            </form>
          )
        }
      ```

2. Import example email, render function and invoke to trigger the app action

    ```typescript
      //islands/form.tsx
      import { invoke } from "../runtime.ts";
      import { render } from "apps/resend/utils/reactEmail.ts";
      import { StripeWelcomeEmail } from "apps/resend/mailExamples/StripeWelcomeEmail.tsx";

      const handleSubmit: JSX.GenericEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();
        
        await invoke.resend.actions.emails.send({
          to: "mw.marcowilliam@gmail.com", // receiver optional 
          html: render(<StripeWelcomeEmail />, { // Convert your react email template when the action is triggered to HTML using render or pure HTML too
            pretty: true, // 
          }),
          subject: "Formulário de contato | Resend App - Deco", // subject optional
        });
      }

      export default function Form(){
        return (
           <form onSubmit={handleSubmit}>
            ...
          </form>
        )
      }

    ```

3. Done! Check the receiver's message box

## Observations

1. You can create your own email templates using [react-email components](https://react.email/docs/introduction#components) that are exported from the file "apps/resend/utils/reactEmail.ts". If any component you need is not being exported, contribute!!
2. Tailwind for email template is currently not supported
