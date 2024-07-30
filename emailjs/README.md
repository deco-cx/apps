<h1>
  <a href="https://www.emailjs.com/">
    <p align="center">
      <strong>
        EmailJS
      </strong>
    </p>
  </a>
</h1>

EmailJS is a service that allows developers to send emails directly from JavaScript without any server code. It can be integrated with popular email services like Gmail, Outlook, and more. EmailJS is designed to be easy to use, offering a variety of features to improve email functionality in your applications.

## Installation

1. Sign up for an account at [EmailJS](https://www.emailjs.com/signup).
2. Follow the instructions to create your EmailJS service and obtain your Service ID, Template ID, and User ID.

## Configuration

1. Create an EmailJS service:
   1. Go to the [Email Services](https://dashboard.emailjs.com/admin) page.
   2. Click on "Add new service" and follow the steps to set up your email service (e.g., Gmail, Outlook).

2. Create an email template:
   1. Go to the [Email Templates](https://dashboard.emailjs.com/admin/templates) page.
   2. Click on "Create new template" and define the structure of your email, including placeholders for dynamic content.

3. Obtain your Service ID, Template ID, and User ID from the [EmailJS Dashboard](https://dashboard.emailjs.com/admin).

## Usage

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

      const handleSubmit: JSX.GenericEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();
        
        await invoke.emailjs.actions.emails.send({
          template_id: "your_template_id",
          template_params: [
            { key: "name", value: "Your name" },
            { key: "subject", value: "Subject" },
            { key: "email", value: "your-email@gmail.com" },
            { key: "message", value: "Message" }
          ]
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

3. Done! Your setup is complete. Now you can send emails directly from your application.

## Observations

1. You can customize your email templates using the EmailJS dashboard.
2. Ensure you handle errors appropriately and inform users of the status of their email submission.
3. EmailJS supports various integrations and can be extended with additional features through its API.

For more detailed information, refer to the [EmailJS Documentation](https://www.emailjs.com/docs/).
