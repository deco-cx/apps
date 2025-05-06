# RD Station Marketing App

This app provides integration with the RD Station Marketing API, allowing you to manage contacts and segmentations in your RD Station Marketing account.

## Setup

To use this app, you need to have an API token from RD Station Marketing. You can create an app and generate a token by following the [RD Station Marketing API documentation](https://developers.rdstation.com/reference/autenticacao).

## Available Features

### Loaders

- **Get All Segmentations**: Retrieves all segmentations from your RD Station Marketing account.
- **Get Segmentation Contacts**: Retrieves all contacts from a specific segmentation.
- **Get Contact**: Retrieves a specific contact by UUID or email address.

### Actions

- **Create Contact**: Creates a new contact in RD Station Marketing.
- **Update Contact**: Updates an existing contact in RD Station Marketing.
- **Delete Contact**: Deletes a contact from RD Station Marketing.

## Usage Examples

### Getting Segmentations

```ts
import { useLoader } from "@deco/deco";
import getSegmentations from "rd-station-marketing/loaders/getSegmentations.ts";

const segmentations = useLoader(getSegmentations, {});
```

### Getting a Contact

```ts
import { useLoader } from "@deco/deco";
import getContact from "rd-station-marketing/loaders/getContact.ts";

const contact = useLoader(getContact, {
  identifier: "email",
  value: "example@example.com",
});
```

### Creating a Contact

```ts
import { useAction } from "@deco/deco";
import createContact from "rd-station-marketing/actions/createContact.ts";

const createNewContact = useAction(createContact);

// Then call it with:
await createNewContact({
  email: "example@example.com",
  name: "John Doe",
  job_title: "Developer",
  tags: ["api", "developer"],
  legal_bases: [{
    category: "communications",
    type: "consent",
    status: "granted"
  }]
});
```

## API Reference

For more details about the available endpoints and parameters, please refer to the [RD Station Marketing API documentation](https://developers.rdstation.com/reference/visao-geral-da-api). 