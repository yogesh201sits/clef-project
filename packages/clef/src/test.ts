import "dotenv/config";

import { createClefRunnable } from "./clef";

const clef = createClefRunnable();

const result = await clef.invoke({
  state:
    "Checkout has been failing for every customer for the last hour.",

  questions: {
    urgent: {
      type: "noul",

      instructions:
        "Is this support request urgent?",
    },

    team: {
      type: "choice",

      instructions:
        "Which team should handle this request?",

      criteria: {
        billing:
          "Payments, invoices, and refunds",

        technical:
          "Outages, errors, and configuration",

        sales:
          "Plans and upgrades",
      },
    },

    severity: {
      type: "score",

      instructions:
        "How severe is the customer impact?",

      criteria: [
        "No impact",
        "Minor",
        "Major",
        "Critical",
      ],
    },
  },
});

console.log(
  JSON.stringify(result, null, 2),
);