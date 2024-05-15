## ToastContainer

This is a high order component that adds the toast functionality

### Usage
Create the toast state with `const [toastText, setToastText] = context.useState<string | null>(null);`

Wrap the top-level container of your app (direct child of the `<blocks>` element) 
in 
```
<ToastContainer text={toastText} onClose={()=>setToastText(null)}>
...
</ToastContainer>
```

Whenever you need to show the toast, use `setToastText("Your toast message");`
