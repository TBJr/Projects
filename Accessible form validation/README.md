# Accessible Form Validation

A contact form demo that checks entries in the browser. Open `index.html` directly; no server, account, or build step is needed. Checking the form does not send or save a message.

The form checks a name, email address, topic, and message. Each field has a label and a short hint. After an unsuccessful check, an error summary links to the fields that need attention, and each field displays a specific error. Errors clear as entries are corrected. A valid form shows a success state with a way to start over.

The demo uses semantic form controls, visible focus styles, keyboard-accessible error links, and focus management after validation. It uses the browser's email input check rather than a custom address pattern. The message counter and validation state reset when starting over.
