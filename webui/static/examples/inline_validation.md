## Inline Validation

[Original HTMX Version](https://htmx.org/examples/inline-validation/)

## Demo
<div
    id="inline_validation"
    data-fetch-url="'/examples/inline_validation/data'"
    data-on-load="$$get"
>
     Replace me
</div>

The only email that will be accepted is test@test.com.

## Explanation

This example shows how to do inline field validation, in this case of an email address. To do this we need to create a form with an input that POSTs back to the server with the value to be validated and updates the DOM with the validation results.

We start with this form:

```html
<h3>Signup Form</h3>
<form hx-post="/contact">
  <div hx-target="this" hx-swap="outerHTML">
    <label>Email Address</label>
    <input name="email" hx-post="/contact/email" hx-indicator="#ind">
    <img id="ind" src="/img/bars.svg" class="htmx-indicator"/>
  </div>
  <div class="form-group">
    <label>First Name</label>
    <input type="text" class="form-control" name="firstName">
  </div>
  <div class="form-group">
    <label>Last Name</label>
    <input type="text" class="form-control" name="lastName">
  </div>
  <button class="btn btn-default">Submit</button>
</form>
```

Note that the first div in the form has set itself as the target of the request and specified the outerHTML swap strategy, so it will be replaced entirely by the response. The input then specifies that it will POST to /contact/email for validation, when the changed event occurs (this is the default for inputs). It also specifies an indicator for the request.

When a request occurs, it will return a partial to replace the outer div. It might look like this:

```html
<div hx-target="this" hx-swap="outerHTML" class="error">
  <label>Email Address</label>
  <input name="email" hx-post="/contact/email" hx-indicator="#ind" value="test@foo.com">
  <img id="ind" src="/img/bars.svg" class="htmx-indicator"/>
  <div class='error-message'>That email is already taken.  Please enter another email.</div>
</div>
```html
Note that this div is annotated with the error class and includes an error message element.

This form can be lightly styled with this CSS:

```css
  .error-message {
    color:red;
  }
  .error input {
      box-shadow: 0 0 3px #CC0000;
   }
  .valid input {
      box-shadow: 0 0 3px #36cc00;
   }
```
To give better visual feedback.


